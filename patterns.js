// patterns.js - 心理模式识别算法

// 计算价格变化
function calculatePriceChange(klines, startTime, endTime) {
  const start = klines.find(k => k.time <= startTime);
  const end = klines.find(k => k.time >= endTime);
  
  if (!start || !end) return 0;
  
  return ((end.close - start.open) / start.open) * 100;
}

// FOMO 检测
function detectFOMO(pairs, klines) {
  const fomo = [];
  
  for (const pair of pairs) {
    // 买入前 1 小时的价格变化
    const priceChange = calculatePriceChange(
      klines,
      pair.buyTime - 3600000,
      pair.buyTime
    );
    
    // 涨幅 > 5% 且最终亏损 = FOMO
    if (priceChange > 5 && pair.pnl < 0) {
      fomo.push({ ...pair, priceChange });
    }
  }
  
  return fomo;
}

// 报复性交易检测
function detectRevengeTrade(pairs) {
  const revenge = [];
  
  for (let i = 1; i < pairs.length; i++) {
    const prev = pairs[i-1];
    const curr = pairs[i];
    
    const timeDiff = (curr.buyTime - prev.sellTime) / 1000; // 秒
    const sizeIncrease = curr.qty / prev.qty;
    
    // 亏损后 30 分钟内 + 仓位增加 > 30%
    if (prev.pnl < 0 && timeDiff < 1800 && sizeIncrease > 1.3) {
      revenge.push({
        ...curr,
        prevLoss: prev.pnl,
        timeDiff,
        sizeIncrease
      });
    }
  }
  
  return revenge;
}

// 时段分析
function analyzeTimePattern(pairs) {
  const byHour = Array(24).fill(null).map(() => ({
    total: 0,
    win: 0,
    pnl: 0
  }));
  
  pairs.forEach(p => {
    const hour = new Date(p.buyTime).getHours();
    byHour[hour].total++;
    if (p.pnl > 0) byHour[hour].win++;
    byHour[hour].pnl += p.pnl;
  });
  
  const stats = byHour
    .map((d, h) => ({
      hour: h,
      winRate: d.total > 0 ? d.win / d.total : 0,
      count: d.total,
      pnl: d.pnl
    }))
    .filter(s => s.count > 0);
  
  stats.sort((a, b) => b.winRate - a.winRate);
  
  return {
    best: stats[0],
    worst: stats[stats.length - 1],
    all: stats
  };
}

// 持仓时间分析
function analyzeHoldTime(pairs) {
  const shortTerm = pairs.filter(p => p.holdTime < 3600); // < 1小时
  const mediumTerm = pairs.filter(p => p.holdTime >= 3600 && p.holdTime < 86400); // 1小时-1天
  const longTerm = pairs.filter(p => p.holdTime >= 86400); // > 1天
  
  const calc = (arr) => ({
    count: arr.length,
    winRate: arr.filter(t => t.pnl > 0).length / (arr.length || 1),
    avgPnl: arr.reduce((sum, t) => sum + t.pnl, 0) / (arr.length || 1)
  });
  
  return {
    short: calc(shortTerm),
    medium: calc(mediumTerm),
    long: calc(longTerm)
  };
}

// 止损纪律分析
function analyzeStopLoss(pairs) {
  const losses = pairs.filter(p => p.pnl < 0);
  const bigLosses = losses.filter(p => {
    const lossPercent = Math.abs(p.pnl / (p.buyPrice * p.qty));
    return lossPercent > 0.05; // 亏损 > 5%
  });
  
  const avgStopLoss = losses.reduce((sum, p) => {
    return sum + Math.abs(p.pnl / (p.buyPrice * p.qty));
  }, 0) / (losses.length || 1) * 100;
  
  return {
    bigLossCount: bigLosses.length,
    avgStopLoss: avgStopLoss.toFixed(1),
    discipline: avgStopLoss < 3 ? '优秀' : avgStopLoss < 5 ? '良好' : avgStopLoss < 8 ? '一般' : '较差'
  };
}

module.exports = {
  detectFOMO,
  detectRevengeTrade,
  analyzeTimePattern,
  analyzeHoldTime,
  analyzeStopLoss
};
