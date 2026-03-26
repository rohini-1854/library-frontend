'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/services/api';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            router.push('/login');
        } catch (err) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full gov-card !p-12 animate-gov relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-[#1A237E]"></div>
                
                <Link
                    href="/"
                    className="absolute top-6 left-6 text-zinc-400 hover:text-[#3F51B5] transition-all"
                    title="Return to Home"
                >
                    <svg className="w-5 h-5" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>

                <div className="text-center space-y-6">
                    <div className="mx-auto h-20 w-20 bg-white rounded-full p-2 shadow-sm flex items-center justify-center border border-zinc-100">
                        <Image src="/tn-logo.png" alt="TN Govt" width={64} height={64} className="object-contain" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">
                            Create Account
                        </h2>
                        <p className="text-[10px] font-bold text-[#3F51B5] uppercase tracking-widest">
                            Join the Library
                        </p>
                    </div>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="text-[#D32F2F] text-[10px] text-center font-bold uppercase tracking-widest bg-red-50 py-3 rounded-md border border-red-100">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="name" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                                Full Name (As per Aadhaar)
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 text-sm font-medium text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-md focus:border-[#3F51B5] focus:ring-1 focus:ring-[#3F51B5] outline-none transition-all"
                                placeholder="Enter your full name"
                                id="name"
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="email" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 text-sm font-medium text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-md focus:border-[#3F51B5] focus:ring-1 focus:ring-[#3F51B5] outline-none transition-all"
                                placeholder="Enter your email"
                                id="email"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="password" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                                Create Password
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 text-sm font-medium text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-md focus:border-[#3F51B5] focus:ring-1 focus:ring-[#3F51B5] outline-none transition-all"
                                placeholder="Min. 8 characters"
                                id="password"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <p className="text-[10px] text-zinc-500 text-center uppercase tracking-wider leading-relaxed">
                        By enrolling, you agree to abide by the rules and regulations of the Directorate of Public Libraries.
                    </p>

                    <button
                        type="submit"
                        className="gov-btn gov-btn-primary w-full !py-4 shadow-md"
                    >
                        Register Account
                    </button>

                    <div className="flex flex-col gap-4 text-center mt-8 pt-6 border-t border-zinc-100">
                        <Link href="/login" className="text-xs font-bold text-[#3F51B5] hover:underline uppercase tracking-wide">
                             Already Registered? Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
