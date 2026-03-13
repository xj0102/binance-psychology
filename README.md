# 币安交易心理分析助手 🧠

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/xj0102/binance-psychology)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-Skill-purple.svg)](https://openclaw.ai)

> 通过 OpenClaw 对话式分析你的交易心理，帮你成为更理性的交易员

## 特点

- 🦞 **OpenClaw 原生集成** - 对话式使用，无需命令行
- 🧠 **心理模式识别** - FOMO、报复性交易、止损纪律
- 📊 **数据驱动洞察** - 时段分析、持仓时间、盈亏比
- 🔒 **安全第一** - 只需 Binance 只读权限

## 快速开始

### 1. 安装

```bash
git clone https://github.com/xj0102/binance-psychology.git
cd binance-psychology
npm install
```

### 2. 配置 API

```bash
export BINANCE_API_KEY="your_key"
export BINANCE_API_SECRET="your_secret"
```

**重要：只需要"读取"权限！**

### 3. 使用

**通过 OpenClaw（推荐）：**
```
"分析我的 BTC 交易心理"
"生成 ETH 的详细报告"
"我的交易有什么问题？"
```

**命令行：**
```bash
# 快速分析
node analyze.js BTCUSDT 30

# 详细报告
node detailed-report.js ETHUSDT 365
```

## 真实案例

**某用户的 ETH 交易分析：**
- 胜率：5.9%（17 笔只赢 1 笔）
- 问题：报复性交易 4 次，止损点 26.2%，全在深夜交易
- 改进后：预计胜率提升至 45%+

## 分析维度

### 1. 心理模式
- **FOMO 检测** - 追涨行为识别
- **报复性交易** - 亏损后的情绪化决策
- **止损纪律** - 是否及时止损

### 2. 时间模式
- **最佳/最差交易时段** - 找到你的黄金时间
- **深夜交易警告** - 疲劳状态下的决策质量

### 3. 持仓分析
- **短线 vs 长线** - 哪种风格更适合你
- **持仓时间分布** - 优化你的交易节奏

### 4. 风险管理
- **盈亏比分析** - 平均盈利 vs 平均亏损
- **最大回撤** - 风险承受能力评估
- **连亏分析** - 何时该停下来

## OpenClaw 集成

作为 OpenClaw Skill 使用：

```javascript
// 在 OpenClaw 中直接对话
"分析我最近 30 天的 BTC 交易"
"我的交易心理有什么问题？"
"给我一份详细的交易报告"
```

## 技术栈

- Node.js
- Binance API
- 心理模式识别算法
- OpenClaw Skill Framework

## 安全说明

- ✅ 只需要 Binance **只读** API 权限
- ✅ 不会执行任何交易操作
- ✅ 数据仅在本地分析
- ✅ 不上传任何交易数据

## 贡献

欢迎提交 Issue 和 PR！

## 许可证

MIT License

## 联系

- GitHub: [@xj0102](https://github.com/xj0102)
- OpenClaw: [openclaw.ai](https://openclaw.ai)

**Q: 需要什么权限？**  
A: 只需要"读取"权限，不需要交易权限。

**Q: 数据安全吗？**  
A: 所有数据本地处理，不上传任何服务器。

**Q: 支持合约交易吗？**  
A: 目前只支持现货，合约版本开发中。

**Q: 分析准确吗？**  
A: 基于真实交易数据，算法识别心理模式，准确率高。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 作者

- GitHub: [@xj0102](https://github.com/xj0102)
- Twitter: [@xiejin010627](https://twitter.com/xiejin010627)

## License

MIT

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
