#!/usr/bin/env node

// 自动演示脚本 - 生成演示截图序列

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const steps = [
  {
    name: '01-hero',
    desc: '主页',
    actions: [
      'agent-browser open "https://binance-psychology.vercel.app/"',
      'agent-browser wait 2000'
    ]
  },
  {
    name: '02-scroll-to-form',
    desc: '滚动到表单',
    actions: [
      'agent-browser eval "window.scrollTo(0, 400)"',
      'agent-browser wait 1000'
    ]
  },
  {
    name: '03-form-filled',
    desc: '填写表单',
    actions: [
      'agent-browser eval "document.querySelector(\'#apiKey\').value = \'YOUR_API_KEY\'"',
      'agent-browser eval "document.querySelector(\'#apiSecret\').value = \'YOUR_SECRET\'"',
      'agent-browser eval "document.querySelector(\'#symbol\').value = \'ETHUSDT\'"',
      'agent-browser eval "document.querySelector(\'#days\').value = \'365\'"',
      'agent-browser wait 1000'
    ]
  }
];

async function generateScreenshots() {
  console.log('🎬 开始生成演示截图...\n');
  
  for (const step of steps) {
    console.log(`📸 ${step.desc}...`);
    
    for (const action of step.actions) {
      await execAsync(action);
    }
    
    await execAsync(`agent-browser screenshot video-frames/${step.name}.png`);
    console.log(`✅ ${step.name}.png\n`);
  }
  
  console.log('✅ 所有截图已生成！');
  console.log('\n查看截图：');
  console.log('open video-frames/');
}

generateScreenshots().catch(console.error);
