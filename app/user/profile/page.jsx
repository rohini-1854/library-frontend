'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProfile } from '@/services/api';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'user') {
            router.push('/login');
        } else {
            fetchProfile(storedUser._id || storedUser.id);
        }
    }, [router]);

    const fetchProfile = async (id) => {
        try {
            const data = await getProfile(id);
            setUser(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch profile', err);
        }
    };

    if (!mounted || loading || !user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#3F51B5] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-[#3F51B5] uppercase tracking-widest">Loading Profile...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f4f7f9] font-sans">
            <header className="gov-banner">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <div className="bg-white rounded-full p-1 shadow-sm flex items-center justify-center">
                            <Image src="/tn-logo.png" alt="TN Govt Seal" width={56} height={56} className="object-contain" />
                        </div>
                        <div className="text-white">
                            <h1 className="text-lg font-bold leading-none uppercase">District Central Library</h1>
                            <p className="text-[10px] font-medium opacity-90 uppercase tracking-widest mt-1">Government of Tamil Nadu • Tirunelveli</p>
                        </div>
                    </div>
                </div>
            </header>

            <nav className="gov-nav sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
                    <div className="flex gap-8 h-full">
                        <button onClick={() => router.push('/user/dashboard')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors">Dashboard</button>
                        <button onClick={() => router.push('/user/profile')} className="text-white text-[11px] font-bold uppercase tracking-widest px-4 border-b-2 border-white">Profile</button>
                    </div>
                    <button onClick={() => router.push('/user/dashboard')} className="text-white/80 hover:text-white text-[10px] font-bold uppercase tracking-widest">Back to Dashboard</button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12 space-y-12 animate-gov">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-zinc-900 uppercase tracking-tight">Citizen Profile Record</h2>
                    <p className="text-xs font-bold text-[#3F51B5] uppercase tracking-[0.2em]">Official Digital Identity • Local Library Authority</p>
                </div>

                <div className="gov-card p-12 space-y-12">
                    <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
                        <div className="w-32 h-32 bg-zinc-100 rounded-2xl border-2 border-zinc-200 flex items-center justify-center overflow-hidden shadow-inner">
                             {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : <span className="text-6xl text-zinc-300">👤</span>}
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Full Name (As per Records)</p>
                                <p className="text-xl font-bold text-zinc-900 uppercase">{user.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Member ID Number</p>
                                <p className="text-xl font-bold text-zinc-900 tabular-nums">LLA-{user._id?.substring(user._id.length - 6).toUpperCase()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Registered Email Address</p>
                                <p className="text-sm font-medium text-zinc-600">{user.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Enrollment Status</p>
                                <div className="pt-1">
                                    <span className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border ${user.isMember ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                        {user.isMember ? 'Verified Member' : 'Enrollment Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-zinc-50 rounded-xl border border-zinc-100">
                        <div className="space-y-1">
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Identity Proof</p>
                            <p className="text-[10px] font-bold text-zinc-900 uppercase">{user.isVerified ? 'Verified' : 'Pending'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Security Deposit</p>
                            <p className="text-[10px] font-bold text-zinc-900 tabular-nums">₹{user.depositAmount || 0}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Borrow Capacity</p>
                            <p className="text-[10px] font-bold text-zinc-900 uppercase">{user.bookCapacity || 1} Books</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Library Unit</p>
                            <p className="text-[10px] font-bold text-zinc-900 uppercase">Unit-I (Central)</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-center gap-6">
                    <button onClick={() => router.push('/user/dashboard')} className="gov-btn gov-btn-secondary !px-12 shadow-sm">Dashboard</button>
                    {!user.isMember && (
                        <button onClick={() => router.push('/user/membership')} className="gov-btn gov-btn-orange !px-12 shadow-md">Complete Enrollment</button>
                    )}
                </div>
            </main>

            <footer className="py-12 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">
                Official Digital Archive • Government of Tamil Nadu
            </footer>
        </div>
    );
}
