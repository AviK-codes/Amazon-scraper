const testCron = async () => {
    console.log(`[Local Cron] Triggering scrape at ${new Date().toLocaleTimeString()}...`);
    try {
        const res = await fetch('http://localhost:3000/api/cron/scrape');
        const data = await res.json();
        console.log(`[Local Cron Response]:`, data.message);
    } catch (err) {
        console.error(`[Local Cron Error]: Could not reach http://localhost:3000/api/cron/scrape. Is the server running?`);
    }
};

console.log('Starting Local Cron Simulator...');
console.log('This script will ping the scrape endpoint every 1 minute, similar to Vercel Cron.');

// Run immediately once
testCron();

// Then run every 60 seconds (60000 milliseconds)
setInterval(testCron, 60000);
