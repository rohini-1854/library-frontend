'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getUsers, updateMembership, deleteUser, getTransactions } from '@/services/api';
import { isTamilEncoded } from '@/utils/tamil';

export default function ManageMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // all, requests, members
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberHistory, setMemberHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const photoInputRef = useRef(null);
    const idFrontInputRef = useRef(null);
    const idBackInputRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'admin') {
            router.push('/login');
        } else {
            fetchMembers();
        }
    }, [router]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setMembers(data.filter(u => u.role === 'user'));
        } catch (err) {
            console.error('Failed to fetch members', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMember = async (member) => {
        setSelectedMember(member);
        setHistoryLoading(true);
        try {
            const history = await getTransactions(member._id);
            setMemberHistory(history);
        } catch (err) {
            console.error('Failed to fetch history', err);
            setMemberHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleVerifyAction = async (id, status, markPaidOnly = false) => {
        try {
            const updatePayload = markPaidOnly
                ? { paymentStatus: 'paid' }
                : { isVerified: status, isMember: status };

            await updateMembership(id, updatePayload);

            if (markPaidOnly) {
                alert('Payment Verified. You can now activate membership.');
                if (selectedMember?._id === id) {
                    setSelectedMember(prev => ({ ...prev, paymentStatus: 'paid' }));
                }
            } else {
                alert(status ? 'Verification APPROVED. Membership Activated.' : 'Verification REVOKED. Membership suspended.');
                if (selectedMember?._id === id) {
                    setSelectedMember(prev => ({ ...prev, isVerified: status, isMember: status }));
                }
            }
            fetchMembers();
        } catch (err) {
            alert('Operation failed. Check if documents/photo are uploaded.');
        }
    };

    const handleAdminUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file || !selectedMember) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result;
            try {
                const updateData = {};
                if (type === 'photo') updateData.photoUrl = base64;
                if (type === 'idFront') updateData.idProofUrl = base64;
                if (type === 'idBack') updateData.idProofBackUrl = base64;

                await updateMembership(selectedMember._id, updateData);
                alert(`${type.toUpperCase()} updated successfully.`);

                // Update local state
                setSelectedMember(prev => ({ ...prev, ...updateData }));
                setMembers(prev => prev.map(m => m._id === selectedMember._id ? { ...m, ...updateData } : m));
            } catch (err) {
                alert('Update failed.');
            }
        };
    };

    const openImageInNewTab = (base64) => {
        if (!base64) return;
        const win = window.open();
        win.document.write(`
            <html>
                <head><title>Archive Document - Digital Central Library</title></head>
                <body style="margin:0; background:#f4f4f5; display:flex; align-items:center; justify-content:center;">
                    <img src="${base64}" style="max-width:90%; max-height:90vh; box-shadow:0 20px 25px -5px rgb(0 0 0 / 0.1); border-radius:20px; border:8px solid white;" />
                </body>
            </html>
        `);
    };

    const handleRemoveUser = async (id, name) => {
        if (confirm(`Are you sure you want to delete ${name.toUpperCase()}? All history and documents will be removed.`)) {
            try {
                await deleteUser(id);
                alert('Account deleted from list.');
                setSelectedMember(null);
                fetchMembers();
            } catch (err) {
                alert('Deletion failed.');
            }
        }
    };

    const filteredMembers = members.filter(m => {
        if (activeTab === 'requests') return m.docsSubmitted && !m.isVerified;
        if (activeTab === 'members') return m.isMember;
        return true;
    });

    const tabs = [
        { id: 'all', label: 'All Users', count: members.length },
        { id: 'requests', label: 'Membership Requests', count: members.filter(m => m.docsSubmitted && !m.isVerified).length },
        { id: 'members', label: 'Library Members', count: members.filter(m => m.isMember).length },
    ];

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
                    {/* Tab filters in banner */}
                    <div className="hidden md:flex gap-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-[#1A237E]' : 'bg-white/20 text-white hover:bg-white/30'}`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </div>
            </header>
            <nav className="gov-nav sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center w-full">
                    <div className="flex gap-2 h-full items-center">
                        <button onClick={() => router.push('/admin/dashboard')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Dashboard</button>
                        <button onClick={() => router.push('/admin/books')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Manage Books</button>
                        <button onClick={() => router.push('/admin/members')} className="text-white text-[11px] font-bold uppercase tracking-widest px-4 border-b-2 border-white py-4">Members</button>
                        <button onClick={() => router.push('/admin/transactions')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Borrow & Return</button>
                        <button onClick={() => router.push('/admin/feedback')} className="text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 transition-colors py-4">Public Feedback</button>
                    </div>
                    <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="bg-[#1A237E] hover:bg-[#D32F2F] text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all border border-white/20">Logout</button>
                </div>
            </nav>

            <main className="pt-28 p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* List Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="md:hidden flex overflow-x-auto pb-4 gap-2 no-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${activeTab === tab.id ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white border border-zinc-100 text-zinc-400'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-zinc-100 border border-zinc-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-50 border-b border-zinc-100">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Member Record</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {loading ? (
                                    <tr><td colSpan={3} className="px-8 py-32 text-center text-zinc-300 font-black animate-pulse uppercase tracking-widest text-xs">Accessing Secure Vault...</td></tr>
                                ) : filteredMembers.length === 0 ? (
                                    <tr><td colSpan={3} className="px-8 py-32 text-center text-zinc-400 font-bold italic text-sm text-[10px] uppercase">No readers found in this quadrant.</td></tr>
                                ) : (
                                    filteredMembers.map((member) => (
                                        <tr
                                            key={member._id}
                                            onClick={() => handleSelectMember(member)}
                                            className={`cursor-pointer transition-all ${selectedMember?._id === member._id ? 'bg-indigo-50/50' : 'hover:bg-zinc-50/50'}`}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-12 h-12 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center overflow-hidden shadow-inner">
                                                        {member.photoUrl ? (
                                                            <img src={member.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-zinc-900 font-black text-lg">{member.name.substring(0, 1).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-zinc-900 text-xs uppercase tracking-tight">{member.name}</p>
                                                        {member.isMember && <span className="text-[7px] font-black px-1.5 py-0.5 bg-green-900 text-white rounded-md uppercase tracking-widest mt-1 inline-block">Paid Member</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                {member.isVerified ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Verified</span>
                                                    </div>
                                                ) : member.docsSubmitted ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Pending Review</span>
                                                        </div>
                                                        {(member.photoUrl?.includes('/uploads/') || member.idProofUrl?.includes('/uploads/') || member.idProofBackUrl?.includes('/uploads/')) && (
                                                            <span className="text-[7px] font-black bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full uppercase tracking-widest border border-rose-100">Broken Link</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Incomplete</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right text-zinc-200 group-hover:text-indigo-600">🏛️</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inspection Sidebar */}
                <div className="lg:col-span-1">
                    {selectedMember ? (
                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-indigo-100 border border-zinc-100 sticky top-28 space-y-8 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start">
                                <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Member Details</h2>
                                <button onClick={() => setSelectedMember(null)} className="text-zinc-300 hover:text-zinc-600">✕</button>
                            </div>

                            <div className="flex flex-col items-center space-y-6">
                                <div
                                    onClick={() => photoInputRef.current?.click()}
                                    className="relative w-32 h-40 bg-zinc-50 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden ring-1 ring-zinc-200 cursor-pointer group"
                                >
                                    {selectedMember.photoUrl ? (
                                        <img src={selectedMember.photoUrl} alt="Portrait" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl grayscale opacity-20 group-hover:opacity-50">👤</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-[9px] font-black uppercase tracking-widest">Update Photo</span>
                                    </div>
                                    <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={(e) => handleAdminUpload(e, 'photo')} />
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-zinc-900 uppercase tracking-tighter leading-none">{selectedMember.name}</p>
                                    <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-2 px-3 py-1 bg-indigo-50 inline-block rounded-lg">LLA-{selectedMember._id.substring(selectedMember._id.length - 8).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4">
                                {/* Profile Segment */}
                                <div className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 space-y-5">
                                    <div className="flex justify-between items-center text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-200 pb-2">
                                        <span>Membership Details</span>
                                        <span className={selectedMember.isMember ? 'text-green-600' : 'text-zinc-300'}>{selectedMember.isMember ? 'PAID' : 'NOT PAID'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[8px] font-bold text-zinc-400 uppercase">Verification</p>
                                            <p className={`text-[10px] font-black uppercase tracking-tight ${selectedMember.isVerified ? 'text-green-600' : 'text-amber-600'}`}>{selectedMember.isVerified ? 'Official' : 'Pending'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-bold text-zinc-400 uppercase">Payment Status</p>
                                            <p className={`text-[10px] font-black uppercase tracking-tight ${selectedMember.paymentStatus === 'paid' ? 'text-green-600' : 'text-rose-500'}`}>{selectedMember.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}</p>
                                            <p className="text-[8px] font-bold text-indigo-500 uppercase">{selectedMember.paymentMode === 'cash' ? 'CASH' : 'ONLINE'}</p>
                                        </div>
                                    </div>
                                    {selectedMember.address && (
                                        <div className="pt-2 border-t border-zinc-100">
                                            <p className="text-[8px] font-bold text-zinc-400 uppercase">Contact Info</p>
                                            <p className="text-[9px] font-bold text-zinc-600">{selectedMember.phoneNumber}</p>
                                            <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1">DOB: {selectedMember.dob ? new Date(selectedMember.dob).toLocaleDateString() : 'N/A'}</p>
                                            <p className="text-[9px] text-zinc-500 mt-1">{selectedMember.address}</p>
                                        </div>
                                    )}
                                    {selectedMember.distanceKm != null && (
                                        <div className="pt-2 border-t border-zinc-100 space-y-2">
                                            <p className="text-[8px] font-bold text-zinc-400 uppercase">Verified Location</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm">📍</span>
                                                    <div>
                                                        <p className="text-[10px] font-black text-indigo-600">{selectedMember.distanceKm.toFixed(2)} KM from Library</p>
                                                        {selectedMember.location?.lat && (
                                                            <p className="text-[8px] text-zinc-400">
                                                                {selectedMember.location.lat.toFixed(4)}, {selectedMember.location.lng.toFixed(4)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {selectedMember.location?.lat && (
                                                    <a
                                                        href={`https://maps.google.com/?q=${selectedMember.location.lat},${selectedMember.location.lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[9px] font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-colors px-3 py-1.5 rounded-xl uppercase tracking-widest whitespace-nowrap"
                                                    >
                                                        View Maps ↗
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* History Segment */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Inspection Archive</h3>

                                    {/* Address Verification Box */}
                                    {selectedMember.docsSubmitted && (
                                        <div className="p-4 rounded-xl border-2 border-dashed border-[#F39C12] bg-amber-50/60 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[9px] font-black text-[#d68910] uppercase tracking-widest">📋 Address Verification</p>
                                                <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">Manual Check</span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div className="bg-white rounded-lg p-3 border border-amber-200">
                                                    <p className="text-[8px] font-black text-zinc-400 uppercase mb-1">GPS Verified Address (Live Location)</p>
                                                    <p className="text-[10px] font-bold text-indigo-600 leading-snug">{selectedMember.gpsAddress || 'Not available'}</p>
                                                </div>

                                                <div className="bg-white rounded-lg p-3 border border-amber-200">
                                                    <p className="text-[8px] font-black text-zinc-400 uppercase mb-1">Aadhaar Address (Manual Transcript)</p>
                                                    <p className="text-[10px] font-bold text-zinc-900 leading-snug">{selectedMember.aadhaarAddress || 'Not provided'}</p>
                                                </div>
                                            </div>

                                            <div className="pt-2 flex justify-center">
                                                {selectedMember.gpsAddress && selectedMember.aadhaarAddress && 
                                                 selectedMember.gpsAddress.toLowerCase().includes(selectedMember.aadhaarAddress.split(',')[0].toLowerCase().trim()) ? (
                                                    <div className="text-[8px] font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase">
                                                        ✓ Contextual Match Detected
                                                    </div>
                                                ) : (
                                                    <div className="text-[8px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 uppercase">
                                                        ⚠ Cross-Verify Documents
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="relative group">
                                                <button
                                                    onClick={() => openImageInNewTab(selectedMember.idProofUrl)}
                                                    disabled={!selectedMember.idProofUrl}
                                                    className="w-full p-4 bg-zinc-900 text-white rounded-2xl flex flex-col items-center gap-2 hover:bg-black transition-all disabled:opacity-20"
                                                >
                                                    <span className="text-xl">💳</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-center">ID Front</span>
                                                </button>
                                                <button
                                                    onClick={() => idFrontInputRef.current?.click()}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-lg hover:scale-110 transition-transform"
                                                    title="Update ID Front"
                                                >
                                                    ✎
                                                </button>
                                                <input type="file" ref={idFrontInputRef} className="hidden" accept="image/*" onChange={(e) => handleAdminUpload(e, 'idFront')} />
                                            </div>

                                            <div className="relative group">
                                                <button
                                                    onClick={() => openImageInNewTab(selectedMember.idProofBackUrl)}
                                                    disabled={!selectedMember.idProofBackUrl}
                                                    className="w-full p-4 bg-indigo-600 text-white rounded-2xl flex flex-col items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-20"
                                                >
                                                    <span className="text-xl">💳</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-center">ID Back</span>
                                                </button>
                                                <button
                                                    onClick={() => idBackInputRef.current?.click()}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-950 text-white rounded-full flex items-center justify-center text-[10px] shadow-lg hover:scale-110 transition-transform"
                                                    title="Update ID Back"
                                                >
                                                    ✎
                                                </button>
                                                <input type="file" ref={idBackInputRef} className="hidden" accept="image/*" onChange={(e) => handleAdminUpload(e, 'idBack')} />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openImageInNewTab(selectedMember.photoUrl)}
                                            disabled={!selectedMember.photoUrl}
                                            className="w-full p-4 bg-zinc-50 text-zinc-600 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-100 transition-all disabled:opacity-20 border border-zinc-100"
                                        >
                                            <span className="text-xl">📸</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest">View Portrait</span>
                                        </button>

                                        {/* Reset Status Button */}
                                        <button
                                            onClick={async () => {
                                                if (confirm('Reset this user to "Registered Only" status? They will need to re-upload their photo and ID proof using the standard 4-step system.')) {
                                                    try {
                                                        await updateMembership(selectedMember._id, { docsSubmitted: false, photoUrl: null, idProofUrl: null, idProofBackUrl: null, isVerified: false, isMember: false });
                                                        alert('User status reset successfully.');
                                                        setSelectedMember(null);
                                                        fetchMembers();
                                                    } catch (err) {
                                                        alert('Reset failed.');
                                                    }
                                                }
                                            }}
                                            className="w-full py-4 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-600 hover:text-white transition-all border border-amber-100"
                                        >
                                            Reset Status (Request Re-upload)
                                        </button>
                                    </div>
                                </div>

                                {/* Registry Timeline Segment */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Registry Timeline</h3>
                                    <div className="space-y-3">
                                        {historyLoading ? (
                                            <p className="text-[9px] font-black text-center py-4 text-zinc-200 animate-pulse uppercase tracking-widest">Accessing Logs...</p>
                                        ) : memberHistory.length === 0 ? (
                                            <p className="text-[9px] font-bold text-center py-4 text-zinc-300 italic uppercase">No historical entries.</p>
                                        ) : (
                                            memberHistory.slice(0, 3).map((tx, i) => (
                                                <div key={i} className="p-4 bg-white border border-zinc-100 rounded-2xl flex justify-between items-center shadow-sm">
                                                    <div>
                                                        <p className={`${isTamilEncoded(tx.bookId?.title) ? 'font-tamil text-base' : 'text-[9px] font-black uppercase'} text-zinc-900 line-clamp-1 leading-[1.6]`}>{tx.bookId?.title}</p>
                                                        <p className="text-[8px] font-bold text-zinc-400 uppercase">{new Date(tx.issueDate).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase ${tx.status === 'returned' ? 'text-green-500 bg-green-50' : 'text-rose-500 bg-rose-50'}`}>{tx.status}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Final Controls */}
                                <div className="pt-6 border-t border-zinc-100 flex flex-col gap-3">
                                    {!selectedMember.isVerified ? (
                                        <div className="space-y-3">
                                            {selectedMember.paymentStatus !== 'paid' && selectedMember.paymentMode === 'cash' && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Confirm receipt of ₹10 cash from ${selectedMember.name}?`)) {
                                                            handleVerifyAction(selectedMember._id, false, true); // Custom action to mark paid
                                                        }
                                                    }}
                                                    className="w-full py-4 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all"
                                                >
                                                    Mark Cash Payment Received (₹10)
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleVerifyAction(selectedMember._id, true)}
                                                disabled={!selectedMember.docsSubmitted || selectedMember.paymentStatus !== 'paid'}
                                                className="w-full py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-20 transition-all"
                                            >
                                                Verify & Activate Membership
                                            </button>
                                            {selectedMember.paymentStatus !== 'paid' && <p className="text-[8px] text-center text-rose-400 font-bold uppercase">Payment Required for Activation</p>}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleVerifyAction(selectedMember._id, false)}
                                            className="w-full py-4 bg-white border-2 border-zinc-100 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-50 transition-all"
                                        >
                                            Revoke Official Rights
                                        </button>
                                    )}

                                    {/* Fix for broken upload links */}
                                    <button
                                        onClick={async () => {
                                            const reason = prompt('Please enter the reason for re-upload (e.g. "ID photo blurry", "Address mismatch"):');
                                            if (reason !== null) {
                                                try {
                                                    await updateMembership(selectedMember._id, { 
                                                        reuploadRequested: true, 
                                                        reuploadReason: reason || 'Please provide clearer document photos.',
                                                        docsSubmitted: false 
                                                    });
                                                    alert('Re-upload request sent to user.');
                                                    setSelectedMember(null);
                                                    fetchMembers();
                                                } catch (err) {
                                                    alert('Request failed.');
                                                }
                                            }
                                        }}
                                        className={`w-full py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border ${(selectedMember.photoUrl?.includes('/uploads/') || selectedMember.idProofUrl?.includes('/uploads/') || selectedMember.idProofBackUrl?.includes('/uploads/'))
                                            ? 'bg-rose-600 text-white border-rose-700 shadow-xl shadow-rose-100 hover:bg-rose-700'
                                            : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white'
                                            }`}
                                    >
                                        {(selectedMember.photoUrl?.includes('/uploads/') || selectedMember.idProofUrl?.includes('/uploads/') || selectedMember.idProofBackUrl?.includes('/uploads/'))
                                            ? 'Repair Integrity (Fix 404)'
                                            : 'Request Document Re-upload'}
                                    </button>

                                    <button
                                        onClick={() => handleRemoveUser(selectedMember._id, selectedMember.name)}
                                        className="w-full py-4 bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                                    >
                                        Permanent Expulsion
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full border-4 border-dashed border-zinc-100 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center space-y-6">
                            <span className="text-6xl grayscale opacity-20">🛂</span>
                            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] leading-relaxed">Select a citizen record from the quadrant for intensive inspection.</p>
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}
