# 🚀 快速部署指南

## 方式 1：通过 Vercel 网页（推荐）

1. 访问 https://vercel.com/new
2. 使用 GitHub 登录
3. 选择 `xj0102/binance-psychology` 仓库
4. 点击 "Deploy"
5. 等待部署完成（约 1-2 分钟）
6. 获取部署 URL

## 方式 2：通过命令行

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
cd binance-psychology
vercel --prod
```

## 部署后测试

访问你的部署 URL，测试：
- ✅ 页面加载
- ✅ 输入 API Key
- ✅ 分析功能
- ✅ 图表显示
- ✅ 实时监控

## Demo URL

部署完成后，更新 README.md：

```markdown
## 🌐 在线 Demo

https://your-app.vercel.app
```

## 注意事项

- Vercel 免费版限制：
  - 100GB 带宽/月
  - 100 次部署/天
  - 无服务器函数 10 秒超时
  
- 用户需要自己输入 Binance API Key
- 所有数据在客户端处理，不存储在服务器
