import React, { useEffect, useRef } from 'react';
import AuthSection from '../context/AuthSection';
import { BookOpen, Sparkles, PenTool, Image as ImageIcon, Zap, User } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Import New Premium Components
import CursorGlow from '../components/CursorGlow';
import ParticleBackground from '../components/ParticleBackground';
import FloatingCharacter from '../components/FloatingCharacter';
import FadeInSection from '../components/FadeInSection';

/* =================================================================
   COMPONENTS
================================================================= */
const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgba(139,92,246,0.1)] hover:shadow-[0_15px_40px_rgba(139,92,246,0.15)] transition-all duration-500 ${className}`}>
    {children}
  </div>
);

/* =================================================================
   NAVBAR
================================================================= */
const LandingNavbar = () => {
  const navItems = [
    { label: "Features", target: "features" },
    { label: "How it Works", target: "how-it-works" },
  ];

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-[999] bg-white/10 backdrop-blur-3xl border-b border-white/20 shadow-[0_20px_50px_rgba(168,85,247,0.08)]"
    >
      <div className="relative max-w-7xl mx-auto px-6 h-20 flex items-center justify-between text-slate-900">
        <div className="flex items-center gap-3 text-2xl font-black text-slate-900">
          <BookOpen className="text-purple-500" size={28} />
          <span className="text-slate-900">
            Story<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">Verse AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-900">
          {navItems.map((item) => (
            <button
              key={item.target}
              onClick={() => document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' })}
              className="text-slate-900 hover:text-purple-600 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-medium rounded-full border border-white/70 bg-white/80 px-4 py-2 text-slate-900 hover:bg-white transition"
          >
            Login
          </button>

          <button
            onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition"
          >
            Sign Up
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

/* =================================================================
   HERO SECTION
================================================================= */
const HeroSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const yOffset = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const textScale = useTransform(scrollYProgress, [0, 0.8], [1, 20]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section ref={containerRef} className="relative min-h-[90vh] flex items-center justify-center bg-transparent overflow-hidden leading-none z-10 pt-24 pb-12">
        
        <div className="absolute inset-0 z-0 scale-110 pointer-events-none">
           {/* Replaced by global background, leaving just the color glows for the hero section */}
        </div>
        
        {/* Dedicated container to hide overflow ONLY for the massive scaling text so it doesn't break page width */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 w-full h-full">
           <motion.div 
              style={{ scale: textScale, opacity: useTransform(scrollYProgress, [0, 0.4], [0.25, 0]) }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
           >
              <h1 
                 className="text-[14vw] font-black uppercase whitespace-nowrap tracking-tighter text-indigo-900"
                 style={{
                    textShadow: '0 0 40px rgba(168, 85, 247, 0.8), 0 0 80px rgba(236, 72, 153, 0.5)'
                 }}
              >
                 STORYVERSE
              </h1>
           </motion.div>
        </div>

        <motion.div 
           style={{ opacity, y: yOffset }}
           className="relative z-20 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full"
        >
          {/* LEFT: Text Content */}
          <div className="space-y-8 max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-200 bg-white/60 backdrop-blur-md shadow-sm">
              <Sparkles size={14} className="text-purple-500" />
              <span className="text-xs font-bold tracking-widest uppercase text-purple-700">
                For Readers. For Creators. For Dreamers.
              </span>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-slate-800 drop-shadow-sm"
            >
               Read.<br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 drop-shadow-md">Visualize.</span><br />
               Create.
            </motion.h1>
            
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-md">
              Dive into an infinite library of beautifully illustrated visual novels, or build your own world.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
                <button
                onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-white/80 text-purple-600 border border-purple-200 font-bold rounded-full shadow-[0_8px_25px_rgba(139,92,246,0.1)] flex items-center justify-center gap-2 text-sm uppercase tracking-wide backdrop-blur-md"
              >
                Explore Worlds <BookOpen size={18} />
              </button>
              <button
                onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-full shadow-[0_8px_25px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
              >
                Start Creating <PenTool size={18} />
              </button>
            </div>
          </div>

          {/* RIGHT: Floating Anime Character Premium Component */}
          <div className="relative flex justify-center items-center h-[50vh] lg:h-[80vh] w-full mt-10 lg:mt-0">
             <FloatingCharacter />
          </div>
        </motion.div>
    </section>
  );
};

/* =================================================================
   FEATURES (Horizontal Scroll Track over Light Pastel Glass)
================================================================= */
const FeatureCardHoriz = ({ icon, title, description }) => (
  <div className="w-[85vw] md:w-[35vw] h-[55vh] flex-shrink-0 mx-4">
     <GlassCard className="h-full p-10 flex flex-col justify-center group overflow-hidden">
       <div className="absolute -inset-2 bg-gradient-to-br from-purple-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2rem]"></div>
       
       <div className="w-16 h-16 rounded-2xl bg-white/70 border border-white flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform text-indigo-600 relative z-10">
         {icon}
       </div>
       <h3 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight relative z-10">{title}</h3>
       <p className="text-lg text-slate-600 leading-relaxed font-medium relative z-10">
         {description}
       </p>
     </GlassCard>
  </div>
);

const HorizontalFeatures = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["5%", "-65%"]);

  const featureItems = [
    { icon: <BookOpen size={30} />, title: "Immersive Reading", description: "Lose yourself in an endless library of interactive, beautifully illustrated light novels and manga crafted by our community." },
    { icon: <ImageIcon size={30} />, title: "AI Creator Studio", description: "Write your own masterpiece. Generate breathtaking anime-style background art and character portraits directly from text." },
    { icon: <Zap size={30} />, title: "Thriving Community", description: "Support your favorite authors, build a dedicated fanbase, and monetize your serialized novels natively." }
  ];

  return (
    <section ref={targetRef} id="features" className="relative h-[300vh] bg-transparent z-10 scroll-mt-24">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        
          <div className="absolute top-24 left-10 md:left-20 z-10">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 drop-shadow-sm font-serif">Two Worlds, One Platform</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-purple-400 to-indigo-400 mt-4 rounded-full"></div>
          </div>

        <motion.div style={{ x }} className="flex mt-20 items-center">
          {featureItems.map((item, idx) => (
            <div key={idx} className="w-[85vw] md:w-[35vw] h-[55vh] flex-shrink-0 mx-4">
              <FeatureCardHoriz icon={item.icon} title={item.title} description={item.description} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* =================================================================
   HOW IT WORKS (Sticky Progress + Magic Grimoire Image)
================================================================= */
const HowItWorksSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start center", "end end"] });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
     <section ref={containerRef} id="how-it-works" className="relative h-[250vh] bg-transparent z-10 scroll-mt-24">
        <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row items-center justify-center overflow-hidden max-w-7xl mx-auto px-6">
           
           <div className="w-full md:w-1/2 flex items-center h-full relative z-10">
              <div className="space-y-16 pl-4 md:pl-10">
                 <FadeInSection>
                   <p className="text-purple-600 font-bold tracking-widest uppercase text-sm mb-2 mt-4 md:mt-0">For Creators</p>
                   <h2 className="text-5xl font-black font-serif tracking-tight mb-2 text-slate-800">Your Web<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">Studio</span></h2>
                   <p className="text-slate-500 text-lg max-w-sm drop-shadow-sm">No massive art teams required. Build branching narratives and monetize beautifully.</p>
                 </FadeInSection>

                 <div className="relative">
                    <motion.div style={{ scaleY: scrollYProgress, transformOrigin: 'top' }} className="absolute left-[19px] top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full z-0" />
                    <div className="absolute left-[19px] top-0 bottom-0 w-1 bg-white/50 rounded-full z-0"></div>

                    {[ 
                       { step: 1, title: 'Write your manuscript', desc: 'Draft your chapters block by block.', op: [0, 0.2] },
                       { step: 2, title: 'Generate the art', desc: 'Highlight scenes to summon breathtaking illustrations.', op: [0.3, 0.5] },
                       { step: 3, title: 'Publish to the world', desc: 'Gain followers and monetize your worlds natively.', op: [0.6, 0.8] }
                    ].map((item, idx) => (
                       <div key={idx} className="relative z-10 flex items-start gap-8 mb-12">
                          <div className="w-10 h-10 rounded-full bg-white border border-purple-200 flex items-center justify-center text-purple-600 font-bold shadow-[0_4px_15px_rgba(139,92,246,0.2)]">{item.step}</div>
                          <motion.div style={{ opacity: useTransform(scrollYProgress, item.op, [0.3, 1]) }}>
                             <h3 className="text-2xl font-bold mb-2 text-slate-800">{item.title}</h3>
                             <p className="text-slate-500 font-medium">{item.desc}</p>
                          </motion.div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="w-full md:w-1/2 flex justify-center items-center h-full relative z-10">
              <motion.div 
                 style={{ y: useTransform(scrollYProgress, [0, 1], [50, -50]) }}
                 className="relative w-full max-w-md aspect-square rounded-[2.5rem] overflow-hidden border-4 border-white/60 shadow-[0_20px_50px_rgba(139,92,246,0.2)] bg-white"
              >
                 <motion.div style={{ scale: imgScale, transformOrigin: 'center' }} className="w-full h-full bg-white">
                    <img src="/web-studio-2.jpg" alt="Glowing Web Studio" className="w-full h-full object-cover" />
                    {/* Add a soft white vignette for blending the Web Studio inside the border */}
                    <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(255,255,255,1)] pointer-events-none rounded-[2.5rem]"></div>
                 </motion.div>
                 <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent opacity-80 mix-blend-overlay"></div>
                 <div className="absolute bottom-6 left-6 right-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-sm">
                       <Sparkles size={14} className="text-purple-600" />
                       <span className="text-[10px] text-purple-800 font-bold tracking-widest uppercase">Generated by StoryVerse AI</span>
                    </div>
                 </div>
              </motion.div>
           </div>

        </div>
     </section>
  )
}

/* =================================================================
   AUTH SECTION (Light Glassmorphism)
================================================================= */


/* =================================================================
   MAIN PAGE
================================================================= */
const LandingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#FAF8FC] selection:bg-purple-200 selection:text-purple-900 font-sans antialiased relative">
      {/* Premium Magical Enhancements */}
      <CursorGlow />
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Global Cinematic Fairy Castle Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAF8FC]/70 via-[#F3EFFF]/60 to-[#EBF0FF]/70 backdrop-blur-[3px] z-10"></div>
        <img src="/hero-bg.png" alt="Global Fairy Castle Background" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-70 z-0" />
        
        {/* Global Uniform Purple Aura (Ambient Glows) */}
        <div className="absolute top-[-10vh] right-[-10vw] w-[60vw] h-[60vw] bg-fuchsia-300/30 rounded-full blur-[150px] mix-blend-multiply z-10"></div>
        <div className="absolute bottom-[-10vh] left-[-10vw] w-[60vw] h-[60vw] bg-purple-400/30 rounded-full blur-[150px] mix-blend-multiply z-10"></div>
        <div className="absolute top-[30vh] left-[40vw] w-[40vw] h-[40vw] bg-indigo-300/20 rounded-full blur-[150px] mix-blend-multiply z-10"></div>
        
        {/* Magical TS Particles Layer */}
        <div className="absolute inset-0 z-20">
           <ParticleBackground />
        </div>
      </div>
      
      <div className="relative z-10 w-full h-full">
         <LandingNavbar />
         <div className="h-20" />
         <HeroSection />
         <HorizontalFeatures />
         <HowItWorksSection />
         <AuthSection />
         
         <footer className="py-10 text-center text-slate-400 text-sm font-semibold border-t border-purple-100/50 bg-white/30 backdrop-blur-md">
            <p>© {new Date().getFullYear()} StoryVerse AI. Created with magic.</p>
         </footer>
      </div>
    </div>
  );
};

export default LandingPage;
