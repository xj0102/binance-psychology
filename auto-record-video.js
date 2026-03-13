// auto-record-video.js - 自动录制 Demo 视频（完整版）

const { chromium } = require('playwright');

async function recordDemo() {
  console.log('🎬 启动自动录制（完整版）...\n');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: './demo-video/',
      size: { width: 1920, height: 1080 }
    }
  });
  
  const page = await context.newPage();
  
  try {
    // 场景 1: 打开主页 (3秒)
    console.log('📍 场景 1: 主页介绍');
    await page.goto('https://binance-psychology.vercel.app/');
    await page.waitForTimeout(3000);
    
    // 场景 2: 滚动到表单 (2秒)
    console.log('📍 场景 2: 滚动到表单');
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    
    // 场景 3: 填写 API Key (需要真实的 API Key 才能分析)
    console.log('📍 场景 3: 填写表单');
    
    // 使用环境变量中的真实 API Key
    const apiKey = process.env.BINANCE_API_KEY || 'demo_key';
    const apiSecret = process.env.BINANCE_API_SECRET || 'demo_secret';
    
    await page.fill('#apiKey', apiKey);
    await page.waitForTimeout(800);
    await page.fill('#apiSecret', apiSecret);
    await page.waitForTimeout(800);
    
    // 场景 4: 选择交易对 (2秒)
    console.log('📍 场景 4: 选择交易对');
    await page.selectOption('#symbol', 'ETHUSDT');
    await page.waitForTimeout(500);
    await page.selectOption('#days', '365');
    await page.waitForTimeout(1500);
    
    // 场景 5: 点击分析按钮 (2秒)
    console.log('📍 场景 5: 点击开始分析');
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'smooth' }));
    await page.waitForTimeout(1000);
    await page.click('.analyze-button');
    await page.waitForTimeout(1000);
    
    // 场景 6: 等待分析完成 (5-10秒)
    console.log('📍 场景 6: 等待分析结果...');
    await page.waitForSelector('#results.show', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // 场景 7: 展示分析结果 (5秒)
    console.log('📍 场景 7: 展示核心数据');
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'smooth' }));
    await page.waitForTimeout(5000);
    
    // 场景 8: 展示图表 (5秒)
    console.log('📍 场景 8: 展示数据图表');
    await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'smooth' }));
    await page.waitForTimeout(5000);
    
    // 场景 9: 展示问题诊断 (5秒)
    console.log('📍 场景 9: 展示问题诊断');
    await page.evaluate(() => window.scrollTo({ top: 2000, behavior: 'smooth' }));
    await page.waitForTimeout(5000);
    
    // 场景 10: 展示实时监控按钮 (3秒)
    console.log('📍 场景 10: 展示实时监控');
    await page.evaluate(() => window.scrollTo({ top: 2500, behavior: 'smooth' }));
    await page.waitForTimeout(3000);
    
    console.log('\n✅ 录制完成！');
    
  } catch (error) {
    console.error('❌ 录制失败:', error.message);
  } finally {
    await context.close();
    await browser.close();
    
    console.log('\n📹 视频已保存到 demo-video/ 目录');
    console.log('查看视频: ls -lh demo-video/*.webm');
  }
}

recordDemo();
