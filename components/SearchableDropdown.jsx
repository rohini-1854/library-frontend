import { useState, useRef, useEffect } from 'react';
import { isTamilEncoded } from '@/utils/tamil';

export default function SearchableDropdown({
    options,
    value,
    onChange,
    placeholder = "Select...",
    displayKey = "title",
    valueKey = "_id",
    subtitleKey = null
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get selected item display
    const safeOptions = options || [];
    const selectedItem = safeOptions.find(opt => opt[valueKey] === value);

    // Filter options
    const filteredOptions = safeOptions.filter(opt => {
        const text = String(opt[displayKey] || '').toLowerCase();
        const sub = subtitleKey ? String(opt[subtitleKey] || '').toLowerCase() : '';
        const searchTerm = search.toLowerCase();
        return text.includes(searchTerm) || sub.includes(searchTerm);
    });

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Button */}
            <div
                onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl cursor-pointer flex justify-between items-center hover:bg-zinc-100 transition-colors"
            >
                {selectedItem ? (
                    <span className={`font-bold text-zinc-900 ${isTamilEncoded(selectedItem[displayKey]) ? 'font-tamil text-lg' : ''}`}>
                        {selectedItem[displayKey]}
                        {subtitleKey && <span className="text-zinc-400 text-sm font-normal ml-2">({selectedItem[subtitleKey]})</span>}
                    </span>
                ) : (
                    <span className="text-zinc-400 font-bold">{placeholder}</span>
                )}
                <svg className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-indigo-100 border border-zinc-100 z-50 overflow-hidden max-h-[300px] flex flex-col">
                    {/* Search Input */}
                    <div className="p-3 border-b border-zinc-50 sticky top-0 bg-white">
                        <input
                            autoFocus
                            placeholder="Type to search..."
                            className="w-full px-4 py-2 bg-zinc-50 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Options List */}
                    <div className="overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-sm text-zinc-400 font-bold">No matches found</div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt[valueKey]}
                                    onClick={() => { onChange(opt[valueKey]); setIsOpen(false); }}
                                    className={`px-5 py-3 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-zinc-50 last:border-0 ${value === opt[valueKey] ? 'bg-indigo-50/50' : ''}`}
                                >
                                    <p className={`font-bold text-zinc-900 ${isTamilEncoded(opt[displayKey]) ? 'font-tamil text-lg' : ''}`}>
                                        {opt[displayKey]}
                                    </p>
                                    {subtitleKey && (
                                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                                            {opt[subtitleKey]}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
