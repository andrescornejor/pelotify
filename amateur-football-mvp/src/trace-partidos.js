const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to Olimpicus 1 profile...');
  await page.setViewport({ width: 1280, height: 800 });
  
  // Register interceptor BEFORE navigation
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('servicios.sportsreel')) {
      try {
        const text = await res.text();
        console.log(`\nURL: ${url}`);
        console.log(`BODY: ${text.substring(0, 300)}`);
      } catch (e) {}
    }
  });

  await page.goto('https://www.sportsreel.com.ar/#/establecimiento/71', { waitUntil: 'networkidle2' });
  
  // Wait for the components to load
  await new Promise(r => setTimeout(r, 5000));

  // Try to find tabs like "Partidos", "Videos", etc.
  // Let's take a screenshot to see where we are
  await page.screenshot({ path: 'sportsreel_profile.png' });
  
  // Find all buttons or links that might lead to "Partidos"
  const buttons = await page.$$eval('button, a', elements => elements.map(e => e.innerText));
  console.log('\nButtons/Links found:', buttons);

  // If we see "Partidos" or something, try clicking it
  const matchButton = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button, a, span'));
    return btns.find(b => b.innerText.toLowerCase().includes('partido') || b.innerText.toLowerCase().includes('repleto') || b.innerText.toLowerCase().includes('completo'));
  });

  if (matchButton.asElement()) {
    console.log('Clicking "Partidos" button...');
    await matchButton.asElement().click();
    await new Promise(r => setTimeout(r, 5000));
  } else {
    console.log('No "Partidos" button found.');
  }

  await browser.close();
})();
