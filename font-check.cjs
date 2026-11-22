const { chromium } = require('@playwright/test');
(async () => {
 const browser = await chromium.launch({headless:true,channel:'msedge'});
 try {
  const page = await browser.newPage();
  await page.goto('http://localhost:3100/about');
  const result = await page.evaluate(async () => {
   const heading = document.querySelector('h1');
   const style = getComputedStyle(heading);
   const loaded = await document.fonts.load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`);
   return {family: style.fontFamily, loaded: loaded.map(f => ({family:f.family,status:f.status}))};
  });
  console.log(JSON.stringify(result));
  if (!result.loaded.length || result.loaded.some(f => f.status !== 'loaded')) throw Error('Font did not load');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
