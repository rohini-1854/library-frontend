'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getHistory } from '@/services/api';
import { isTamilEncoded } from '@/utils/tamil';

export default function UserHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'user') {
            router.push('/login');
        } else {
            fetchHistory(user._id || user.id);
        }
    }, [router]);

    const fetchHistory = async (userId) => {
        try {
            const data = await getHistory(userId);
            setHistory(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch history', err);
            setLoading(false);
        }
    };

    const handleDummyPay = (item) => {
        if (confirm(`Proceed to pay fine for "${item.book?.title}"?\n\nAmount: ₹${item.fineAmount}`)) {
            alert('Processing payment...');
            setTimeout(() => {
                alert('Fine of ₹' + item.fineAmount + ' paid successfully.');
            }, 1000);
        }
    };

    if (!mounted) return null;

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
                        <button onClick={() => router.push('/user/history')} className="text-white text-[11px] font-bold uppercase tracking-widest px-4 border-b-2 border-white">History</button>
                    </div>
                    <button onClick={() => router.push('/user/dashboard')} className="text-white/80 hover:text-white text-[10px] font-bold uppercase tracking-widest">Back to Dashboard</button>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-8 animate-gov">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-zinc-900 uppercase tracking-tight">Borrowing History</h2>
                    <p className="text-xs font-bold text-[#3F51B5] uppercase tracking-[0.2em]">Your library transactions</p>
                </div>

                <div className="gov-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-200">
                                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Book Information</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Issue Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Return Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fine (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-20 font-bold text-zinc-400 animate-pulse">Loading History...</td></tr>
                                ) : history.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-20 font-bold text-zinc-400 italic">No records found in the database.</td></tr>
                                ) : (
                                    history.map((t) => (
                                        <tr key={t._id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className={`${isTamilEncoded(t.book?.title) ? 'font-tamil text-base' : 'text-[13px] font-bold'} text-zinc-900 leading-tight`}>
                                                    {t.book?.title || 'Unknown Asset'}
                                                </p>
                                                <p className={`${isTamilEncoded(t.book?.author) ? 'font-tamil text-sm' : 'text-[11px] font-medium'} text-zinc-500 mt-1`}>
                                                    {t.book?.author}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-[11px] font-bold text-zinc-600 uppercase tabular-nums">{new Date(t.issueDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-[11px] font-bold text-zinc-600 uppercase tabular-nums">
                                                {t.returnDate ? new Date(t.returnDate).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border text-center ${t.status === 'issued' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-green-50 text-green-600 border-green-200'
                                                        }`}>
                                                        {t.status === 'issued' ? 'Issued' : 'Returned'}
                                                    </span>
                                                    {t.fineAmount > 0 && (
                                                        <span className={`text-[8px] font-bold text-center uppercase ${t.finePaid ? 'text-green-500' : 'text-red-500 animate-pulse'}`}>
                                                            {t.finePaid ? 'Fine Paid' : 'Fine Pending'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {t.fineAmount > 0 ? (
                                                    <div className="flex flex-col gap-2 items-start">
                                                        <p className={`font-bold text-sm tabular-nums ${t.finePaid ? 'text-zinc-900' : 'text-red-600'}`}>₹{t.fineAmount}</p>
                                                        {!t.finePaid && (
                                                            <button
                                                                onClick={() => handleDummyPay(t)}
                                                                className="px-3 py-1 bg-[#1A237E] text-white text-[9px] font-bold uppercase rounded hover:bg-[#D32F2F] transition-all"
                                                            >
                                                                Pay Now
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-zinc-300 text-sm">—</p>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <footer className="py-12 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">
                Directorate of Public Libraries • Government of Tamil Nadu
            </footer>
        </div>
    );
}
