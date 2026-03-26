'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProfile } from '@/services/api';

export default function IDCardPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
            router.push('/login');
        } else {
            fetchProfile(storedUser._id || storedUser.id);
        }
    }, [router]);

    const fetchProfile = async (id) => {
        try {
            const data = await getProfile(id);
            if (!data.isMember) {
                alert('Active membership required to view ID Card.');
                router.push('/user/dashboard');
                return;
            }
            setUser(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch profile', err);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!mounted || loading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse uppercase tracking-[0.4em] text-xs">Generating Secure Credentials...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 py-12 px-6 print:p-0 print:bg-white flex flex-col items-center">
            {/* Action Header - Hidden on Print */}
            <div className="mb-10 flex gap-4 print-hidden">
                <button
                    onClick={() => router.push('/user/dashboard')}
                    className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-900 font-bold rounded-xl hover:bg-zinc-50 transition-all uppercase tracking-widest text-[10px] shadow-sm flex items-center gap-2"
                >
                    <span className="text-lg">←</span> Dashboard
                </button>
                <button
                    onClick={handlePrint}
                    className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 flex items-center gap-2"
                >
                    Print ID Card <span>🖨️</span>
                </button>
            </div>

            {/* The ID Card Container - Landscape */}
            <div id="membership-card" className="w-[680px] h-[440px] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-zinc-100 flex print:shadow-none print:border-zinc-300 print:w-[680px] print:h-[440px] relative">

                {/* Left Branding Panel (Dark/Accent) */}
                <div className="w-[200px] bg-zinc-950 flex flex-col items-center justify-between py-10 px-4 relative overflow-hidden">
                    {/* Abstract background pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500 rounded-full blur-3xl -ml-12 -mb-12"></div>
                    </div>

                    <div className="relative z-10 w-full flex flex-col items-center space-y-6">
                        {/* Member Photo */}
                        <div className="w-32 h-40 bg-zinc-800 rounded-2xl border-2 border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                            {user.photoUrl ? (
                                <img src={user.photoUrl} alt="Member Photo" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
                            ) : (
                                <span className="text-4xl opacity-20 text-white font-black italic">USER</span>
                            )}
                            <div className="absolute inset-0 border-[6px] border-white/5 pointer-events-none" />
                        </div>

                        <div className="text-center">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1">Status</p>
                            <p className="text-xs font-black text-white uppercase tracking-widest bg-white/5 py-1 px-4 rounded-full border border-white/10">Active Member</p>
                        </div>
                    </div>

                    {/* Barcode-style Footer */}
                    <div className="relative z-10 w-full flex flex-col items-center">
                        <div className="w-full h-8 flex gap-[1px] opacity-40 px-4 mb-2">
                            {[...Array(24)].map((_, i) => (
                                <div key={i} className={`h-full bg-white`} style={{ width: `${Math.random() * 4 + 1}px` }}></div>
                            ))}
                        </div>
                        <p className="text-[9px] font-mono text-white/40 tracking-[0.2em]">LLA-LIB-{user._id.substring(user._id.length - 8).toUpperCase()}</p>
                    </div>
                </div>

                {/* Right Details Panel */}
                <div className="flex-1 px-10 py-8 flex flex-col justify-between relative bg-gradient-to-br from-white to-zinc-50/50">

                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4 items-center">
                            <div className="bg-white rounded-full p-1 shadow-sm flex items-center justify-center">
                                <Image src="/tn-logo.png" alt="TN Logo" width={56} height={56} className="object-contain" />
                            </div>
                            <div>
                                <h1 className="text-[13px] font-black text-zinc-900 uppercase tracking-tight leading-none">Local Library Authority</h1>
                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mt-1">Government of Tamil Nadu</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Regional District</p>
                            <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">Tirunelveli</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 mt-6 mb-2">
                        <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-4 leading-tight">{user.name}</h2>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Date of Birth</span>
                                <p className="text-[10px] font-semibold text-zinc-900">{user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Date of Joining</span>
                                <p className="text-[10px] font-semibold text-zinc-900">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Phone Number</span>
                                <p className="text-[10px] font-semibold text-zinc-900">{user.phoneNumber || 'N/A'}</p>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Borrowing Capacity</span>
                                <p className="text-[10px] font-semibold text-zinc-900">{user.bookCapacity} Books per session</p>
                            </div>
                            <div className="col-span-2 space-y-0.5">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Primary Address</span>
                                <p className="text-[10px] font-medium text-zinc-600 leading-relaxed max-w-[420px] break-words">{user.address || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Security */}
                    <div className="flex justify-between items-end border-t border-zinc-100 pt-5">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-zinc-100 shadow-sm">
                                <span className="text-base">✅</span>
                            </div>
                            <div>
                                <p className="text-[7px] font-black text-zinc-400 uppercase tracking-wider">Verification Status</p>
                                <p className="text-[9px] font-bold text-green-600 uppercase tracking-tight">Security Verified</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="w-24 h-6 border-b border-zinc-200 mb-1 mx-auto opacity-60"></div>
                            <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Authorized Signatory</p>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 opacity-[0.02] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-32 h-1 bg-indigo-600"></div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 1cm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        background-color: white !important;
                    }
                    button, .print-hidden {
                        display: none !important;
                    }
                    #membership-card {
                        box-shadow: none !important;
                        border: 1px solid #e5e7eb !important;
                        margin: 0 auto !important;
                        position: relative !important;
                        top: 0 !important;
                        transform: none !important;
                    }
                    .min-h-screen {
                        height: auto !important;
                        min-height: 0 !important;
                        padding: 0 !important;
                        display: block !important;
                    }
                }
            `}</style>

            <div className="mt-10 text-center text-zinc-400 print-hidden space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.3em]">Digital Identity Passport • LLA Tirunelveli</p>
                <p className="text-[8px] font-bold uppercase tracking-widest">Authorized by the Director of Public Libraries, Tamil Nadu</p>
            </div>
        </div>
    );
}
