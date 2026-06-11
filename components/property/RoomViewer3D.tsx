'use client';

import React, { useState, useRef, useEffect } from 'react';

interface RoomViewer3DProps {
  roomConfig?: string;
  photos?: string[];
  onClose: () => void;
}

export default function RoomViewer3D({ roomConfig = '2BHK', photos = [], onClose }: RoomViewer3DProps) {
  const [rotation, setRotation] = useState({ x: -25, y: -35 });
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto rotate
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const interval = setInterval(() => {
      setRotation((prev) => ({ ...prev, y: prev.y - 0.3 }));
    }, 16);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    lastMouse.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    setRotation((prev) => ({
      x: Math.max(-60, Math.min(10, prev.x + dy * 0.5)),
      y: prev.y + dx * 0.5,
    }));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => setIsDragging(false);

  const roomColors = {
    floor: '#E8DCC8',
    wall1: '#F5F0EB',
    wall2: '#EDE8E3',
    wall3: '#E5E0DB',
    wall4: '#DDD8D3',
  };

  const roomSize = roomConfig === '3BHK' ? 200 : roomConfig === '1BHK' ? 140 : 170;
  const wallH = 120;

  return (
    <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg px-6 py-4">
        <div>
          <h2 className="text-white font-bold text-lg">3D Room View</h2>
          <p className="text-white/60 text-xs">Drag to rotate • {roomConfig}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              autoRotate
                ? 'bg-indigo-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {autoRotate ? '⟳ Auto' : '⟳ Manual'}
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 3D Room */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center w-full overflow-hidden cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ perspective: '800px', perspectiveOrigin: '50% 40%' }}
      >
        <div
          style={{
            width: roomSize,
            height: roomSize,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {/* Floor */}
          <div
            style={{
              position: 'absolute',
              width: roomSize,
              height: roomSize,
              transform: `rotateX(90deg) translateZ(-${wallH / 2}px)`,
              background: `linear-gradient(135deg, ${roomColors.floor} 0%, #D4C9B5 100%)`,
              boxShadow: 'inset 0 0 60px rgba(0,0,0,0.1)',
              border: '1px solid #C4B9A5',
            }}
          >
            {/* Floor grid lines */}
            {[...Array(5)].map((_, i) => (
              <React.Fragment key={i}>
                <div style={{ position: 'absolute', left: `${(i + 1) * 20}%`, top: 0, width: 1, height: '100%', background: 'rgba(0,0,0,0.05)' }} />
                <div style={{ position: 'absolute', top: `${(i + 1) * 20}%`, left: 0, height: 1, width: '100%', background: 'rgba(0,0,0,0.05)' }} />
              </React.Fragment>
            ))}
            {/* Sofa */}
            <div style={{ position: 'absolute', bottom: '15%', left: '15%', width: '35%', height: '18%', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', borderRadius: 8, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
              <div style={{ position: 'absolute', top: -8, left: 0, right: 0, height: 8, background: '#5558E6', borderRadius: '8px 8px 0 0' }} />
            </div>
            {/* Coffee table */}
            <div style={{ position: 'absolute', top: '55%', left: '50%', width: '25%', height: '12%', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', borderRadius: 4, boxShadow: '0 2px 8px rgba(139,92,246,0.3)' }} />
            {/* Bed */}
            <div style={{ position: 'absolute', top: '15%', right: '10%', width: '30%', height: '28%', background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderRadius: 6, boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', background: 'white', borderRadius: '6px 6px 0 0', opacity: 0.9 }} />
            </div>
            {/* Rug */}
            <div style={{ position: 'absolute', top: '50%', left: '20%', width: '40%', height: '25%', background: 'linear-gradient(135deg, #EC4899, #BE185D)', borderRadius: '50%', opacity: 0.3 }} />
          </div>

          {/* Back wall */}
          <div
            style={{
              position: 'absolute',
              width: roomSize,
              height: wallH,
              transform: `translateZ(-${roomSize / 2}px) translateY(-${wallH / 2 - wallH}px)`,
              background: `linear-gradient(180deg, ${roomColors.wall1} 0%, #E8E3DE 100%)`,
              borderBottom: '3px solid #D4CFC8',
            }}
          >
            {/* Window */}
            <div style={{ position: 'absolute', top: '15%', left: '25%', width: '50%', height: '45%', background: 'linear-gradient(180deg, #87CEEB, #B0E0E6)', border: '4px solid #B8B0A8', borderRadius: 4, boxShadow: 'inset 0 0 20px rgba(135,206,235,0.3)' }}>
              <div style={{ position: 'absolute', left: '50%', top: 0, width: 4, height: '100%', background: '#B8B0A8', transform: 'translateX(-50%)' }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 4, background: '#B8B0A8', transform: 'translateY(-50%)' }} />
            </div>
            {/* Painting */}
            <div style={{ position: 'absolute', top: '20%', right: '8%', width: '12%', height: '20%', background: 'linear-gradient(135deg, #F59E0B, #EF4444)', border: '3px solid #8B7355', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
          </div>

          {/* Left wall */}
          <div
            style={{
              position: 'absolute',
              width: roomSize,
              height: wallH,
              transform: `rotateY(90deg) translateZ(-${roomSize / 2}px) translateY(-${wallH / 2 - wallH}px)`,
              transformOrigin: 'left center',
              background: `linear-gradient(180deg, ${roomColors.wall2} 0%, #E0DBD6 100%)`,
              borderBottom: '3px solid #D4CFC8',
            }}
          >
            {/* Shelf */}
            <div style={{ position: 'absolute', top: '25%', left: '20%', width: '60%', height: 4, background: '#8B7355', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
            <div style={{ position: 'absolute', top: '35%', left: '20%', width: '60%', height: 4, background: '#8B7355', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
            {/* Books */}
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ position: 'absolute', top: `${20 + i * 2}%`, left: `${22 + i * 8}%`, width: 8, height: 14, background: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][i], borderRadius: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
            ))}
          </div>

          {/* Right wall */}
          <div
            style={{
              position: 'absolute',
              width: roomSize,
              height: wallH,
              transform: `rotateY(-90deg) translateZ(-${roomSize / 2}px) translateY(-${wallH / 2 - wallH}px)`,
              transformOrigin: 'right center',
              background: `linear-gradient(180deg, ${roomColors.wall3} 0%, #D8D3CE 100%)`,
              borderBottom: '3px solid #D4CFC8',
            }}
          >
            {/* TV */}
            <div style={{ position: 'absolute', top: '18%', left: '20%', width: '60%', height: '35%', background: '#1E293B', borderRadius: 4, border: '3px solid #334155', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              <div style={{ position: 'absolute', inset: 4, background: 'linear-gradient(135deg, #1E3A5F, #0F172A)', borderRadius: 2 }}>
                {/* Screen content */}
                <div style={{ position: 'absolute', inset: 8, background: 'linear-gradient(135deg, #6366F1, #3B82F6, #06B6D4)', borderRadius: 2, opacity: 0.6 }} />
              </div>
            </div>
            {/* TV stand */}
            <div style={{ position: 'absolute', bottom: '30%', left: '25%', width: '50%', height: 6, background: '#8B7355', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
          </div>

          {/* Ceiling light */}
          <div
            style={{
              position: 'absolute',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
              transform: `rotateX(-90deg) translateZ(-${wallH}px) translateY(${roomSize / 2}px) translateX(${roomSize / 2 - 20}px)`,
              boxShadow: '0 0 60px 30px rgba(255,255,255,0.15)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FDE68A, #F59E0B)',
              transform: `rotateX(-90deg) translateZ(-${wallH + 1}px) translateY(${roomSize / 2 + 10}px) translateX(${roomSize / 2 - 10}px)`,
              boxShadow: '0 0 20px rgba(253,230,138,0.5)',
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-lg px-6 py-4 flex items-center justify-between">
        <div className="flex gap-2">
          {['Front', 'Top', 'Side'].map((view) => (
            <button
              key={view}
              onClick={() => {
                setAutoRotate(false);
                if (view === 'Front') setRotation({ x: 0, y: 0 });
                else if (view === 'Top') setRotation({ x: -60, y: 0 });
                else setRotation({ x: -15, y: -90 });
              }}
              className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-xs font-semibold hover:bg-white/20 transition-colors"
            >
              {view}
            </button>
          ))}
        </div>
        <p className="text-white/40 text-xs">Drag anywhere to rotate</p>
      </div>
    </div>
  );
}
