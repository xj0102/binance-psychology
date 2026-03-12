// demo.js - 演示脚本（不需要真实 API）

const patterns = require('./patterns');

console.log('🧠 币安交易心理分析助手 - 演示\n');
console.log('='.repeat(50));
console.log('\n');

// 模拟一个典型的亏损交易员
const mockPairs = [
  // 第 1 天：FOMO 追涨
  { buyTime: new Date('2026-03-06 10:00').getTime(), buyPrice: 62000, sellTime: new Date('2026-03-06 15:00').getTime(), sellPrice: 60000, qty: 0.1, pnl: -200 },
  
  // 第 2 天：报复性交易
  { buyTime: new Date('2026-03-07 14:00').getTime(), buyPrice: 60000, sellTime: new Date('2026-03-07 16:00').getTime(), sellPrice: 59000, qty: 0.1, pnl: -100 },
  { buyTime: new Date('2026-03-07 16:20').getTime(), buyPrice: 59500, sellTime: new Date('2026-03-07 18:00').getTime(), sellPrice: 58000, qty: 0.15, pnl: -225 }, // 20分钟后加仓
  
  // 第 3 天：晚上情绪化交易
  { buyTime: new Date('2026-03-08 22:30').getTime(), buyPrice: 58000, sellTime: new Date('2026-03-08 23:00').getTime(), sellPrice: 57000, qty: 0.1, pnl: -100 },
  { buyTime: new Date('2026-03-08 23:15').getTime(), buyPrice: 57500, sellTime: new Date('2026-03-08 23:45').getTime(), sellPrice: 56500, qty: 0.12, pnl: -120 },
  
  // 第 4 天：又是 FOMO
  { buyTime: new Date('2026-03-09 11:00').getTime(), buyPrice: 63000, sellTime: new Date('2026-03-09 14:00').getTime(), sellPrice: 61000, qty: 0.1, pnl: -200 },
  
  // 第 5 天：早上理性交易（成功）
  { buyTime: new Date('2026-03-10 09:30').getTime(), buyPrice: 59000, sellTime: new Date('2026-03-10 11:00').getTime(), sellPrice: 60500, qty: 0.1, pnl: 150 },
  { buyTime: new Date('2026-03-10 10:00').getTime(), buyPrice: 59500, sellTime: new Date('2026-03-10 12:00').getTime(), sellPrice: 61000, qty: 0.1, pnl: 150 },
  
  // 第 6 天：止损不果断
  { buyTime: new Date('2026-03-11 15:00').getTime(), buyPrice: 60000, sellTime: new Date('2026-03-11 20:00').getTime(), sellPrice: 55000, qty: 0.1, pnl: -500 }, // 亏损 8.3%
  
  // 第 7 天：正常交易
  { buyTime: new Date('2026-03-12 10:00').getTime(), buyPrice: 58000, sellTime: new Date('2026-03-12 14:00').getTime(), sellPrice: 59000, qty: 0.1, pnl: 100 }
];

const mockKlines = [
  { time: new Date('2026-03-06 09:00').getTime(), open: 58000, close: 62000 }, // 暴涨
  { time: new Date('2026-03-09 10:00').getTime(), open: 59000, close: 63000 }, // 暴涨
];

console.log('📊 交易心理分析报告\n');
console.log(`时间范围: 2026-03-06 至 2026-03-12`);
console.log(`总交易: ${mockPairs.length} 笔`);

const wins = mockPairs.filter(p => p.pnl > 0).length;
const winRate = (wins / mockPairs.length * 100).toFixed(0);
const totalPnl = mockPairs.reduce((sum, p) => sum + p.pnl, 0);

console.log(`胜率: ${winRate}%`);
console.log(`盈亏: $${totalPnl.toFixed(2)}`);
console.log('\n');

// 分析
const fomo = patterns.detectFOMO(mockPairs, mockKlines);
const revenge = patterns.detectRevengeTrade(mockPairs);
const timePattern = patterns.analyzeTimePattern(mockPairs);
const stopLoss = patterns.analyzeStopLoss(mockPairs);

console.log('🔴 发现的问题:\n');

if (fomo.length > 0) {
  const fomoWinRate = (fomo.filter(t => t.pnl > 0).length / fomo.length * 100).toFixed(0);
  console.log(`1. FOMO（追涨）`);
  console.log(`   ${fomo.length} 次在暴涨后追涨，胜率 ${fomoWinRate}%`);
  console.log(`   平均亏损 $${Math.abs(fomo.reduce((sum, t) => sum + t.pnl, 0) / fomo.length).toFixed(2)}/笔\n`);
}

if (revenge.length > 0) {
  const revengeWinRate = (revenge.filter(t => t.pnl > 0).length / revenge.length * 100).toFixed(0);
  console.log(`2. 报复性交易`);
  console.log(`   ${revenge.length} 次亏损后立即加仓，胜率 ${revengeWinRate}%\n`);
}

if (timePattern.worst) {
  console.log(`3. 时段问题`);
  console.log(`   ${timePattern.worst.hour}:00 胜率最低（${(timePattern.worst.winRate * 100).toFixed(0)}%）`);
  console.log(`   ${timePattern.best.hour}:00 胜率最高（${(timePattern.best.winRate * 100).toFixed(0)}%）\n`);
}

if (stopLoss.bigLossCount > 0) {
  console.log(`4. 止损纪律: ${stopLoss.discipline}`);
  console.log(`   ${stopLoss.bigLossCount} 次亏损超过 5%`);
  console.log(`   平均止损点: ${stopLoss.avgStopLoss}%\n`);
}

console.log('💡 改进建议:\n');

if (fomo.length > 0) {
  console.log('- 避免追涨: 价格 1 小时涨幅 > 5% 时等待回调');
}

if (revenge.length > 0) {
  console.log('- 亏损后休息: 强制休息 1 小时再交易');
}

if (timePattern.worst && timePattern.worst.winRate < 0.4) {
  console.log(`- 调整时段: 避开 ${timePattern.worst.hour}:00，多在 ${timePattern.best.hour}:00 交易`);
}

if (parseFloat(stopLoss.avgStopLoss) > 5) {
  console.log('- 严格止损: 设置 -3% 自动止损，不要心存侥幸');
}

console.log('\n');
console.log('📈 如果遵循这些建议:');
console.log('   预计胜率可提升至 50%+');
console.log('   预计月收益可转正');
