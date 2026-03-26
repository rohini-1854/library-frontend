'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllFeedback, updateFeedbackStatus } from '@/services/api';

export default function AdminFeedback() {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'feedback'
    const router = useRouter();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            router.push('/login');
        } else {
            fetchFeedback();
        }
    }, [router]);

    const fetchFeedback = async () => {
        try {
            const data = await getAllFeedback();
            setFeedback(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch feedback', err);
        }
    };

    const filteredFeedback = feedback.filter(f => {
        if (activeTab === 'reports') return f.type === 'report';
        return f.type === 'feedback' || f.type === 'suggestion';
    });

    const handleStatusChange = async (id, status) => {
        try {
            await updateFeedbackStatus(id, status);
            fetchFeedback();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f7f9] font-sans">
            {/* Government Banner */}
            <header className="gov-banner">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <div className="bg-white rounded-full p-1 shadow-sm flex items-center justify-center">
                            <img src="/tn-logo.png" alt="TN Govt Seal" width={48} height={48} className="object-contain" />
                        </div>
                        <div className="text-white">
                            <h1 className="text-base font-bold leading-none uppercase">District Central Library</h1>
                            <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest mt-1">Government of Tamil Nadu • Tirunelveli</p>
                            <span className="text-[9px] font-bold bg-[#F39C12] px-2 py-0.5 rounded text-zinc-900 mt-1 inline-block">தமிழ்நாடு அரசு • Administration</span>
                        </div>
                    </div>
                </div>
            </header>
            <nav className="gov-nav sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center w-full">
                    <div className="flex gap-2 h-full items-center">
                        <button onClick={() => router.push('/admin/dashboard')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Dashboard</button>
                        <button onClick={() => router.push('/admin/books')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Asset Management</button>
                        <button onClick={() => router.push('/admin/members')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Members</button>
                        <button onClick={() => router.push('/admin/transactions')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Circulation Desk</button>
                        <button onClick={() => router.push('/admin/feedback')} className="text-white text-[11px] font-bold uppercase tracking-widest px-4 border-b-2 border-white py-4">Public Feedback</button>
                    </div>
                    <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="bg-[#1A237E] hover:bg-[#D32F2F] text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all border border-white/20">Logout</button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-gov">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-zinc-100 border border-zinc-50 overflow-hidden">
                            <div className="px-8 py-6 border-b border-zinc-50 flex flex-col sm:flex-row justify-between items-center bg-zinc-50/30 gap-6">
                                <div className="flex bg-white p-1 rounded-2xl border border-zinc-100">
                                    <button
                                        onClick={() => setActiveTab('reports')}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-zinc-400 hover:text-zinc-600'
                                            }`}
                                    >
                                        Reports
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('feedback')}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'feedback' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-zinc-400 hover:text-zinc-600'
                                            }`}
                                    >
                                        Feedback
                                    </button>
                                </div>
                                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{filteredFeedback.length} {activeTab.toUpperCase()}</span>
                            </div>

                            <div className="divide-y divide-zinc-50">
                                {loading ? (
                                    <div className="p-20 text-center font-black text-zinc-300 animate-pulse uppercase tracking-widest text-xs">Loading inbox...</div>
                                ) : filteredFeedback.length === 0 ? (
                                    <div className="p-20 text-center text-zinc-300 font-bold italic">No records found for this section.</div>
                                ) : (
                                    filteredFeedback.map((f) => (
                                        <div key={f._id} className="p-8 hover:bg-zinc-50/50 transition-colors group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-sm ${f.type === 'report' ? 'bg-rose-50 text-rose-500' :
                                                        f.type === 'suggestion' ? 'bg-amber-50 text-amber-500' :
                                                            'bg-indigo-50 text-indigo-500'
                                                        }`}>
                                                        {f.type === 'report' ? '⚠️' : f.type === 'suggestion' ? '💡' : '💬'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-zinc-900 uppercase tracking-tight">{f.subject}</p>
                                                        <p className="text-xs font-bold text-zinc-400">From: {f.user?.name} ({f.user?.email})</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="text-[10px] font-black text-zinc-300 uppercase">{new Date(f.createdAt).toLocaleDateString()}</span>
                                                    <select
                                                        value={f.status}
                                                        onChange={(e) => handleStatusChange(f._id, e.target.value)}
                                                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-none focus:ring-0 cursor-pointer ${f.status === 'new' ? 'bg-indigo-50 text-indigo-600' :
                                                            f.status === 'read' ? 'bg-amber-50 text-amber-600' :
                                                                'bg-green-50 text-green-600'
                                                            }`}
                                                    >
                                                        <option value="new">New</option>
                                                        <option value="read">In Review</option>
                                                        <option value="resolved">Resolved</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <p className="text-zinc-600 text-sm leading-relaxed font-medium bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                                                {f.message}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-zinc-100 border border-zinc-50">
                            <h3 className="text-lg font-black text-zinc-900 mb-6 uppercase tracking-tight">Analytics</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Unread Reports', count: feedback.filter(f => f.status === 'new').length, color: 'text-indigo-600 bg-indigo-50' },
                                    { label: 'Active Tasks', count: feedback.filter(f => f.status === 'read').length, color: 'text-amber-600 bg-amber-50' },
                                    { label: 'Success Rate', count: feedback.length > 0 ? Math.round((feedback.filter(f => f.status === 'resolved').length / feedback.length) * 100) + '%' : '0%', color: 'text-green-600 bg-green-50' },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 rounded-2xl border border-zinc-50">
                                        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{item.label}</span>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-black ${item.color}`}>{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mr-16 -mt-16 rounded-full blur-2xl" />
                            <h3 className="text-xl font-black mb-2 relative z-10">Librarian Tip 💡</h3>
                            <p className="text-indigo-100 text-xs font-bold leading-relaxed relative z-10">
                                Aim to resolve "Report" types within 24 hours to maintain high library trust. Use the status filter to prioritize.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
