#!/usr/bin/env node
// skill-handler.js - OpenClaw Skill 处理器

const BinancePsychology = require('./analyze');
const DetailedAnalyzer = require('./detailed-report');
const fs = require('fs');
const path = require('path');

class SkillHandler {
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

  async handleMessage(message) {
    const msg = message.toLowerCase();

    // 配置 API
    if (msg.includes('配置') && msg.includes('api')) {
      return this.promptForConfig();
    }

    // 分析交易
    if (msg.includes('分析') && (msg.includes('交易') || msg.includes('心理'))) {
      return this.analyzeTrading(message);
    }

    // 详细报告
    if (msg.includes('详细') || msg.includes('报告')) {
      return this.generateDetailedReport(message);
    }

    // 帮助
    if (msg.includes('帮助') || msg.includes('help')) {
      return this.showHelp();
    }

    return null; // 不处理
  }

  promptForConfig() {
    return `
📝 配置币安 API

请提供以下信息：

1. API Key
2. API Secret

**重要：只需要"读取"权限！**

格式：
\`\`\`
API Key: xxx
API Secret: xxx
\`\`\`

或者直接发送：
\`\`\`
配置 API
Key: xxx
Secret: xxx
\`\`\`
`;
  }

  async analyzeTrading(message) {
    if (!this.config.apiKey || !this.config.apiSecret) {
      return '❌ 请先配置 API：说"配置币安 API"';
    }

    // 提取交易对和天数
    const symbolMatch = message.match(/([A-Z]{3,10}USDT)/i);
    const daysMatch = message.match(/(\d+)\s*天/);

    const symbol = symbolMatch ? symbolMatch[1].toUpperCase() : 'BTCUSDT';
    const days = daysMatch ? parseInt(daysMatch[1]) : 30;

    const analyzer = new BinancePsychology(this.config.apiKey, this.config.apiSecret);
    
    try {
      const report = await analyzer.generateReport(symbol, days);
      return report;
    } catch (e) {
      return `❌ 分析失败: ${e.message}`;
    }
  }

  async generateDetailedReport(message) {
    if (!this.config.apiKey || !this.config.apiSecret) {
      return '❌ 请先配置 API：说"配置币安 API"';
    }

    const symbolMatch = message.match(/([A-Z]{3,10}USDT)/i);
    const daysMatch = message.match(/(\d+)\s*天/);

    const symbol = symbolMatch ? symbolMatch[1].toUpperCase() : 'ETHUSDT';
    const days = daysMatch ? parseInt(daysMatch[1]) : 365;

    const analyzer = new DetailedAnalyzer(this.config.apiKey, this.config.apiSecret);
    
    try {
      await analyzer.generateDetailedReport(symbol, days);
      return ''; // 输出已经在 console
    } catch (e) {
      return `❌ 分析失败: ${e.message}`;
    }
  }

  showHelp() {
    return `
🧠 币安交易心理分析助手

**使用方法：**

1️⃣ 配置 API
   说："配置币安 API"

2️⃣ 快速分析
   说："分析我的交易心理"
   或："分析 ETHUSDT 最近 30 天"

3️⃣ 详细报告
   说："生成详细报告"
   或："详细分析 BTCUSDT 最近 365 天"

**示例：**
- "分析我的 BTC 交易"
- "ETHUSDT 详细报告"
- "最近 7 天的交易心理"

**功能：**
- 🔴 FOMO 检测
- 🔴 报复性交易识别
- 📊 时段分析
- 🛑 止损纪律评估
- 💡 改进建议

GitHub: https://github.com/xj0102/binance-psychology
`;
  }
}

// CLI 模式
if (require.main === module) {
  const handler = new SkillHandler();
  const message = process.argv.slice(2).join(' ');
  
  handler.handleMessage(message).then(response => {
    if (response) console.log(response);
  });
}

module.exports = SkillHandler;
