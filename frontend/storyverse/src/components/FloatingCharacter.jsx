import { motion, useScroll, useTransform } from "framer-motion";

export default function FloatingCharacter() {
  const { scrollY } = useScroll();

  // parallax movement
  const y = useTransform(scrollY, [0, 500], [0, -120]);

  return (
    <motion.div
      style={{ y }}
      className="relative flex justify-center"
    >
      {/* glow */}
      <div className="absolute w-72 h-72 bg-purple-400 opacity-30 blur-3xl rounded-full"></div>

      {/* A stunning Glassmorphic Portrait Frame to hold the solid JPEG beautifully */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-80 md:w-[400px] lg:w-[480px] xl:w-[520px] aspect-[4/5] bg-white/20 backdrop-blur-xl p-3 md:p-4 rounded-[2.5rem] border border-white/50 shadow-[0_20px_50px_rgba(139,92,246,0.3)] shadow-purple-500/20 rotate-3 hover:rotate-0 transition-transform duration-500 ease-out"
      >
        <div className="w-full h-full rounded-[1.2rem] overflow-hidden relative shadow-inner">
           {/* Inner vignette so the image rests softly in the frame */}
           <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,255,255,0.7)] pointer-events-none z-10 rounded-[1.2rem]"></div>
           <img
              src="/floating-char.jpg"
              alt="Floating Character Portrait"
              className="w-full h-full object-cover"
           />
        </div>
      </motion.div>
    </motion.div>
  );
}
