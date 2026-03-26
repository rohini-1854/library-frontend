'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProfile, verifyLocation, submitPersonalDetails, submitDocuments, completeRegistration } from '@/services/api';

export default function MembershipEnrollment() {
    const [user, setUser] = useState(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [registrationResult, setRegistrationResult] = useState(null);
    const [mounted, setMounted] = useState(false);

    // Form States
    const [coords, setCoords] = useState(null);
    const [locError, setLocError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        parentsName: '',
        dob: '',
        address: '',
        phoneNumber: '',
        aadhaarAddress: ''
    });

    const [photoFile, setPhotoFile] = useState(null);
    const [idFrontFile, setIdFrontFile] = useState(null);
    const [idBackFile, setIdBackFile] = useState(null);

    const photoInputRef = useRef(null);
    const idFrontInputRef = useRef(null);
    const idBackInputRef = useRef(null);
    const [paymentMethod, setPaymentMethod] = useState('online');
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
        if (!id) {
            setLoading(false);
            return;
        }
        try {
            const data = await getProfile(id);
            setUser(data);
            
            if (data.reuploadRequested) {
                setStep(3);
            } else if (data.isMember && data.isVerified) {
                setRegistrationResult({
                    success: true,
                    isVerified: true,
                    membershipId: data.membershipId,
                    message: 'Membership verified and activated!'
                });
                setStep(5);
            } else if (data.registrationStep) {
                setStep(data.registrationStep);
            }

            setFormData({
                name: data.name || '',
                parentsName: data.parentsName || '',
                dob: data.dob ? data.dob.split('T')[0] : '',
                address: data.address || '',
                phoneNumber: data.phoneNumber || '',
                aadhaarAddress: data.aadhaarAddress || ''
            });
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch profile', err);
            setLoading(false);
        }
    };

    const [distance, setDistance] = useState(null);

    const [satelliteChecking, setSatelliteChecking] = useState(false);

    const handleVerifyLocation = () => {
        if (!navigator.geolocation) {
            setLocError("Geolocation is not supported by your browser.");
            return;
        }

        setSatelliteChecking(true);
        setLocError(null);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            setCoords({ lat: latitude, lng: longitude });
            
            try {
                // Reverse Geocoding using Nominatim
                let gpsAddress = '';
                try {
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const geoData = await geoRes.json();
                    gpsAddress = geoData.display_name || '';
                } catch (geoErr) {
                    console.error("Reverse geocoding failed", geoErr);
                }

                const res = await verifyLocation(user._id, latitude, longitude, gpsAddress);
                setDistance(res.distance);
                
                // Keep the "Satellite Checking" state for a bit for the effect
                setTimeout(() => {
                    setSatelliteChecking(false);
                    if (res.success) {
                        setTimeout(() => setStep(2), 2000);
                    } else {
                        setLocError(res.message);
                    }
                }, 3000); // 3 seconds of satellite animation
            } catch (err) {
                setLocError("Server verification failed. Please try again.");
                setSatelliteChecking(false);
            }
        }, (err) => {
            setLocError("Location access denied. Please allow location access to continue.");
            setSatelliteChecking(false);
        });
    };

    const handleStep2Submit = async () => {
        setSubmitting(true);
        try {
            await submitPersonalDetails(user._id, formData);
            setStep(3);
        } catch (err) {
            alert("Failed to save details.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        if (type === 'photo') setPhotoFile(file);
        else if (type === 'idFront') setIdFrontFile(file);
        else if (type === 'idBack') setIdBackFile(file);
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleStep3Submit = async () => {
        if (!photoFile || !idFrontFile || !idBackFile || !formData.aadhaarAddress) return;
        setSubmitting(true);
        try {
            const photoBase64 = await convertToBase64(photoFile);
            const idFrontBase64 = await convertToBase64(idFrontFile);
            const idBackBase64 = await convertToBase64(idBackFile);
            await submitDocuments(user._id, {
                photoUrl: photoBase64,
                idProofUrl: idFrontBase64,
                idProofBackUrl: idBackBase64,
                aadhaarAddress: formData.aadhaarAddress
            });
            setStep(4);
        } catch (err) {
            alert("Upload failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFinalSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await completeRegistration(user._id, { paymentMode: paymentMethod });
            setRegistrationResult(res);
            setStep(5);
        } catch (err) {
            console.error('Final submission failed', err);
            alert('Submission failed.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse uppercase tracking-widest text-xs">Checking Membership Status...</div>;

    // Step 5: Result / ID Card Page
    if (step === 5) {
        return (
            <div className="min-h-screen bg-[#f4f7f9] font-sans flex flex-col items-center justify-center p-8 space-y-12 animate-gov">
                <div className="gov-card max-w-2xl w-full !p-0 overflow-hidden shadow-xl">
                    <div className="bg-white p-12 flex flex-col items-center text-center space-y-8">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl ${registrationResult?.isVerified ? 'bg-green-50 text-[#2E7D32]' : 'bg-amber-50 text-[#F39C12]'}`}>
                            {registrationResult?.isVerified ? '✓' : '⌛'}
                        </div>
                        
                        <div className="space-y-3">
                            <h3 className="text-3xl font-bold text-zinc-900 uppercase tracking-tight">
                                {registrationResult?.isVerified ? 'Membership Activated' : 'Application Submitted'}
                            </h3>
                            <p className="text-sm font-medium text-zinc-500 max-w-sm mx-auto uppercase tracking-wide">
                                {registrationResult?.message}
                            </p>
                        </div>

                        {registrationResult?.isVerified && (
                            <div id="id-card" className="w-full max-w-[480px] h-auto bg-white border-2 border-zinc-200 rounded-2xl p-0 overflow-hidden shadow-2xl relative mx-auto">
                                {/* Card Header */}
                                <div className="bg-[#1A237E] p-4 flex items-center gap-4 border-b-4 border-[#F39C12]">
                                    <div className="w-12 h-12 bg-white rounded-full p-1 flex items-center justify-center">
                                        <Image src="/tn-logo.png" alt="TN Logo" width={40} height={40} className="object-contain" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-white text-[12px] font-bold uppercase leading-none">Government of Tamil Nadu</h4>
                                        <p className="text-white text-[10px] font-medium opacity-80 uppercase tracking-widest mt-1">District Central Library, Tirunelveli</p>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 flex justify-between gap-4">
                                    <div className="flex-1 text-left space-y-3">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Library Member ID</p>
                                            <p className="text-xl font-bold text-[#1A237E] tracking-tight">{registrationResult.membershipId}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Full Name</p>
                                            <p className="text-lg font-bold text-zinc-800 uppercase leading-none">{user?.name}</p>
                                        </div>
                                        {user?.dob && (
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Date of Birth</p>
                                                <p className="text-[11px] font-bold text-zinc-800">{new Date(user.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        )}
                                        {user?.address && (
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Address</p>
                                                <p className="text-[10px] font-semibold text-zinc-700 leading-snug line-clamp-2">{user.address}</p>
                                            </div>
                                        )}
                                        <div className="pt-2 flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-zinc-300 text-2xl">QR</span>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-bold text-zinc-400 uppercase">Valid Thru</p>
                                                    <p className="text-[10px] font-bold text-zinc-800">LIFETIME ACCESS</p>
                                                </div>
                                            </div>
                                            {user?.distanceKm != null && (
                                                <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs">📍</span>
                                                        <div>
                                                            <p className="text-[8px] font-bold text-zinc-400 uppercase">Distance from Library</p>
                                                            <p className="text-[10px] font-bold text-[#1A237E]">{user.distanceKm.toFixed(2)} KM</p>
                                                        </div>
                                                    </div>
                                                    {user?.location?.lat && (
                                                        <a
                                                            href={`https://maps.google.com/?q=${user.location.lat},${user.location.lng}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[8px] font-bold text-[#3F51B5] underline uppercase"
                                                        >
                                                            Maps ↗
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-32 h-40 bg-zinc-100 rounded-xl border-2 border-zinc-200 flex items-center justify-center overflow-hidden shadow-inner">
                                        {user?.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : <span className="text-5xl text-zinc-300">👤</span>}
                                    </div>
                                </div>

                                {/* Watermark */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                                    <div className="mt-[-128px] ml-[-128px] opacity-[0.03]">
                                        <Image src="/tn-logo.png" alt="TN Watermark" width={256} height={256} className="object-contain" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 w-full">
                            <button
                                onClick={() => router.push('/user/dashboard')}
                                className="gov-btn gov-btn-secondary flex-1"
                            >
                                Member Dashboard
                            </button>
                            {registrationResult?.isVerified && (
                                <button
                                    onClick={() => window.print()}
                                    className="gov-btn gov-btn-primary flex-1 shadow-md"
                                >
                                    Download Card (PDF)
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="bg-[#f8f9fa] border-t border-zinc-100 p-4 text-center">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Official Document • Government of Tamil Nadu</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfdfe] font-sans pb-20 overflow-x-hidden">
            {/* Official Government Banner */}
            <header className="gov-banner sticky top-0 z-[70] shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-white rounded-full p-1 shadow-sm flex items-center justify-center">
                        <Image src="/tn-logo.png" alt="TN Govt" width={56} height={56} className="object-contain" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-zinc-900 leading-none uppercase">
                            <span className="block font-tamil mb-0.5">தமிழ்நாடு அரசு</span>
                            Government of Tamil Nadu
                        </h1>
                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            District Central Library • திருநெல்வேலி
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => router.push('/user/dashboard')} className="gov-btn gov-btn-secondary !text-[9px] !py-2">
                        Back to Home
                    </button>
                </div>
            </header>

            {/* Official Process Navigation */}
            <nav className="bg-[#f8f9fa] border-b border-zinc-200 px-8 py-4 sticky top-[80px] z-50">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-zinc-900 leading-none uppercase tracking-tight">
                            Membership Application • <span className="text-[#3F51B5]">உறுப்பினர் சேர்க்கை</span>
                        </h2>
                    </div>
                    <div className="hidden lg:flex items-center gap-6">
                        {[
                            { id: 1, label: 'Location' },
                            { id: 2, label: 'Personal Information' },
                            { id: 3, label: 'Document Upload' },
                            { id: 4, label: 'Final Review' }
                        ].map((s) => (
                            <div key={s.id} className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= s.id ? 'bg-[#3F51B5] text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                                    {s.id}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${step === s.id ? 'text-[#3F51B5]' : 'text-zinc-400'}`}>
                                    {s.label}
                                </span>
                                {s.id < 4 && <div className="w-4 h-px bg-zinc-200" />}
                            </div>
                        ))}
                    </div>
                </div>
            </nav>

            <main className="pt-6 p-8 max-w-5xl mx-auto space-y-8 animate-entrance">
                <header className="text-center space-y-4">
                    <div className="inline-block px-4 py-1.5 bg-[#E8EAF6] border border-[#C5CAE9] rounded-md">
                        <span className="text-[10px] font-bold text-[#3F51B5] uppercase tracking-widest">Application Process</span>
                    </div>
                    <h2 className="text-3xl font-bold text-zinc-900 uppercase tracking-tight">
                        {step === 1 && 'Step 1: Check Location'}
                        {step === 2 && 'Step 2: Personal Information'}
                        {step === 3 && 'Step 3: Document Submission'}
                        {step === 4 && 'Step 4: Final Review & Confirmation'}
                    </h2>
                </header>

                {user?.reuploadRequested && (
                    <div className="max-w-2xl mx-auto p-8 bg-zinc-950 border border-white/5 rounded-[3rem] flex items-center gap-6 shadow-3xl">
                        <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-rose-950/20">⚠️</div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em]">Critical Exception: Document Rejection</p>
                            <p className="text-[11px] font-bold text-white/70 leading-relaxed italic">"{user.reuploadReason || 'Administrative decision requires re-submission of identifying documentation.'}"</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-12">

                    {/* STEP 1: LOCATION VERIFICATION */}
                    {step === 1 && (
                        <div className="max-w-xl mx-auto space-y-8 gov-card !p-12">
                            {satelliteChecking && (
                                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-6">
                                    <div className="w-16 h-16 border-4 border-[#3F51B5]/20 border-t-[#3F51B5] rounded-full animate-spin"></div>
                                    <p className="text-sm font-bold text-[#3F51B5] uppercase tracking-widest animate-pulse">Verifying Location Coordinates...</p>
                                </div>
                            )}

                            <div className="w-20 h-20 bg-zinc-50 rounded-2xl flex items-center justify-center text-4xl mx-auto border border-zinc-100 shadow-sm">📍</div>
                            <div className="text-center space-y-4">
                                <h3 className="text-xl font-bold text-zinc-900 uppercase tracking-tight">Check if you can join</h3>
                                <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                                    Members must live in Tirunelveli (within 15km of the Library).
                                </p>
                            </div>

                            {/* Rules & Conditions Section */}
                            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-zinc-200 pb-2">Library Rules</p>
                                <ul className="space-y-3">
                                    {[
                                        { icon: '📸', text: 'Membership requires a recent Passport Size Photo for the identity card.' },
                                        { icon: '🛡️', text: 'Live location tracking is mandatory to verify residential jurisdiction (15 km limit).' },
                                        { icon: '📋', text: 'Your address must match your Aadhaar card.' },
                                        { icon: '🆔', text: 'Original ID proof must be presented if requested by the District Librarian.' },
                                        { icon: '💳', text: 'One-time membership fee is ₹10.' }
                                    ].map((rule, idx) => (
                                        <li key={idx} className="flex gap-3 items-start">
                                            <span className="text-xs">{rule.icon}</span>
                                            <span className="text-[11px] font-medium text-zinc-600 leading-snug">{rule.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {coords && (
                                <div className="grid grid-cols-2 gap-4 p-6 bg-[#f8f9fa] border border-zinc-200 rounded-xl animate-gov">
                                    <div className="text-center border-r border-zinc-200">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Status</p>
                                        <p className="text-xs font-bold text-[#2E7D32] uppercase">Location Acquired</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Distance (Approx)</p>
                                        <p className={`text-base font-bold ${distance <= 15 ? 'text-zinc-900' : 'text-[#D32F2F]'}`}>
                                            {distance ? `${distance.toFixed(2)} Kilometers` : '---'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {locError && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                                    <p className="text-xs font-bold text-[#D32F2F] uppercase text-center">{locError}</p>
                                </div>
                            )}

                            {!coords || locError ? (
                                <button
                                    onClick={handleVerifyLocation}
                                    disabled={satelliteChecking}
                                    className="gov-btn gov-btn-primary w-full !py-5 !text-xs shadow-md"
                                >
                                    {satelliteChecking ? 'Processing...' : 'Auto-Verify Location'}
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="gov-btn w-full !py-5 !text-xs bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] font-bold">
                                        Location Verified Successfully
                                    </div>
                                    <p className="text-[10px] text-zinc-400 text-center uppercase font-bold tracking-widest">Initializing Step 2...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: PERSONAL INFORMATION */}
                    {step === 2 && (
                        <div className="max-w-3xl mx-auto gov-card !p-12 space-y-10 animate-gov">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">Applicant Name (as per ID)</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-lg font-medium text-zinc-900 focus:border-[#3F51B5] focus:ring-1 focus:ring-[#3F51B5] outline-none transition-all"
                                        placeholder="Enter legal name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">Father / Guardian Name</label>
                                    <input
                                        type="text"
                                        value={formData.parentsName}
                                        onChange={(e) => setFormData({ ...formData, parentsName: e.target.value })}
                                        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-lg font-medium text-zinc-900 focus:border-[#3F51B5] focus:ring-1 focus:ring-[#3F51B5] outline-none transition-all"
                                        placeholder="Enter father/guardian name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-lg font-medium text-zinc-900 focus:border-[#3F51B5] focus:ring-1 focus:ring-[#3F51B5] outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">Contact Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-lg font-medium text-zinc-900 focus:border-[#3F51B5] focus:ring-1 focus:ring-[#3F51B5] outline-none transition-all"
                                        placeholder="+91 Number"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">Residential Address (Current)</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-lg font-medium text-zinc-900 focus:border-[#3F51B5] focus:ring-1 focus:ring-[#3F51B5] outline-none transition-all min-h-[100px]"
                                        placeholder="Provide complete address with pin code"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-zinc-100">
                                <button onClick={() => setStep(1)} className="gov-btn gov-btn-secondary flex-1">Back</button>
                                <button
                                    onClick={handleStep2Submit}
                                    disabled={submitting || !formData.name || !formData.address}
                                    className="gov-btn gov-btn-primary flex-[2] shadow-md"
                                >
                                    {submitting ? 'Saving...' : 'Save & Continue'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DOCUMENTS */}
                    {step === 3 && (
                        <div className="max-w-4xl mx-auto gov-card !p-12 space-y-12 animate-gov">
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-zinc-900 uppercase tracking-tight">Required Documentation</h3>
                                <p className="text-xs text-zinc-500 font-medium">Please upload clear scanned copies of your original documents.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { id: 'photo', label: 'Passport Size Photo', icon: '📸', ref: photoInputRef, state: photoFile || user?.photoUrl },
                                    { id: 'idFront', label: 'Aadhaar (Front Side)', icon: '🛡️', ref: idFrontInputRef, state: idFrontFile },
                                    { id: 'idBack', label: 'Aadhaar (Back Side)', icon: '🛡️', ref: idBackInputRef, state: idBackFile }
                                ].map((item) => (
                                    <div 
                                        key={item.id}
                                        onClick={() => item.ref.current?.click()} 
                                        className={`group p-6 border-2 border-dashed rounded-xl flex flex-col items-center text-center space-y-4 cursor-pointer transition-all ${item.state ? 'bg-indigo-50/50 border-[#3F51B5]/30' : 'bg-zinc-50 border-zinc-200 hover:border-[#3F51B5] hover:bg-white'}`}
                                    >
                                        <input type="file" ref={item.ref} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, item.id)} />
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${item.state ? 'bg-white text-[#3F51B5] shadow-sm' : 'bg-zinc-100 text-zinc-400 group-hover:bg-[#3F51B5] group-hover:text-white'}`}>{item.state ? '✓' : item.icon}</div>
                                        <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-wider">{item.state ? 'File Selected' : item.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6 pt-6 border-t border-zinc-100">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">Aadhaar Address Transcript (Manual Entry)</label>
                                    <textarea
                                        value={formData.aadhaarAddress}
                                        onChange={(e) => setFormData({ ...formData, aadhaarAddress: e.target.value })}
                                        className="w-full p-4 bg-zinc-950 text-white rounded-lg font-medium outline-none focus:ring-2 focus:ring-[#3F51B5]/50 transition-all min-h-[100px] text-sm"
                                        placeholder="Type the exact address as printed on your Aadhaar card..."
                                    />
                                </div>

                                {formData.aadhaarAddress && (
                                    <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4">
                                        <p className="text-[10px] font-bold text-[#3F51B5] uppercase tracking-widest">System Validation Status</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase">Inputted Residential Address</p>
                                                <p className="text-xs font-semibold text-zinc-800 italic">"{formData.address}"</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase">Aadhaar Document Address</p>
                                                <p className="text-xs font-semibold text-zinc-800 italic">"{formData.aadhaarAddress}"</p>
                                            </div>
                                        </div>
                                        <div className="pt-2 flex justify-center">
                                            {formData.address?.toLowerCase().replace(/[^a-z0-9]/g, '') === formData.aadhaarAddress?.toLowerCase().replace(/[^a-z0-9]/g, '') ? (
                                                <div className="text-[10px] font-bold text-[#2E7D32] uppercase bg-[#E8F5E9] px-4 py-2 rounded-full border border-[#C8E6C9]">
                                                    ✓ Data Match Confirmed
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-bold text-[#F39C12] uppercase bg-[#FFF3E0] px-4 py-2 rounded-full border border-[#FFE0B2]">
                                                    ⚠ Address Discrepancy Detected
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setStep(2)} className="gov-btn gov-btn-secondary flex-1">Back</button>
                                <button
                                    onClick={handleStep3Submit}
                                    disabled={submitting || !photoFile || !idFrontFile || !idBackFile || !formData.aadhaarAddress}
                                    className="gov-btn gov-btn-primary flex-[2] shadow-md"
                                >
                                    {submitting ? 'Uploading...' : 'Verify & Continue'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: PAYMENT & REVIEW */}
                    {step === 4 && (
                        <div className="max-w-3xl mx-auto gov-card !p-12 space-y-10 animate-gov">
                            <div className="space-y-6">
                                <div className="p-8 bg-[#f8f9fa] border border-zinc-200 rounded-xl space-y-6">
                                    <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
                                        <h4 className="text-sm font-bold text-zinc-900 uppercase">Application Summary</h4>
                                        <span className="text-[#3F51B5] text-[10px] font-bold">Ref No: #DCL-{new Date().getFullYear()}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Full Name</p>
                                            <p className="text-sm font-bold text-zinc-900">{formData.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Regional Jurisdiction</p>
                                            <p className="text-sm font-bold text-zinc-900">{distance?.toFixed(2)} KM (Verified)</p>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Address Validation</p>
                                            <div className="flex items-center gap-2">
                                                {formData.address?.toLowerCase().replace(/[^a-z0-9]/g, '') === formData.aadhaarAddress?.toLowerCase().replace(/[^a-z0-9]/g, '') ? (
                                                    <span className="text-[10px] font-bold text-[#2E7D32]">✓ Verified & Matching</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-[#F39C12]">⚠ Pending Administrative Review</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-zinc-200 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Enrollment Fee (Lifetime)</p>
                                            <p className="text-2xl font-bold text-[#3F51B5]">₹10.00</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-3 py-1 rounded-md border border-[#C8E6C9] uppercase">Active</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Select Payment Mode</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div 
                                            onClick={() => setPaymentMethod('online')} 
                                            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-[#3F51B5] bg-[#E8EAF6]/50' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'}`}
                                        >
                                             <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-zinc-900">Online Payment</p>
                                                    <p className="text-[10px] text-zinc-500 font-medium">UPI / Net Banking / Debit Card</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === 'online' ? 'bg-[#3F51B5] border-[#3F51B5]' : 'border-zinc-300'}`} />
                                            </div>
                                        </div>
                                        <div 
                                            onClick={() => setPaymentMethod('cash')} 
                                            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-zinc-800 bg-zinc-800 text-white' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'}`}
                                        >
                                             <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold">Library Counter</p>
                                                    <p className="text-[10px] font-medium opacity-70">Pay cash at District Central Library</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === 'cash' ? 'bg-[#3F51B5] border-[#3F51B5]' : 'border-zinc-300'}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-[#FFF9C4] border border-[#FFF176] rounded-lg">
                                <p className="text-[11px] font-bold text-zinc-800 uppercase tracking-wide text-center">
                                    Final Submission initiates administrative verification of documents.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setStep(3)} className="gov-btn gov-btn-secondary flex-1">Back</button>
                                <button
                                    onClick={handleFinalSubmit}
                                    disabled={submitting}
                                    className="gov-btn gov-btn-primary flex-[2] shadow-md"
                                >
                                    {submitting ? 'Processing...' : 'Submit Application'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
