// visual-report-enhanced.js - 超详细像素风报告

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
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Press Start 2P', monospace;
      background: #0a0a0f;
      color: #00ff41;
      padding: 20px;
      line-height: 1.8;
      font-size: 10px;
    }
    .container {
      max-width: 1600px;
      margin: 0 auto;
      background: #1a1a2e;
      border: 4px solid #00ff41;
      box-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
      padding: 40px;
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
      background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.2), transparent);
      animation: scan 3s infinite;
    }
    @keyframes scan {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    h1 {
      color: #00ff41;
      font-size: 28px;
      text-shadow: 0 0 20px #00ff41;
      margin-bottom: 15px;
      letter-spacing: 3px;
    }
    .subtitle {
      color: #00d4ff;
      font-size: 11px;
      text-shadow: 0 0 10px #00d4ff;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      padding: 30px;
      background: #0f0f23;
    }
    .stat-card {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 3px solid #00ff41;
      padding: 25px;
      position: relative;
      box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
      transition: all 0.3s;
    }
    .stat-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 0 40px rgba(0, 255, 65, 0.6);
      border-color: #00d4ff;
    }
    .stat-label {
      color: #00d4ff;
      font-size: 9px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .stat-value {
      color: #00ff41;
      font-size: 36px;
      margin: 15px 0;
      text-shadow: 0 0 15px #00ff41;
      font-weight: bold;
    }
    .stat-value.negative { color: #ff0055; text-shadow: 0 0 15px #ff0055; }
    .stat-value.warning { color: #ffaa00; text-shadow: 0 0 15px #ffaa00; }
    .stat-desc {
      color: #888;
      font-size: 8px;
      margin-top: 8px;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #0f0f23;
      border: 2px solid #00ff41;
      margin-top: 12px;
      position: relative;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00ff41, #00d4ff);
      box-shadow: 0 0 15px #00ff41;
      transition: width 1.5s ease;
    }
    .section {
      padding: 35px;
      border-top: 3px solid #00ff41;
      background: #0f0f23;
    }
    .section-title {
      color: #00ff41;
      font-size: 18px;
      margin-bottom: 25px;
      text-shadow: 0 0 15px #00ff41;
      display: flex;
      align-items: center;
      gap: 12px;
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
      padding: 25px;
      margin: 25px 0;
      box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
    }
    .chart-title {
      color: #00d4ff;
      font-size: 12px;
      margin-bottom: 20px;
      text-shadow: 0 0 10px #00d4ff;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
      margin: 25px 0;
    }
    .metric-box {
      background: #1a1a2e;
      border: 2px solid #00ff41;
      padding: 18px;
      text-align: center;
      transition: all 0.3s;
    }
    .metric-box:hover {
      border-color: #00d4ff;
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
    }
    .metric-label {
      color: #00d4ff;
      font-size: 8px;
      margin-bottom: 10px;
    }
    .metric-value {
      color: #00ff41;
      font-size: 20px;
      text-shadow: 0 0 10px #00ff41;
    }
    .problem-grid {
      display: grid;
      gap: 18px;
      margin: 25px 0;
    }
    .problem-card {
      background: #1a1a2e;
      border-left: 6px solid #ff0055;
      padding: 25px;
      box-shadow: 0 0 20px rgba(255, 0, 85, 0.3);
      position: relative;
    }
    .problem-card::before {
      content: '⚠';
      position: absolute;
      top: 25px;
      right: 25px;
      font-size: 28px;
      color: #ff0055;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.3); }
    }
    .problem-title {
      color: #ff0055;
      font-size: 13px;
      margin-bottom: 12px;
      text-shadow: 0 0 10px #ff0055;
    }
    .problem-desc {
      color: #00ff41;
      font-size: 9px;
      line-height: 1.8;
    }
    .suggestions {
      background: #1a1a2e;
      border: 3px solid #00d4ff;
      padding: 25px;
      margin: 25px 0;
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    }
    .suggestions h3 {
      color: #00d4ff;
      font-size: 15px;
      margin-bottom: 20px;
      text-shadow: 0 0 15px #00d4ff;
    }
    .suggestion-item {
      color: #00ff41;
      font-size: 9px;
      padding: 12px 0;
      border-bottom: 1px solid #333;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .suggestion-item::before {
      content: '✓';
      color: #00d4ff;
      font-size: 16px;
    }
    .suggestion-item:last-child { border-bottom: none; }
    .trade-detail {
      background: #1a1a2e;
      border: 2px solid #00ff41;
      padding: 20px;
      margin: 15px 0;
    }
    .trade-detail-title {
      color: #00d4ff;
      font-size: 11px;
      margin-bottom: 15px;
    }
    .trade-detail-content {
      color: #00ff41;
      font-size: 9px;
      line-height: 1.8;
    }
    .footer {
      background: #0f0f23;
      padding: 25px;
      text-align: center;
      border-top: 3px solid #00ff41;
      color: #00d4ff;
      font-size: 8px;
    }
    .footer a {
      color: #00ff41;
      text-decoration: none;
      text-shadow: 0 0 10px #00ff41;
    }
    .footer a:hover {
      color: #00d4ff;
      text-shadow: 0 0 10px #00d4ff;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧠 ${this.data.symbol} PSYCHOLOGY REPORT</h1>
      <p class="subtitle">ADVANCED TRADING ANALYSIS SYSTEM v2.0</p>
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

      <div class="stat-card">
        <div class="stat-label">AVG WIN</div>
        <div class="stat-value">$${this.data.avgWin}</div>
        <div class="stat-desc">PER WINNING TRADE</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">AVG LOSS</div>
        <div class="stat-value negative">$${this.data.avgLoss}</div>
        <div class="stat-desc">PER LOSING TRADE</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">MAX WIN STREAK</div>
        <div class="stat-value">${this.data.maxWinStreak}</div>
        <div class="stat-desc">CONSECUTIVE WINS</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">MAX LOSS STREAK</div>
        <div class="stat-value negative">${this.data.maxLossStreak}</div>
        <div class="stat-desc">CONSECUTIVE LOSSES</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">MAX DRAWDOWN</div>
        <div class="stat-value negative">$${this.data.maxDrawdown}</div>
        <div class="stat-desc">PEAK TO TROUGH</div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">PSYCHOLOGY METRICS</h2>
      <div class="metrics-grid">
        <div class="metric-box">
          <div class="metric-label">FOMO TRADES</div>
          <div class="metric-value">${this.data.fomoCount}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">FOMO WIN RATE</div>
          <div class="metric-value">${this.data.fomoWinRate}%</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">REVENGE TRADES</div>
          <div class="metric-value">${this.data.revengeCount}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">REVENGE WIN RATE</div>
          <div class="metric-value">${this.data.revengeWinRate}%</div>
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
      <h2 class="section-title">HOLDING TIME ANALYSIS</h2>
      <div class="metrics-grid">
        <div class="metric-box">
          <div class="metric-label">SHORT TERM (&lt;1H)</div>
          <div class="metric-value">${this.data.shortTermWinRate}%</div>
          <div class="stat-desc">${this.data.shortTermCount} TRADES</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">MEDIUM TERM (1H-1D)</div>
          <div class="metric-value">${this.data.mediumTermWinRate}%</div>
          <div class="stat-desc">${this.data.mediumTermCount} TRADES</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">LONG TERM (&gt;1D)</div>
          <div class="metric-value">${this.data.longTermWinRate}%</div>
          <div class="stat-desc">${this.data.longTermCount} TRADES</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">BEST & WORST TRADES</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="trade-detail">
          <div class="trade-detail-title">🏆 BEST TRADE</div>
          <div class="trade-detail-content">
            P&L: $${this.data.bestTrade.pnl}<br>
            DATE: ${this.data.bestTrade.date}<br>
            HOLD TIME: ${this.data.bestTrade.holdTime}H
          </div>
        </div>
        <div class="trade-detail">
          <div class="trade-detail-title">💀 WORST TRADE</div>
          <div class="trade-detail-content">
            P&L: $${this.data.worstTrade.pnl}<br>
            DATE: ${this.data.worstTrade.date}<br>
            HOLD TIME: ${this.data.worstTrade.holdTime}H
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">TIME PATTERN ANALYSIS</h2>
      <div class="chart-container">
        <div class="chart-title">HOURLY WIN RATE</div>
        <canvas id="timeChart"></canvas>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">P&L EVOLUTION</h2>
      <div class="chart-container">
        <div class="chart-title">CUMULATIVE PROFIT & LOSS</div>
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
      <p style="margin-top: 12px; opacity: 0.6;">POWERED BY OPENCLAW AI • PIXEL STYLE v2.0</p>
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
            return rate > 50 ? 'rgba(0, 255, 65, 0.7)' : rate > 30 ? 'rgba(255, 170, 0, 0.7)' : 'rgba(255, 0, 85, 0.7)';
          }))},
          borderColor: ${JSON.stringify(this.data.timePattern.map(t => {
            const rate = parseFloat(t.winRate);
            return rate > 50 ? 'rgba(0, 255, 65, 1)' : rate > 30 ? 'rgba(255, 170, 0, 1)' : 'rgba(255, 0, 85, 1)';
          }))},
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#00ff41',
              font: { family: 'Press Start 2P', size: 9 }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { color: '#00ff41', font: { family: 'Press Start 2P', size: 9 } },
            grid: { color: 'rgba(0, 255, 65, 0.15)' }
          },
          x: {
            ticks: { color: '#00d4ff', font: { family: 'Press Start 2P', size: 8 } },
            grid: { color: 'rgba(0, 212, 255, 0.15)' }
          }
        }
      }
    });

    const pnlCtx = document.getElementById('pnlChart').getContext('2d');
    new Chart(pnlCtx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(this.data.pnlHistory.map((_, i) => 'T' + (i+1)))},
        datasets: [{
          label: 'Cumulative P&L ($)',
          data: ${JSON.stringify(this.data.pnlHistory)},
          borderColor: '#00ff41',
          backgroundColor: 'rgba(0, 255, 65, 0.15)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#00d4ff',
          pointBorderColor: '#00ff41',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#00ff41',
              font: { family: 'Press Start 2P', size: 9 }
            }
          }
        },
        scales: {
          y: {
            ticks: { color: '#00ff41', font: { family: 'Press Start 2P', size: 9 } },
            grid: { color: 'rgba(0, 255, 65, 0.15)' }
          },
          x: {
            ticks: { color: '#00d4ff', font: { family: 'Press Start 2P', size: 8 } },
            grid: { color: 'rgba(0, 212, 255, 0.15)' }
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
          <div class="problem-title">FOMO DETECTED</div>
          <div class="problem-desc">
            ${this.data.fomoCount} trades after price surge (>5%)<br>
            Win rate: ${this.data.fomoWinRate}%<br>
            Total loss: $${Math.abs(this.data.fomoLoss).toFixed(2)}<br>
            Pattern: Chasing pumps, buying at peaks
          </div>
        </div>
      `;
    }
    
    if (this.data.revengeCount > 0) {
      html += `
        <div class="problem-card">
          <div class="problem-title">REVENGE TRADING</div>
          <div class="problem-desc">
            ${this.data.revengeCount} trades within 30min after loss<br>
            Win rate: ${this.data.revengeWinRate}%<br>
            Pattern: Emotional decision making<br>
            Trying to recover losses immediately
          </div>
        </div>
      `;
    }
    
    if (this.data.stopLossDiscipline === '较差' || this.data.stopLossDiscipline === '一般') {
      html += `
        <div class="problem-card">
          <div class="problem-title">POOR STOP LOSS DISCIPLINE</div>
          <div class="problem-desc">
            ${this.data.bigLossCount} big losses (>5%)<br>
            Avg stop: ${this.data.avgStopLoss}%<br>
            Recommended: 3%<br>
            Pattern: Holding losers too long
          </div>
        </div>
      `;
    }
    
    if (this.data.maxLossStreak > 5) {
      html += `
        <div class="problem-card">
          <div class="problem-title">HIGH LOSS STREAK</div>
          <div class="problem-desc">
            Max consecutive losses: ${this.data.maxLossStreak}<br>
            Pattern: Not adapting to market conditions<br>
            Suggestion: Take a break after 3 losses
          </div>
        </div>
      `;
    }
    
    return html || '<div class="problem-desc" style="color: #00ff41;">✓ NO CRITICAL ISSUES DETECTED</div>';
  }

  generateSuggestions() {
    const suggestions = [];
    
    if (this.data.fomoCount > 0) {
      suggestions.push('<div class="suggestion-item">Avoid buying after 5%+ price surge - wait for pullback</div>');
    }
    
    if (this.data.revengeCount > 0) {
      suggestions.push('<div class="suggestion-item">Wait 1 hour after loss before next trade - cool down period</div>');
    }
    
    if (this.data.worstHour) {
      suggestions.push(`<div class="suggestion-item">Avoid trading at ${this.data.worstHour}:00 - your worst performing hour</div>`);
    }
    
    if (parseFloat(this.data.avgStopLoss) > 5) {
      suggestions.push('<div class="suggestion-item">Set automatic stop loss at -3% - cut losses early</div>');
    }
    
    if (this.data.maxLossStreak > 5) {
      suggestions.push('<div class="suggestion-item">Take a break after 3 consecutive losses - reset mindset</div>');
    }
    
    if (parseFloat(this.data.longTermWinRate) > parseFloat(this.data.shortTermWinRate) + 20) {
      suggestions.push('<div class="suggestion-item">Focus on longer holding periods - your long-term trades perform better</div>');
    }
    
    return suggestions.join('') || '<div class="suggestion-item">Continue maintaining good trading discipline</div>';
  }

  save(filename = 'report.html') {
    const html = this.generateHTML();
    fs.writeFileSync(filename, html);
    console.log(`✅ 报告已生成: ${filename}`);
    return filename;
  }
}

module.exports = VisualReport;
