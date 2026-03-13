// auto-record-video.js - 自动录制 Demo 视频

const { chromium } = require('playwright');

async function recordDemo() {
  console.log('🎬 启动自动录制...\n');
  
  // 启动浏览器，开启视频录制
  const browser = await chromium.launch({
    headless: false, // 显示浏览器
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
    // 场景 1: 打开主页 (5秒)
    console.log('📍 场景 1: 主页介绍');
    await page.goto('https://binance-psychology.vercel.app/');
    await page.waitForTimeout(5000);
    
    // 场景 2: 滚动到表单 (3秒)
    console.log('📍 场景 2: 滚动到表单');
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(3000);
    
    // 场景 3: 填写 API Key (5秒)
    console.log('📍 场景 3: 填写表单');
    await page.fill('#apiKey', 'demo_api_key_***');
    await page.waitForTimeout(1000);
    await page.fill('#apiSecret', '***secret***');
    await page.waitForTimeout(1000);
    
    // 场景 4: 选择交易对 (3秒)
    console.log('📍 场景 4: 选择交易对');
    await page.selectOption('#symbol', 'ETHUSDT');
    await page.waitForTimeout(1000);
    await page.selectOption('#days', '365');
    await page.waitForTimeout(2000);
    
    // 场景 5: 滚动展示按钮 (3秒)
    console.log('📍 场景 5: 展示分析按钮');
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'smooth' }));
    await page.waitForTimeout(3000);
    
    // 场景 6: 回到顶部 (3秒)
    console.log('📍 场景 6: 回到顶部');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(3000);
    
    // 场景 7: 展示完整界面 (5秒)
    console.log('📍 场景 7: 完整界面');
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
    await page.waitForTimeout(5000);
    
    console.log('\n✅ 录制完成！');
    
  } catch (error) {
    console.error('❌ 录制失败:', error);
  } finally {
    // 关闭浏览器，保存视频
    await context.close();
    await browser.close();
    
    console.log('\n📹 视频已保存到 demo-video/ 目录');
    console.log('查看视频: ls -lh demo-video/*.webm');
  }
}

recordDemo();
