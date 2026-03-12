---
name: binance-psychology
version: 2.0.0
description: 币安交易心理分析助手 - 发现你的交易坏习惯，实时预警，帮助你成为更理性的交易员
homepage: https://github.com/xj0102/binance-psychology
metadata:
  category: trading
  platform: binance
  emoji: 🧠
---

# 币安交易心理分析助手 v2.0

## 🆕 新功能

### 1. 实时监控 + 主动预警 🚨
- 检测 FOMO（追涨）→ 立即警告
- 检测报复性交易 → 强制冷静
- 检测深夜交易 → 提醒胜率低
- 检测止损不及时 → 建议止损

### 2. 可视化报告 📊
- 时段胜率图表
- 盈亏趋势图
- 心理问题分析
- HTML 报告可分享

### 3. OpenClaw 集成 🦞
- 直接对话使用
- 无需命令行
- 自动配置
- 智能识别意图

## 快速开始（OpenClaw 用户）

### 安装

在 OpenClaw 中说：
```
安装 binance-psychology skill
```

或手动安装：
```bash
cd ~/.openclaw/skills
git clone https://github.com/xj0102/binance-psychology.git
cd binance-psychology
npm install
```

### 使用

**1. 配置 API**
```
配置币安 API
```

**2. 分析交易**
```
分析我的交易心理
```

**3. 详细报告**
```
生成详细报告
```

**4. 实时监控**
```
开启实时监控
```

**5. 可视化报告**
```
生成可视化报告
```

## 命令行使用

### 快速分析
```bash
node analyze.js BTCUSDT 30
```

### 详细报告
```bash
node detailed-report.js ETHUSDT 365
```

### 实时监控
```bash
node realtime-monitor.js
```

### 可视化报告
```bash
node generate-visual-report.js
```

## 功能详解

### 实时监控

**监控内容：**
- FOMO 检测：价格暴涨后买入
- 报复性交易：亏损后立即加仓
- 时段问题：深夜交易
- 止损不及时：亏损超过 5%

**预警方式：**
- Telegram 推送
- 控制台输出
- 可选：自动止损

### 可视化报告

**包含图表：**
- 时段胜率柱状图
- 盈亏趋势折线图
- 心理问题卡片
- 改进建议列表

**导出格式：**
- HTML（可在浏览器打开）
- 可分享到社交媒体

## 示例输出

### 实时预警

```
============================================================
🚨 FOMO 警告！

BTCUSDT 刚涨了 6.9%

你历史上有 5 次 FOMO，胜率 0%

建议：等待回调再买入
============================================================
```

### 可视化报告

打开 `report.html` 查看：
- 📊 交互式图表
- 🎨 精美设计
- 📱 移动端适配

## 配置

### API 权限

**只需要"读取"权限！**
- ✅ 查看账户信息
- ✅ 查看交易历史
- ❌ 不需要交易权限
- ❌ 不需要提现权限

### 环境变量

```bash
export BINANCE_API_KEY="your_key"
export BINANCE_API_SECRET="your_secret"
```

或在 `config.json` 中配置：
```json
{
  "apiKey": "your_key",
  "apiSecret": "your_secret"
}
```

## 技术实现

- 币安 API 获取交易历史
- WebSocket 实时监听（可选）
- 算法识别心理模式
- Chart.js 生成图表
- Telegram Bot 推送预警

## 安全说明

- ✅ 只读权限
- ✅ 本地运行
- ✅ 不执行任何交易
- ✅ API key 本地存储
- ✅ 开源代码可审计

## 作者

- GitHub: [@xj0102](https://github.com/xj0102)
- Twitter: [@xiejin010627](https://twitter.com/xiejin010627)

## License

MIT
