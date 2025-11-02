import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CursorPosition {
  x: number;
  y: number;
}

const CursorEffect: React.FC = () => {
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [trail, setTrail] = useState<CursorPosition[]>([]);

  useEffect(() => {
    const updateCursorPosition = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      setTrail((prevTrail) => {
        const newTrail = [...prevTrail, { x: e.clientX, y: e.clientY }];
        // Keep trail length to a manageable number (e.g., 5-10 elements)
        return newTrail.slice(Math.max(newTrail.length - 8, 0));
      });
    };

    window.addEventListener('mousemove', updateCursorPosition);

    return () => {
      window.removeEventListener('mousemove', updateCursorPosition);
    };
  }, []);

  return (
    <>
      {trail.map((pos, index) => (
        <motion.div
          key={index}
          className="fixed pointer-events-none z-[9999] rounded-full"
          style={{
            left: pos.x,
            top: pos.y,
            width: 10 + index * 0.5, // Make tail slightly larger
            height: 10 + index * 0.5,
            background: 'radial-gradient(circle, rgba(255,223,0,1) 0%, rgba(255,165,0,0.8) 70%, rgba(255,255,255,0) 100%)', // Golden glow
            filter: 'blur(3px)',
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ opacity: 0.5, scale: 0.5 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }} // Each trail element fades out quickly
        />
      ))}
       {/* Main cursor dot */}
      <motion.div
        className="fixed pointer-events-none z-[10000] rounded-full"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          width: 15,
          height: 15,
          background: 'radial-gradient(circle, rgba(255,223,0,1) 0%, rgba(255,165,0,0.8) 70%, rgba(255,255,255,0.2) 100%)',
          filter: 'blur(2px)',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
};

export default CursorEffect;
