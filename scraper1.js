const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
 
  const currentTime = new Date();
  // Format the current time as hours and minutes for comparison
  const formattedTime = currentTime.getHours() * 100 + currentTime.getMinutes();

  let scriptToRun = 'https://thinhnamnet.com/xo-so-truc-tiep-duc-hanh.php';

  // Determine which script to run based on the current time
  if (formattedTime >1200) { // Checks if the current time is before 3:00 PM
    console.log('Running scraper1.js...');
    scriptToRun = 'https://thinhnamnet.com/xo-so-truc-tiep-mien-nam.php';
  }
  await page.goto(scriptToRun, { waitUntil: 'networkidle2' });

  const data = await page.evaluate(() => {
    /* let regionsData = []; // This will collect all regions data
    const rows = document.querySelectorAll('#bangkqxsmien > div.box_kqxs > div.content > table.bkqmiennam > tbody > tr');

    rows.forEach(row => {
      const row1 = row.querySelector('tr > td:nth-child(2)');

      for (let i = 1; i <= 3; i++) {
        const results = {};
        const region = row1.querySelector(`tr > td:nth-child(${i}) .tinh a`).title;
        row1.querySelector(`tr > td:nth-child(${i})`).querySelectorAll('.giai8, .giai7, .giai6, .giai5, .giai4, .giai3, .giai2, .giai1, .giaidb').forEach(el => {
          const category = el.className;
          const numbers = Array.from(el.querySelectorAll('div')).map(div => div.textContent.trim());
          results[category] = numbers.length > 1 ? numbers.join('\n') : el.textContent.trim();
        });
        regionsData.push({ region, results });
      } */

    let regionsData = [];
    const tables = document.querySelectorAll('.rightcl');

    tables.forEach(table => {
      const region = table.querySelector('.tinh a').textContent; // Assuming this remains consistent
      const results = {};

      table.querySelectorAll('.giai8, .giai7, .giai6, .giai5, .giai4, .giai3, .giai2, .giai1, .giaidb').forEach(el => {
        const category = el.className;
        const numbers = Array.from(el.querySelectorAll('div')).map(div => div.textContent.trim());
        results[category] = numbers.length > 1 ? numbers.join('\n') : el.textContent.trim();
      });

      regionsData.push({ region, results });
    });
    return regionsData;
  });

  // Debugging
  //console.log(data);

  // Save the flattened array to results.json
  fs.writeFile('results.json', JSON.stringify(data, null, 2), err => {
    if (err) throw err;
    console.log('Saved lottery results to results.json');
  });

  await browser.close();
})();
