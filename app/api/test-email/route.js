import { getSettings } from '@/lib/storage';
import { sendEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const settings = await getSettings();
        if (!settings.targetEmail) {
            return NextResponse.json({ message: 'No target email configured in settings' }, { status: 400 });
        }

        const success = await sendEmail({
            to: settings.targetEmail,
            subject: '✅ Amazon Tracker: Test Email Alert!',
            text: `Hello!

This is a test email from your Amazon Tracker application.

If you received this email, it means your GMAIL_USER and GMAIL_APP_PASSWORD are configured perfectly, and you will correctly receive alerts when your tracked items are available!

Happy tracking!
`,
        });

        if (success) {
            return NextResponse.json({ message: 'Test email successfully sent to ' + settings.targetEmail });
        } else {
            return NextResponse.json({ message: 'Failed to send test email. Please check your console for errors and verify your App Password.' }, { status: 500 });
        }

    } catch (error) {
        console.error('Test email error:', error);
        return NextResponse.json({ message: 'Error triggering test email' }, { status: 500 });
    }
}
