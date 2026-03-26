'use client';
import { useState } from 'react';

export default function TamilKeyboard({ onCharClick, onClose }) {
    const vowels = ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'ஃ'];
    const consonants = ['க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன', 'ஜ', 'ஷ', 'ஸ', 'ஹ', 'க்ஷ', 'ஶ'];
    const modifiers = ['ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ', '்'];

    return (
        <div className="absolute top-full left-0 mt-4 w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-indigo-200/50 border border-zinc-100 p-6 z-50 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Tamil Virtual Input</h3>
                <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-rose-500 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-6">
                {/* Vowels */}
                <div className="space-y-2">
                    <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Uyir Ezhuthukkal (Vowels)</p>
                    <div className="flex flex-wrap gap-2">
                        {vowels.map(char => (
                            <button
                                key={char}
                                onClick={() => onCharClick(char)}
                                className="w-10 h-10 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl text-lg font-bold text-indigo-900 transition-all active:scale-95 shadow-sm font-tamil"
                            >
                                {char}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Consonants */}
                <div className="space-y-2">
                    <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Mei Ezhuthukkal (Consonants)</p>
                    <div className="flex flex-wrap gap-2">
                        {consonants.map(char => (
                            <button
                                key={char}
                                onClick={() => onCharClick(char)}
                                className="w-10 h-10 bg-zinc-50 hover:bg-zinc-800 hover:text-white rounded-xl text-lg font-bold text-zinc-700 transition-all active:scale-95 shadow-sm font-tamil"
                            >
                                {char}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Modifiers */}
                <div className="space-y-2">
                    <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Uyir Mei Kuri (Modifiers)</p>
                    <div className="flex flex-wrap gap-2">
                        {modifiers.map(char => (
                            <button
                                key={char}
                                onClick={() => onCharClick(char)}
                                className="w-10 h-10 bg-amber-50 hover:bg-amber-500 hover:text-white rounded-xl text-lg font-bold text-amber-700 transition-all active:scale-95 shadow-sm font-tamil relative group"
                            >
                                <span className="absolute opacity-20 group-hover:opacity-100 text-[8px] top-1 right-1">க</span>
                                {char}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-between items-center">
                <p className="text-[9px] font-bold text-zinc-400">Click consonants then modifiers (e.g., க + ி = கி)</p>
                <button onClick={() => onCharClick(' ')} className="px-8 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-xs font-black uppercase tracking-wider text-zinc-600">Space</button>
            </div>
        </div>
    );
}
