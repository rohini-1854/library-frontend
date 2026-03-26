'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getBooks, getProfile, reserveBook } from '@/services/api';
import { isTamilEncoded, baminiToUnicode } from '@/utils/tamil';
import TamilKeyboard from '@/components/TamilKeyboard';

export default function SearchPortal() {
    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [activeQuery, setActiveQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
            console.error('Failed to sync search data', err);
            setLoading(false);
        }
    };

    const handleSearchTrigger = () => setActiveQuery(searchInput);
    const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearchTrigger(); };

    const handleHold = async (bookId) => {
        if (!user.isMember || !user.isVerified) {
            alert('Membership Verification Required to hold books.');
            return;
        }
        if (confirm('Do you want to reserve this book for 24 hours?')) {
            try {
                await reserveBook(bookId, user._id || user.id);
                fetchData(user._id || user.id);
                alert('Book reserved successfully.');
            } catch (err) {
                alert('Could not reserve book: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const categories = ['All', ...new Set(books.map(b => b.category || 'General'))];

    const filteredBooks = books.filter(book => {
        const q = activeQuery.toLowerCase();
        const matchesQuery = !q.trim() ||
            book.title.toLowerCase().includes(q) ||
            book.author.toLowerCase().includes(q) ||
            book.bookId?.toLowerCase().includes(q) ||
            book.isbn?.toLowerCase().includes(q);
        const matchesCategory = selectedCategory === 'All' || (book.category || 'General') === selectedCategory;
        return matchesQuery && matchesCategory;
    });

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center font-black text-[#3F51B5] animate-pulse uppercase tracking-[0.4em] text-xs">
            Searching Library...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f4f7f9] font-sans">
            {/* Government Banner */}
            <header className="gov-banner">
                <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white rounded-full p-1 shadow-sm flex items-center justify-center">
                            <Image src="/tn-logo.png" alt="TN Govt Seal" width={56} height={56} className="object-contain" />
                        </div>
                        <div className="text-white border-l-2 border-white/20 ml-2 pl-4">
                            <h1 className="text-base font-bold leading-none uppercase">District Central Library</h1>
                            <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest mt-1">Government of Tamil Nadu • Tirunelveli</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-bold bg-[#F39C12] px-2 py-0.5 rounded text-zinc-900 border border-[#d68910]">தமிழ்நாடு அரசு</span>
                            </div>
                        </div>
                    </div>
                    {user && (
                        <div className="hidden lg:flex items-center gap-4 text-white">
                            <div className="text-right">
                                <span className="text-[10px] font-bold uppercase tracking-widest block">{user.name}</span>
                                <span className="text-[9px] font-medium opacity-70 uppercase">Member</span>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Navigation Bar */}
            <nav className="gov-nav sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
                    <div className="flex gap-6 h-full items-center">
                        <button onClick={() => router.push('/user/dashboard')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">← Dashboard</button>
                        <button onClick={() => router.push('/user/search')} className="text-white text-[11px] font-bold uppercase tracking-widest px-4 border-b-2 border-white py-4">Search Books</button>
                        <button onClick={() => router.push('/user/history')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">History</button>
                        <button onClick={() => router.push('/user/feedback')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Feedback</button>
                    </div>
                    <button
                        onClick={() => { localStorage.clear(); router.push('/login'); }}
                        className="bg-[#1A237E] hover:bg-[#D32F2F] text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all border border-white/20"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-gov">
                {/* Search Panel */}
                <div className="gov-card !p-8 border-t-4 border-t-[#3F51B5]">
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight uppercase">Search Library</h2>
                                <p className="text-[10px] font-bold text-[#3F51B5] uppercase tracking-widest">Across all categories and districts</p>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-80">
                                    <input
                                        type="text"
                                        placeholder="Type in Tamil or English..."
                                        className="w-full pl-5 pr-12 py-3 bg-zinc-50 rounded text-zinc-900 border border-zinc-200 focus:outline-none focus:border-[#3F51B5] transition-all font-medium text-sm placeholder:text-zinc-400"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                    <button onClick={() => setShowKeyboard(!showKeyboard)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#3F51B5] p-1">⌨️</button>
                                </div>
                                <button onClick={handleSearchTrigger} className="gov-btn gov-btn-primary !text-[10px] !px-8">Search</button>
                            </div>
                        </div>

                        {showKeyboard && (
                            <div className="relative z-10">
                                <TamilKeyboard onCharClick={(char) => setSearchInput(prev => prev + char)} onClose={() => setShowKeyboard(false)} />
                            </div>
                        )}

                        {/* Category Pills */}
                        <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar border-t border-zinc-100 pt-4">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2 rounded text-[10px] font-bold tracking-widest transition-all border whitespace-nowrap
                                        ${selectedCategory === cat
                                            ? 'bg-[#1A237E] text-white border-[#1A237E] shadow-md'
                                            : 'bg-white text-zinc-500 border-zinc-200 hover:border-[#3F51B5] hover:text-[#3F51B5]'
                                        } ${isTamilEncoded(cat) ? 'font-tamil text-lg' : 'uppercase'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results count */}
                {!loading && (
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        {filteredBooks.length} {filteredBooks.length === 1 ? 'Book' : 'Books'} Found
                    </p>
                )}

                {/* Book Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                    {loading ? (
                        <div className="col-span-full py-24 text-center text-zinc-300 font-bold uppercase tracking-widest text-xs animate-pulse">
                            Finding Books...
                        </div>
                    ) : filteredBooks.length === 0 ? (
                        <div className="col-span-full py-24 text-center space-y-4">
                            <span className="text-6xl opacity-20">🔎</span>
                            <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">No matching books found.</p>
                        </div>
                    ) : (
                        filteredBooks.map((book) => (
                            <div key={book._id} className="gov-card group hover:border-[#3F51B5] transition-all !p-6 cursor-default">
                                <div className="flex gap-5">
                                    <div className="w-16 h-24 bg-[#E8EAF6] rounded flex items-center justify-center text-2xl group-hover:bg-[#3F51B5] group-hover:text-white transition-all shrink-0 border border-[#C5CAE9]">📖</div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div className="space-y-1">
                                            <p className={`${isTamilEncoded(book.title) ? 'font-tamil text-xl' : 'text-sm font-bold'} text-zinc-900 leading-tight line-clamp-2`}>
                                                {isTamilEncoded(book.title) ? baminiToUnicode(book.title) : book.title}
                                            </p>
                                            <p className={`${isTamilEncoded(book.author) ? 'font-tamil text-sm' : 'text-[10px] font-bold'} text-zinc-400 uppercase tracking-widest line-clamp-1`}>
                                                {isTamilEncoded(book.author) ? baminiToUnicode(book.author) : book.author}
                                            </p>
                                            <span className="inline-block px-2 py-0.5 bg-[#E8EAF6] text-[#3F51B5] text-[9px] font-bold rounded uppercase tracking-widest">
                                                {book.category || 'General'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className={`text-[9px] font-bold uppercase tracking-wide ${book.availableCopies > 0 ? 'text-green-600' : 'text-rose-500'}`}>
                                                {book.availableCopies > 0 ? `${book.availableCopies} In Stock` : 'Out of Stock'}
                                            </span>
                                            {book.availableCopies > 0 && (
                                                <button onClick={() => handleHold(book._id)} className="gov-btn gov-btn-primary !text-[9px] !px-4 !py-2">Hold</button>
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
