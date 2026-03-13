// server.js - 本地报告生成服务器

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const BinancePsychology = require('./analyze');
const patterns = require('./patterns');
const VisualReport = require('./visual-report');

const PORT = 3456;

// 从环境变量读取 API keys
const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;

if (!apiKey || !apiSecret) {
  console.log('❌ 请设置 BINANCE_API_KEY 和 BINANCE_API_SECRET');
  process.exit(1);
}

async function generateReport(symbol, days) {
  const analyzer = new BinancePsychology(apiKey, apiSecret);
  
  const trades = await analyzer.getTrades(symbol, days);
  const klines = await analyzer.getKlines(symbol, '1h', Math.min(days * 24, 1000));
  const pairs = analyzer.buildTradePairs(trades);
  
  if (pairs.length === 0) {
    throw new Error('没有交易记录');
  }
  
  const fomo = patterns.detectFOMO(pairs, klines);
  const revenge = patterns.detectRevengeTrade(pairs);
  const timePattern = patterns.analyzeTimePattern(pairs);
  const holdTime = patterns.analyzeHoldTime(pairs);
  const stopLoss = patterns.analyzeStopLoss(pairs);
  
  const wins = pairs.filter(p => p.pnl > 0);
  const losses = pairs.filter(p => p.pnl < 0);
  const winRate = (wins.length / pairs.length * 100).toFixed(1);
  const totalPnl = pairs.reduce((sum, p) => sum + p.pnl, 0);
  const avgWin = wins.length > 0 ? wins.reduce((sum, p) => sum + p.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((sum, p) => sum + p.pnl, 0) / losses.length : 0;
  const profitFactor = isNaN(avgWin / Math.abs(avgLoss)) ? '0.00' : (avgWin / Math.abs(avgLoss)).toFixed(2);
  
  // 最大连胜/连亏
  let maxWinStreak = 0, maxLossStreak = 0;
  let currentWinStreak = 0, currentLossStreak = 0;
  pairs.forEach(p => {
    if (p.pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
    } else {
      currentLossStreak++;
      currentWinStreak = 0;
      maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
    }
  });
  
  // 最大回撤
  let peak = 0, maxDrawdown = 0;
  let cumPnl = 0;
  pairs.forEach(p => {
    cumPnl += p.pnl;
    peak = Math.max(peak, cumPnl);
    const drawdown = peak - cumPnl;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });
  
  // 累计盈亏
  cumPnl = 0;
  const pnlHistory = pairs.map(p => {
    cumPnl += p.pnl;
    return cumPnl;
  });
  
  const bestTrade = pairs.reduce((best, p) => p.pnl > best.pnl ? p : best, pairs[0]);
  const worstTrade = pairs.reduce((worst, p) => p.pnl < worst.pnl ? p : worst, pairs[0]);
  
  const data = {
    symbol,
    totalTrades: pairs.length,
    wins: wins.length,
    losses: losses.length,
    winRate,
    totalPnl: totalPnl.toFixed(2),
    profitFactor,
    avgWin: avgWin.toFixed(2),
    avgLoss: avgLoss.toFixed(2),
    maxWinStreak: maxWinStreak || 0,
    maxLossStreak: maxLossStreak || 0,
    maxDrawdown: maxDrawdown.toFixed(2),
    timePattern: timePattern.all.map(t => ({
      hour: t.hour,
      winRate: (t.winRate * 100).toFixed(0),
      count: t.count,
      pnl: t.pnl.toFixed(2)
    })),
    pnlHistory,
    fomoCount: fomo.length,
    fomoWinRate: fomo.length > 0 ? (fomo.filter(t => t.pnl > 0).length / fomo.length * 100).toFixed(0) : '0',
    fomoLoss: fomo.reduce((sum, t) => sum + t.pnl, 0),
    revengeCount: revenge.length,
    revengeWinRate: revenge.length > 0 ? (revenge.filter(t => t.pnl > 0).length / revenge.length * 100).toFixed(0) : '0',
    stopLossDiscipline: stopLoss.discipline,
    bigLossCount: stopLoss.bigLossCount || 0,
    avgStopLoss: stopLoss.avgStopLoss || '0',
    worstHour: timePattern.worst?.hour || 0,
    bestHour: timePattern.best?.hour || 0,
    shortTermWinRate: (holdTime.short.winRate * 100).toFixed(0),
    mediumTermWinRate: (holdTime.medium.winRate * 100).toFixed(0),
    longTermWinRate: (holdTime.long.winRate * 100).toFixed(0),
    shortTermCount: holdTime.short.count || 0,
    mediumTermCount: holdTime.medium.count || 0,
    longTermCount: holdTime.long.count || 0,
    bestTrade: {
      pnl: bestTrade.pnl.toFixed(2),
      date: new Date(bestTrade.buyTime).toLocaleDateString(),
      holdTime: (bestTrade.holdTime / 3600).toFixed(1)
    },
    worstTrade: {
      pnl: worstTrade.pnl.toFixed(2),
      date: new Date(worstTrade.buyTime).toLocaleDateString(),
      holdTime: (worstTrade.holdTime / 3600).toFixed(1)
    }
  };
  
  const report = new VisualReport(data);
  return report.generateHTML();
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // API: 生成报告
  if (parsedUrl.pathname === '/api/generate') {
    const symbol = parsedUrl.query.symbol || 'BTCUSDT';
    const days = parseInt(parsedUrl.query.days) || 365;
    
    console.log(`📊 生成报告: ${symbol} (${days} 天)`);
    
    try {
      const html = await generateReport(symbol, days);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (e) {
      console.error('❌ 错误:', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  
  // 静态文件
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('index.html not found');
    }
    return;
  }
  
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`✅ 服务器已启动: http://localhost:${PORT}`);
  console.log(`\n在浏览器中打开: http://localhost:${PORT}`);
  console.log(`\nAPI 端点: http://localhost:${PORT}/api/generate?symbol=BTCUSDT&days=365`);
});
