'use client';

import React, { useState, useRef, useCallback } from 'react';

interface VirtualTourProps {
  propertyTitle: string;
  photos: string[];
  onClose: () => void;
}

export default function VirtualTour({ propertyTitle, photos, onClose }: VirtualTourProps) {
  const [angle, setAngle] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const rooms = [
    { name: 'Living Room', color: '#6366F1', furniture: ['sofa', 'table', 'tv'] },
    { name: 'Bedroom', color: '#F59E0B', furniture: ['bed', 'wardrobe', 'lamp'] },
    { name: 'Kitchen', color: '#10B981', furniture: ['counter', 'fridge', 'stove'] },
    { name: 'Bathroom', color: '#06B6D4', furniture: ['tub', 'sink', 'mirror'] },
  ];

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setAngle((prev) => prev - dx * 0.4);
    setTilt((prev) => Math.max(-30, Math.min(30, prev + dy * 0.3)));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, [isDragging]);

  const handlePointerUp = useCallback(() => setIsDragging(false), []);

  const switchRoom = (index: number) => {
    if (index === currentRoom || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentRoom(index);
      setAngle(0);
      setTilt(0);
      setIsTransitioning(false);
    }, 400);
  };

  const room = rooms[currentRoom];

  return (
    <div className="fixed inset-0 z-[3000] bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-800">
        <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold text-white">360° Virtual Tour</h2>
          <p className="text-[10px] text-white/50">{propertyTitle}</p>
        </div>
        <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </button>
      </div>

      {/* 360 Panoramic View */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ perspective: '600px' }}
      >
        <div className={`absolute inset-0 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {/* Panoramic walls */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${angle}deg) rotateX(${tilt}deg)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            {/* 4 walls forming a panorama */}
            {[0, 90, 180, 270].map((wallAngle, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  width: '100vw',
                  height: '100%',
                  transform: `rotateY(${wallAngle}deg) translateZ(min(50vw, 400px))`,
                  transformOrigin: 'center center',
                }}
              >
                {/* Wall background */}
                <div className="w-full h-full" style={{
                  background: `linear-gradient(180deg, ${room.color}15 0%, ${room.color}08 40%, ${room.color}15 100%)`,
                }}>
                  {/* Wall texture */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, ${room.color}20 40px, ${room.color}20 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, ${room.color}20 40px, ${room.color}20 41px)`,
                  }} />

                  {/* Wall decorations based on room */}
                  {i === 0 && (
                    <>
                      {/* Window */}
                      <div className="absolute top-[15%] left-[25%] w-[50%] h-[40%] rounded-lg overflow-hidden" style={{
                        background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 60%, #E8F4FD 100%)',
                        boxShadow: 'inset 0 0 30px rgba(135,206,235,0.3), 0 4px 20px rgba(0,0,0,0.2)',
                        border: '6px solid #B8B0A8',
                      }}>
                        <div className="absolute left-1/2 top-0 w-1 h-full bg-[#B8B0A8] -translate-x-1/2" />
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-[#B8B0A8] -translate-y-1/2" />
                        {/* Curtain */}
                        <div className="absolute top-0 left-0 w-[20%] h-full bg-gradient-to-r from-white/40 to-transparent" />
                        <div className="absolute top-0 right-0 w-[20%] h-full bg-gradient-to-l from-white/40 to-transparent" />
                      </div>
                      {/* Painting */}
                      <div className="absolute top-[18%] right-[10%] w-[15%] h-[22%] rounded" style={{
                        background: 'linear-gradient(135deg, #F59E0B, #EF4444, #8B5CF6)',
                        border: '4px solid #8B7355',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }} />
                    </>
                  )}
                  {i === 1 && (
                    <>
                      {/* Bookshelf */}
                      <div className="absolute top-[10%] left-[10%] w-[80%] h-[70%] rounded-lg" style={{
                        background: 'linear-gradient(180deg, #8B7355, #6B5B45)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                      }}>
                        {[0, 1, 2, 3].map((row) => (
                          <div key={row} className="absolute w-full" style={{ top: `${row * 25}%` }}>
                            <div className="w-full h-1 bg-[#6B5B45]" />
                            <div className="flex gap-1 px-3 pt-2">
                              {[0, 1, 2, 3, 4, 5].map((book) => (
                                <div key={book} className="rounded-sm" style={{
                                  width: 8 + Math.random() * 4,
                                  height: 20 + Math.random() * 10,
                                  background: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][book],
                                }} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {i === 2 && (
                    <>
                      {/* Door */}
                      <div className="absolute top-[10%] left-[35%] w-[30%] h-[80%] rounded-t-lg" style={{
                        background: 'linear-gradient(180deg, #A0845C, #8B7355)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                      }}>
                        <div className="absolute right-[15%] top-[45%] w-3 h-3 rounded-full bg-[#D4A853] shadow-lg" />
                      </div>
                    </>
                  )}
                  {i === 3 && (
                    <>
                      {/* Mirror */}
                      <div className="absolute top-[12%] left-[25%] w-[50%] h-[45%] rounded-xl" style={{
                        background: 'linear-gradient(135deg, #E8F4FD, #B0E0E6, #87CEEB)',
                        border: '6px solid #8B7355',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 0 30px rgba(255,255,255,0.3)',
                      }} />
                      {/* Console table */}
                      <div className="absolute bottom-[15%] left-[15%] w-[70%] h-[8%] rounded" style={{
                        background: 'linear-gradient(180deg, #8B7355, #6B5B45)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }} />
                    </>
                  )}

                  {/* Floor */}
                  <div className="absolute bottom-0 left-0 right-0 h-[30%]" style={{
                    background: `linear-gradient(180deg, ${room.color}08, ${room.color}15)`,
                    borderTop: `2px solid ${room.color}20`,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Ceiling light glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center top, rgba(255,255,255,0.06) 0%, transparent 70%)',
          }} />
        </div>

        {/* Compass indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-white text-[10px] font-semibold">{Math.round(((angle % 360) + 360) % 360)}°</span>
        </div>

        {/* Drag hint */}
        {!isDragging && Math.abs(angle) < 5 && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 animate-pulse">
            <p className="text-white/80 text-xs font-medium">👆 Drag to look around</p>
          </div>
        )}
      </div>

      {/* Room selector */}
      <div className="bg-zinc-900/90 backdrop-blur-sm border-t border-zinc-800 px-5 py-4">
        <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider mb-3">Rooms</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {rooms.map((r, i) => (
            <button
              key={i}
              onClick={() => switchRoom(i)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                currentRoom === i
                  ? 'text-white shadow-lg'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
              style={currentRoom === i ? { background: r.color, boxShadow: `0 4px 16px ${r.color}40` } : {}}
            >
              {r.name}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-white/30 mt-2 text-center">Current: {room.name}</p>
      </div>
    </div>
  );
}
