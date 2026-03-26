'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/services/api';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, password);
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (data.user.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/user/dashboard');
            }
        } catch (err) {
            setError('Invalid email or password');
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
                            Login
                        </h2>
                        <p className="text-[10px] font-bold text-[#3F51B5] uppercase tracking-widest">
                            District Central Library • Tirunelveli
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
                            <label htmlFor="email" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                                Registered Email
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 text-sm font-medium text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-md focus:border-[#3F51B5] focus:ring-1 focus:ring-[#3F51B5] outline-none transition-all"
                                placeholder="Enter your email"
                                id="email"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="password" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                                Secure Password
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 text-sm font-medium text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-md focus:border-[#3F51B5] focus:ring-1 focus:ring-[#3F51B5] outline-none transition-all"
                                placeholder="Enter your password"
                                id="password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="gov-btn gov-btn-primary w-full !py-4 shadow-md"
                    >
                        Login
                    </button>

                    <div className="flex flex-col gap-4 text-center mt-8 pt-6 border-t border-zinc-100">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">New User?</p>
                        <Link href="/register" className="text-xs font-bold text-[#3F51B5] hover:underline uppercase tracking-wide">
                             Join the Library
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );

}
