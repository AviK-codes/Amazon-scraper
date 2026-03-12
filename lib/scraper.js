import chromium from '@sparticuz/chromium-min';

export async function checkFreeShipping(url) {
    let browser = null;
    try {
        const isLocal = !process.env.VERCEL_ENV && process.env.NODE_ENV !== 'production';

        let puppeteer;
        if (isLocal) {
            puppeteer = await import('puppeteer');
            browser = await puppeteer.launch({
                headless: true,
                ignoreHTTPSErrors: true,
            });
        } else {
            puppeteer = await import('puppeteer-core');
            
            // Remote binary URL for Vercel
            const remoteBinary = 'https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar';
            
            browser = await puppeteer.launch({
                args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(remoteBinary),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
        }

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Short timeout for Vercel
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });

        // Extract the product title
        const title = await page.evaluate(() => {
            const el = document.querySelector('#productTitle');
            return el ? el.textContent.trim() : 'Unknown Product';
        });

        const html = await page.content();
        
        // Amazon sometimes shows a bot detection page
        if (html.toLowerCase().includes('sorry, we just need to make sure you\'re not a robot')) {
            return { isFreeShipping: false, title: 'Blocked by Amazon Bot Check' };
        }

        // Check if free shipping to Israel is present
        const isFreeShipping = html.toLowerCase().includes('free shipping') && html.toLowerCase().includes('israel');

        return { isFreeShipping, title };
    } catch (err) {
        console.error('Scraping Error:', err);
        return { isFreeShipping: false, title: `Error: ${err.message}` };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
