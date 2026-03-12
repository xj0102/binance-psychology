#!/bin/bash
# install.sh - 一键安装脚本

echo "🧠 币安交易心理分析助手 - 安装"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 需要 Node.js >= 16"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 安装依赖
echo "📦 安装依赖..."
npm install --silent

echo ""
echo "✅ 安装完成！"
echo ""
echo "使用方法:"
echo ""
echo "1. 配置 API:"
echo "   export BINANCE_API_KEY='your_key'"
echo "   export BINANCE_API_SECRET='your_secret'"
echo ""
echo "2. 运行分析:"
echo "   node analyze.js BTCUSDT 30"
echo ""
echo "3. 详细报告:"
echo "   node detailed-report.js ETHUSDT 365"
echo ""
echo "4. 演示（无需 API）:"
echo "   node demo.js"
echo ""
