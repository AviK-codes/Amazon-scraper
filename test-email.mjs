import fs from 'fs';
import nodemailer from 'nodemailer';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = envFile.split(/\r?\n/).reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key && val.length) acc[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
    return acc;
}, {});

console.log('Testing with User:', env.GMAIL_USER);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
    },
});

transporter.sendMail({
    from: `"Amazon Tracker Test" <${env.GMAIL_USER}>`,
    to: 'android.utility@gmail.com',
    subject: 'Test Email from Script',
    text: 'This is a test of the email configuration to verify it works.'
}).then(info => console.log('✅ Success! Sent: ', info.messageId))
    .catch(err => console.error('❌ SMTP Error: ', err.message));
