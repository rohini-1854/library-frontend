'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBooks, getUsers, getHistory } from '@/services/api';
import { isTamilEncoded } from '@/utils/tamil';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [lostBooks, setLostBooks] = useState([]);
    const [stats, setStats] = useState({
        totalBooks: 0,
        activeLoans: 0,
        totalMembers: 0,
        totalFines: 0,
        lostAssets: 0,
        pendingRequests: 0
    });
    const [pendingMembers, setPendingMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'admin') {
            router.push('/login');
        } else {
            setUser(storedUser);
            fetchDashboardData();
        }
    }, [router]);

    const fetchDashboardData = async () => {
        try {
            const [books, users, history] = await Promise.all([
                getBooks(),
                getUsers(),
                getHistory()
            ]);

            const totalFines = history.reduce((sum, t) => sum + (t.finePaid ? 0 : (t.fineAmount || 0)), 0);
            const activeLoans = history.filter(t => t.status === 'issued').length;
            const lostList = history.filter(t => t.status === 'lost');

            setStats({
                totalBooks: books.length,
                activeLoans: activeLoans,
                totalMembers: users.filter(u => u.role === 'user').length,
                totalFines: totalFines,
                lostAssets: lostList.length,
                pendingRequests: users.filter(u => u.role === 'user' && u.docsSubmitted && !u.isVerified).length
            });

            setPendingMembers(users.filter(u => u.role === 'user' && u.docsSubmitted && !u.isVerified).slice(0, 5));

            setLostBooks(lostList.slice(0, 5)); // Show top 5 lost books

            // Format activities from history
            const recentActivities = history.slice(0, 5).map(t => {
                let action = '';
                let icon = '👤';
                let time = getTimeAgo(new Date(t.updatedAt || t.createdAt));

                if (t.status === 'returned') {
                    action = `returned "${t.book?.title}"`;
                    icon = '📥';
                } else if (t.status === 'issued') {
                    action = `borrowed "${t.book?.title}"`;
                    icon = '📤';
                }

                if (t.fineAmount > 0 && t.finePaid) {
                    action = `paid ₹${t.fineAmount} fine for "${t.book?.title}"`;
                    icon = '💰';
                }

                return {
                    id: t._id,
                    userName: t.user?.name || 'Unknown User',
                    actionVerb: t.status === 'returned' ? 'returned' : t.status === 'issued' ? 'borrowed' : 'processed',
                    bookTitle: t.book?.title || 'Unknown Book',
                    icon: icon,
                    time: time
                };
            });

            setActivities(recentActivities);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
            setLoading(false);
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    if (!mounted || loading || !user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#3F51B5] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-[#3F51B5] uppercase tracking-widest">Accessing Admin Services...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f4f7f9] font-sans">
            {/* Government Banner */}
            <header className="gov-banner">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <div className="bg-white rounded-full p-1 shadow-sm flex items-center justify-center">
                            <img src="/tn-logo.png" alt="TN Govt Seal" width={56} height={56} className="object-contain" />
                        </div>
                        <div className="text-zinc-900 border-l-2 border-zinc-200 ml-2 pl-4">
                            <h1 className="text-lg font-bold leading-none uppercase">District Central Library</h1>
                            <p className="text-[10px] font-medium opacity-70 uppercase tracking-widest mt-1">Government of Tamil Nadu • Tirunelveli</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-bold bg-[#F39C12] px-2 py-0.5 rounded text-zinc-900 border border-[#d68910]">நிர்வாகம் • ADMINISTRATION</span>
                            </div>
                        </div>
                    </div>

                </div>
            </header>

            {/* Navigation Bar */}
            <nav className="gov-nav sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
                    <div className="flex gap-8 h-full">
                        <button onClick={() => router.push('/admin/dashboard')} className="text-white text-[11px] font-bold uppercase tracking-widest px-4 border-b-2 border-white py-4">Dashboard</button>
                        <button onClick={() => router.push('/admin/books')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Manage Books</button>
                        <button onClick={() => router.push('/admin/members')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Members</button>
                        <button onClick={() => router.push('/admin/transactions')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Borrow & Return</button>
                        <button onClick={() => router.push('/admin/feedback')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Public Feedback</button>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end text-white">
                            <span className="text-[10px] font-bold uppercase tracking-widest">{user.name}</span>
                            <span className="text-[9px] font-medium opacity-70 italic uppercase">Admin</span>
                        </div>
                        <button
                            onClick={() => { localStorage.clear(); router.push('/login'); }}
                            className="bg-[#1A237E] hover:bg-[#D32F2F] text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all border border-white/20"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-gov">
                {/* Stats Grid - Professional Government Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { label: 'Total Books', value: stats.totalBooks, color: '#3F51B5', icon: '📚', sub: 'Books in Library' },
                        { label: 'Currently Borrowed', value: stats.activeLoans, color: '#1A237E', icon: '🔄', sub: 'Books checked out' },
                        { label: 'Active Members', value: stats.totalMembers, color: '#2E7D32', icon: '👥', sub: 'Local Members' },
                    ].map((stat, i) => (
                        <div key={i} className="gov-card !p-8 flex flex-col justify-between border-b-4" style={{ borderBottomColor: stat.color }}>
                            <div className="flex justify-between items-start">
                                <span className="text-3xl">{stat.icon}</span>
                                <span className="text-4xl font-bold text-zinc-900 tabular-nums">
                                    {loading ? '...' : stat.value}
                                </span>
                            </div>
                            <div className="mt-6">
                                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.15em]">{stat.label}</p>
                                <p className="text-[9px] font-medium text-zinc-400 uppercase mt-1">{stat.sub}</p>
                                <div className="w-12 h-1 mt-2" style={{ backgroundColor: stat.color }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Activity Feed */}
                    <div className="gov-card !p-10 flex flex-col h-full border-t-4 border-t-[#3F51B5]">
                        <div className="flex justify-between items-end mb-10 pb-6 border-b border-zinc-100">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 uppercase tracking-tight">Recent Activity</h3>
                                <p className="text-[10px] font-bold text-[#3F51B5] uppercase tracking-widest mt-1">Check what's happening</p>
                            </div>
                            <button
                                onClick={() => router.push('/admin/transactions')}
                                className="text-[10px] font-bold text-[#3F51B5] hover:underline uppercase tracking-widest"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map(n => <div key={n} className="h-16 bg-zinc-50 rounded-lg animate-pulse" />)}
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="text-center py-20 text-zinc-300 font-bold italic text-sm">No recent activity detected.</div>
                            ) : (
                                activities.map((act) => (
                                    <div key={act.id} className="flex justify-between items-center group cursor-pointer p-4 rounded-xl border border-transparent hover:border-[#3F51B5] hover:bg-zinc-50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center shadow-sm text-xl group-hover:bg-white transition-colors">
                                                {act.icon}
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-900 text-[12px] uppercase leading-none mb-1">{act.userName}</p>
                                                <p className="text-[11px] text-zinc-400 font-medium">
                                                    {act.actionVerb} <span className={isTamilEncoded(act.bookTitle) ? 'font-tamil text-sm' : ''}>“{act.bookTitle}”</span>
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{act.time}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Pending Membership Requests */}
                    <div className="gov-card !p-10 flex flex-col h-full border-t-4 border-t-[#F39C12]">
                        <div className="flex justify-between items-end mb-10 pb-6 border-b border-zinc-100">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 uppercase tracking-tight">Membership Requests</h3>
                                <p className="text-[10px] font-bold text-[#F39C12] uppercase tracking-widest mt-1">Pending review</p>
                            </div>
                            <button
                                onClick={() => router.push('/admin/members')}
                                className="text-[10px] font-bold text-[#F39C12] hover:underline uppercase tracking-widest"
                            >
                                View Registry
                            </button>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2].map(n => <div key={n} className="h-16 bg-zinc-50 rounded-lg animate-pulse" />)}
                                </div>
                            ) : pendingMembers.length === 0 ? (
                                <div className="text-center py-20 text-zinc-300 font-bold italic text-sm uppercase tracking-widest">No pending applications</div>
                            ) : (
                                pendingMembers.map((member) => (
                                    <div key={member._id} onClick={() => router.push('/admin/members')} className="flex justify-between items-center group cursor-pointer p-4 rounded-xl bg-amber-50/30 border border-amber-100 hover:bg-amber-50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden border border-amber-200">
                                                {member.photoUrl ? <img src={member.photoUrl} className="w-full h-full object-cover" /> : <span className="text-xl">👤</span>}
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-900 text-[12px] uppercase leading-none mb-1">{member.name}</p>
                                                <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest">Documents Received</p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold text-white bg-[#F39C12] px-3 py-1 rounded uppercase tracking-widest shadow-sm">Pending</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* System Administration Utilities */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-zinc-900 uppercase tracking-tight">Admin Tools • <span className="text-[#3F51B5]">நிர்வாகம்</span></h3>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-6">
                            {[
                                { title: 'Book Management', desc: 'Add and manage books.', icon: '📦', path: '/admin/books', color: '#3F51B5' },
                                { title: 'Member List', desc: 'Manage local members.', icon: '📇', path: '/admin/members', color: '#1A237E' },
                                { title: 'Borrow & Return', desc: 'Track loans and returns.', icon: '♻️', path: '/admin/transactions', color: '#F39C12' },
                                { title: 'Public Feedback', desc: 'Read member feedback.', icon: '📝', path: '/admin/feedback', color: '#2E7D32' },
                                { title: 'Library Settings', desc: 'Change app settings.', icon: '⚙️', path: '/admin/settings', color: '#455A64' },
                            ].map((util, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => router.push(util.path)}
                                    className="gov-card p-6 group cursor-pointer hover:border-[#3F51B5] transition-all w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)] min-w-[300px]"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl bg-zinc-50 w-12 h-12 flex items-center justify-center rounded-lg border border-zinc-100 group-hover:bg-[#E8EAF6] group-hover:text-[#1A237E] transition-colors">{util.icon}</span>
                                        <div>
                                            <h4 className="text-xs font-bold text-zinc-900 uppercase">{util.title}</h4>
                                            <p className="text-[10px] font-medium text-zinc-400 mt-1">{util.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* System Status Banner */}
                        <div className="bg-zinc-900 p-6 rounded-2xl flex items-center justify-between shadow-xl">
                            <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-green-400 animate-pulse">⚡</div>
                                 <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Portal Infrastructure</p>
                                    <p className="text-xs font-bold text-white uppercase tracking-tight">All Systems Operational • Security Level: High</p>
                                 </div>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 font-mono">NODE_ADMIN_v1.5.0-STABLE</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Information */}
            <footer className="bg-zinc-100 border-t border-zinc-200 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Official Portal of Directorate of Public Libraries</p>
                    <div className="flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <img src="/tn-logo.png" alt="TN Logo" width={40} height={40} />
                    </div>
                    <p className="text-[11px] font-medium text-zinc-500">© {new Date().getFullYear()} Government of Tamil Nadu. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
