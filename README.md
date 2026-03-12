This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Bypassing Hobby Cron Limits 🚨

Vercel's **Hobby plan** limits built-in Cron Jobs to once per day. To track products more frequently (e.g., every 10 minutes), you can use a free external "pinger" service:

1.  **Deploy your app** to Vercel first.
2.  Go to [cron-job.org](https://cron-job.org/) or [Upstash](https://upstash.com/).
3.  Create a new job that hits your URL: `https://your-app-name.vercel.app/api/cron/scrape`
4.  Set the schedule to your desired frequency (e.g., every 5 or 10 minutes).
5.  **Important:** Ensure you set up the Environment Variables (`GMAIL_USER`, `GMAIL_APP_PASSWORD`) and attach a **Vercel KV** database in the Vercel dashboard for the scraper to work properly.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
