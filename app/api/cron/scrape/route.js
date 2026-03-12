import { getSettings, getLastScrapedAt, setLastScrapedAt } from '@/lib/storage';
import { checkFreeShipping } from '@/lib/scraper';
import { sendEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

// This is required for Vercel Cron Jobs
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const isManual = url.searchParams.get('manual') === 'true';

        const settings = await getSettings();
        if (!settings.trackedUrl || !settings.targetEmail) {
            return NextResponse.json({ message: 'No tracked URL or email configured' }, { status: 400 });
        }

        if (!isManual) {
            const lastScrapedAt = await getLastScrapedAt();
            const now = Date.now();
            const intervalMs = (settings.intervalMinutes || 60) * 60 * 1000;
            
            if (now - lastScrapedAt < intervalMs) {
                return NextResponse.json({ message: `Scrape skipped. Interval of ${settings.intervalMinutes} minutes has not elapsed.` });
            }
            
            // Record the timestamp before starting the slow scrape
            await setLastScrapedAt(now);
        }

        const { isFreeShipping, title } = await checkFreeShipping(settings.trackedUrl);

        if (title.startsWith('Error:')) {
            return NextResponse.json({ message: `Scraper Error: ${title}`, title }, { status: 500 });
        }

        if (isFreeShipping) {
            await sendEmail({
                to: settings.targetEmail,
                subject: `🚨 Amazon Tracker Alert: FREE Shipping for ${title.substring(0, 30)}...!`,
                text: `Good news!

  The item "${title}" is currently available with FREE shipping to Israel.

  Link: ${settings.trackedUrl}

  Happy shopping!
  `,
            });
            return NextResponse.json({ message: `Free shipping found for "${title.substring(0, 30)}..."! Alert sent.`, title });
        }

        if (isManual) {
            await sendEmail({
                to: settings.targetEmail,
                subject: `ℹ️ Amazon Tracker: No free shipping yet for ${title.substring(0, 30)}...`,
                text: `Hello!

You manually triggered the Amazon Tracker for:
"${title}"

Currently, it is NOT available with FREE shipping to Israel. 
We will keep tracking this for you automatically in the background!

Link: ${settings.trackedUrl}
  `,
            });
        }

        return NextResponse.json({ message: `No free shipping found for "${title.substring(0, 30)}...".${isManual ? ' Email sent.' : ''}`, title });
    } catch (error) {
        console.error('Cron scrape error:', error);
        return NextResponse.json({ message: `System Error: ${error.message}` }, { status: 500 });
    }
}
