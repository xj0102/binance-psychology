const { chromium } = require('playwright');

async function recordDemo() {
  console.log('🎬 启动自动录制...\n');
  
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
    console.log('📍 场景 1: 主页');
    await page.goto('https://binance-psychology.vercel.app/');
    await page.waitForTimeout(3000);
    
    console.log('📍 场景 2: 滚动到表单');
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    
    console.log('📍 场景 3: 填写表单（打码）');
    await page.fill('#apiKey', 'YOUR_API_KEY_***');
    await page.waitForTimeout(800);
    await page.fill('#apiSecret', '***YOUR_SECRET***');
    await page.waitForTimeout(800);
    
    console.log('📍 场景 4: 选择交易对');
    await page.selectOption('#symbol', 'ETHUSDT');
    await page.waitForTimeout(500);
    await page.selectOption('#days', '365');
    await page.waitForTimeout(1500);
    
    console.log('📍 场景 5: 滚动到按钮');
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'smooth' }));
    await page.waitForTimeout(1000);
    
    console.log('📍 场景 6: 替换真实 Key');
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;
    
    if (apiKey && apiSecret) {
      await page.evaluate(({key, secret}) => {
        document.querySelector('#apiKey').value = key;
        document.querySelector('#apiSecret').value = secret;
      }, {key: apiKey, secret: apiSecret});
    }
    
    console.log('📍 场景 7: 点击分析');
    await page.click('.analyze-button');
    await page.waitForTimeout(2000);
    
    console.log('📍 场景 8: 等待结果...');
    await page.waitForSelector('#results.show', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    console.log('📍 场景 9: 展示统计');
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'smooth' }));
    await page.waitForTimeout(4000);
    
    console.log('📍 场景 10: 展示评分');
    await page.evaluate(() => window.scrollTo({ top: 1400, behavior: 'smooth' }));
    await page.waitForTimeout(3000);
    
    console.log('📍 场景 11: 展示图表');
    await page.evaluate(() => window.scrollTo({ top: 1900, behavior: 'smooth' }));
    await page.waitForTimeout(4000);
    
    console.log('📍 场景 12: 展示问题');
    await page.evaluate(() => window.scrollTo({ top: 2400, behavior: 'smooth' }));
    await page.waitForTimeout(4000);
    
    console.log('📍 场景 13: 展示建议');
    await page.evaluate(() => window.scrollTo({ top: 2800, behavior: 'smooth' }));
    await page.waitForTimeout(3000);
    
    console.log('\n✅ 录制完成！');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await context.close();
    await browser.close();
    console.log('\n📹 视频已保存');
  }
}

recordDemo();
