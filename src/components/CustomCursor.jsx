import React, { useState, useEffect } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="custom-cursor"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        width: isPointer ? '40px' : '20px',
        height: isPointer ? '40px' : '20px',
        background: isPointer ? 'radial-gradient(circle, var(--neon-purple) 0%, transparent 70%)' : 'radial-gradient(circle, var(--bright-cyan) 0%, transparent 70%)',
        boxShadow: isPointer ? '0 0 20px var(--glow-purple)' : '0 0 20px var(--glow-cyan)'
      }}
    />
  );
};

export default CustomCursor;
