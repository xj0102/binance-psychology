// realtime-monitor.js - 实时监控系统

const axios = require('axios');
const crypto = require('crypto');
const WebSocket = require('ws');

class RealtimeMonitor {
  constructor(apiKey, apiSecret, alertCallback) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.alertCallback = alertCallback;
    this.baseUrl = 'https://api.binance.com';
    this.wsUrl = 'wss://stream.binance.com:9443/ws';
    
    // 用户历史数据
    this.userStats = {
      fomoCount: 0,
      revengeCount: 0,
      nightTradeWinRate: 0,
      avgStopLoss: 0
    };
    
    // 最近交易
    this.recentTrades = [];
  }

  sign(params) {
    const query = new URLSearchParams(params).toString();
    return crypto.createHmac('sha256', this.apiSecret).update(query).digest('hex');
  }

  // 加载用户历史统计
  async loadUserStats() {
    // 从历史分析中加载
    // 这里简化处理
    this.userStats = {
      fomoCount: 5,
      revengeCount: 4,
      nightTradeWinRate: 8,
      avgStopLoss: 26.2
    };
  }

  // 获取当前持仓
  async getCurrentPositions() {
    const timestamp = Date.now();
    const params = { timestamp };
    const signature = this.sign(params);
    
    const url = `${this.baseUrl}/api/v3/account`;
    const resp = await axios.get(url, {
      params: { ...params, signature },
      headers: { 'X-MBX-APIKEY': this.apiKey }
    });
    
    return resp.data.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);
  }

  // 获取最近价格
  async getRecentPrice(symbol) {
    const url = `${this.baseUrl}/api/v3/klines`;
    const resp = await axios.get(url, {
      params: { symbol, interval: '1h', limit: 2 }
    });
    
    const prev = parseFloat(resp.data[0][4]); // 前一小时收盘价
    const current = parseFloat(resp.data[1][4]); // 当前价格
    const change = ((current - prev) / prev) * 100;
    
    return { current, prev, change };
  }

  // 检测 FOMO
  async checkFOMO(symbol, action) {
    if (action !== 'BUY') return null;
    
    const price = await this.getRecentPrice(symbol);
    
    if (price.change > 5) {
      return {
        type: 'FOMO',
        severity: 'high',
        message: `🚨 FOMO 警告！\n\n${symbol} 刚涨了 ${price.change.toFixed(1)}%\n\n你历史上有 ${this.userStats.fomoCount} 次 FOMO，胜率 0%\n\n建议：等待回调再买入`,
        action: 'block'
      };
    }
    
    return null;
  }

  // 检测报复性交易
  async checkRevengeTrade(symbol, action) {
    if (this.recentTrades.length === 0) return null;
    
    const lastTrade = this.recentTrades[this.recentTrades.length - 1];
    const timeDiff = (Date.now() - lastTrade.time) / 1000 / 60; // 分钟
    
    if (lastTrade.pnl < 0 && timeDiff < 30) {
      return {
        type: 'REVENGE',
        severity: 'high',
        message: `🚨 报复性交易警告！\n\n你刚亏损 $${Math.abs(lastTrade.pnl).toFixed(2)}\n${timeDiff.toFixed(0)} 分钟后又要交易\n\n你历史上有 ${this.userStats.revengeCount} 次报复性交易，胜率 25%\n\n建议：休息 1 小时冷静一下`,
        action: 'block'
      };
    }
    
    return null;
  }

  // 检测时段问题
  checkTimeOfDay() {
    const hour = new Date().getHours();
    
    if (hour >= 22 || hour <= 2) {
      return {
        type: 'TIME',
        severity: 'medium',
        message: `⚠️  时段警告！\n\n现在是 ${hour}:00\n你在深夜的胜率只有 ${this.userStats.nightTradeWinRate}%\n\n建议：明天白天再交易`,
        action: 'warn'
      };
    }
    
    return null;
  }

  // 检测止损
  async checkStopLoss(symbol, position) {
    // 获取当前价格
    const price = await this.getRecentPrice(symbol);
    const entryPrice = position.entryPrice;
    const currentLoss = ((price.current - entryPrice) / entryPrice) * 100;
    
    if (currentLoss < -5 && currentLoss > -this.userStats.avgStopLoss) {
      return {
        type: 'STOPLOSS',
        severity: 'high',
        message: `🚨 止损警告！\n\n${symbol} 已亏损 ${Math.abs(currentLoss).toFixed(1)}%\n\n你的平均止损点是 ${this.userStats.avgStopLoss}%\n建议止损点：-3%\n\n建议：立即止损`,
        action: 'warn'
      };
    }
    
    return null;
  }

  // 监听用户订单流
  async startMonitoring() {
    console.log('🔍 开始实时监控...\n');
    
    await this.loadUserStats();
    
    // 定时检查（每 10 秒）
    setInterval(async () => {
      try {
        const positions = await this.getCurrentPositions();
        
        for (const pos of positions) {
          if (parseFloat(pos.free) === 0 && parseFloat(pos.locked) === 0) continue;
          
          const symbol = pos.asset + 'USDT';
          
          // 检查各种风险
          const fomoAlert = await this.checkFOMO(symbol, 'BUY');
          const revengeAlert = await this.checkRevengeTrade(symbol, 'BUY');
          const timeAlert = this.checkTimeOfDay();
          
          if (fomoAlert) this.alertCallback(fomoAlert);
          if (revengeAlert) this.alertCallback(revengeAlert);
          if (timeAlert) this.alertCallback(timeAlert);
        }
      } catch (e) {
        console.error('监控错误:', e.message);
      }
    }, 10000);
  }
}

// CLI 测试
if (require.main === module) {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.log('❌ 请设置 BINANCE_API_KEY 和 BINANCE_API_SECRET');
    process.exit(1);
  }
  
  const monitor = new RealtimeMonitor(apiKey, apiSecret, (alert) => {
    console.log('\n' + '='.repeat(60));
    console.log(alert.message);
    console.log('='.repeat(60) + '\n');
  });
  
  monitor.startMonitoring();
}

module.exports = RealtimeMonitor;
