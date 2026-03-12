// visual-report.js - 现代专业风格报告

const fs = require('fs');

class VisualReport {
  constructor(data) {
    this.data = data;
  }

  generateHTML() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.data.symbol} Trading Psychology Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      color: #2d3748;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 60px 40px;
      color: white;
      text-align: center;
    }
    
    h1 {
      font-size: 42px;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }
    
    .subtitle {
      font-size: 18px;
      opacity: 0.9;
      font-weight: 400;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      padding: 40px;
      background: #f7fafc;
    }
    
    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid #e2e8f0;
    }
    
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    }
    
    .stat-label {
      color: #718096;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    
    .stat-value {
      font-size: 48px;
      font-weight: 700;
      margin: 16px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .stat-value.negative {
      background: linear-gradient(135deg, #f56565 0%, #c53030 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .stat-value.warning {
      background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .stat-desc {
      color: #a0aec0;
      font-size: 14px;
      font-weight: 500;
    }
    
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      margin-top: 16px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: 4px;
      transition: width 1s ease;
    }
    
    .section {
      padding: 48px 40px;
      border-top: 1px solid #e2e8f0;
    }
    
    .section-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 32px;
      color: #2d3748;
    }
    
    .chart-container {
      background: white;
      border-radius: 16px;
      padding: 32px;
      margin: 24px 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }
    
    .chart-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 24px;
      color: #4a5568;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 32px 0;
    }
    
    .metric-box {
      background: white;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
      transition: all 0.3s;
    }
    
    .metric-box:hover {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    
    .metric-label {
      color: #718096;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    
    .metric-value {
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .problem-grid {
      display: grid;
      gap: 20px;
      margin: 32px 0;
    }
    
    .problem-card {
      background: #fff5f5;
      border-left: 4px solid #f56565;
      border-radius: 12px;
      padding: 28px;
      box-shadow: 0 2px 8px rgba(245, 101, 101, 0.1);
    }
    
    .problem-title {
      color: #c53030;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    
    .problem-desc {
      color: #4a5568;
      font-size: 15px;
      line-height: 1.8;
    }
    
    .suggestions {
      background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%);
      border-radius: 16px;
      padding: 32px;
      margin: 32px 0;
    }
    
    .suggestions h3 {
      color: #234e52;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 24px;
    }
    
    .suggestion-item {
      color: #2d3748;
      font-size: 15px;
      padding: 16px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    
    .suggestion-item::before {
      content: '✓';
      color: #38b2ac;
      font-size: 20px;
      font-weight: 700;
      flex-shrink: 0;
    }
    
    .suggestion-item:last-child {
      border-bottom: none;
    }
    
    .trade-detail {
      background: white;
      border-radius: 12px;
      padding: 28px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
    }
    
    .trade-detail-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #4a5568;
    }
    
    .trade-detail-content {
      color: #718096;
      font-size: 14px;
      line-height: 1.8;
    }
    
    .footer {
      background: #2d3748;
      padding: 32px;
      text-align: center;
      color: #a0aec0;
      font-size: 14px;
    }
    
    .footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    
    .footer a:hover {
      color: #764ba2;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${this.data.symbol} 交易心理分析报告</h1>
      <p class="subtitle">深度交易分析与洞察</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">总交易次数</div>
        <div class="stat-value">${this.data.totalTrades}</div>
        <div class="stat-desc">已执行订单</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">胜率</div>
        <div class="stat-value ${parseFloat(this.data.winRate) < 30 ? 'negative' : parseFloat(this.data.winRate) < 50 ? 'warning' : ''}">${this.data.winRate}%</div>
        <div class="stat-desc">${this.data.wins} 胜 / ${this.data.losses} 负</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${this.data.winRate}%"></div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">总盈亏</div>
        <div class="stat-value ${parseFloat(this.data.totalPnl) < 0 ? 'negative' : ''}">$${this.data.totalPnl}</div>
        <div class="stat-desc">${parseFloat(this.data.totalPnl) >= 0 ? '盈利' : '亏损'}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">盈亏比</div>
        <div class="stat-value ${parseFloat(this.data.profitFactor) < 1 ? 'negative' : parseFloat(this.data.profitFactor) < 2 ? 'warning' : ''}">${this.data.profitFactor}</div>
        <div class="stat-desc">平均盈利 / 平均亏损</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">平均盈利</div>
        <div class="stat-value">$${this.data.avgWin}</div>
        <div class="stat-desc">每笔盈利交易</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">平均亏损</div>
        <div class="stat-value negative">$${this.data.avgLoss}</div>
        <div class="stat-desc">每笔亏损交易</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">最大连胜</div>
        <div class="stat-value">${this.data.maxWinStreak}</div>
        <div class="stat-desc">连续盈利次数</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">最大连亏</div>
        <div class="stat-value negative">${this.data.maxLossStreak}</div>
        <div class="stat-desc">连续亏损次数</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">最大回撤</div>
        <div class="stat-value negative">$${this.data.maxDrawdown}</div>
        <div class="stat-desc">峰值到谷底</div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">心理指标</h2>
      <div class="metrics-grid">
        <div class="metric-box">
          <div class="metric-label">FOMO 交易</div>
          <div class="metric-value">${this.data.fomoCount}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">FOMO 胜率</div>
          <div class="metric-value">${this.data.fomoWinRate}%</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">报复性交易</div>
          <div class="metric-value">${this.data.revengeCount}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">报复性胜率</div>
          <div class="metric-value">${this.data.revengeWinRate}%</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">大额亏损</div>
          <div class="metric-value">${this.data.bigLossCount}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">平均止损点</div>
          <div class="metric-value">${this.data.avgStopLoss}%</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">最佳时段</div>
          <div class="metric-value">${this.data.bestHour}:00</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">最差时段</div>
          <div class="metric-value">${this.data.worstHour}:00</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">持仓时间分析</h2>
      <div class="metrics-grid">
        <div class="metric-box">
          <div class="metric-label">短线 (&lt;1小时)</div>
          <div class="metric-value">${this.data.shortTermWinRate}%</div>
          <div class="stat-desc">${this.data.shortTermCount} 笔交易</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">中线 (1小时-1天)</div>
          <div class="metric-value">${this.data.mediumTermWinRate}%</div>
          <div class="stat-desc">${this.data.mediumTermCount} 笔交易</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">长线 (&gt;1天)</div>
          <div class="metric-value">${this.data.longTermWinRate}%</div>
          <div class="stat-desc">${this.data.longTermCount} 笔交易</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">最佳与最差交易</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <div class="trade-detail">
          <div class="trade-detail-title">🏆 最佳交易</div>
          <div class="trade-detail-content">
            盈亏: $${this.data.bestTrade.pnl}<br>
            日期: ${this.data.bestTrade.date}<br>
            持仓时间: ${this.data.bestTrade.holdTime} 小时
          </div>
        </div>
        <div class="trade-detail">
          <div class="trade-detail-title">💀 最差交易</div>
          <div class="trade-detail-content">
            盈亏: $${this.data.worstTrade.pnl}<br>
            日期: ${this.data.worstTrade.date}<br>
            持仓时间: ${this.data.worstTrade.holdTime} 小时
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">时段模式分析</h2>
      <div class="chart-container">
        <div class="chart-title">每小时胜率</div>
        <canvas id="timeChart"></canvas>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">盈亏演变</h2>
      <div class="chart-container">
        <div class="chart-title">累计盈亏</div>
        <canvas id="pnlChart"></canvas>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">发现的问题</h2>
      <div class="problem-grid">
        ${this.generateProblems()}
      </div>
    </div>

    <div class="section">
      <div class="suggestions">
        <h3>💡 改进建议</h3>
        ${this.generateSuggestions()}
      </div>
    </div>

    <div class="footer">
      <p>币安交易心理分析器</p>
      <p><a href="https://github.com/xj0102/binance-psychology" target="_blank">GitHub 仓库</a></p>
    </div>
  </div>

  <script>
    const timeCtx = document.getElementById('timeChart').getContext('2d');
    new Chart(timeCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(this.data.timePattern.map(t => t.hour + ':00'))},
        datasets: [{
          label: 'Win Rate (%)',
          data: ${JSON.stringify(this.data.timePattern.map(t => t.winRate))},
          backgroundColor: ${JSON.stringify(this.data.timePattern.map(t => {
            const rate = parseFloat(t.winRate);
            return rate > 50 ? 'rgba(102, 126, 234, 0.8)' : rate > 30 ? 'rgba(237, 137, 54, 0.8)' : 'rgba(245, 101, 101, 0.8)';
          }))},
          borderColor: ${JSON.stringify(this.data.timePattern.map(t => {
            const rate = parseFloat(t.winRate);
            return rate > 50 ? 'rgba(102, 126, 234, 1)' : rate > 30 ? 'rgba(237, 137, 54, 1)' : 'rgba(245, 101, 101, 1)';
          }))},
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#4a5568',
              font: { family: 'Inter', size: 12, weight: '600' }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { color: '#718096', font: { family: 'Inter', size: 11 } },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: {
            ticks: { color: '#718096', font: { family: 'Inter', size: 11 } },
            grid: { display: false }
          }
        }
      }
    });

    const pnlCtx = document.getElementById('pnlChart').getContext('2d');
    new Chart(pnlCtx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(this.data.pnlHistory.map((_, i) => 'Trade ' + (i+1)))},
        datasets: [{
          label: 'Cumulative P&L ($)',
          data: ${JSON.stringify(this.data.pnlHistory)},
          borderColor: 'rgba(102, 126, 234, 1)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: 'rgba(118, 75, 162, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#4a5568',
              font: { family: 'Inter', size: 12, weight: '600' }
            }
          }
        },
        scales: {
          y: {
            ticks: { color: '#718096', font: { family: 'Inter', size: 11 } },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: {
            ticks: { color: '#718096', font: { family: 'Inter', size: 11 } },
            grid: { display: false }
          }
        }
      }
    });
  </script>
</body>
</html>`;
  }

  generateProblems() {
    let html = '';
    
    if (this.data.fomoCount > 0) {
      html += `
        <div class="problem-card">
          <div class="problem-title">检测到 FOMO</div>
          <div class="problem-desc">
            ${this.data.fomoCount} 次在价格暴涨后追涨 (>5%)<br>
            胜率: ${this.data.fomoWinRate}%<br>
            总亏损: $${Math.abs(this.data.fomoLoss).toFixed(2)}<br>
            模式: 追涨杀跌，在高点买入
          </div>
        </div>
      `;
    }
    
    if (this.data.revengeCount > 0) {
      html += `
        <div class="problem-card">
          <div class="problem-title">报复性交易</div>
          <div class="problem-desc">
            ${this.data.revengeCount} 次在亏损后 30 分钟内交易<br>
            胜率: ${this.data.revengeWinRate}%<br>
            模式: 情绪化决策<br>
            试图立即挽回损失
          </div>
        </div>
      `;
    }
    
    if (this.data.stopLossDiscipline === '较差' || this.data.stopLossDiscipline === '一般') {
      html += `
        <div class="problem-card">
          <div class="problem-title">止损纪律较差</div>
          <div class="problem-desc">
            ${this.data.bigLossCount} 次大额亏损 (>5%)<br>
            平均止损: ${this.data.avgStopLoss}%<br>
            建议: 3%<br>
            模式: 持有亏损仓位过久
          </div>
        </div>
      `;
    }
    
    if (this.data.maxLossStreak > 5) {
      html += `
        <div class="problem-card">
          <div class="problem-title">连亏次数过多</div>
          <div class="problem-desc">
            最大连续亏损: ${this.data.maxLossStreak} 次<br>
            模式: 未能适应市场变化<br>
            建议: 连亏 3 次后休息
          </div>
        </div>
      `;
    }
    
    return html || '<div class="problem-desc" style="color: #38b2ac;">✓ 未发现严重问题</div>';
  }

  generateSuggestions() {
    const suggestions = [];
    
    if (this.data.fomoCount > 0) {
      suggestions.push('<div class="suggestion-item">避免在价格暴涨 5% 后买入 - 等待回调</div>');
    }
    
    if (this.data.revengeCount > 0) {
      suggestions.push('<div class="suggestion-item">亏损后等待 1 小时再交易 - 冷静期</div>');
    }
    
    if (this.data.worstHour) {
      suggestions.push(`<div class="suggestion-item">避免在 ${this.data.worstHour}:00 交易 - 你表现最差的时段</div>`);
    }
    
    if (parseFloat(this.data.avgStopLoss) > 5) {
      suggestions.push('<div class="suggestion-item">设置 -3% 自动止损 - 及早止损</div>');
    }
    
    if (this.data.maxLossStreak > 5) {
      suggestions.push('<div class="suggestion-item">连续亏损 3 次后休息 - 重置心态</div>');
    }
    
    if (parseFloat(this.data.longTermWinRate) > parseFloat(this.data.shortTermWinRate) + 20) {
      suggestions.push('<div class="suggestion-item">专注长线持仓 - 你的长线交易表现更好</div>');
    }
    
    return suggestions.join('') || '<div class="suggestion-item">继续保持良好的交易纪律</div>';
  }

  save(filename = 'report.html') {
    const html = this.generateHTML();
    fs.writeFileSync(filename, html);
    console.log(`✅ 报告已生成: ${filename}`);
    return filename;
  }
}

module.exports = VisualReport;
