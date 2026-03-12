const { saveSettings, getSettings } = require('./lib/storage');

async function test() {
  console.log('Testing saveSettings...');
  const testSettings = {
    trackedUrl: 'https://www.amazon.com/dp/B0CKRWHG3V',
    targetEmail: 'test@example.com',
    intervalMinutes: 10
  };

  try {
    const success = await saveSettings(testSettings);
    console.log('Save success:', success);
    
    if (success) {
      const settings = await getSettings();
      console.log('Retrieved settings:', settings);
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

test();
