import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, text, html }) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: `"Amazon Tracker" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}
