'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSettings, updateSettings } from '@/services/api';

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        fineRatePerDay: 5,
        standardBorrowDays: 14,
        lostBookProcessingFee: 200,
        maxBooksPerUser: 3
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            router.push('/login');
        } else {
            fetchSettings();
        }
    }, [router]);

    const fetchSettings = async () => {
        try {
            const data = await getSettings('library_config');
            if (data) setSettings(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch settings', err);
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage('');
        try {
            await updateSettings(settings, 'library_config');
            setSuccessMessage('Authority directives updated successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            alert('Failed to update system authority.');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: parseInt(value) || 0
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <p className="text-zinc-400 font-black animate-pulse uppercase tracking-widest">Accessing Authority Vault...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 font-sans">
            <nav className="bg-white/80 backdrop-blur-md border-b border-zinc-100 px-8 py-5 flex justify-between items-center fixed top-0 w-full z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin/dashboard')} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400">←</button>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight leading-none uppercase">System Authority Settings</h1>
                </div>
                {successMessage && (
                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-4 py-2 rounded-full uppercase tracking-widest border border-green-100 animate-in fade-in slide-in-from-top-2">
                        {successMessage}
                    </span>
                )}
            </nav>

            <main className="pt-28 p-8 max-w-4xl mx-auto space-y-10 pb-20">
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-indigo-100 border border-zinc-100">
                    <div className="mb-12">
                        <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter">Operational Directives</h2>
                        <p className="text-zinc-500 text-sm mt-2 font-medium">Define the core parameters of the Library's automated governance system.</p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-10">
                        {/* Financial Parameters */}
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] pb-2 border-b border-zinc-100">Financial Parameters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest block pl-1">Daily Fine Rate (₹)</label>
                                    <input
                                        type="number"
                                        value={settings.fineRatePerDay || 0}
                                        onChange={e => handleChange('fineRatePerDay', e.target.value)}
                                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-black text-lg text-zinc-900 transition-all"
                                    />
                                    <p className="text-[10px] text-zinc-400 italic pl-1">Applied automatically after the due date expires.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest block pl-1">Standard Borrowing Period (Days)</label>
                                    <input
                                        type="number"
                                        value={settings.standardBorrowDays || 0}
                                        onChange={e => handleChange('standardBorrowDays', e.target.value)}
                                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-black text-lg text-zinc-900 transition-all"
                                    />
                                    <p className="text-[10px] text-zinc-400 italic pl-1">Default duration for every new issue transaction.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest block pl-1">Lost Book Processing Fee (₹)</label>
                                    <input
                                        type="number"
                                        value={settings.lostBookProcessingFee || 0}
                                        onChange={e => handleChange('lostBookProcessingFee', e.target.value)}
                                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-black text-lg text-zinc-900 transition-all"
                                    />
                                    <p className="text-[10px] text-zinc-400 italic pl-1">Administrative charge applied on top of book price when lost.</p>
                                </div>
                            </div>
                        </section>

                        {/* Membership Constraints */}
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] pb-2 border-b border-zinc-100">Membership Limits</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest block pl-1">Max Books / User</label>
                                    <input
                                        type="number"
                                        value={settings.maxBooksPerUser || 0}
                                        onChange={e => handleChange('maxBooksPerUser', e.target.value)}
                                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-black text-lg text-zinc-900 transition-all"
                                    />
                                    <p className="text-[10px] text-zinc-400 italic pl-1">Maximum number of books a member can hold at once.</p>
                                </div>
                            </div>
                        </section>

                        <div className="pt-10 flex gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 py-5 bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-[2rem] hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                {saving ? 'Pulsing System Update...' : 'Commit Operational Directives'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="p-10 border-4 border-dashed border-zinc-100 rounded-[3rem] text-center space-y-4">
                    <span className="text-4xl grayscale opacity-30">🛡️</span>
                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] leading-relaxed max-w-xl mx-auto">WARNING: Modifying these directives will immediately alter calculations for all new and existing transactions system-wide. Exercise Authority with caution.</p>
                </div>
            </main>
        </div>
    );
}
