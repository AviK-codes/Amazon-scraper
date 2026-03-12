import chromium from '@sparticuz/chromium-min';

/**
 * Attempts to scrape using a simple fetch request first (Fast)
 * Falls back to Chromium if fetch is blocked or fails (Slow)
 */
export async function checkFreeShipping(url) {
    console.log('--- Scraping Start ---');
    console.log('Target URL:', url);

    // 1. FAST ATTEMPT: Simple Fetch with Headers
    try {
        console.log('Stage 1: Attempting fast fetch...');
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
            signal: AbortSignal.timeout(10000) // 10s timeout for fetch
        });

        if (response.ok) {
            const html = await response.text();
            
            // Check if we got a real page or a bot block
            if (!html.includes('robot') && html.includes('productTitle')) {
                console.log('Fast fetch successful!');
                
                // Extract Title using simple regex to avoid needing a DOM parser
                const titleMatch = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/i);
                const title = titleMatch ? titleMatch[1].trim() : 'Unknown Product';
                
                const isFreeShipping = html.toLowerCase().includes('free shipping') && html.toLowerCase().includes('israel');
                console.log('Result (Fetch):', { isFreeShipping, title });
                return { isFreeShipping, title };
            }
            console.log('Fast fetch blocked or invalid. Falling back to Chromium...');
        } else {
            console.log('Fast fetch returned status:', response.status);
        }
    } catch (e) {
        console.log('Fast fetch failed:', e.message);
    }

    // 2. SLOW ATTEMPT: Chromium Fallback
    let browser = null;
    try {
        console.log('Stage 2: Launching Chromium...');
        const isLocal = !process.env.VERCEL_ENV && process.env.NODE_ENV !== 'production';

        let puppeteer;
        if (isLocal) {
            puppeteer = await import('puppeteer');
            browser = await puppeteer.launch({ headless: true });
        } else {
            puppeteer = await import('puppeteer-core');
            const remoteBinary = 'https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar';
            console.log('Downloading/Locating Chromium binary...');
            const executablePath = await chromium.executablePath(remoteBinary);
            
            browser = await puppeteer.launch({
                args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
                defaultViewport: chromium.defaultViewport,
                executablePath,
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
        }

        console.log('Browser launched. Opening page...');
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        // Very tight timeout to stay within Vercel limits
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

        const title = await page.evaluate(() => {
            const el = document.querySelector('#productTitle');
            return el ? el.textContent.trim() : 'Unknown Product';
        });

        const html = await page.content();
        const isFreeShipping = html.toLowerCase().includes('free shipping') && html.toLowerCase().includes('israel');

        console.log('Result (Chromium):', { isFreeShipping, title });
        return { isFreeShipping, title };
    } catch (err) {
        console.error('Final Scraper Error:', err.message);
        return { isFreeShipping: false, title: `Error: ${err.message}` };
    } finally {
        if (browser) await browser.close();
        console.log('--- Scraping End ---');
    }
}
