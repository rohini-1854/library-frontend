'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchGoogleBooks, getProfile } from '@/services/api';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

export default function BookSearch() {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Basic authorization check
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/login');
            return;
        }
        // Page access allowed for all logged in users, but features restricted
        setAuthorized(true);
    }, [router]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        const data = await searchGoogleBooks(query);
        setBooks(data.items || []);
        setLoading(false);
    };

    const handleRead = (book) => {
        const userStr = localStorage.getItem('user');
        const user = JSON.parse(userStr || '{}');

        if (!user.isMember) {
            alert("Premium Feature: Online reading is exclusively for Library Members. Please upgrade your membership.");
            router.push('/user/membership');
            return;
        }

        setSelectedBook(book);
    };

    if (!authorized) return null;

    return (
        <div className="min-h-screen bg-zinc-50 font-sans">
            <Script src="https://www.google.com/books/jsapi.js" onLoad={() => {
                if (window.google) {
                    window.google.books.load();
                }
            }} />

            {/* Header */}
            <div className="bg-white border-b border-zinc-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/user/dashboard" className="text-zinc-500 hover:text-zinc-900 font-bold text-sm flex items-center gap-2">
                        ← Dashboard
                    </Link>
                    <h1 className="text-xl font-black text-zinc-900 uppercase tracking-widest">Digital Library</h1>
                    <div className="w-20" /> {/* Spacer */}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16 relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for books, authors, or ISBNs..."
                        className="w-full px-8 py-5 rounded-2xl bg-white border border-zinc-200 shadow-xl shadow-zinc-100/50 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>

                {/* Results Grid */}
                {books.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                        {books.map((book) => {
                            const info = book.volumeInfo;
                            const thumbnail = info.imageLinks?.thumbnail?.replace('http:', 'https:');

                            return (
                                <div key={book.id} className="group bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="relative aspect-[2/3] mb-4 rounded-xl overflow-hidden bg-zinc-100">
                                        {thumbnail ? (
                                            <Image
                                                src={thumbnail}
                                                alt={info.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-zinc-300">No Cover</div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-zinc-900 text-sm mb-1 line-clamp-2 leading-tight">{info.title}</h3>
                                    <p className="text-xs text-zinc-500 mb-4 line-clamp-1">{info.authors?.join(', ')}</p>

                                    <button
                                        onClick={() => handleRead(book)}
                                        className="w-full py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-lg uppercase tracking-wider hover:bg-zinc-800 transition-colors"
                                    >
                                        Read Book
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!loading && books.length === 0 && query && (
                    <div className="text-center py-20">
                        <p className="text-zinc-400 font-medium">No books found. Try a different search.</p>
                    </div>
                )}
            </main>

            {/* Reader Modal */}
            {selectedBook && (
                <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-xl flex flex-col">
                    <div className="flex items-center justify-between px-6 h-16 border-b border-zinc-200/50 bg-white/50">
                        <h2 className="font-bold text-zinc-900 line-clamp-1">{selectedBook.volumeInfo.title}</h2>
                        <button
                            onClick={() => setSelectedBook(null)}
                            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                        >
                            ✕ Close
                        </button>
                    </div>
                    <div className="flex-1 w-full bg-white relative">
                        <EmbeddedViewer isbn={selectedBook.volumeInfo.industryIdentifiers?.[0]?.identifier} id={selectedBook.id} />
                    </div>
                </div>
            )}
        </div>
    );
}

function EmbeddedViewer({ isbn, id }) {
    useEffect(() => {
        if (!window.google) return;

        // Initialize the viewer
        window.google.books.load();
        window.google.books.setOnLoadCallback(() => {
            const viewer = new window.google.books.DefaultViewer(document.getElementById('viewerCanvas'));
            if (id) {
                viewer.load(id);
            } else if (isbn) {
                viewer.load('ISBN:' + isbn);
            } else {
                alert('No readable content available for this book.');
            }
        });
    }, [isbn, id]);

    return <div id="viewerCanvas" className="w-full h-full" />;
}
