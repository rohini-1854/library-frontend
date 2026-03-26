'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProfile, getBooks } from '@/services/api';
import { isTamilEncoded } from '@/utils/tamil';

export default function UserDashboard() {
    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'user') {
            router.push('/login');
        } else {
            fetchFullData(storedUser._id || storedUser.id);
        }
    }, [router]);

    const fetchFullData = async (id) => {
        setLoading(true);
        try {
            const [profile, allBooks] = await Promise.all([
                getProfile(id),
                getBooks()
            ]);
            setUser(profile);
            setBooks(allBooks.slice(0, 6)); // Show latest 6 books
            setLoading(false);
        } catch (err) {
            console.error('Failed to sync profile', err);
            setLoading(false);
        }
    };


    if (!mounted || loading || !user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#3F51B5] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-[#3F51B5] uppercase tracking-widest">Loading Dashboard...</p>
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
                            <Image src="/tn-logo.png" alt="TN Govt Seal" width={56} height={56} className="object-contain" />
                        </div>
                        <div className="text-white">
                            <h1 className="text-lg font-bold leading-none uppercase">District Central Library</h1>
                            <p className="text-[10px] font-medium opacity-90 uppercase tracking-widest mt-1">Government of Tamil Nadu • Tirunelveli</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-bold bg-[#F39C12] px-2 py-0.5 rounded text-zinc-900 border border-[#d68910]">தமிழ்நாடு அரசு</span>
                            </div>
                        </div>
                    </div>

                </div>
            </header>

            {/* Navigation Bar */}
            <nav className="gov-nav sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
                    <div className="flex gap-8 h-full">
                        <button onClick={() => router.push('/user/dashboard')} className="text-white text-[11px] font-bold uppercase tracking-widest px-4 border-b-2 border-white">Dashboard</button>
                        <button onClick={() => router.push('/user/search')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors">Search Books</button>
                        <button onClick={() => router.push('/user/history')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors">History</button>
                        <button onClick={() => router.push('/user/feedback')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors">Feedback</button>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end text-white">
                            <span className="text-[10px] font-bold uppercase tracking-widest">{user.name}</span>
                            <span className="text-[9px] font-medium opacity-70">Member ID: {user._id.substring(user._id.length - 6).toUpperCase()}</span>
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
                {/* Profile Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* User Profile Card */}
                    <div className="lg:col-span-1 gov-card overflow-hidden">
                        <div className="bg-[#1A237E] p-4 text-center border-b-4 border-[#F39C12]">
                            <p className="text-white text-[10px] font-bold uppercase tracking-widest">Library Membership Card</p>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-24 h-24 bg-zinc-100 rounded-lg border-2 border-zinc-200 flex items-center justify-center overflow-hidden shadow-inner">
                                    {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : <span className="text-5xl text-zinc-300">👤</span>}
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-zinc-900 uppercase leading-none">{user.name}</h3>
                                    <p className="text-[10px] font-bold text-[#3F51B5] mt-2 uppercase tracking-widest">
                                        {user.isVerified ? 'Library Member' : 'Checking Details'}
                                    </p>
                                </div>
                            </div>

                            {user.reuploadRequested && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Review Required</p>
                                    <p className="text-[11px] font-medium text-red-800 mt-1">{user.reuploadReason || 'Please check your submitted documents.'}</p>
                                    <button 
                                        onClick={() => router.push('/user/membership')}
                                        className="mt-3 w-full py-2 bg-red-600 text-white text-[10px] font-bold uppercase rounded hover:bg-red-700"
                                    >
                                        Update Details
                                    </button>
                                </div>
                            )}

                            <div className="space-y-4 pt-4 border-t border-zinc-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Status</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${user.isVerified ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                        {user.isVerified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                                {!user.isMember && !user.docsSubmitted && (
                                    <button
                                        onClick={() => router.push('/user/membership')}
                                        className="gov-btn gov-btn-orange w-full shadow-sm"
                                    >
                                        Apply for Membership
                                    </button>
                                )}
                                {user.isVerified && (
                                    <button
                                        onClick={() => router.push('/user/membership')}
                                        className="gov-btn gov-btn-secondary w-full shadow-sm"
                                    >
                                        View ID Card
                                    </button>
                                )}
                            </div>

                            {/* Quick Nav Links */}
                            <div className="pt-4 border-t border-zinc-100 space-y-2">
                                {[
                                    { title: 'Borrowing History', desc: 'Past transactions', icon: '📊', path: '/user/history' },
                                    { title: 'Submit Feedback', desc: 'Share your thoughts', icon: '✉️', path: '/user/feedback' },
                                    { title: 'Account Settings', desc: 'Update your profile', icon: '👤', path: '/user/profile' }
                                ].map((util, i) => (
                                    <div
                                        key={i}
                                        onClick={() => router.push(util.path)}
                                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[#E8EAF6] group transition-all"
                                    >
                                        <span className="text-lg w-8 h-8 flex items-center justify-center bg-zinc-50 rounded-md border border-zinc-100 group-hover:bg-white transition-colors flex-shrink-0">{util.icon}</span>
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-wide">{util.title}</p>
                                            <p className="text-[9px] text-zinc-400 font-medium">{util.desc}</p>
                                        </div>
                                        <span className="ml-auto text-zinc-300 group-hover:text-[#3F51B5] text-xs">→</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Stats */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: 'Books Borrowed', val: user.borrowed?.length || 0, icon: '📖', color: '#3F51B5' },
                            { label: 'Books Reserved', val: user.reserved?.length || 0, icon: '🔖', color: '#1A237E' },
                            { label: 'Pending Fines', val: `₹${user.fineAmount || 0}`, icon: '💰', color: '#800000' }
                        ].map((stat, i) => (
                            <div key={i} className="gov-card !p-8 flex flex-col justify-between border-b-4" style={{ borderBottomColor: stat.color }}>
                                <div className="flex justify-between items-start">
                                    <span className="text-3xl">{stat.icon}</span>
                                    <span className="text-4xl font-bold text-zinc-900 tabular-nums">{stat.val}</span>
                                </div>
                                <div className="mt-6">
                                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.15em]">{stat.label}</p>
                                    <div className="w-12 h-1 mt-2" style={{ backgroundColor: stat.color }}></div>
                                </div>
                            </div>
                        ))}

                        {/* Quick Actions Card */}
                        <div className="md:col-span-3 gov-card !p-10 bg-white relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-4 text-center md:text-left">
                                    <h2 className="text-3xl font-bold text-zinc-900 uppercase tracking-tight">Search Library Catalog</h2>
                                    <p className="text-sm font-medium text-zinc-500 max-w-xl">
                                        Access our extensive collection of books, journals, and digital resources. Search by title, author, or category.
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push('/user/search')}
                                    className="gov-btn gov-btn-primary !px-12 !py-5 shadow-lg whitespace-nowrap"
                                >
                                    Open Catalog
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                <Image src="/tn-logo.png" alt="TN Watermark" width={300} height={300} className="object-contain" />
                            </div>
                        </div>

                        {/* NEW ARRIVALS SECTION */}
                        <div className="md:col-span-3 space-y-8 pt-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-zinc-900 uppercase tracking-tight">New Arrivals • <span className="text-[#3F51B5]">புதிய வரவுகள்</span></h3>
                                <button onClick={() => router.push('/user/search')} className="text-xs font-bold text-[#3F51B5] uppercase hover:underline">View All</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {books.length === 0 ? (
                                    <div className="col-span-3 py-10 bg-white border border-zinc-100 rounded-3xl text-center text-zinc-400 font-medium italic">No books available in the catalog yet.</div>
                                ) : (
                                    books.map((book) => (
                                        <div key={book._id} className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-50 hover:border-[#3F51B5] transition-all group">
                                            <div className="flex gap-4">
                                                <div className="w-16 h-24 bg-zinc-50 rounded-lg flex items-center justify-center text-2xl border border-zinc-100 flex-shrink-0">📖</div>
                                                <div className="space-y-2">
                                                    <h4 className={`${isTamilEncoded(book.title) ? 'font-tamil text-lg' : 'text-sm font-bold'} text-zinc-900 leading-tight line-clamp-2`}>{book.title}</h4>
                                                    <p className={`${isTamilEncoded(book.author) ? 'font-tamil text-xs' : 'text-[10px] font-bold uppercase'} text-zinc-400 tracking-widest`}>{book.author}</p>
                                                    <span className="inline-block px-3 py-1 bg-[#E8EAF6] text-[#3F51B5] text-[9px] font-bold rounded-full uppercase tracking-widest">{book.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>


            </main>

            {/* Footer Information */}
            <footer className="bg-zinc-100 border-t border-zinc-200 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Official Portal of Directorate of Public Libraries</p>
                    <div className="flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <Image src="/tn-logo.png" alt="TN Logo" width={40} height={40} />
                        {/* Add other official logos if available */}
                    </div>
                    <p className="text-[11px] font-medium text-zinc-500">© {new Date().getFullYear()} Government of Tamil Nadu. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
