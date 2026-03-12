// generate-visual-report.js - 生成可视化报告

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
  
  console.log(`📊 正在生成 ${symbol} 的可视化报告...\n`);
  
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
    const stopLoss = patterns.analyzeStopLoss(pairs);
    
    const wins = pairs.filter(p => p.pnl > 0);
    const losses = pairs.filter(p => p.pnl < 0);
    const winRate = (wins.length / pairs.length * 100).toFixed(1);
    const totalPnl = pairs.reduce((sum, p) => sum + p.pnl, 0).toFixed(2);
    const avgWin = wins.length > 0 ? wins.reduce((sum, p) => sum + p.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, p) => sum + p.pnl, 0) / losses.length : 0;
    const profitFactor = (avgWin / Math.abs(avgLoss)).toFixed(2);
    
    // 累计盈亏
    let cumPnl = 0;
    const pnlHistory = pairs.map(p => {
      cumPnl += p.pnl;
      return cumPnl;
    });
    
    // 准备数据
    const data = {
      totalTrades: pairs.length,
      wins: wins.length,
      losses: losses.length,
      winRate,
      totalPnl,
      profitFactor,
      timePattern: timePattern.all.map(t => ({
        hour: t.hour,
        winRate: (t.winRate * 100).toFixed(0)
      })),
      pnlHistory,
      fomoCount: fomo.length,
      fomoWinRate: fomo.length > 0 ? (fomo.filter(t => t.pnl > 0).length / fomo.length * 100).toFixed(0) : 0,
      fomoLoss: fomo.reduce((sum, t) => sum + t.pnl, 0),
      revengeCount: revenge.length,
      revengeWinRate: revenge.length > 0 ? (revenge.filter(t => t.pnl > 0).length / revenge.length * 100).toFixed(0) : 0,
      stopLossDiscipline: stopLoss.discipline,
      bigLossCount: stopLoss.bigLossCount,
      avgStopLoss: stopLoss.avgStopLoss,
      worstHour: timePattern.worst?.hour,
      bestHour: timePattern.best?.hour
    };
    
    // 生成报告
    const report = new VisualReport(data);
    const filename = `report-${symbol}-${Date.now()}.html`;
    report.save(filename);
    
    console.log(`\n✅ 可视化报告已生成: ${filename}`);
    console.log(`\n在浏览器中打开查看：`);
    console.log(`open ${filename}`);
    
  } catch (e) {
    console.error('❌ 错误:', e.message);
  }
}

generateReport();
