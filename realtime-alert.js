// realtime-alert.js - 实时交易预警系统

const BinancePsychology = require('./analyze');
const patterns = require('./patterns');
const WebSocket = require('ws');

class RealtimeAlert {
  constructor(apiKey, apiSecret, symbol) {
    this.analyzer = new BinancePsychology(apiKey, apiSecret);
    this.symbol = symbol;
    this.lastPrice = 0;
    this.priceHistory = [];
    this.recentTrades = [];
    this.alerts = [];
  }

  async start() {
    console.log(`🚨 启动实时预警: ${this.symbol}\n`);
    
    // 加载历史交易数据
    await this.loadHistory();
    
    // 连接 WebSocket 监听价格
    this.connectWebSocket();
    
    // 定期检查交易
    setInterval(() => this.checkNewTrades(), 30000); // 每 30 秒检查一次
  }

  async loadHistory() {
    console.log('📊 加载历史交易数据...');
    const trades = await this.analyzer.getTrades(this.symbol, 90);
    const klines = await this.analyzer.getKlines(this.symbol, '1h', 1000);
    this.recentTrades = this.analyzer.buildTradePairs(trades);
    this.klines = klines;
    
    console.log(`✅ 已加载 ${this.recentTrades.length} 笔历史交易\n`);
  }

  connectWebSocket() {
    const wsUrl = `wss://stream.binance.com:9443/ws/${this.symbol.toLowerCase()}@trade`;
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', () => {
      console.log('✅ WebSocket 已连接\n');
    });
    
    ws.on('message', (data) => {
      const trade = JSON.parse(data);
      const price = parseFloat(trade.p);
      
      this.lastPrice = price;
      this.priceHistory.push({ price, time: Date.now() });
      
      // 只保留最近 1 小时的数据
      const oneHourAgo = Date.now() - 3600000;
      this.priceHistory = this.priceHistory.filter(p => p.time > oneHourAgo);
      
      // 检查 FOMO
      this.checkFOMO();
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket 错误:', error.message);
    });
  }

  checkFOMO() {
    if (this.priceHistory.length < 2) return;
    
    const oneHourAgo = this.priceHistory[0].price;
    const currentPrice = this.lastPrice;
    const priceChange = ((currentPrice - oneHourAgo) / oneHourAgo) * 100;
    
    if (priceChange > 5) {
      // 计算历史 FOMO 胜率
      const fomoTrades = patterns.detectFOMO(this.recentTrades, this.klines);
      const fomoWinRate = fomoTrades.length > 0 
        ? (fomoTrades.filter(t => t.pnl > 0).length / fomoTrades.length * 100).toFixed(0)
        : 0;
      
      this.sendAlert({
        type: 'FOMO',
        severity: 'high',
        title: '🚨 FOMO 警告！',
        message: `${this.symbol} 刚涨了 ${priceChange.toFixed(1)}%\n\n你历史上有 ${fomoTrades.length} 次 FOMO，胜率 ${fomoWinRate}%\n\n建议：等待回调再买入`,
        price: currentPrice,
        priceChange
      });
    }
  }

  async checkNewTrades() {
    try {
      const trades = await this.analyzer.getTrades(this.symbol, 1);
      
      if (trades.length === 0) return;
      
      const lastTrade = trades[trades.length - 1];
      const lastHistoricalTrade = this.recentTrades[this.recentTrades.length - 1];
      
      // 检查是否有新交易
      if (!lastHistoricalTrade || lastTrade.time > lastHistoricalTrade.buyTime) {
        // 检查是否是报复性交易
        if (lastHistoricalTrade && lastHistoricalTrade.pnl < 0) {
          const timeSinceLastLoss = (lastTrade.time - lastHistoricalTrade.sellTime) / 60000; // 分钟
          
          if (timeSinceLastLoss < 30) {
            const revengeTrades = patterns.detectRevengeTrade(this.recentTrades);
            const revengeWinRate = revengeTrades.length > 0
              ? (revengeTrades.filter(t => t.pnl > 0).length / revengeTrades.length * 100).toFixed(0)
              : 0;
            
            this.sendAlert({
              type: 'REVENGE',
              severity: 'high',
              title: '⚡ 报复性交易警告！',
              message: `你刚在 ${timeSinceLastLoss.toFixed(0)} 分钟前亏损了 $${Math.abs(lastHistoricalTrade.pnl).toFixed(2)}\n\n你历史上有 ${revengeTrades.length} 次报复性交易，胜率 ${revengeWinRate}%\n\n建议：冷静 1 小时后再交易`,
              lastLoss: lastHistoricalTrade.pnl
            });
          }
        }
        
        // 检查交易时段
        const hour = new Date(lastTrade.time).getHours();
        const timePattern = patterns.analyzeTimePattern(this.recentTrades);
        const hourStats = timePattern.all.find(t => t.hour === hour);
        
        if (hourStats && hourStats.winRate < 0.3 && hourStats.count >= 3) {
          this.sendAlert({
            type: 'BAD_TIME',
            severity: 'medium',
            title: '⏰ 时段警告',
            message: `${hour}:00 是你表现较差的时段\n\n历史胜率: ${(hourStats.winRate * 100).toFixed(0)}%\n\n建议：考虑换个时间交易`,
            hour,
            winRate: hourStats.winRate
          });
        }
      }
    } catch (e) {
      console.error('检查交易失败:', e.message);
    }
  }

  sendAlert(alert) {
    // 避免重复警告（5 分钟内）
    const fiveMinAgo = Date.now() - 300000;
    const recentSameType = this.alerts.filter(a => 
      a.type === alert.type && a.time > fiveMinAgo
    );
    
    if (recentSameType.length > 0) return;
    
    alert.time = Date.now();
    this.alerts.push(alert);
    
    // 显示警告
    console.log('\n' + '='.repeat(60));
    console.log(alert.title);
    console.log('='.repeat(60));
    console.log(alert.message);
    console.log('='.repeat(60) + '\n');
    
    // 发送到前端（通过 WebSocket 或 SSE）
    if (this.onAlert) {
      this.onAlert(alert);
    }
  }
}

module.exports = RealtimeAlert;

// 命令行使用
if (require.main === module) {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;
  const symbol = process.argv[2] || 'BTCUSDT';
  
  if (!apiKey || !apiSecret) {
    console.log('❌ 请设置 BINANCE_API_KEY 和 BINANCE_API_SECRET');
    process.exit(1);
  }
  
  const alert = new RealtimeAlert(apiKey, apiSecret, symbol);
  alert.start();
}
