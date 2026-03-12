// index.js - 主入口

const BinancePsychology = require('./analyze');
const patterns = require('./patterns');
const fs = require('fs');
const path = require('path');

class PsychologySkill {
  constructor() {
    this.configPath = path.join(__dirname, 'config.json');
    this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      } else {
        this.config = {};
      }
    } catch (e) {
      this.config = {};
    }
  }

  saveConfig() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  async configure(apiKey, apiSecret) {
    this.config.apiKey = apiKey;
    this.config.apiSecret = apiSecret;
    this.saveConfig();
    return '✅ 配置已保存';
  }

  async analyze(symbol = 'BTCUSDT', days = 7) {
    if (!this.config.apiKey || !this.config.apiSecret) {
      return '❌ 请先配置 API: 说"配置币安 API"';
    }

    const analyzer = new BinancePsychology(this.config.apiKey, this.config.apiSecret);
    
    try {
      const trades = await analyzer.getTrades(symbol, days);
      
      if (trades.length === 0) {
        return `📭 最近 ${days} 天没有 ${symbol} 的交易记录`;
      }

      const klines = await analyzer.getKlines(symbol, '1h', days * 24);
      const pairs = analyzer.buildTradePairs(trades);
      
      // 分析各种模式
      const fomo = patterns.detectFOMO(pairs, klines);
      const revenge = patterns.detectRevengeTrade(pairs);
      const timePattern = patterns.analyzeTimePattern(pairs);
      const holdTime = patterns.analyzeHoldTime(pairs);
      const stopLoss = patterns.analyzeStopLoss(pairs);
      
      // 生成报告
      const winRate = (pairs.filter(p => p.pnl > 0).length / pairs.length * 100).toFixed(0);
      const totalPnl = pairs.reduce((sum, p) => sum + p.pnl, 0).toFixed(2);
      
      let report = `📊 ${symbol} 交易心理分析\n\n`;
      report += `时间范围: 最近 ${days} 天\n`;
      report += `总交易: ${pairs.length} 笔\n`;
      report += `胜率: ${winRate}%\n`;
      report += `盈亏: $${totalPnl}\n\n`;
      
      const problems = [];
      
      if (fomo.count > 0) {
        problems.push({
          title: 'FOMO（追涨）',
          desc: `${fomo.count} 次在暴涨后追涨，胜率 ${fomo.winRate}%`,
          severity: 'high'
        });
      }
      
      if (revenge.count > 0) {
        problems.push({
          title: '报复性交易',
          desc: `${revenge.count} 次亏损后立即加仓，胜率 ${revenge.winRate}%`,
          severity: 'high'
        });
      }
      
      if (timePattern.worst && parseFloat(timePattern.worst.winRate) < 40) {
        problems.push({
          title: '时段问题',
          desc: `${timePattern.worst.hour}:00 胜率最低（${timePattern.worst.winRate}%）`,
          severity: 'medium'
        });
      }
      
      if (stopLoss.discipline === '较差') {
        problems.push({
          title: '止损纪律较差',
          desc: `${stopLoss.bigLossCount} 次亏损超过 5%，平均止损 ${stopLoss.avgStopLoss}%`,
          severity: 'high'
        });
      }
      
      if (problems.length > 0) {
        report += `🔴 发现的问题:\n\n`;
        problems.forEach((p, i) => {
          report += `${i+1}. ${p.title}\n   ${p.desc}\n\n`;
        });
      } else {
        report += `✅ 未发现明显的心理问题，交易纪律良好！\n\n`;
      }
      
      // 建议
      report += `💡 改进建议:\n\n`;
      
      if (fomo.count > 0) {
        report += `- 避免追涨: 价格 1 小时涨幅 > 5% 时等待回调\n`;
      }
      
      if (revenge.count > 0) {
        report += `- 亏损后休息: 强制休息 1 小时再交易\n`;
      }
      
      if (timePattern.worst && parseFloat(timePattern.worst.winRate) < 40) {
        report += `- 调整时段: 避开 ${timePattern.worst.hour}:00，多在 ${timePattern.best.hour}:00 交易\n`;
      }
      
      if (stopLoss.avgStopLoss > 5) {
        report += `- 严格止损: 设置 -3% 自动止损，不要心存侥幸\n`;
      }
      
      if (holdTime.short.winRate < 0.4 && holdTime.long.winRate > 0.5) {
        report += `- 减少短线: 你的长线胜率更高，建议减少短线操作\n`;
      }
      
      return report;
    } catch (e) {
      return `❌ 分析失败: ${e.message}`;
    }
  }
}

module.exports = PsychologySkill;
