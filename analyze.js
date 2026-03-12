// analyze.js - 币安交易心理分析

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

class BinancePsychology {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://api.binance.com';
  }

  // 签名
  sign(params) {
    const query = new URLSearchParams(params).toString();
    return crypto.createHmac('sha256', this.apiSecret).update(query).digest('hex');
  }

  // 获取交易历史
  async getTrades(symbol, days = 30) {
    const timestamp = Date.now();
    const startTime = timestamp - days * 86400000;
    
    const params = { symbol, startTime, timestamp };
    const signature = this.sign(params);
    
    const url = `${this.baseUrl}/api/v3/myTrades`;
    const resp = await axios.get(url, {
      params: { ...params, signature },
      headers: { 'X-MBX-APIKEY': this.apiKey }
    });
    
    return resp.data;
  }

  // 获取历史价格（用于检测 FOMO）
  async getKlines(symbol, interval = '1h', limit = 500) {
    const url = `${this.baseUrl}/api/v3/klines`;
    const resp = await axios.get(url, {
      params: { symbol, interval, limit }
    });
    return resp.data.map(k => ({
      time: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4])
    }));
  }

  // 构建交易对（买入 + 卖出）
  buildTradePairs(trades) {
    const pairs = [];
    let position = 0;
    let buyTrades = [];
    
    for (const trade of trades) {
      const qty = parseFloat(trade.qty);
      const price = parseFloat(trade.price);
      
      if (trade.isBuyer) {
        buyTrades.push({ time: trade.time, price, qty });
        position += qty;
      } else {
        // 卖出
        let remaining = qty;
        
        while (remaining > 0 && buyTrades.length > 0) {
          const buy = buyTrades[0];
          const matched = Math.min(remaining, buy.qty);
          
          pairs.push({
            buyTime: buy.time,
            buyPrice: buy.price,
            sellTime: trade.time,
            sellPrice: price,
            qty: matched,
            pnl: (price - buy.price) * matched,
            holdTime: (trade.time - buy.time) / 1000
          });
          
          buy.qty -= matched;
          remaining -= matched;
          position -= matched;
          
          if (buy.qty <= 0) buyTrades.shift();
        }
      }
    }
    
    return pairs;
  }

  // FOMO 检测
  detectFOMO(pairs, klines) {
    const fomo = [];
    
    for (const pair of pairs) {
      // 找到买入前 1 小时的价格
      const buyKline = klines.find(k => Math.abs(k.time - pair.buyTime) < 3600000);
      if (!buyKline) continue;
      
      const priceChange = ((pair.buyPrice - buyKline.open) / buyKline.open) * 100;
      
      if (priceChange > 5) {
        fomo.push({ ...pair, priceChange });
      }
    }
    
    const winRate = fomo.filter(t => t.pnl > 0).length / (fomo.length || 1);
    const avgLoss = fomo.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / (fomo.filter(t => t.pnl < 0).length || 1);
    
    return {
      count: fomo.length,
      winRate: (winRate * 100).toFixed(0),
      avgLoss: avgLoss.toFixed(2),
      trades: fomo
    };
  }

  // 报复性交易检测
  detectRevenge(pairs) {
    const revenge = [];
    
    for (let i = 1; i < pairs.length; i++) {
      const prev = pairs[i-1];
      const curr = pairs[i];
      
      const timeDiff = (curr.buyTime - prev.sellTime) / 1000;
      const sizeIncrease = curr.qty / prev.qty;
      
      if (prev.pnl < 0 && timeDiff < 1800 && sizeIncrease > 1.3) {
        revenge.push({
          ...curr,
          prevLoss: prev.pnl,
          sizeIncrease: sizeIncrease.toFixed(1)
        });
      }
    }
    
    const winRate = revenge.filter(t => t.pnl > 0).length / (revenge.length || 1);
    
    return {
      count: revenge.length,
      winRate: (winRate * 100).toFixed(0),
      trades: revenge
    };
  }

  // 时段分析
  analyzeTimePattern(pairs) {
    const byHour = Array(24).fill(null).map(() => ({ total: 0, win: 0, pnl: 0 }));
    
    pairs.forEach(p => {
      const hour = new Date(p.buyTime).getHours();
      byHour[hour].total++;
      if (p.pnl > 0) byHour[hour].win++;
      byHour[hour].pnl += p.pnl;
    });
    
    const stats = byHour.map((d, h) => ({
      hour: h,
      winRate: d.total > 0 ? (d.win / d.total * 100).toFixed(0) : 0,
      count: d.total,
      pnl: d.pnl.toFixed(2)
    })).filter(s => s.count > 0);
    
    stats.sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
    
    return {
      best: stats[0],
      worst: stats[stats.length - 1],
      all: stats
    };
  }

  // 止损纪律
  analyzeStopLoss(pairs) {
    const losses = pairs.filter(p => p.pnl < 0);
    const bigLosses = losses.filter(p => Math.abs(p.pnl / (p.buyPrice * p.qty)) > 0.05);
    
    const avgStopLoss = losses.reduce((sum, p) => sum + Math.abs(p.pnl / (p.buyPrice * p.qty)), 0) / (losses.length || 1) * 100;
    
    return {
      bigLossCount: bigLosses.length,
      avgStopLoss: avgStopLoss.toFixed(1),
      discipline: avgStopLoss < 5 ? '良好' : avgStopLoss < 8 ? '一般' : '较差'
    };
  }

  // 生成报告
  async generateReport(symbol, days = 7) {
    console.log(`📊 正在分析 ${symbol} 最近 ${days} 天的交易...\n`);
    
    const trades = await this.getTrades(symbol, days);
    const klines = await this.getKlines(symbol, '1h', days * 24);
    const pairs = this.buildTradePairs(trades);
    
    if (pairs.length === 0) {
      return '📭 最近没有交易记录';
    }
    
    const patterns = require('./patterns');
    const fomo = patterns.detectFOMO(pairs, klines);
    const revenge = patterns.detectRevengeTrade(pairs);
    const timePattern = patterns.analyzeTimePattern(pairs);
    const stopLoss = patterns.analyzeStopLoss(pairs);
    
    const winRate = (pairs.filter(p => p.pnl > 0).length / pairs.length * 100).toFixed(0);
    const totalPnl = pairs.reduce((sum, p) => sum + p.pnl, 0).toFixed(2);
    
    let report = `📊 交易心理分析报告\n\n`;
    report += `时间: 最近 ${days} 天\n`;
    report += `总交易: ${pairs.length} 笔\n`;
    report += `胜率: ${winRate}%\n`;
    report += `盈亏: $${totalPnl}\n\n`;
    
    const problems = [];
    
    if (fomo.length > 0) {
      const fomoWinRate = (fomo.filter(t => t.pnl > 0).length / fomo.length * 100).toFixed(0);
      problems.push(`FOMO（追涨）: ${fomo.length} 次，胜率 ${fomoWinRate}%`);
    }
    
    if (revenge.length > 0) {
      const revengeWinRate = (revenge.filter(t => t.pnl > 0).length / revenge.length * 100).toFixed(0);
      problems.push(`报复性交易: ${revenge.length} 次，胜率 ${revengeWinRate}%`);
    }
    
    if (timePattern.worst && parseFloat(timePattern.worst.winRate) < 40) {
      problems.push(`时段问题: ${timePattern.worst.hour}:00 胜率最低（${(timePattern.worst.winRate * 100).toFixed(0)}%）`);
    }
    
    if (stopLoss.discipline === '较差' || stopLoss.discipline === '一般') {
      problems.push(`止损纪律${stopLoss.discipline}: ${stopLoss.bigLossCount} 次大额亏损`);
    }
    
    if (problems.length > 0) {
      report += `🔴 发现的问题:\n\n`;
      problems.forEach((p, i) => {
        report += `${i+1}. ${p}\n`;
      });
      report += `\n`;
    } else {
      report += `✅ 未发现明显问题，交易纪律良好！\n\n`;
    }
    
    report += `💡 改进建议:\n\n`;
    
    if (fomo.length > 0) {
      report += `- 避免追涨: 价格 1 小时涨幅 > 5% 时等待回调\n`;
    }
    
    if (revenge.length > 0) {
      report += `- 亏损后休息: 强制休息 1 小时再交易\n`;
    }
    
    if (timePattern.worst && parseFloat(timePattern.worst.winRate) < 40) {
      report += `- 调整时段: 避开 ${timePattern.worst.hour}:00，多在 ${timePattern.best.hour}:00 交易\n`;
    }
    
    if (parseFloat(stopLoss.avgStopLoss) > 5) {
      report += `- 严格止损: 设置 -3% 自动止损\n`;
    }
    
    return report;
  }
}

module.exports = BinancePsychology;

// CLI 使用
if (require.main === module) {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;
  const symbol = process.argv[2] || 'BTCUSDT';
  const days = parseInt(process.argv[3]) || 7;
  
  if (!apiKey || !apiSecret) {
    console.log('❌ 请设置 BINANCE_API_KEY 和 BINANCE_API_SECRET');
    process.exit(1);
  }
  
  const analyzer = new BinancePsychology(apiKey, apiSecret);
  analyzer.generateReport(symbol, days).then(report => {
    console.log(report);
  }).catch(e => {
    console.error('❌ 错误:', e.message);
  });
}
