#!/bin/bash
DIR="$(pwd)/demo-video"

echo "🎬 生成演示序列..."

# 1. 主页
agent-browser open "https://binance-psychology.vercel.app/"
agent-browser wait 2000
agent-browser screenshot "$DIR/01-hero.png"
echo "✅ 1/8 主页"

# 2. 滚动到表单
agent-browser eval "window.scrollTo({top: 400, behavior: 'smooth'})"
agent-browser wait 1500
agent-browser screenshot "$DIR/02-scroll.png"
echo "✅ 2/8 滚动"

# 3. 填写 API Key
agent-browser eval "document.querySelector('#apiKey').value = 'demo_key_***'"
agent-browser eval "document.querySelector('#apiSecret').value = '***secret***'"
agent-browser wait 500
agent-browser screenshot "$DIR/03-api-key.png"
echo "✅ 3/8 API Key"

# 4. 选择交易对
agent-browser eval "document.querySelector('#symbol').value = 'ETHUSDT'"
agent-browser eval "document.querySelector('#days').value = '365'"
agent-browser wait 500
agent-browser screenshot "$DIR/04-form-filled.png"
echo "✅ 4/8 表单填写"

# 5. 按钮高亮
agent-browser eval "window.scrollTo({top: 700, behavior: 'smooth'})"
agent-browser wait 1000
agent-browser screenshot "$DIR/05-button.png"
echo "✅ 5/8 分析按钮"

# 6. 回到顶部
agent-browser eval "window.scrollTo({top: 0, behavior: 'smooth'})"
agent-browser wait 1500
agent-browser screenshot "$DIR/06-top.png"
echo "✅ 6/8 回到顶部"

# 7. 展示标题
agent-browser eval "window.scrollTo({top: 200, behavior: 'smooth'})"
agent-browser wait 1000
agent-browser screenshot "$DIR/07-title.png"
echo "✅ 7/8 标题"

# 8. 最终画面
agent-browser eval "window.scrollTo({top: 500, behavior: 'smooth'})"
agent-browser wait 1000
agent-browser screenshot "$DIR/08-final.png"
echo "✅ 8/8 完成"

echo ""
echo "✅ 演示序列已生成！"
echo "查看: open $DIR"
