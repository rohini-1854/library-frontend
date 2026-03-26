'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getPublicFeedback } from "@/services/api";

export default function Home() {
  const [testimonials, setTestimonials] = useState([]);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    fetchTestimonials();
    setTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTestimonials = async () => {
    try {
      const data = await getPublicFeedback();
      setTestimonials(data);
    } catch (err) {
      console.error("Failed to fetch testimonials", err);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 italic-none scroll-smooth">
      {/* Official Government Banner */}
      <header className="gov-banner sticky top-0 z-[60] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full p-1 shadow-sm flex items-center justify-center">
              <Image src="/tn-logo.png" alt="Government of Tamil Nadu" width={56} height={56} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold text-white leading-tight tracking-tight uppercase">
                <span className="block font-tamil mb-0.5">தமிழ்நாடு அரசு</span>
                GOVERNMENT OF TAMIL NADU
              </h1>
              <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-0.5">
                Directorate of Public Libraries • பொது நூலக இயக்ககம்
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-right border-r pr-6 border-white/20">
              <p className="text-[9px] font-black text-white/50 uppercase tracking-tighter">Current Protocol Time</p>
              <p className="text-sm font-bold text-white font-mono tracking-widest">{time}</p>
            </div>
            <div className="flex gap-3">
               <Link href="/login" className="gov-btn gov-btn-secondary !text-[10px] !bg-white !text-[#1A237E]">Login</Link>
               <Link href="/register" className="gov-btn gov-btn-primary !text-[10px]">Register</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Official Navigation */}
      <nav className="gov-nav sticky top-[80px] z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center h-full">
          <Link href="/" className="gov-nav-link active">Home</Link>
          <Link href="#membership" className="gov-nav-link">Membership</Link>
          <Link href="#districts" className="gov-nav-link">Districts</Link>
          <Link href="#contact" className="gov-nav-link">Contact</Link>
        </div>
      </nav>

      <main className="animate-gov">
        {/* News Ticker Style Banner */}
        <div className="bg-[#FFF9C4] border-b border-[#FBC02D] px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <span className="bg-[#D32F2F] text-white px-2 py-0.5 text-[9px] font-black uppercase rounded animate-pulse">Update</span>
            <p className="text-[11px] font-bold text-[#616161] truncate">
              Membership system active for Tirunelveli district. Digital membership cards now available for all members.
            </p>
          </div>
        </div>

        {/* Hero Section - Professional & Informative */}
        <section className="relative bg-[#f5f7f9] overflow-hidden py-16 border-b border-zinc-200">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-6xl font-black text-[#1A237E] leading-[1.1] tracking-tighter mb-6 uppercase">
                  District Central <span className="text-[#3F51B5]">Library</span> Portal
                </h2>
                <div className="w-20 h-2 bg-[#3F51B5] rounded-full mb-8"></div>
                <p className="text-lg text-zinc-600 font-medium leading-relaxed max-w-xl">
                  Providing citizens easy access to library books, borrowing rules, and online resources. 
                  Managed by the Tirunelveli District Library Office.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/register" className="gov-btn gov-btn-primary !px-10 !py-4 shadow-xl">Start Enrollment</Link>
                <Link href="/login" className="gov-btn gov-btn-secondary !px-10 !py-4">Access Member Dashboard</Link>
              </div>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-[#3F51B5] rounded-[2rem] rotate-3 opacity-5"></div>
                <div className="relative bg-white p-4 rounded-[3rem] border border-zinc-200 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_48px_80px_-12px_rgba(63,81,181,0.15)]">
                   <div className="relative aspect-[4/5] sm:aspect-[3/2] lg:aspect-[5/4] rounded-[2.5rem] overflow-hidden grayscale-[0.2] hover:grayscale-0 transition-all duration-700">
                     <Image src="/hero-image.png" alt="Library Infrastructure" fill className="object-cover transform hover:scale-110 transition-transform duration-1000" />
                   </div>
                </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-8 py-24 space-y-32">
          
          {/* Services Grid */}
          <section id="membership" className="scroll-mt-48">
            <h3 className="gov-heading">Membership Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="gov-card">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-6">🛡️</div>
                <h4 className="text-lg font-bold text-zinc-900 mb-3 uppercase tracking-tight">ID Verification</h4>
                <p className="text-sm text-zinc-500 font-medium italic">Aadhaar and Address check are required for all new library memberships.</p>
              </div>
              <div className="gov-card gov-card-maroon">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-2xl mb-6">💰</div>
                <h4 className="text-lg font-bold text-zinc-900 mb-3 uppercase tracking-tight">Membership Fees</h4>
                <p className="text-sm text-zinc-500 font-medium italic">Standard membership fee is ₹10.00 per year for local residents. Life membership is also available.</p>
              </div>
              <div className="gov-card gov-card-green">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl mb-6">📗</div>
                <h4 className="text-lg font-bold text-zinc-900 mb-3 uppercase tracking-tight">Borrowing Rules</h4>
                <p className="text-sm text-zinc-500 font-medium italic">You can borrow books for 14 days. Please return them on time to avoid late fees.</p>
              </div>
            </div>
          </section>

          {/* District Impact */}
          {testimonials.length > 0 && (
            <section>
              <h3 className="gov-heading gov-card-orange">Citizen Feedback</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {testimonials.slice(0, 4).map((t: any) => (
                  <div key={t._id} className="p-8 border border-zinc-100 bg-zinc-50 rounded-2xl space-y-4">
                    <p className="text-xs font-bold text-zinc-700 italic">"{t.message}"</p>
                    <div className="pt-4 border-t border-zinc-200">
                      <p className="text-[10px] font-black text-zinc-900 uppercase">{t.user?.name}</p>
                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Library Member</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact Section */}
          <section id="contact" className="scroll-mt-48">
            <div className="gov-card-maroon grid grid-cols-1 lg:grid-cols-2 border border-zinc-200 rounded-[2rem] overflow-hidden shadow-xl bg-white">
               <div className="h-[400px] bg-zinc-100 relative group">
                  <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=District+Central+Library,Tirunelveli', '_blank')} />
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3943.834604924765!2d77.72895287586523!3d8.711956593503254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ab06e756080b03d%3A0x6b77c688e7d7a5b3!2sDistrict%20Central%20Library!5e0!3m2!1sen!2sin!4v1711440000000!5m2!1sen!2sin"
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy"
                    className="grayscale-[0.4] group-hover:grayscale-0 transition-grayscale duration-700 pointer-events-none"
                  />
               </div>
               <div className="p-12 space-y-10">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase">Library Location</h3>
                    <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest italic">Tirunelveli District Headquarters</p>
                  </div>
                    <div className="space-y-6">
                    <div className="flex gap-4">
                      <span className="text-xl">🏛️</span>
                      <div>
                        <p className="text-[10px] font-black text-[#3F51B5] uppercase">Address</p>
                        <p className="text-sm font-bold text-zinc-700">District Central Library, Palayamkottai, Tirunelveli - 627002</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex gap-4">
                        <span className="text-xl">📞</span>
                        <div>
                          <p className="text-[10px] font-black text-[#3F51B5] uppercase">Phone</p>
                          <p className="text-sm font-bold text-zinc-700">0462-2561712</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-xl">🕒</span>
                        <div>
                          <p className="text-[10px] font-black text-[#3F51B5] uppercase">Library Hours</p>
                          <p className="text-sm font-bold text-zinc-700">08:00 AM - 08:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </section>
        </div>
      </main>

      {/* Official Footer */}
      <footer className="bg-[#1A237E] text-white pt-20 pb-12 px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            <div className="col-span-1 lg:col-span-2 space-y-6">
               <div className="flex items-center gap-5 brightness-0 invert opacity-80">
                  <Image src="/tn-logo.png" alt="TN Govt" width={60} height={60} />
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-lg leading-none">Government of Tamil Nadu</h4>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-60">School Education Department</p>
                  </div>
               </div>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed font-medium mt-6">
                 Official website for the District Library Office, Tirunelveli. 
                 Open and accessible to all citizens since 1952.
                </p>
            </div>
            
            <div className="space-y-6">
               <h5 className="text-[10px] font-black text-[#F39C12] uppercase tracking-[0.3em]">Quick Links</h5>
               <ul className="space-y-3 text-xs font-bold text-zinc-400">
                  <li><a href="#" className="hover:text-white transition-colors">Apply for Membership</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Book Search (OPAC)</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Resource Archive</a></li>
               </ul>
            </div>

            <div className="space-y-6">
               <h5 className="text-[10px] font-black text-[#F39C12] uppercase tracking-[0.3em]">Useful Links</h5>
               <ul className="space-y-3 text-xs font-bold text-zinc-400">
                  <li><a href="#" className="hover:text-white transition-colors">DPL Tamil Nadu</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">National Virtual Library</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Public Holiday List</a></li>
               </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              © 2026 Local Library Authority, Tirunelveli. Official Portal.
            </p>
             <div className="flex gap-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Accessibility</a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
