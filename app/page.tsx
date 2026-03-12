// app/page.js
'use client';
import { useState, useEffect } from 'react';

interface Settings {
    trackedUrl: string;
    targetEmail: string;
    intervalMinutes?: number;
}

export default function Home() {
    const [settings, setSettings] = useState<Settings>({ trackedUrl: '', targetEmail: '', intervalMinutes: 60 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/settings')
            .then((res) => res.json())
            .then((data) => {
                setSettings(data);
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            const data = await res.json();
            setMessage(data.message);
        } catch {
            setMessage('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const handleDeploy = () => {
        window.open('https://vercel.com/new', '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
                <div className="animate-pulse text-gray-500">Loading Configuration...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-6 font-sans">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        Amazon Tracker
                    </h1>
                    <p className="mt-3 text-lg text-gray-500">
                        Monitor Amazon products for &apos;FREE Shipping to Israel&apos;
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Tracker Settings</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Amazon ASIN / URL
                            </label>
                            <input
                                type="url"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
                                placeholder="https://www.amazon.com/dp/B0..."
                                value={settings.trackedUrl}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, trackedUrl: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Target Gmail Address
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
                                placeholder="alerts@gmail.com"
                                value={settings.targetEmail}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, targetEmail: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Polling Interval (minutes)
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
                                placeholder="60"
                                value={settings.intervalMinutes || 60}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, intervalMinutes: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98]"
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </form>

                    {message && (
                        <div className={`mt-6 p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-2 ${message.includes('Error') || message.includes('Failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    {message.includes('Error') || message.includes('Failed') ? '⚠️' : message.includes('Checking') ? '⏳' : '✅'}
                                    <span dangerouslySetInnerHTML={{ __html: message.replace(/"([^"]*)"/g, '<strong>"$1"</strong>') }}></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Manual Action</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            You can manually trigger the scraper to check the item immediately without waiting for the scheduled cron job.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                type="button"
                                onClick={async () => {
                                    setMessage('Checking availability now... please wait.');
                                    try {
                                        const res = await fetch('/api/cron/scrape?manual=true');
                                        const data = await res.json();
                                        setMessage(data.message);
                                    } catch {
                                        setMessage('Failed to trigger scrape.');
                                    }
                                }}
                                className="w-full bg-white text-indigo-600 font-bold py-3 px-4 rounded-xl border-2 border-indigo-600 hover:bg-indigo-50 focus:ring-4 focus:ring-indigo-500/20 transition-all active:scale-[0.98]"
                            >
                                Scrape Now
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    setMessage('Sending test email... please wait.');
                                    try {
                                        const res = await fetch('/api/test-email');
                                        const data = await res.json();
                                        setMessage(data.message);
                                    } catch {
                                        setMessage('Failed to send test email.');
                                    }
                                }}
                                className="w-full bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-xl border-2 border-gray-200 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 transition-all active:scale-[0.98]"
                            >
                                Test Email Alert
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                    <h2 className="text-xl font-bold mb-3 relative z-10">Ready for Production</h2>
                    <p className="text-gray-300 mb-6 text-sm leading-relaxed relative z-10">
                        For Vercel deployment, ensure you add <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300">GMAIL_USER</code> and <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300">GMAIL_APP_PASSWORD</code> via the dashboard, and attach a <strong>Vercel KV</strong> store.
                    </p>
                    <button
                        type="button"
                        className="group relative z-10 inline-flex items-center justify-center gap-2 bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all active:scale-[0.98] w-full sm:w-auto"
                        onClick={handleDeploy}
                    >
                        <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" /></svg>
                        Deploy to Vercel
                    </button>
                </div>
            </div>
        </main>
    );
}
