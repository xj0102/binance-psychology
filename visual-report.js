// visual-report.js - 可视化报告生成

const fs = require('fs');
const path = require('path');

class VisualReport {
  constructor(analysisData) {
    this.data = analysisData;
  }

  generateHTML() {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>交易心理分析报告</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      text-align: center;
      color: #667eea;
      margin-bottom: 10px;
      font-size: 2.5em;
    }
    .subtitle {
      text-align: center;
      color: #999;
      margin-bottom: 40px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 15px;
      text-align: center;
    }
    .stat-value {
      font-size: 2.5em;
      font-weight: bold;
      margin: 10px 0;
    }
    .stat-label {
      opacity: 0.9;
      font-size: 0.9em;
    }
    .chart-container {
      margin: 40px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 15px;
    }
    .chart-title {
      font-size: 1.5em;
      margin-bottom: 20px;
      color: #667eea;
    }
    .problems {
      margin: 40px 0;
    }
    .problem-card {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 15px 0;
      border-radius: 10px;
    }
    .problem-card.high {
      background: #f8d7da;
      border-left-color: #dc3545;
    }
    .suggestions {
      background: #d1ecf1;
      border-left: 4px solid #17a2b8;
      padding: 20px;
      margin: 20px 0;
      border-radius: 10px;
    }
    .suggestions h3 {
      color: #17a2b8;
      margin-bottom: 15px;
    }
    .suggestions ul {
      list-style: none;
      padding-left: 0;
    }
    .suggestions li {
      padding: 10px 0;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }
    .suggestions li:last-child {
      border-bottom: none;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧠 交易心理分析报告</h1>
    <p class="subtitle">基于真实交易数据的深度心理分析</p>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">总交易</div>
        <div class="stat-value">${this.data.totalTrades}</div>
        <div class="stat-label">笔</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">胜率</div>
        <div class="stat-value">${this.data.winRate}%</div>
        <div class="stat-label">${this.data.wins}胜 ${this.data.losses}负</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">总盈亏</div>
        <div class="stat-value">$${this.data.totalPnl}</div>
        <div class="stat-label">${this.data.totalPnl >= 0 ? '盈利' : '亏损'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">盈亏比</div>
        <div class="stat-value">${this.data.profitFactor}</div>
        <div class="stat-label">平均盈利/平均亏损</div>
      </div>
    </div>

    <div class="chart-container">
      <h3 class="chart-title">📊 时段胜率分析</h3>
      <canvas id="timeChart"></canvas>
    </div>

    <div class="chart-container">
      <h3 class="chart-title">📈 盈亏分布</h3>
      <canvas id="pnlChart"></canvas>
    </div>

    <div class="problems">
      <h2 style="color: #dc3545; margin-bottom: 20px;">🔴 发现的问题</h2>
      ${this.generateProblems()}
    </div>

    <div class="suggestions">
      <h3>💡 改进建议</h3>
      <ul>
        ${this.generateSuggestions()}
      </ul>
    </div>

    <div class="footer">
      <p>币安交易心理分析助手</p>
      <p>GitHub: <a href="https://github.com/xj0102/binance-psychology">xj0102/binance-psychology</a></p>
    </div>
  </div>

  <script>
    // 时段胜率图
    const timeCtx = document.getElementById('timeChart').getContext('2d');
    new Chart(timeCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(this.data.timePattern.map(t => t.hour + ':00'))},
        datasets: [{
          label: '胜率 (%)',
          data: ${JSON.stringify(this.data.timePattern.map(t => t.winRate))},
          backgroundColor: ${JSON.stringify(this.data.timePattern.map(t => t.winRate > 50 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'))},
          borderColor: ${JSON.stringify(this.data.timePattern.map(t => t.winRate > 50 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'))},
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });

    // 盈亏分布图
    const pnlCtx = document.getElementById('pnlChart').getContext('2d');
    new Chart(pnlCtx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(this.data.pnlHistory.map((_, i) => '第' + (i+1) + '笔'))},
        datasets: [{
          label: '累计盈亏 ($)',
          data: ${JSON.stringify(this.data.pnlHistory)},
          borderColor: 'rgba(102, 126, 234, 1)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  </script>
</body>
</html>
`;
    return html;
  }

  generateProblems() {
    let html = '';
    
    if (this.data.fomoCount > 0) {
      html += `
        <div class="problem-card high">
          <h4>🔴 FOMO（追涨）</h4>
          <p>${this.data.fomoCount} 次在暴涨后追涨，胜率 ${this.data.fomoWinRate}%</p>
          <p>总亏损: $${Math.abs(this.data.fomoLoss).toFixed(2)}</p>
        </div>
      `;
    }
    
    if (this.data.revengeCount > 0) {
      html += `
        <div class="problem-card high">
          <h4>🔴 报复性交易</h4>
          <p>${this.data.revengeCount} 次亏损后立即加仓，胜率 ${this.data.revengeWinRate}%</p>
        </div>
      `;
    }
    
    if (this.data.stopLossDiscipline === '较差') {
      html += `
        <div class="problem-card high">
          <h4>🔴 止损纪律较差</h4>
          <p>${this.data.bigLossCount} 次亏损超过 5%</p>
          <p>平均止损点: ${this.data.avgStopLoss}%（建议 3%）</p>
        </div>
      `;
    }
    
    return html || '<p>✅ 未发现明显问题</p>';
  }

  generateSuggestions() {
    const suggestions = [];
    
    if (this.data.fomoCount > 0) {
      suggestions.push('<li>✅ 避免追涨：价格 1 小时涨幅 > 5% 时等待回调</li>');
    }
    
    if (this.data.revengeCount > 0) {
      suggestions.push('<li>✅ 亏损后休息：强制休息 1 小时再交易</li>');
    }
    
    if (this.data.worstHour) {
      suggestions.push(`<li>✅ 调整时段：避开 ${this.data.worstHour}:00，多在 ${this.data.bestHour}:00 交易</li>`);
    }
    
    if (parseFloat(this.data.avgStopLoss) > 5) {
      suggestions.push('<li>✅ 严格止损：设置 -3% 自动止损</li>');
    }
    
    return suggestions.join('') || '<li>继续保持良好的交易纪律</li>';
  }

  save(filename = 'report.html') {
    const html = this.generateHTML();
    fs.writeFileSync(filename, html);
    console.log(`✅ 报告已生成: ${filename}`);
    return filename;
  }
}

module.exports = VisualReport;
