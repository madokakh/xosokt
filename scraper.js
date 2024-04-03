const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.minhngoc.net.vn/xo-so-truc-tiep/mien-nam.html', { waitUntil: 'networkidle2' });

  const data = await page.evaluate(() => {
    let regionsData = [];
    const tables = document.querySelectorAll('.rightcl');

    tables.forEach(table => {
        const region = table.querySelector('.tinh a').textContent; // Assuming this remains consistent
        const results = {};
        
        table.querySelectorAll('.giaiSo').forEach(el => {
            const category = el.getAttribute('id').split('_')[0]; // Adjust based on IDs or another distinguishing feature
            const number = el.textContent.trim();

            // Check if the category already exists, and append the number with a newline if it does
            if (results[category]) {
                results[category] += `\n${number}`;
            } else {
                results[category] = number;
            }
        });

        regionsData.push({ region, results });
    });
    return regionsData;
});



  // Debugging
 // console.log(data);

  // Save the flattened array to results.json
  fs.writeFile('results.json', JSON.stringify(data, null, 2), err => {
    if (err) throw err;
    console.log('Saved lottery results to results.json');
  });

  await browser.close();
})();
