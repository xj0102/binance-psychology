# Binance Trading Psychology Coach 🧠

[![Build with Binance](https://img.shields.io/badge/Build%20with-Binance-F0B90B?style=for-the-badge&logo=binance)](https://www.binance.com)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-Skill-purple?style=for-the-badge)](https://openclaw.ai)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)](LICENSE)

> AI 驱动的交易心理教练 - 帮你成为更理性的交易员

**🏆 Build with Binance 2025 参赛项目**

## 🌐 在线 Demo

**立即体验：** https://binance-psychology.vercel.app/

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xj0102/binance-psychology)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/binance-psychology)

## 🎯 项目简介

Binance Trading Psychology Coach 是一个基于 AI 的交易心理分析工具，**原生集成 OpenClaw（龙虾）**，通过对话式交互分析你的历史交易数据，识别心理问题（FOMO、报复性交易、止损纪律等），并提供个性化的改进建议和实时预警。

**🦞 OpenClaw 原生支持** - 对话式使用，无需命令行操作

## ✨ 核心功能

### 1. 🧠 心理模式识别
- **FOMO 检测** - 识别价格暴涨后的追涨行为
- **报复性交易** - 检测亏损后的情绪化决策
- **止损纪律** - 评估止损执行力
- **时段分析** - 找出最佳/最差交易时段

### 2. 📊 数据可视化
- 时段胜率柱状图
- 持仓时间分布饼图
- 盈亏趋势分析
- 交易统计仪表板

### 3. 🎯 智能评分系统
- 0-100 分心理健康评分
- 三级评级（优秀/良好/需改进）
- 动态评分算法

### 4. 📈 对比分析
- 你 vs 市场平均胜率（45%）
- 你 vs 市场平均盈亏比（1.5）
- 你 vs 市场平均 FOMO 频率（15%）

### 5. 🚨 实时预警
- WebSocket 实时价格监控
- FOMO 警告（价格暴涨 >5%）
- 报复性交易检测
- 时段警告

### 6. 📜 历史记录
- 自动保存分析记录
- 最近 10 条历史
- 评分趋势追踪

### 7. 📄 PDF 导出
- 一键导出完整报告
- 打印友好格式
- 包含所有核心数据

## 🚀 快速开始

### 方式 1：通过 OpenClaw 使用（推荐）

**安装为 OpenClaw Skill：**

```bash
cd ~/.openclaw/skills
git clone https://github.com/xj0102/binance-psychology.git
cd binance-psychology
npm install
```

**配置 API：**

在 OpenClaw 中说：
```
"配置币安 API"
```

然后输入你的 API Key 和 Secret（只需只读权限）

**使用：**

直接在 OpenClaw 中对话：
```
"分析我的 BTC 交易心理"
"生成 ETH 的详细报告"
"我的交易有什么问题？"
"开启实时监控"
```

### 方式 2：独立 Web 应用

**安装：**

```bash
git clone https://github.com/xj0102/binance-psychology.git
cd binance-psychology
npm install
```

**启动服务器：**

```bash
node api-server.js
```

**访问：**

在浏览器中打开：http://localhost:3456

## 🛠️ 技术栈

- **AI 框架**: OpenClaw Skill Framework
- **前端**: HTML5, CSS3, JavaScript, Chart.js
- **后端**: Node.js, Express
- **API**: Binance REST API, WebSocket API
- **存储**: LocalStorage

## 📊 评分算法

```javascript
基础分: 100
- FOMO 每次: -5 分
- 报复性交易每次: -5 分
- 止损超标: -(avgStopLoss - 3) * 2 分
- 胜率低于 50%: -(50 - winRate) * 0.5 分
```

## 🔒 安全说明

- ✅ 只需要 Binance **只读** API 权限
- ✅ 不会执行任何交易操作
- ✅ 数据仅在本地分析
- ✅ 不上传任何交易数据
- ✅ 开源代码可审计

## 🌟 为什么需要这个工具？

根据研究，**80% 的交易亏损来自心理问题**，而非技术分析错误：

- 📈 FOMO（Fear of Missing Out）- 追涨杀跌
- ⚡ 报复性交易 - 亏损后急于翻本
- 🛑 止损不及时 - 让亏损扩大
- ⏰ 疲劳交易 - 深夜决策质量差

**本工具通过数据分析，帮你识别并改正这些问题。**

## 📈 真实案例

**用户 A 的 ETH 交易分析：**
- 胜率：5.9%（17 笔只赢 1 笔）
- 问题：4 次报复性交易，止损点 26.2%，全在深夜交易
- **使用工具后：预计胜率提升至 45%+**

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 📄 许可证

MIT License

## 👨‍💻 作者

- GitHub: [@xj0102](https://github.com/xj0102)
- Twitter: [@xiejin010627](https://twitter.com/xiejin010627)

## 🙏 致谢

感谢 Binance 提供的 API 和黑客松平台！

---

**Built with ❤️ for Binance Build with Binance 2025**
