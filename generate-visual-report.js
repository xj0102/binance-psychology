// generate-visual-report.js - 生成详细可视化报告

const BinancePsychology = require('./analyze');
const patterns = require('./patterns');
const VisualReport = require('./visual-report');

async function generateReport() {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;
  const symbol = process.argv[2] || 'ETHUSDT';
  const days = parseInt(process.argv[3]) || 365;
  
  if (!apiKey || !apiSecret) {
    console.log('❌ 请设置 BINANCE_API_KEY 和 BINANCE_API_SECRET');
    process.exit(1);
  }
  
  console.log(`📊 正在生成 ${symbol} 的详细可视化报告...\n`);
  
  const analyzer = new BinancePsychology(apiKey, apiSecret);
  
  try {
    const trades = await analyzer.getTrades(symbol, days);
    const klines = await analyzer.getKlines(symbol, '1h', Math.min(days * 24, 1000));
    const pairs = analyzer.buildTradePairs(trades);
    
    if (pairs.length === 0) {
      console.log('📭 没有交易记录');
      return;
    }
    
    // 分析
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
    const profitFactor = (avgWin / Math.abs(avgLoss)).toFixed(2);
    
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
    
    // 每日盈亏
    const dailyPnl = {};
    pairs.forEach(p => {
      const date = new Date(p.sellTime).toISOString().split('T')[0];
      dailyPnl[date] = (dailyPnl[date] || 0) + p.pnl;
    });
    
    // 最佳/最差交易
    const bestTrade = pairs.reduce((best, p) => p.pnl > best.pnl ? p : best, pairs[0]);
    const worstTrade = pairs.reduce((worst, p) => p.pnl < worst.pnl ? p : worst, pairs[0]);
    
    // 准备数据
    const data = {
      symbol,
      totalTrades: pairs.length,
      wins: wins.length,
      losses: losses.length,
      winRate,
      totalPnl: totalPnl.toFixed(2),
      profitFactor: isNaN(profitFactor) || !isFinite(profitFactor) ? '0.00' : profitFactor,
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
      dailyPnl: Object.entries(dailyPnl).map(([date, pnl]) => ({ date, pnl: pnl.toFixed(2) })),
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
    
    // 生成报告
    const report = new VisualReport(data);
    const filename = `report-${symbol}-${Date.now()}.html`;
    report.save(filename);
    
    console.log(`\n✅ 详细可视化报告已生成: ${filename}`);
    console.log(`\n在浏览器中打开查看：`);
    console.log(`open ${filename}`);
    
  } catch (e) {
    console.error('❌ 错误:', e.message);
  }
}

generateReport();
