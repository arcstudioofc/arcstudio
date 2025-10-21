import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed select-none inset-0 z-[9999] flex items-center justify-center bg-background">
      <div className="flex space-x-6 text-6xl font-bold text-gray-700">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.span
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              y: { repeat: Infinity, repeatType: "loop", duration: 0.6, delay },
              opacity: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 0.6,
                delay,
              },
            }}
          >
            .
          </motion.span>
        ))}
      </div>
    </div>
  );
}
