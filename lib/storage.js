import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

const SETTINGS_KEY = 'amazon_tracker_settings';
const LOCAL_FILE = path.join(process.cwd(), 'local-settings.json');

export async function getSettings() {
  try {
    let settings = { trackedUrl: '', targetEmail: '', intervalMinutes: 60 };
    if (!process.env.KV_REST_API_URL) {
      if (fs.existsSync(LOCAL_FILE)) {
        const localSettings = JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf-8'));
        settings = { ...settings, ...localSettings };
      }
    } else {
      const kvSettings = await kv.get(SETTINGS_KEY);
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
    if (!process.env.KV_REST_API_URL) {
      const currentSettings = fs.existsSync(LOCAL_FILE) ? JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf-8')) : {};
      fs.writeFileSync(LOCAL_FILE, JSON.stringify({ ...currentSettings, ...settings }, null, 2));
      return true;
    }
    const currentSettings = (await kv.get(SETTINGS_KEY)) || {};
    await kv.set(SETTINGS_KEY, { ...currentSettings, ...settings });
    return true;
  } catch (error) {
    console.error('Error saving settings', error);
    return false;
  }
}

const TIMESTAMP_KEY = 'amazon_tracker_last_scraped_at';
const LOCAL_TIMESTAMP_FILE = path.join(process.cwd(), 'local-timestamp.json');

export async function getLastScrapedAt() {
  try {
    if (!process.env.KV_REST_API_URL) {
      console.log('Fetching local timestamp file:', LOCAL_TIMESTAMP_FILE);
      if (fs.existsSync(LOCAL_TIMESTAMP_FILE)) {
        const data = JSON.parse(fs.readFileSync(LOCAL_TIMESTAMP_FILE, 'utf-8'));
        console.log('Found local timestamp:', data.lastScrapedAt);
        return data.lastScrapedAt || 0;
      }
      console.log('No local timestamp file found.');
      return 0;
    }
    const lastScrapedAt = await kv.get(TIMESTAMP_KEY);
    return lastScrapedAt || 0;
  } catch (error) {
    console.error('Error getting last scraped at', error);
    return 0;
  }
}

export async function setLastScrapedAt(timestamp) {
  try {
    console.log('Setting last scraped at:', timestamp);
    if (!process.env.KV_REST_API_URL) {
      console.log('Writing to local timestamp file:', LOCAL_TIMESTAMP_FILE);
      fs.writeFileSync(LOCAL_TIMESTAMP_FILE, JSON.stringify({ lastScrapedAt: timestamp }, null, 2));
      return true;
    }
    await kv.set(TIMESTAMP_KEY, timestamp);
    return true;
  } catch (error) {
    console.error('Error setting last scraped at', error);
    return false;
  }
}
