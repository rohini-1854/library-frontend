'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { getBooks, getProfile, reserveBook } from '@/services/api';
import { isTamilEncoded } from '@/utils/tamil';

export default function CategoryPage() {
    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const categoryName = decodeURIComponent(params.category);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'user') {
            router.push('/login');
        } else {
            fetchData(storedUser.id);
        }
    }, [router]);

    const fetchData = async (userId) => {
        setLoading(true);
        try {
            const [profile, booksData] = await Promise.all([
                getProfile(userId),
                getBooks()
            ]);
            setUser(profile);
            setBooks(booksData);
            setLoading(false);
        } catch (err) {
            console.error('Failed to sync category data', err);
            setLoading(false);
        }
    };

    const handleHold = async (bookId) => {
        if (!user.isMember || !user.isVerified) {
            alert('Membership Verification Required to hold books.');
            return;
        }
        if (confirm('Initiate 24-Hour Hold Protocol?')) {
            try {
                await reserveBook(bookId, user._id || user.id);
                fetchData(user._id || user.id);
                alert('RESERVATION SECURED.');
            } catch (err) {
                alert('HOLD REJECTED: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const filteredBooks = books.filter(book => {
        if (categoryName === 'All') return true;
        return (book.category || 'General') === categoryName;
    });

    if (!user) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse uppercase tracking-[0.4em] text-xs">Accessing Category Archives...</div>;

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Official Header */}
            <div className="bg-indigo-900 text-white h-10 px-8 text-[9px] font-black uppercase tracking-[0.25em] fixed top-0 w-full z-[60] flex justify-between items-center shadow-lg">
                <span>District Central Library • LOCAL LIBRARY AUTHORITY</span>
                <span className="hidden sm:block text-indigo-400">Government of Tamil Nadu • Tirunelveli</span>
            </div>

            <nav className="bg-white/95 backdrop-blur-md border-b border-zinc-100 px-8 py-4 flex justify-between items-center fixed top-10 w-full z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/user/dashboard')} className="p-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-400 rounded-xl transition-all border border-zinc-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div className="flex flex-col">
                        <span className={`text-lg font-black text-zinc-900 tracking-tight leading-none ${isTamilEncoded(categoryName) ? 'font-tamil' : 'uppercase'}`}>
                            {categoryName}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Category Archives</span>
                    </div>
                </div>
            </nav>

            <main className="pt-32 p-6 max-w-7xl mx-auto space-y-12">
                <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-100/30">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className={`text-4xl font-black text-zinc-900 tracking-tighter ${isTamilEncoded(categoryName) ? 'font-tamil' : 'uppercase'}`}>
                                {categoryName}
                            </h2>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {filteredBooks.length} Assets Identified
                            </p>
                        </div>
                        <div className="w-20 h-1.5 bg-indigo-600 rounded-full" />
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                    {loading ? (
                        <div className="col-span-full py-24 text-center text-zinc-300 font-black uppercase tracking-widest">Scanning category database...</div>
                    ) : filteredBooks.length === 0 ? (
                        <div className="col-span-full py-24 text-center space-y-4">
                            <span className="text-6xl opacity-20">📖</span>
                            <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">No books in this category.</p>
                        </div>
                    ) : (
                        filteredBooks.map((book) => (
                            <div key={book._id} className="group bg-white p-6 rounded-[2.5rem] border border-zinc-100 hover:shadow-2xl transition-all relative overflow-hidden">
                                <div className="flex gap-6">
                                    <div className="w-20 h-28 bg-zinc-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-zinc-900 group-hover:text-white transition-all transform group-hover:rotate-2 shadow-inner border border-zinc-100 shrink-0">📖</div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div className="space-y-1">
                                            <p className={`${isTamilEncoded(book.title) ? 'font-tamil text-xl' : 'text-[13px] font-black'} text-zinc-900 leading-tight line-clamp-2`}>{book.title}</p>
                                            <p className={`${isTamilEncoded(book.author) ? 'font-tamil text-sm' : 'text-[10px] font-bold'} text-zinc-400 uppercase tracking-widest line-clamp-1`}>{book.author}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${book.availableCopies > 0 ? 'text-green-500' : 'text-rose-500'}`}>
                                                {book.availableCopies > 0 ? `${book.availableCopies} In Stock` : 'Out of Stock'}
                                            </span>
                                            {book.availableCopies > 0 && (
                                                <button onClick={() => handleHold(book._id)} className="px-5 py-2.5 bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95">Hold</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
            <style jsx global>{` .no-scrollbar::-webkit-scrollbar { display: none; } `}</style>
        </div>
    );
}
