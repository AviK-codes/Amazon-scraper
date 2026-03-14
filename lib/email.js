import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, text, html }) {
    try {
        console.log('--- Email Sending Start ---');
        console.log('Sending email to:', to);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
            connectionTimeout: 10000, // 10s
        });

        // Verify connection configuration
        try {
            await transporter.verify();
            console.log('SMTP server is ready to take our messages');
        } catch (verifyError) {
            console.error('SMTP Verification Error:', verifyError);
            throw verifyError;
        }

        const info = await transporter.sendMail({
            from: `"Amazon Tracker" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        console.log('--- Email Sending End (Success) ---');
        return true;
    } catch (error) {
        console.error('--- Email Sending Error ---');
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        return false;
    }
}
