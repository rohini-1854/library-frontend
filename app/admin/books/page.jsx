'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBooks, createBook, updateBook, deleteBook } from '@/services/api';
import { isTamilEncoded } from '@/utils/tamil';
import TamilKeyboard from '@/components/TamilKeyboard';

export default function AdminBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [formData, setFormData] = useState({
        bookId: '',
        title: '',
        author: '',
        isbn: '',
        category: '',
        totalCopies: 1,
        availableCopies: 1,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const router = useRouter();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            router.push('/login');
        } else {
            fetchBooks();
        }
    }, [router]);

    const fetchBooks = async () => {
        try {
            const data = await getBooks();
            setBooks(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch books', err);
        }
    };

    const filteredBooks = books.filter(book => {
        const q = searchQuery.toLowerCase();
        const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
        const matchesSearch = !q ||
            book.title?.toLowerCase().includes(q) ||
            book.author?.toLowerCase().includes(q) ||
            book.bookId?.toLowerCase().includes(q) ||
            book.category?.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBook) {
                await updateBook(editingBook._id, formData);
            } else {
                await createBook(formData);
            }
            setShowModal(false);
            setEditingBook(null);
            setFormData({ bookId: '', title: '', author: '', isbn: '', category: '', totalCopies: 1, availableCopies: 1 });
            fetchBooks();
        } catch (err) {
            alert('Error saving book: ' + err.message);
        }
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setFormData(book);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this book?')) {
            try {
                await deleteBook(id);
                fetchBooks();
            } catch (err) {
                alert('Error deleting book');
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
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:flex items-center gap-3">
                            <select
                                className={`pl-4 pr-10 py-2 bg-white/20 border border-white/30 rounded text-[10px] font-bold uppercase tracking-widest text-white focus:outline-none ${isTamilEncoded(selectedCategory) ? 'font-tamil text-lg' : ''}`}
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all" className="text-zinc-900 bg-white">ALL CATEGORIES</option>
                                {[...new Set(books.map(b => b.category))].filter(Boolean).sort().map(cat => (
                                    <option key={cat} value={cat} className={`text-zinc-900 bg-white ${isTamilEncoded(cat) ? 'font-tamil' : ''}`}>{cat}</option>
                                ))}
                            </select>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search books..."
                                    className="pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded text-sm font-bold w-48 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/30"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        <button
                            onClick={() => { setEditingBook(null); setShowModal(true); }}
                            className="gov-btn gov-btn-primary !text-[10px] !px-6"
                        >
                            + Add Book
                        </button>
                    </div>
                </div>
            </header>
            <nav className="gov-nav sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center w-full">
                    <div className="flex gap-2 h-full items-center">
                        <button onClick={() => router.push('/admin/dashboard')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Dashboard</button>
                        <button onClick={() => router.push('/admin/books')} className="text-white text-[11px] font-bold uppercase tracking-widest px-4 border-b-2 border-white py-4">Manage Books</button>
                        <button onClick={() => router.push('/admin/members')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Members</button>
                        <button onClick={() => router.push('/admin/transactions')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Borrow & Return</button>
                        <button onClick={() => router.push('/admin/feedback')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Public Feedback</button>
                    </div>
                    <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="bg-[#1A237E] hover:bg-[#D32F2F] text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all border border-white/20">Logout</button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8 animate-gov">
                <div className="gov-card !p-0 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1A237E] text-white">
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em]">Book Details</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em]">Category</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em]">Stock</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-20 font-bold text-zinc-400 animate-pulse uppercase tracking-widest text-xs">Loading Books...</td></tr>
                            ) : filteredBooks.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-20 font-bold text-zinc-400 italic">No matches found in catalog.</td></tr>
                            ) : (
                                filteredBooks.map((book) => (
                                    <tr key={book._id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-zinc-900 text-white text-[9px] font-black rounded-md uppercase tracking-wider">{book.bookId || 'NO-ID'}</span>
                                                    <p className={`${isTamilEncoded(book.title) ? 'font-tamil text-lg' : 'text-sm font-semibold'} text-zinc-900 leading-[1.6]`}>{book.title}</p>
                                                </div>
                                                <p className={`${isTamilEncoded(book.author) ? 'font-tamil text-[13px]' : 'text-xs font-medium uppercase tracking-widest'} text-zinc-500`}>{book.author}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`${isTamilEncoded(book.category) ? 'font-tamil' : 'uppercase'} px-4 py-1.5 bg-zinc-50 text-zinc-600 rounded-xl text-[10px] font-black tracking-widest border border-zinc-100`}>
                                                {book.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${book.availableCopies > 0 ? 'bg-green-500' : 'bg-rose-500'}`} />
                                                    <span className="font-black text-zinc-900 text-sm">{book.availableCopies} <span className="text-zinc-300">/</span> {book.totalCopies}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">In Stock</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-4">
                                                <button onClick={() => handleEdit(book)} className="text-zinc-400 hover:text-indigo-600 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleDelete(book._id)} className="text-zinc-400 hover:text-rose-500 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-200/50 relative">
                        <h2 className="text-3xl font-black text-zinc-900 mb-8 items-center flex gap-4">
                            {editingBook ? 'Edit Book' : 'Add New Book'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1 text-[9px]">Book ID</label>
                                    <input
                                        required
                                        placeholder="e.g. TNV123948"
                                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-bold"
                                        value={formData.bookId}
                                        onChange={e => setFormData({ ...formData, bookId: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Title</label>
                                    <div className="relative">
                                        <input
                                            required
                                            className={`w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold pr-12 ${isTamilEncoded(formData.title) ? 'font-tamil text-xl' : ''}`}
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            onFocus={() => { setFocusedField('title'); setShowKeyboard(true); }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setFocusedField('title'); setShowKeyboard(!showKeyboard); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xl grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100"
                                            title="Toggle Tamil Keyboard"
                                        >
                                            ⌨️
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Author</label>
                                    <div className="relative">
                                        <input
                                            required
                                            className={`w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold pr-12 ${isTamilEncoded(formData.author) ? 'font-tamil text-lg' : ''}`}
                                            value={formData.author}
                                            onChange={e => setFormData({ ...formData, author: e.target.value })}
                                            onFocus={() => { setFocusedField('author'); setShowKeyboard(true); }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setFocusedField('author'); setShowKeyboard(!showKeyboard); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xl grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100"
                                            title="Toggle Tamil Keyboard"
                                        >
                                            ⌨️
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">ISBN</label>
                                    <input
                                        required
                                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        value={formData.isbn}
                                        onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Total Copies</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        value={formData.totalCopies}
                                        onChange={e => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 0, availableCopies: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Category</label>
                                    <div className="relative space-y-2">
                                        <select
                                            className={`w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold ${isTamilEncoded(formData.category) ? 'font-tamil text-lg' : ''}`}
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="">Select Existing Category</option>
                                            {['Tamil Literature', 'Fiction', 'Biography', 'Science', 'History', 'General', ...new Set(books.map(b => b.category))].filter(Boolean).sort().map((cat, idx, self) => self.indexOf(cat) === idx && (
                                                <option key={cat} value={cat} className={isTamilEncoded(cat) ? 'font-tamil text-lg' : ''}>
                                                    {cat}
                                                </option>
                                            ))}
                                            <option value="NEW">Add New Category+</option>
                                        </select>

                                        {(formData.category === 'NEW' || !books.some(b => b.category === formData.category)) && (
                                            <div className="relative animate-in slide-in-from-top-2 duration-200">
                                                <input
                                                    className="w-full px-5 py-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-black text-indigo-900 pr-12"
                                                    value={formData.category === 'NEW' ? '' : formData.category}
                                                    placeholder="Enter New Category Name..."
                                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                    onFocus={() => { setFocusedField('category'); setShowKeyboard(true); }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => { setFocusedField('category'); setShowKeyboard(!showKeyboard); }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xl grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100"
                                                >
                                                    ⌨️
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-black text-zinc-400 hover:text-zinc-600 transition-colors bg-zinc-50 rounded-2xl">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all">Save Changes</button>
                            </div>
                        </form>

                        {showKeyboard && focusedField && (
                            <div className="absolute top-0 left-full ml-6 w-[400px] animate-in slide-in-from-bottom-4 duration-300">
                                <TamilKeyboard
                                    onCharClick={(char) => setFormData(prev => ({
                                        ...prev,
                                        [focusedField]: prev[focusedField] + char
                                    }))}
                                    onClose={() => setShowKeyboard(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
