// api-server.js - 参赛版本 API 服务器

const express = require('express');
const cors = require('cors');
const path = require('path');
const BinancePsychology = require('./analyze');
const patterns = require('./patterns');

const app = express();
const PORT = process.env.PORT || 3456;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: 分析交易心理
app.post('/api/analyze', async (req, res) => {
  try {
    const { apiKey, apiSecret, symbol, days } = req.body;
    
    if (!apiKey || !apiSecret) {
      return res.status(400).json({ error: '缺少 API credentials' });
    }
    
    console.log(`📊 分析请求: ${symbol} (${days} 天)`);
    
    const analyzer = new BinancePsychology(apiKey, apiSecret);
    
    // 获取交易数据
    const trades = await analyzer.getTrades(symbol, parseInt(days));
    const klines = await analyzer.getKlines(symbol, '1h', Math.min(days * 24, 1000));
    const pairs = analyzer.buildTradePairs(trades);
    
    if (pairs.length === 0) {
      return res.json({
        totalTrades: 0,
        winRate: '0',
        totalPnl: '0.00',
        profitFactor: '0.00',
        fomoCount: 0,
        fomoWinRate: '0',
        fomoLoss: 0,
        revengeCount: 0,
        revengeWinRate: '0',
        bigLossCount: 0,
        avgStopLoss: '0'
      });
    }
    
    // 心理模式分析
    const fomo = patterns.detectFOMO(pairs, klines);
    const revenge = patterns.detectRevengeTrade(pairs);
    const stopLoss = patterns.analyzeStopLoss(pairs);
    const timePattern = patterns.analyzeTimePattern(pairs);
    const holdTime = patterns.analyzeHoldTime(pairs);
    
    // 基础统计
    const wins = pairs.filter(p => p.pnl > 0);
    const losses = pairs.filter(p => p.pnl < 0);
    const winRate = (wins.length / pairs.length * 100).toFixed(1);
    const totalPnl = pairs.reduce((sum, p) => sum + p.pnl, 0).toFixed(2);
    const avgWin = wins.length > 0 ? wins.reduce((sum, p) => sum + p.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, p) => sum + p.pnl, 0) / losses.length : 0;
    const profitFactor = isNaN(avgWin / Math.abs(avgLoss)) ? '0.00' : (avgWin / Math.abs(avgLoss)).toFixed(2);
    
    // 返回结果
    const result = {
      totalTrades: pairs.length,
      winRate,
      totalPnl,
      profitFactor,
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      
      // 心理问题
      fomoCount: fomo.length,
      fomoWinRate: fomo.length > 0 ? (fomo.filter(t => t.pnl > 0).length / fomo.length * 100).toFixed(0) : '0',
      fomoLoss: fomo.reduce((sum, t) => sum + t.pnl, 0),
      
      revengeCount: revenge.length,
      revengeWinRate: revenge.length > 0 ? (revenge.filter(t => t.pnl > 0).length / revenge.length * 100).toFixed(0) : '0',
      
      bigLossCount: stopLoss.bigLossCount || 0,
      avgStopLoss: stopLoss.avgStopLoss || '0',
      stopLossDiscipline: stopLoss.discipline,
      
      // 时段分析
      worstHour: timePattern.worst?.hour || 0,
      bestHour: timePattern.best?.hour || 0,
      timePattern: timePattern.all.map(t => ({
        hour: t.hour,
        winRate: (t.winRate * 100).toFixed(0),
        count: t.count
      })),
      
      // 持仓分析
      shortTermWinRate: (holdTime.short.winRate * 100).toFixed(0),
      mediumTermWinRate: (holdTime.medium.winRate * 100).toFixed(0),
      longTermWinRate: (holdTime.long.winRate * 100).toFixed(0),
      shortTermCount: holdTime.short.count || 0,
      mediumTermCount: holdTime.medium.count || 0,
      longTermCount: holdTime.long.count || 0
    };
    
    console.log(`✅ 分析完成: ${pairs.length} 笔交易, 胜率 ${winRate}%`);
    res.json(result);
    
  } catch (error) {
    console.error('❌ 分析错误:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🏆 Binance Trading Psychology Coach                 ║
║                                                        ║
║   服务器已启动: http://localhost:${PORT}              ║
║                                                        ║
║   在浏览器中打开查看 Demo                              ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Vercel 导出
module.exports = app;
