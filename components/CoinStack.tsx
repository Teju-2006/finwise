import { motion } from "framer-motion";
import React from "react";

interface CoinStackProps {
  coins: number; // The actual number of coins
}

const CoinStack: React.FC<CoinStackProps> = ({ coins }) => {
  // Determine how many visual coins to render based on the actual coin count.
  // Using a simple scaling factor, e.g., 1 visual coin for every 10 actual coins,
  // up to a maximum number of visual coins to avoid clutter.
  const maxVisualCoins = 10;
  const visualCoinCount = Math.min(maxVisualCoins, Math.floor(coins / 10));

  const coinElements = Array.from({ length: visualCoinCount }).map((_, i) => (
    <motion.div
      key={i}
      className="w-6 h-6 rounded-full bg-gradient-to-t from-yellow-400 to-amber-500 shadow-md border border-yellow-600"
      initial={{ y: 20, opacity: 0, scale: 0.5 }}
      animate={{ y: [0, -4, 0], opacity: 1, scale: 1 }}
      transition={{
        duration: 1.5,
        delay: i * 0.1 + 0.5, // Staggered entry + continuous animation delay
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    />
  ));

  return (
    <div className="flex items-end justify-center gap-1 h-32 py-2">
      {coinElements.length > 0 ? coinElements : (
        <p className="text-gray-400 text-sm italic">No coins yet!</p>
      )}
    </div>
  );
};

export default CoinStack;
