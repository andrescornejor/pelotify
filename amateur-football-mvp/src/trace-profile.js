const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('servicios.sportsreel.com.ar')) {
      try {
        const text = await response.text();
        console.log(`\nAPI CALL: ${url}`);
        console.log(`RESPONSE: ${text.substring(0, 500)}`);
      } catch (e) {}
    }
  });

  console.log('Navigating to Sportsreel Home...');
  await page.goto('https://www.sportsreel.com.ar/#/', { waitUntil: 'networkidle2' });
  
  // Try to find a venue link or search
  // Based on previous trace, establecimiento/get is called.
  // Let's assume there is a list of venues.
  // Wait for the page to load.
  await new Promise(r => setTimeout(r, 5000));

  // If we can find a link to "Olimpicus 1" or "El Ovalo"
  // Let's try to navigate directly to their "profile" if possible
  // Pattern seems to be /#/establecimiento/{id}
  console.log('\nNavigating to Olimpicus 1 profile...');
  await page.goto('https://www.sportsreel.com.ar/#/establecimiento/71', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));

  await browser.close();
})();
