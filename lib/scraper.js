import chromium from '@sparticuz/chromium';

export async function checkFreeShipping(url) {
    let browser = null;
    try {
        const isLocal = !process.env.VERCEL_ENV && process.env.NODE_ENV !== 'production';

        let puppeteer;
        if (isLocal) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            puppeteer = require('puppeteer');
            browser = await puppeteer.launch({
                headless: 'new',
                ignoreHTTPSErrors: true,
            });
        } else {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            puppeteer = require('puppeteer-core');
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
        }

        const page = await browser.newPage();
        // Use an established user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const html = await page.content();

        // Extract the product title
        const title = await page.evaluate(() => {
            const el = document.querySelector('#productTitle');
            return el ? el.textContent.trim() : 'Unknown Product';
        });

        // Check if free shipping to Israel is present
        const isFreeShipping = html.toLowerCase().includes('free shipping') && html.toLowerCase().includes('israel');

        return { isFreeShipping, title };
    } catch (err) {
        console.error('Error during scraping', err);
        return { isFreeShipping: false, title: 'Error' };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
