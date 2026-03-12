// detailed-report.js - 详细分析报告

const axios = require('axios');
const crypto = require('crypto');
const patterns = require('./patterns');

class DetailedAnalyzer {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://api.binance.com';
  }

  sign(params) {
    const query = new URLSearchParams(params).toString();
    return crypto.createHmac('sha256', this.apiSecret).update(query).digest('hex');
  }

  async getTrades(symbol, days = 365) {
    const timestamp = Date.now();
    const startTime = timestamp - days * 86400000;
    
    const params = { symbol, startTime, timestamp, limit: 1000 };
    const signature = this.sign(params);
    
    const url = `${this.baseUrl}/api/v3/myTrades`;
    const resp = await axios.get(url, {
      params: { ...params, signature },
      headers: { 'X-MBX-APIKEY': this.apiKey }
    });
    
    return resp.data;
  }

  async getKlines(symbol, interval = '1h', limit = 1000) {
    const url = `${this.baseUrl}/api/v3/klines`;
    const resp = await axios.get(url, {
      params: { symbol, interval, limit }
    });
    return resp.data.map(k => ({
      time: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5])
    }));
  }

  buildTradePairs(trades) {
    const pairs = [];
    let position = 0;
    let buyTrades = [];
    
    for (const trade of trades) {
      const qty = parseFloat(trade.qty);
      const price = parseFloat(trade.price);
      const commission = parseFloat(trade.commission);
      
      if (trade.isBuyer) {
        buyTrades.push({ time: trade.time, price, qty, commission });
        position += qty;
      } else {
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
            pnl: (price - buy.price) * matched - buy.commission - commission,
            holdTime: (trade.time - buy.time) / 1000,
            buyHour: new Date(buy.time).getHours(),
            sellHour: new Date(trade.time).getHours()
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

  async generateDetailedReport(symbol, days = 365) {
    console.log(`\n🧠 ${symbol} 详细交易心理分析\n`);
    console.log('='.repeat(60));
    console.log('\n');
    
    const trades = await this.getTrades(symbol, days);
    
    if (trades.length === 0) {
      return `📭 最近 ${days} 天没有 ${symbol} 的交易记录`;
    }

    const klines = await this.getKlines(symbol, '1h', Math.min(days * 24, 1000));
    const pairs = this.buildTradePairs(trades);
    
    if (pairs.length === 0) {
      return `📭 没有完整的交易对（买入+卖出）`;
    }

    // 基础统计
    const wins = pairs.filter(p => p.pnl > 0);
    const losses = pairs.filter(p => p.pnl < 0);
    const winRate = (wins.length / pairs.length * 100).toFixed(1);
    const totalPnl = pairs.reduce((sum, p) => sum + p.pnl, 0);
    const avgWin = wins.length > 0 ? wins.reduce((sum, p) => sum + p.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, p) => sum + p.pnl, 0) / losses.length : 0;
    const profitFactor = avgWin / Math.abs(avgLoss);
    
    console.log('📊 基础统计\n');
    console.log(`时间范围: ${new Date(pairs[0].buyTime).toLocaleDateString()} - ${new Date(pairs[pairs.length-1].sellTime).toLocaleDateString()}`);
    console.log(`总交易: ${pairs.length} 笔`);
    console.log(`盈利: ${wins.length} 笔 (平均 $${avgWin.toFixed(2)})`);
    console.log(`亏损: ${losses.length} 笔 (平均 $${avgLoss.toFixed(2)})`);
    console.log(`胜率: ${winRate}%`);
    console.log(`总盈亏: $${totalPnl.toFixed(2)}`);
    console.log(`盈亏比: ${profitFactor.toFixed(2)}`);
    console.log('\n');

    // FOMO 分析
    const fomo = patterns.detectFOMO(pairs, klines);
    if (fomo.length > 0) {
      const fomoWinRate = (fomo.filter(t => t.pnl > 0).length / fomo.length * 100).toFixed(0);
      const fomoLoss = fomo.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0);
      
      console.log('🔴 1. FOMO（追涨）分析\n');
      console.log(`发现次数: ${fomo.length} 次`);
      console.log(`胜率: ${fomoWinRate}%`);
      console.log(`总亏损: $${fomoLoss.toFixed(2)}`);
      console.log(`占总亏损: ${(Math.abs(fomoLoss) / Math.abs(totalPnl) * 100).toFixed(0)}%`);
      
      console.log('\n典型案例:');
      fomo.slice(0, 3).forEach((t, i) => {
        console.log(`  ${i+1}. ${new Date(t.buyTime).toLocaleString()}`);
        console.log(`     价格暴涨 ${t.priceChange.toFixed(1)}% 后追涨`);
        console.log(`     买入 $${t.buyPrice.toFixed(2)} → 卖出 $${t.sellPrice.toFixed(2)}`);
        console.log(`     亏损 $${t.pnl.toFixed(2)}`);
      });
      console.log('\n');
    }

    // 报复性交易
    const revenge = patterns.detectRevengeTrade(pairs);
    if (revenge.length > 0) {
      const revengeWinRate = (revenge.filter(t => t.pnl > 0).length / revenge.length * 100).toFixed(0);
      const revengeLoss = revenge.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0);
      
      console.log('🔴 2. 报复性交易分析\n');
      console.log(`发现次数: ${revenge.length} 次`);
      console.log(`胜率: ${revengeWinRate}%`);
      console.log(`总亏损: $${revengeLoss.toFixed(2)}`);
      
      console.log('\n典型案例:');
      revenge.slice(0, 3).forEach((t, i) => {
        console.log(`  ${i+1}. ${new Date(t.buyTime).toLocaleString()}`);
        console.log(`     前一笔亏损 $${t.prevLoss.toFixed(2)}`);
        console.log(`     ${(t.timeDiff / 60).toFixed(0)} 分钟后加仓 ${((t.sizeIncrease - 1) * 100).toFixed(0)}%`);
        console.log(`     结果: ${t.pnl > 0 ? '盈利' : '亏损'} $${t.pnl.toFixed(2)}`);
      });
      console.log('\n');
    }

    // 时段分析
    const timePattern = patterns.analyzeTimePattern(pairs);
    console.log('📊 3. 时段分析\n');
    console.log('各时段表现:');
    timePattern.all.forEach(t => {
      const emoji = t.winRate > 0.6 ? '🟢' : t.winRate > 0.4 ? '🟡' : '🔴';
      console.log(`  ${emoji} ${String(t.hour).padStart(2, '0')}:00 - 胜率 ${(t.winRate * 100).toFixed(0)}% (${t.count} 笔, $${t.pnl.toFixed(2)})`);
    });
    console.log('\n');

    // 持仓时间分析
    const holdTime = patterns.analyzeHoldTime(pairs);
    console.log('⏱️  4. 持仓时间分析\n');
    console.log(`短线 (< 1小时): ${holdTime.short.count} 笔, 胜率 ${(holdTime.short.winRate * 100).toFixed(0)}%, 平均 $${holdTime.short.avgPnl.toFixed(2)}`);
    console.log(`中线 (1小时-1天): ${holdTime.medium.count} 笔, 胜率 ${(holdTime.medium.winRate * 100).toFixed(0)}%, 平均 $${holdTime.medium.avgPnl.toFixed(2)}`);
    console.log(`长线 (> 1天): ${holdTime.long.count} 笔, 胜率 ${(holdTime.long.winRate * 100).toFixed(0)}%, 平均 $${holdTime.long.avgPnl.toFixed(2)}`);
    console.log('\n');

    // 止损分析
    const stopLoss = patterns.analyzeStopLoss(pairs);
    console.log('🛑 5. 止损纪律分析\n');
    console.log(`止损纪律: ${stopLoss.discipline}`);
    console.log(`大额亏损 (> 5%): ${stopLoss.bigLossCount} 次`);
    console.log(`平均止损点: ${stopLoss.avgStopLoss}%`);
    
    const biggestLoss = losses.sort((a, b) => a.pnl - b.pnl)[0];
    if (biggestLoss) {
      console.log(`\n最大单笔亏损:`);
      console.log(`  时间: ${new Date(biggestLoss.buyTime).toLocaleString()}`);
      console.log(`  亏损: $${biggestLoss.pnl.toFixed(2)} (${(biggestLoss.pnl / (biggestLoss.buyPrice * biggestLoss.qty) * 100).toFixed(1)}%)`);
      console.log(`  持仓时间: ${(biggestLoss.holdTime / 3600).toFixed(1)} 小时`);
    }
    console.log('\n');

    // 综合建议
    console.log('💡 综合改进建议\n');
    console.log('='.repeat(60));
    console.log('\n');
    
    if (revenge.length > pairs.length * 0.2) {
      console.log('🔴 优先级 1: 控制报复性交易');
      console.log('   - 亏损后强制休息 1 小时');
      console.log('   - 设置每日最大亏损额度');
      console.log('   - 达到亏损额度后停止交易\n');
    }
    
    if (parseFloat(stopLoss.avgStopLoss) > 5) {
      console.log('🔴 优先级 2: 严格止损纪律');
      console.log('   - 设置 -3% 自动止损');
      console.log('   - 不要心存侥幸');
      console.log('   - 止损后不要立即反向开仓\n');
    }
    
    if (timePattern.worst && timePattern.worst.winRate < 0.3) {
      console.log('🟡 优先级 3: 调整交易时段');
      console.log(`   - 避开 ${timePattern.worst.hour}:00 (胜率 ${(timePattern.worst.winRate * 100).toFixed(0)}%)`);
      console.log(`   - 多在 ${timePattern.best.hour}:00 交易 (胜率 ${(timePattern.best.winRate * 100).toFixed(0)}%)`);
      console.log('   - 晚上容易情绪化，建议只在白天交易\n');
    }
    
    if (holdTime.short.winRate < 0.3 && holdTime.long.winRate > 0.5) {
      console.log('🟡 优先级 4: 减少短线交易');
      console.log(`   - 你的短线胜率只有 ${(holdTime.short.winRate * 100).toFixed(0)}%`);
      console.log(`   - 长线胜率有 ${(holdTime.long.winRate * 100).toFixed(0)}%`);
      console.log('   - 建议持仓时间 > 1 天\n');
    }
    
    console.log('📈 预期改进效果:\n');
    console.log(`如果遵循以上建议:`);
    console.log(`  - 胜率可能从 ${winRate}% 提升至 45-55%`);
    console.log(`  - 月盈亏可能从 $${(totalPnl / (days / 30)).toFixed(2)} 转正`);
    console.log(`  - 最大回撤可能减少 50%+`);
    console.log('\n');
  }
}

// CLI
if (require.main === module) {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;
  const symbol = process.argv[2] || 'BTCUSDT';
  const days = parseInt(process.argv[3]) || 365;
  
  if (!apiKey || !apiSecret) {
    console.log('❌ 请设置 BINANCE_API_KEY 和 BINANCE_API_SECRET');
    process.exit(1);
  }
  
  const analyzer = new DetailedAnalyzer(apiKey, apiSecret);
  analyzer.generateDetailedReport(symbol, days).catch(e => {
    console.error('❌ 错误:', e.message);
  });
}

module.exports = DetailedAnalyzer;
