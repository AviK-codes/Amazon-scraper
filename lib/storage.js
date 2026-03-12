import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';

// Detection of environment
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL_URL;

let redis = null;
try {
  // Use any available Upstash/KV REST variables
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (url && token) {
    redis = new Redis({ url, token });
  } else if (isVercel) {
    console.error('CRITICAL: Running on Vercel but no Redis environment variables found!');
  }
} catch (error) {
  console.error('Failed to initialize Redis client:', error.message);
}

const SETTINGS_KEY = 'amazon_tracker_settings';
const LOCAL_FILE = path.join(process.cwd(), 'local-settings.json');

export async function getSettings() {
  try {
    let settings = { trackedUrl: '', targetEmail: '', intervalMinutes: 60 };
    if (!redis) {
        if (isVercel) return settings; // Don't use filesystem on Vercel
      if (fs.existsSync(LOCAL_FILE)) {
        const localSettings = JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf-8'));
        settings = { ...settings, ...localSettings };
      }
    } else {
      const kvSettings = await redis.get(SETTINGS_KEY);
      if (kvSettings) settings = { ...settings, ...kvSettings };
    }

    // Fallback to GMAIL_USER if targetEmail is empty
    if (!settings.targetEmail && process.env.GMAIL_USER) {
      settings.targetEmail = process.env.GMAIL_USER;
    }
    return settings;
  } catch (error) {
    console.error('Error fetching settings', error);
    return { trackedUrl: '', targetEmail: process.env.GMAIL_USER || '', intervalMinutes: 60 };
  }
}

export async function saveSettings(settings) {
  try {
    if (!redis) {
      if (isVercel) throw new Error('Redis not initialized - cannot save in production');
      const currentSettings = fs.existsSync(LOCAL_FILE) ? JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf-8')) : {};
      fs.writeFileSync(LOCAL_FILE, JSON.stringify({ ...currentSettings, ...settings }, null, 2));
      return true;
    }
    const currentSettings = (await redis.get(SETTINGS_KEY)) || {};
    await redis.set(SETTINGS_KEY, { ...currentSettings, ...settings });
    return true;
  } catch (error) {
    console.error('Error in saveSettings:', error.message || error);
    return false;
  }
}

const TIMESTAMP_KEY = 'amazon_tracker_last_scraped_at';
const LOCAL_TIMESTAMP_FILE = path.join(process.cwd(), 'local-timestamp.json');

export async function getLastScrapedAt() {
  try {
    if (!redis) {
      if (isVercel) return 0;
      if (fs.existsSync(LOCAL_TIMESTAMP_FILE)) {
        const data = JSON.parse(fs.readFileSync(LOCAL_TIMESTAMP_FILE, 'utf-8'));
        return data.lastScrapedAt || 0;
      }
      return 0;
    }
    const lastScrapedAt = await redis.get(TIMESTAMP_KEY);
    return lastScrapedAt || 0;
  } catch (error) {
    console.error('Error getting last scraped at', error);
    return 0;
  }
}

export async function setLastScrapedAt(timestamp) {
  try {
    if (!redis) {
      if (isVercel) return false;
      fs.writeFileSync(LOCAL_TIMESTAMP_FILE, JSON.stringify({ lastScrapedAt: timestamp }, null, 2));
      return true;
    }
    await redis.set(TIMESTAMP_KEY, timestamp);
    return true;
  } catch (error) {
    console.error('Error setting last scraped at', error);
    return false;
  }
}
