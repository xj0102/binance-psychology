// test.js - 测试脚本（使用模拟数据）

const patterns = require('./patterns');

// 模拟交易数据
const mockPairs = [
  // FOMO 案例
  { buyTime: Date.now() - 86400000, buyPrice: 62000, sellTime: Date.now() - 82800000, sellPrice: 60000, qty: 0.1, pnl: -200 },
  { buyTime: Date.now() - 72000000, buyPrice: 63000, sellTime: Date.now() - 68400000, sellPrice: 61000, qty: 0.1, pnl: -200 },
  
  // 报复性交易
  { buyTime: Date.now() - 50000000, buyPrice: 60000, sellTime: Date.now() - 48000000, sellPrice: 59000, qty: 0.1, pnl: -100 },
  { buyTime: Date.now() - 47000000, buyPrice: 59500, sellTime: Date.now() - 45000000, sellPrice: 58000, qty: 0.15, pnl: -225 }, // 30分钟后加仓
  
  // 正常交易
  { buyTime: Date.now() - 30000000, buyPrice: 58000, sellTime: Date.now() - 20000000, sellPrice: 60000, qty: 0.1, pnl: 200 },
  { buyTime: Date.now() - 10000000, buyPrice: 59000, sellTime: Date.now() - 5000000, sellPrice: 61000, qty: 0.1, pnl: 200 }
];

const mockKlines = [
  { time: Date.now() - 90000000, open: 58000, close: 58500 },
  { time: Date.now() - 86400000, open: 58500, close: 62000 }, // 暴涨
  { time: Date.now() - 82800000, open: 62000, close: 61000 },
  { time: Date.now() - 72000000, open: 61000, close: 63000 }, // 暴涨
  { time: Date.now() - 50000000, open: 60000, close: 59000 }
];

console.log('🧪 测试交易心理分析\n');

// 测试 FOMO
const fomo = patterns.detectFOMO(mockPairs, mockKlines);
console.log('1. FOMO 检测:');
console.log(`   发现 ${fomo.length} 次追涨`);
console.log(`   胜率: ${(fomo.filter(t => t.pnl > 0).length / fomo.length * 100).toFixed(0)}%\n`);

// 测试报复性交易
const revenge = patterns.detectRevengeTrade(mockPairs);
console.log('2. 报复性交易:');
console.log(`   发现 ${revenge.length} 次\n`);

// 测试时段分析
const timePattern = patterns.analyzeTimePattern(mockPairs);
console.log('3. 时段分析:');
console.log(`   最佳时段: ${timePattern.best.hour}:00 (胜率 ${(timePattern.best.winRate * 100).toFixed(0)}%)`);
console.log(`   最差时段: ${timePattern.worst.hour}:00 (胜率 ${(timePattern.worst.winRate * 100).toFixed(0)}%)\n`);

// 测试止损
const stopLoss = patterns.analyzeStopLoss(mockPairs);
console.log('4. 止损纪律:');
console.log(`   大额亏损: ${stopLoss.bigLossCount} 次`);
console.log(`   平均止损: ${stopLoss.avgStopLoss}%`);
console.log(`   评级: ${stopLoss.discipline}\n`);

console.log('✅ 测试完成！');
