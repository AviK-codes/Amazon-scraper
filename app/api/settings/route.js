import { getSettings, saveSettings } from '@/lib/storage';
import { NextResponse } from 'next/server';

export async function GET() {
    const settings = await getSettings();
    return NextResponse.json(settings);
}

export async function POST(req) {
    try {
        const data = await req.json();
        const { trackedUrl, targetEmail, intervalMinutes } = data;
        
        // Ensure interval is a number, default to 60 if missing/invalid
        const interval = intervalMinutes ? parseInt(intervalMinutes, 10) : 60;

        const success = await saveSettings({ 
            trackedUrl, 
            targetEmail, 
            intervalMinutes: isNaN(interval) ? 60 : interval 
        });
        if (success) {
            return NextResponse.json({ message: 'Settings saved successfully' });
        }
        return NextResponse.json({ message: 'Failed to save' }, { status: 500 });
    } catch {
        return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }
}
