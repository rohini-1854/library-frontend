'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { submitFeedback } from '@/services/api';

export default function UserFeedback() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        type: 'feedback',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'user') {
            router.push('/login');
        } else {
            setUser(storedUser);
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await submitFeedback({
                ...formData,
                userId: user._id || user.id
            });
            setSuccess(true);
            setFormData({ type: 'feedback', subject: '', message: '' });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            alert('Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    if (!mounted || !user) return null;

    return (
        <div className="min-h-screen bg-[#f4f7f9] font-sans">
            <header className="gov-banner">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <div className="bg-white rounded-full p-1 shadow-sm flex items-center justify-center">
                            <Image src="/tn-logo.png" alt="TN Govt Seal" width={56} height={56} className="object-contain" />
                        </div>
                        <div className="text-white">
                            <h1 className="text-lg font-bold leading-none uppercase">District Central Library</h1>
                            <p className="text-[10px] font-medium opacity-90 uppercase tracking-widest mt-1">Government of Tamil Nadu • Tirunelveli</p>
                        </div>
                    </div>
                </div>
            </header>

            <nav className="gov-nav sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
                    <div className="flex gap-8 h-full">
                        <button onClick={() => router.push('/user/dashboard')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors">Dashboard</button>
                        <button onClick={() => router.push('/user/feedback')} className="text-white text-[11px] font-bold uppercase tracking-widest px-4 border-b-2 border-white">Feedback</button>
                    </div>
                    <button onClick={() => router.push('/user/dashboard')} className="text-white/80 hover:text-white text-[10px] font-bold uppercase tracking-widest">Back to Dashboard</button>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 py-12 space-y-8 animate-gov">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-zinc-900 uppercase tracking-tight">Citizen Feedback Portal</h2>
                    <p className="text-xs font-bold text-[#3F51B5] uppercase tracking-[0.2em]">Service Excellence & Grievance Redressal</p>
                </div>

                <div className="gov-card p-10 space-y-8">
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg font-bold text-sm text-center">
                            ✓ Your submission has been recorded in the official registry. We will review it shortly.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Submission Category</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['feedback', 'report', 'suggestion'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type })}
                                        className={`py-3 rounded text-[10px] font-bold uppercase tracking-widest border transition-all ${formData.type === type
                                                ? 'bg-[#1A237E] border-[#1A237E] text-white shadow-md'
                                                : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:border-[#1A237E] hover:text-[#1A237E]'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Subject of Communication</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1A237E] font-medium text-zinc-900"
                                placeholder="Enter a concise subject..."
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Detailed Description</label>
                            <textarea
                                required
                                rows="6"
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1A237E] font-medium text-zinc-900 resize-none"
                                placeholder="Please provide complete details for our records..."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="gov-btn gov-btn-primary w-full shadow-lg !py-4"
                        >
                            {submitting ? 'Recording Submission...' : 'Submit to Authority'}
                        </button>
                    </form>
                </div>

                <div className="p-6 bg-[#E8EAF6] rounded-lg border border-[#C5CAE9] text-center">
                    <p className="text-[10px] font-bold text-[#1A237E] uppercase tracking-widest">
                        Support Helpline: 0462-2561712 • dcltirunelveli@gmail.com
                    </p>
                </div>
            </main>

            <footer className="py-12 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">
                Department of Public Libraries • Government of Tamil Nadu
            </footer>
        </div>
    );
}
