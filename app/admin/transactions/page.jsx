'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBooks, getUsers, getHistory, issueBook, returnBook, payFine } from '@/services/api';

import { isTamilEncoded } from '@/utils/tamil';
import SearchableDropdown from '@/components/SearchableDropdown';

export default function AdminTransactions() {
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [memberSearch, setMemberSearch] = useState('');
    const router = useRouter();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            router.push('/login');
        } else {
            fetchData();
        }
    }, [router]);

    const fetchData = async () => {
        try {
            const [booksData, usersData, historyData] = await Promise.all([
                getBooks(),
                getUsers(),
                getHistory()
            ]);
            setBooks(booksData.filter(b => b.availableCopies > 0));
            // Only show members who are verified and have active membership
            setUsers(usersData.filter(u => u.role === 'user' && u.isVerified && u.isMember));
            // Process history to calculate dynamic fines for overdue books
            const processedHistory = historyData.map(t => {
                if (t.status === 'issued' && !t.returnDate) {
                    const dueDate = new Date(t.dueDate);
                    const today = new Date();
                    if (today > dueDate) {
                        const diffTime = Math.abs(today - dueDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const fineRate = 5; // Default fine rate
                        return { ...t, fineAmount: diffDays * fineRate, isOverdue: true };
                    }
                }
                return t;
            });
            setTransactions(processedHistory);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch data', err);
        }
    };

    const handleIssue = async (e) => {
        e.preventDefault();
        try {
            await issueBook(selectedBook, selectedUser);
            setShowIssueModal(false);
            setSelectedBook('');
            setSelectedUser('');
            setSelectedCategory('all');
            fetchData();
        } catch (err) {
            alert('Error issuing book: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleReturn = async (id) => {
        if (confirm('Mark this book as returned?')) {
            try {
                await returnBook(id);
                fetchData();
            } catch (err) {
                alert('Error returning book');
            }
        }
    };

    const handlePayFine = async (id) => {
        if (confirm('Mark this fine as paid?')) {
            try {
                await payFine(id);
                fetchData();
            } catch (err) {
                alert('Error processing payment');
            }
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
                    <button
                        onClick={() => setShowIssueModal(true)}
                        className="gov-btn gov-btn-primary !text-[10px] !px-6"
                    >
                        Issue New Book
                    </button>
                </div>
            </header>
            <nav className="gov-nav sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center w-full">
                    <div className="flex gap-2 h-full items-center">
                        <button onClick={() => router.push('/admin/dashboard')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Dashboard</button>
                        <button onClick={() => router.push('/admin/books')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Manage Books</button>
                        <button onClick={() => router.push('/admin/members')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Members</button>
                        <button onClick={() => router.push('/admin/transactions')} className="text-white text-[11px] font-bold uppercase tracking-widest px-4 border-b-2 border-white py-4">Borrow & Return</button>
                        <button onClick={() => router.push('/admin/feedback')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Public Feedback</button>
                    </div>
                    <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="bg-[#1A237E] hover:bg-[#D32F2F] text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all border border-white/20">Logout</button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-gov">
                <div className="gov-card !p-0 overflow-hidden">
                    <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                        <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight">Borrow & Return History</h2>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{transactions.length} total records</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest min-w-[200px]">Book Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Member</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Fine</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-20 font-bold text-zinc-400 animate-pulse">Loading transaction history...</td></tr>
                                ) : transactions.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-20 font-bold text-zinc-400 italic">No transactions found.</td></tr>
                                ) : (
                                    transactions.map((t) => (
                                        <tr key={t._id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 max-w-[280px]">
                                                    <span className="px-1.5 py-0.5 bg-zinc-900 text-white text-[7px] font-black rounded-sm uppercase tracking-wider w-fit">{t.book?.bookId || 'LIB'}</span>
                                                    <p className={`${isTamilEncoded(t.book?.title) ? 'font-tamil text-sm' : 'text-[11px] font-semibold'} text-zinc-900 line-clamp-1 truncate uppercase tracking-tight leading-[1.6]`}>{t.book?.title || 'Unknown Book'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-zinc-600 text-[11px] truncate max-w-[120px]">{t.user?.name || 'Unknown User'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase">IN: {new Date(t.issueDate).toLocaleDateString()}</span>
                                                    <span className="text-[9px] font-bold text-indigo-400 uppercase">DUE: {new Date(t.dueDate).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${t.status === 'issued' ? 'bg-amber-50 text-amber-600' :
                                                        t.status === 'lost' ? 'bg-rose-50 text-rose-600' : t.status === 'reserved' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'
                                                        }`}>
                                                        {t.status === 'reserved' ? 'On Hold' : t.status}
                                                    </span>
                                                    {t.fineAmount > 0 && (
                                                        <span className={`text-[8px] font-bold uppercase tracking-tight ${t.finePaid ? 'text-zinc-400' : 'text-rose-500 animate-pulse'}`}>
                                                            {t.finePaid ? 'Paid' : 'Unpaid Fine'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {t.fineAmount > 0 ? (
                                                    <div className="flex flex-col">
                                                        <p className="font-black text-zinc-900 text-xs">₹{t.fineAmount}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-zinc-300 text-xs">—</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1.5">
                                                    {t.status === 'reserved' && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await issueBook(t.book._id, t.user._id);
                                                                    fetchData();
                                                                } catch (err) {
                                                                    alert('Error issuing book');
                                                                }
                                                            }}
                                                            className="px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black rounded-lg hover:bg-indigo-700 transition-all active:scale-95"
                                                        >
                                                            Issue
                                                        </button>
                                                    )}
                                                    {t.status === 'issued' && (
                                                        <button
                                                            onClick={() => handleReturn(t._id)}
                                                            className="px-3 py-1.5 bg-zinc-900 text-white text-[9px] font-black rounded-lg hover:bg-zinc-800 transition-all active:scale-95"
                                                        >
                                                            Return
                                                        </button>
                                                    )}
                                                    {t.fineAmount > 0 && !t.finePaid && (
                                                        <button
                                                            onClick={() => handlePayFine(t._id)}
                                                            className="px-3 py-1.5 bg-green-600 text-white text-[9px] font-black rounded-lg hover:bg-green-700 transition-all active:scale-95"
                                                        >
                                                            Collect
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
            `}</style>

            {showIssueModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl shadow-indigo-200/50 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Issue New Book</h2>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Lending Desk</p>
                            </div>
                            <button onClick={() => setShowIssueModal(false)} className="p-3 bg-white border border-zinc-200 rounded-2xl hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                            {/* Left Side: Asset Selection */}
                            <div className="p-10 space-y-8 border-r border-zinc-100 overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-indigo-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                        Select Book
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Target Category</label>
                                            <select
                                                className={`w-full p-5 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all ${isTamilEncoded(selectedCategory) ? 'font-tamil text-lg' : 'text-sm'}`}
                                                value={selectedCategory}
                                                onChange={(e) => {
                                                    setSelectedCategory(e.target.value);
                                                    setSelectedBook('');
                                                }}
                                            >
                                                <option value="all">ALL CATEGORIES</option>
                                                {[...new Set(books.map(b => b.category))].filter(Boolean).map(cat => (
                                                    <option key={cat} value={cat} className={isTamilEncoded(cat) ? 'font-tamil' : ''}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5 focus-within:scale-[1.01] transition-all">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Select Book</label>
                                            <SearchableDropdown
                                                options={selectedCategory === 'all' ? books : books.filter(b => b.category === selectedCategory)}
                                                value={selectedBook}
                                                onChange={setSelectedBook}
                                                placeholder="Search by Title or Book ID..."
                                                displayKey="title"
                                                valueKey="_id"
                                                subtitleKey="bookId"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Selection Preview */}
                                {selectedBook && (
                                    <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 animate-in zoom-in-95 duration-200">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-16 bg-white border border-indigo-100 rounded-xl flex items-center justify-center text-2xl shadow-sm italic font-black text-indigo-200 shrink-0">B</div>
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Queued for Issuance</p>
                                                <p className={`text-zinc-900 font-bold leading-tight ${isTamilEncoded(books.find(b => b._id === selectedBook)?.title) ? 'font-tamil text-xl' : 'text-sm'}`}>
                                                    {books.find(b => b._id === selectedBook)?.title}
                                                </p>
                                                <p className="text-[10px] text-zinc-400 font-bold mt-1">ID: {books.find(b => b._id === selectedBook)?.bookId}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Member Registry */}
                            <div className="p-10 space-y-6 flex flex-col bg-zinc-50/30 overflow-hidden">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-black text-emerald-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            Member List
                                        </h3>
                                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">Verified Personnel Only</span>
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="Search by Member Name..."
                                            className="w-full pl-12 pr-5 py-4 bg-white border border-zinc-100 rounded-[1.25rem] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all outline-none group-hover:border-emerald-200"
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                        />
                                        <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                    {users.filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase())).map((u) => (
                                        <div
                                            key={u._id}
                                            onClick={() => setSelectedUser(u._id)}
                                            className={`p-4 rounded-[1.25rem] border transition-all cursor-pointer flex items-center justify-between group ${selectedUser === u._id
                                                    ? 'bg-emerald-600 border-emerald-600 shadow-xl shadow-emerald-100 translate-x-1'
                                                    : 'bg-white border-zinc-100 hover:border-emerald-300 hover:shadow-lg shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-sm font-black transition-all ${selectedUser === u._id ? 'bg-white/20 border-white/20 text-white' : 'bg-zinc-50 border-zinc-100 text-zinc-400'
                                                    } overflow-hidden`}>
                                                    {u.photoUrl ? <img src={u.photoUrl} className="w-full h-full object-cover" /> : u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-xs font-black uppercase truncate leading-none mb-1.5 transition-colors ${selectedUser === u._id ? 'text-white' : 'text-zinc-900 underline decoration-zinc-100 decoration-4 underline-offset-2'}`}>{u.name}</p>
                                                    <p className={`text-[9px] font-bold uppercase tracking-tight transition-colors ${selectedUser === u._id ? 'text-emerald-100' : 'text-zinc-400'}`}>ID: LLA-{u._id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedUser === u._id ? 'bg-white border-white' : 'border-zinc-100 group-hover:border-emerald-300'
                                                }`}>
                                                {selectedUser === u._id && (
                                                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-zinc-100 bg-zinc-50/50 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setShowIssueModal(false)}
                                className="flex-1 py-5 font-black text-zinc-400 hover:text-zinc-600 transition-all bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleIssue}
                                disabled={!selectedBook || !selectedUser}
                                className={`flex-[2] py-5 font-black rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 ${selectedBook && selectedUser
                                        ? 'bg-indigo-600 text-white shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98]'
                                        : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                </svg>
                                Confirm & Issue Book
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
}
