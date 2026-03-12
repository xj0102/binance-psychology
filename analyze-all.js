// analyze-all.js - 分析所有交易过的币种

const BinancePsychology = require('./analyze');
const patterns = require('./patterns');
const VisualReport = require('./visual-report');
const fs = require('fs');

async function analyzeAll() {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;
  const days = parseInt(process.argv[2]) || 365;
  
  if (!apiKey || !apiSecret) {
    console.log('❌ 请设置 BINANCE_API_KEY 和 BINANCE_API_SECRET');
    process.exit(1);
  }
  
  console.log(`📊 正在扫描所有现货交易...\n`);
  
  const analyzer = new BinancePsychology(apiKey, apiSecret);
  
  // 常见交易对
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 
                   'DOGEUSDT', 'XRPUSDT', 'DOTUSDT', 'MATICUSDT', 'LINKUSDT'];
  
  const results = [];
  
  for (const symbol of symbols) {
    try {
      const trades = await analyzer.getTrades(symbol, days);
      
      if (trades.length > 0) {
        const pairs = analyzer.buildTradePairs(trades);
        
        if (pairs.length > 0) {
          const wins = pairs.filter(p => p.pnl > 0).length;
          const winRate = (wins / pairs.length * 100).toFixed(1);
          const totalPnl = pairs.reduce((sum, p) => sum + p.pnl, 0).toFixed(2);
          
          results.push({
            symbol,
            trades: pairs.length,
            winRate,
            totalPnl
          });
          
          console.log(`✓ ${symbol}: ${pairs.length} 笔交易, 胜率 ${winRate}%, 盈亏 $${totalPnl}`);
        }
      }
    } catch (e) {
      // 跳过没有交易的币种
    }
  }
  
  console.log(`\n📋 找到 ${results.length} 个有交易记录的币种\n`);
  
  if (results.length === 0) {
    console.log('❌ 没有找到任何交易记录');
    return;
  }
  
  // 生成选择页面
  generateSelectionPage(results);
}

function generateSelectionPage(results) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>现货交易分析 - 选择币种</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      color: white;
      margin-bottom: 48px;
    }
    h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .subtitle {
      font-size: 20px;
      opacity: 0.9;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    }
    .symbol {
      font-size: 32px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 16px;
    }
    .stats {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }
    .stat-label {
      color: #718096;
      font-weight: 500;
    }
    .stat-value {
      color: #2d3748;
      font-weight: 600;
    }
    .stat-value.positive {
      color: #38a169;
    }
    .stat-value.negative {
      color: #e53e3e;
    }
    .button {
      margin-top: 20px;
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .button:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>现货交易心理分析</h1>
      <p class="subtitle">选择要分析的币种</p>
    </div>
    <div class="grid">
      ${results.map(r => `
        <div class="card" onclick="analyze('${r.symbol}')">
          <div class="symbol">${r.symbol.replace('USDT', '')}</div>
          <div class="stats">
            <div class="stat">
              <span class="stat-label">交易次数</span>
              <span class="stat-value">${r.trades} 笔</span>
            </div>
            <div class="stat">
              <span class="stat-label">胜率</span>
              <span class="stat-value">${r.winRate}%</span>
            </div>
            <div class="stat">
              <span class="stat-label">总盈亏</span>
              <span class="stat-value ${parseFloat(r.totalPnl) >= 0 ? 'positive' : 'negative'}">$${r.totalPnl}</span>
            </div>
          </div>
          <button class="button">查看详细分析</button>
        </div>
      `).join('')}
    </div>
  </div>
  <script>
    function analyze(symbol) {
      alert('正在生成 ' + symbol + ' 的详细报告...\\n\\n请在终端运行:\\nnode generate-visual-report.js ' + symbol + ' 365');
    }
  </script>
</body>
</html>`;

  fs.writeFileSync('spot-selection.html', html);
  console.log('✅ 已生成选择页面: spot-selection.html');
  console.log('\n在浏览器中打开查看：');
  console.log('open spot-selection.html');
}

analyzeAll();
