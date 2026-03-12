// visual-report.js - 像素风可视化报告生成

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
  <title>交易心理分析报告 - Pixel Style</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Press Start 2P', monospace;
      background: #0f0f23;
      color: #00ff41;
      padding: 20px;
      line-height: 1.8;
      image-rendering: pixelated;
      font-size: 10px;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: #1a1a2e;
      border: 4px solid #00ff41;
      box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
    }
    
    .header {
      background: linear-gradient(90deg, #0f0f23 0%, #1a1a2e 50%, #0f0f23 100%);
      padding: 30px;
      text-align: center;
      border-bottom: 4px solid #00ff41;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.1), transparent);
      animation: scan 3s infinite;
    }
    
    @keyframes scan {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    
    h1 {
      color: #00ff41;
      font-size: 24px;
      text-shadow: 0 0 10px #00ff41, 0 0 20px #00ff41;
      margin-bottom: 10px;
      letter-spacing: 2px;
    }
    
    .subtitle {
      color: #00d4ff;
      font-size: 10px;
      text-shadow: 0 0 5px #00d4ff;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      padding: 30px;
      background: #0f0f23;
    }
    
    .stat-card {
      background: #1a1a2e;
      border: 3px solid #00ff41;
      padding: 20px;
      position: relative;
      box-shadow: 0 0 15px rgba(0, 255, 65, 0.2);
      transition: all 0.3s;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 0 25px rgba(0, 255, 65, 0.4);
      border-color: #00d4ff;
    }
    
    .stat-card::before {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      background: linear-gradient(45deg, #00ff41, #00d4ff, #ff00ff, #00ff41);
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .stat-card:hover::before {
      opacity: 0.3;
      animation: rotate 2s linear infinite;
    }
    
    @keyframes rotate {
      0% { filter: hue-rotate(0deg); }
      100% { filter: hue-rotate(360deg); }
    }
    
    .stat-label {
      color: #00d4ff;
      font-size: 9px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    
    .stat-value {
      color: #00ff41;
      font-size: 32px;
      margin: 15px 0;
      text-shadow: 0 0 10px #00ff41;
      font-weight: bold;
    }
    
    .stat-value.negative {
      color: #ff0055;
      text-shadow: 0 0 10px #ff0055;
    }
    
    .stat-value.warning {
      color: #ffaa00;
      text-shadow: 0 0 10px #ffaa00;
    }
    
    .stat-desc {
      color: #888;
      font-size: 8px;
    }
    
    .section {
      padding: 30px;
      border-top: 3px solid #00ff41;
      background: #0f0f23;
    }
    
    .section-title {
      color: #00ff41;
      font-size: 16px;
      margin-bottom: 20px;
      text-shadow: 0 0 10px #00ff41;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section-title::before {
      content: '▶';
      color: #00d4ff;
      animation: blink 1s infinite;
    }
    
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
    
    .chart-container {
      background: #1a1a2e;
      border: 3px solid #00ff41;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 0 15px rgba(0, 255, 65, 0.2);
    }
    
    .problem-grid {
      display: grid;
      gap: 15px;
      margin: 20px 0;
    }
    
    .problem-card {
      background: #1a1a2e;
      border-left: 5px solid #ff0055;
      padding: 20px;
      box-shadow: 0 0 15px rgba(255, 0, 85, 0.2);
      position: relative;
    }
    
    .problem-card::before {
      content: '⚠';
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 24px;
      color: #ff0055;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }
    
    .problem-title {
      color: #ff0055;
      font-size: 12px;
      margin-bottom: 10px;
      text-shadow: 0 0 5px #ff0055;
    }
    
    .problem-desc {
      color: #00ff41;
      font-size: 9px;
      line-height: 1.6;
    }
    
    .suggestions {
      background: #1a1a2e;
      border: 3px solid #00d4ff;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
    }
    
    .suggestions h3 {
      color: #00d4ff;
      font-size: 14px;
      margin-bottom: 15px;
      text-shadow: 0 0 10px #00d4ff;
    }
    
    .suggestion-item {
      color: #00ff41;
      font-size: 9px;
      padding: 10px 0;
      border-bottom: 1px solid #333;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .suggestion-item::before {
      content: '✓';
      color: #00d4ff;
      font-size: 14px;
    }
    
    .suggestion-item:last-child {
      border-bottom: none;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    
    .metric-box {
      background: #1a1a2e;
      border: 2px solid #00ff41;
      padding: 15px;
      text-align: center;
    }
    
    .metric-label {
      color: #00d4ff;
      font-size: 8px;
      margin-bottom: 8px;
    }
    
    .metric-value {
      color: #00ff41;
      font-size: 18px;
      text-shadow: 0 0 5px #00ff41;
    }
    
    .footer {
      background: #0f0f23;
      padding: 20px;
      text-align: center;
      border-top: 3px solid #00ff41;
      color: #00d4ff;
      font-size: 8px;
    }
    
    .footer a {
      color: #00ff41;
      text-decoration: none;
      text-shadow: 0 0 5px #00ff41;
    }
    
    .footer a:hover {
      color: #00d4ff;
      text-shadow: 0 0 5px #00d4ff;
    }
    
    .progress-bar {
      width: 100%;
      height: 20px;
      background: #0f0f23;
      border: 2px solid #00ff41;
      margin: 10px 0;
      position: relative;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00ff41, #00d4ff);
      box-shadow: 0 0 10px #00ff41;
      transition: width 1s ease;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧠 TRADING PSYCHOLOGY REPORT</h1>
      <p class="subtitle">PIXEL ANALYSIS SYSTEM v2.0</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">TOTAL TRADES</div>
        <div class="stat-value">${this.data.totalTrades}</div>
        <div class="stat-desc">EXECUTED ORDERS</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">WIN RATE</div>
        <div class="stat-value ${parseFloat(this.data.winRate) < 30 ? 'negative' : parseFloat(this.data.winRate) < 50 ? 'warning' : ''}">${this.data.winRate}%</div>
        <div class="stat-desc">${this.data.wins}W / ${this.data.losses}L</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${this.data.winRate}%"></div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">TOTAL P&L</div>
        <div class="stat-value ${parseFloat(this.data.totalPnl) < 0 ? 'negative' : ''}">$${this.data.totalPnl}</div>
        <div class="stat-desc">${parseFloat(this.data.totalPnl) >= 0 ? 'PROFIT' : 'LOSS'}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">PROFIT FACTOR</div>
        <div class="stat-value ${parseFloat(this.data.profitFactor) < 1 ? 'negative' : parseFloat(this.data.profitFactor) < 2 ? 'warning' : ''}">${this.data.profitFactor}</div>
        <div class="stat-desc">AVG WIN / AVG LOSS</div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">ADVANCED METRICS</h2>
      <div class="metrics-grid">
        <div class="metric-box">
          <div class="metric-label">FOMO TRADES</div>
          <div class="metric-value">${this.data.fomoCount}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">REVENGE TRADES</div>
          <div class="metric-value">${this.data.revengeCount}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">BIG LOSSES</div>
          <div class="metric-value">${this.data.bigLossCount}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">AVG STOP LOSS</div>
          <div class="metric-value">${this.data.avgStopLoss}%</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">BEST HOUR</div>
          <div class="metric-value">${this.data.bestHour}:00</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">WORST HOUR</div>
          <div class="metric-value">${this.data.worstHour}:00</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">TIME PATTERN ANALYSIS</h2>
      <div class="chart-container">
        <canvas id="timeChart"></canvas>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">P&L EVOLUTION</h2>
      <div class="chart-container">
        <canvas id="pnlChart"></canvas>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">DETECTED PROBLEMS</h2>
      <div class="problem-grid">
        ${this.generateProblems()}
      </div>
    </div>

    <div class="section">
      <div class="suggestions">
        <h3>💡 IMPROVEMENT SUGGESTIONS</h3>
        ${this.generateSuggestions()}
      </div>
    </div>

    <div class="footer">
      <p>BINANCE TRADING PSYCHOLOGY ANALYZER</p>
      <p>GITHUB: <a href="https://github.com/xj0102/binance-psychology" target="_blank">xj0102/binance-psychology</a></p>
      <p style="margin-top: 10px; opacity: 0.5;">POWERED BY OPENCLAW AI</p>
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
          label: 'Win Rate (%)',
          data: ${JSON.stringify(this.data.timePattern.map(t => t.winRate))},
          backgroundColor: ${JSON.stringify(this.data.timePattern.map(t => {
            const rate = parseFloat(t.winRate);
            return rate > 50 ? 'rgba(0, 255, 65, 0.6)' : rate > 30 ? 'rgba(255, 170, 0, 0.6)' : 'rgba(255, 0, 85, 0.6)';
          }))},
          borderColor: ${JSON.stringify(this.data.timePattern.map(t => {
            const rate = parseFloat(t.winRate);
            return rate > 50 ? 'rgba(0, 255, 65, 1)' : rate > 30 ? 'rgba(255, 170, 0, 1)' : 'rgba(255, 0, 85, 1)';
          }))},
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#00ff41',
              font: { family: 'Press Start 2P', size: 8 }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { color: '#00ff41', font: { family: 'Press Start 2P', size: 8 } },
            grid: { color: 'rgba(0, 255, 65, 0.1)' }
          },
          x: {
            ticks: { color: '#00d4ff', font: { family: 'Press Start 2P', size: 8 } },
            grid: { color: 'rgba(0, 212, 255, 0.1)' }
          }
        }
      }
    });

    // 盈亏趋势图
    const pnlCtx = document.getElementById('pnlChart').getContext('2d');
    new Chart(pnlCtx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(this.data.pnlHistory.map((_, i) => 'T' + (i+1)))},
        datasets: [{
          label: 'Cumulative P&L ($)',
          data: ${JSON.stringify(this.data.pnlHistory)},
          borderColor: '#00ff41',
          backgroundColor: 'rgba(0, 255, 65, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: '#00d4ff',
          pointBorderColor: '#00ff41',
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#00ff41',
              font: { family: 'Press Start 2P', size: 8 }
            }
          }
        },
        scales: {
          y: {
            ticks: { color: '#00ff41', font: { family: 'Press Start 2P', size: 8 } },
            grid: { color: 'rgba(0, 255, 65, 0.1)' }
          },
          x: {
            ticks: { color: '#00d4ff', font: { family: 'Press Start 2P', size: 8 } },
            grid: { color: 'rgba(0, 212, 255, 0.1)' }
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
        <div class="problem-card">
          <div class="problem-title">FOMO DETECTED</div>
          <div class="problem-desc">
            ${this.data.fomoCount} trades after price surge<br>
            Win rate: ${this.data.fomoWinRate}%<br>
            Total loss: $${Math.abs(this.data.fomoLoss).toFixed(2)}
          </div>
        </div>
      `;
    }
    
    if (this.data.revengeCount > 0) {
      html += `
        <div class="problem-card">
          <div class="problem-title">REVENGE TRADING</div>
          <div class="problem-desc">
            ${this.data.revengeCount} trades after loss<br>
            Win rate: ${this.data.revengeWinRate}%<br>
            Pattern: Emotional decision making
          </div>
        </div>
      `;
    }
    
    if (this.data.stopLossDiscipline === '较差' || this.data.stopLossDiscipline === '一般') {
      html += `
        <div class="problem-card">
          <div class="problem-title">POOR STOP LOSS</div>
          <div class="problem-desc">
            ${this.data.bigLossCount} big losses (>5%)<br>
            Avg stop: ${this.data.avgStopLoss}%<br>
            Recommended: 3%
          </div>
        </div>
      `;
    }
    
    return html || '<div class="problem-desc" style="color: #00ff41;">✓ NO CRITICAL ISSUES DETECTED</div>';
  }

  generateSuggestions() {
    const suggestions = [];
    
    if (this.data.fomoCount > 0) {
      suggestions.push('<div class="suggestion-item">Avoid buying after 5%+ price surge</div>');
    }
    
    if (this.data.revengeCount > 0) {
      suggestions.push('<div class="suggestion-item">Wait 1 hour after loss before trading</div>');
    }
    
    if (this.data.worstHour) {
      suggestions.push(`<div class="suggestion-item">Avoid trading at ${this.data.worstHour}:00</div>`);
    }
    
    if (parseFloat(this.data.avgStopLoss) > 5) {
      suggestions.push('<div class="suggestion-item">Set automatic stop loss at -3%</div>');
    }
    
    return suggestions.join('') || '<div class="suggestion-item">Continue maintaining good discipline</div>';
  }

  save(filename = 'report.html') {
    const html = this.generateHTML();
    fs.writeFileSync(filename, html);
    console.log(`✅ 报告已生成: ${filename}`);
    return filename;
  }
}

module.exports = VisualReport;
