"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface NeuralNode {
  id: string;
  label: string;
  type: "meeting" | "decision" | "project" | "document" | "knowledge" | "conversation" | "person" | "task" | "calendar" | "email";
  x: number;
  y: number;
  radius: number;
  color: string;
  pulseSpeed: number;
}

const NODE_TYPES = {
  meeting: { color: "#3B82F6", label: "Meetings" },
  decision: { color: "#10B981", label: "Decisions" },
  project: { color: "#8B5CF6", label: "Projects" },
  document: { color: "#F59E0B", label: "Documents" },
  knowledge: { color: "#06B6D4", label: "Knowledge" },
  conversation: { color: "#EC4899", label: "Conversations" },
  person: { color: "#6366F1", label: "People" },
  task: { color: "#F97316", label: "Tasks" },
  calendar: { color: "#14B8A6", label: "Calendar" },
  email: { color: "#E11D48", label: "Emails" },
};

function generateNodes(seed: number): NeuralNode[] {
  const types = Object.keys(NODE_TYPES) as NeuralNode["type"][];
  const r = (s: number) => {
    const x = Math.sin(s * 127.1 + seed) * 1000;
    return x - Math.floor(x);
  };

  return types.map((type, i) => {
    const angle = (i / types.length) * Math.PI * 2 + r(i * 7) * 0.3;
    const dist = 100 + r(i * 13) * 80;
    return {
      id: type,
      label: NODE_TYPES[type].label,
      type,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      radius: 6 + r(i * 17) * 4,
      color: NODE_TYPES[type].color,
      pulseSpeed: 2 + r(i * 23) * 2,
    };
  });
}

function NeuralNode({ node, index }: { node: NeuralNode; index: number }) {
  return (
    <g>
      {/* Node glow */}
      <motion.circle
        cx={node.x}
        cy={node.y}
        r={node.radius + 6}
        fill={node.color}
        opacity={0.12}
        animate={{
          r: [node.radius + 6, node.radius + 12, node.radius + 6],
          opacity: [0.12, 0.06, 0.12],
        }}
        transition={{ duration: node.pulseSpeed, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Node dot */}
      <motion.circle
        cx={node.x}
        cy={node.y}
        r={node.radius}
        fill={node.color}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05, type: "spring" }}
      />
      {/* Node label */}
      <motion.text
        x={node.x}
        y={node.y + node.radius + 14}
        textAnchor="middle"
        className="text-[9px] fill-gray-500 font-medium"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 + 0.2 }}
      >
        {node.label}
      </motion.text>
    </g>
  );
}

function ConnectionLine({
  from,
  to,
  color,
  delay,
  animated = true,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  delay: number;
  animated?: boolean;
}) {
  return (
    <motion.line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={color}
      strokeWidth={1}
      strokeOpacity={0.15}
      initial={animated ? { pathLength: 0 } : undefined}
      whileInView={animated ? { pathLength: 1 } : undefined}
      viewport={animated ? { once: true } : undefined}
      transition={animated ? { duration: 1, delay, ease: "easeInOut" } : undefined}
    />
  );
}

function FloatingParticle({ index }: { index: number }) {
  const seed = useMemo(() => index * 137.5, [index]);
  const startX = Math.cos(seed) * Math.random() * 180;
  const startY = Math.sin(seed * 1.3) * Math.random() * 180;
  const endX = Math.cos(seed + 2) * Math.random() * 180;
  const endY = Math.sin(seed * 1.3 + 2) * Math.random() * 180;
  const colors = ["#3B82F6", "#8B5CF6", "#10B981", "#06B6D4", "#6366F1"];

  return (
    <motion.circle
      r={1 + Math.random() * 1.5}
      fill={colors[index % colors.length]}
      initial={{ opacity: 0 }}
      animate={{
        cx: [startX, endX, startX],
        cy: [startY, endY, startY],
        opacity: [0, 0.5, 0],
      }}
      transition={{
        duration: 4 + Math.random() * 3,
        repeat: Infinity,
        delay: Math.random() * 3,
        ease: "easeInOut",
      }}
    />
  );
}

export default function CompanyBrain() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes = useMemo(() => generateNodes(42), []);
  const connections = useMemo(() => {
    const conns: { from: number; to: number }[] = [];
    // Create a connected graph
    for (let i = 0; i < nodes.length; i++) {
      // Connect to next nodes
      for (let j = 1; j <= 3; j++) {
        const target = (i + j) % nodes.length;
        if (!conns.some((c) => (c.from === i && c.to === target) || (c.from === target && c.to === i))) {
          conns.push({ from: i, to: target });
        }
      }
      // Connect some random pairs
      if (i % 2 === 0) {
        const random = Math.floor(Math.abs(Math.sin(i * 73.7)) * nodes.length);
        if (random !== i && !conns.some((c) => (c.from === i && c.to === random) || (c.from === random && c.to === i))) {
          conns.push({ from: i, to: random });
        }
      }
    }
    return conns;
  }, [nodes]);

  return (
    <section className="relative py-24 lg:py-32 px-6 lg:px-12 overflow-hidden" id="company-brain"
      style={{ background: "#FAFAFA" }}
    >
      {/* Cinematic background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] opacity-25"
          style={{
            background: "radial-gradient(ellipse at 20% 15%, rgba(255,255,255,0.4) 0%, rgba(191,219,254,0.12) 30%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, rgba(191,219,254,0.25) 0%, transparent 70%)" }}
        />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, rgba(221,214,254,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-soft" />
            <span className="text-[12px] font-semibold text-blue-600 tracking-wide">
              Company Brain
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-[36px] sm:text-[44px] lg:text-[52px] font-bold tracking-[-0.035em] leading-[1.1] text-gray-900"
          >
            Your company&apos;s living
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-violet-500 to-blue-500 bg-clip-text text-transparent">
              knowledge ecosystem.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-[16px] text-gray-500 max-w-xl mx-auto"
          >
            Every meeting, decision, project, and conversation connects into a
            living knowledge graph that grows smarter over time.
          </motion.p>
        </div>

        {/* Brain Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-[600px] mx-auto"
        >
          {/* Large glass container */}
          <div className="relative aspect-square bg-white/60 backdrop-blur-2xl border border-white/50 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.04)] overflow-hidden premium-card">
            {/* Subtle inner gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-violet-50/30 pointer-events-none" />

            {/* SVG Knowledge Graph */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="-250 -250 500 500"
              onMouseLeave={() => setHoveredNode(null)}
            >
              <defs>
                <radialGradient id="coreGlowNew" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="40%" stopColor="#3B82F6" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </radialGradient>
                <filter id="glowFilter">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>

              {/* Core glow */}
              <circle r="140" fill="url(#coreGlowNew)">
                <animate attributeName="r" values="120;160;120" dur="6s" repeatCount="indefinite" />
              </circle>

              {/* Orbital rings */}
              {[80, 120, 170, 220].map((r, i) => (
                <circle
                  key={i}
                  r={r}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="0.5"
                  strokeOpacity={0.06 + i * 0.02}
                  strokeDasharray={i % 2 === 0 ? "none" : "8 6"}
                  transform={`rotate(${i * 22})`}
                />
              ))}

              {/* Rotating outer ring */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0"
                  to="360"
                  dur="60s"
                  repeatCount="indefinite"
                />
                <circle r="190" fill="none" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.08"
                  strokeDasharray="4 8" />
              </g>

              {/* Connection lines */}
              {connections.map((conn, i) => (
                <ConnectionLine
                  key={i}
                  from={nodes[conn.from]}
                  to={nodes[conn.to]}
                  color={
                    hoveredNode === nodes[conn.from].id || hoveredNode === nodes[conn.to].id
                      ? nodes[conn.from].color
                      : "#3B82F6"
                  }
                  delay={i * 0.02}
                />
              ))}

              {/* Particles floating through the network */}
              {Array.from({ length: 20 }).map((_, i) => (
                <FloatingParticle key={i} index={i} />
              ))}

              {/* Nodes */}
              {nodes.map((node, i) => (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  className="cursor-pointer"
                >
                  <NeuralNode node={node} index={i} />
                </g>
              ))}

              {/* Center AI Core */}
              <g transform="translate(0, 0)">
                {/* Pulsing glow */}
                <circle r="30" fill="#3B82F6" opacity="0.08" filter="url(#glowFilter)">
                  <animate
                    attributeName="r"
                    values="25;35;25"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.08;0.15;0.08"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="20" fill="#3B82F6" opacity="0.12">
                  <animate
                    attributeName="r"
                    values="18;24;18"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Core icon */}
                <circle r="14" fill="url(#logoGrad)" />
                <circle r="14" fill="white" opacity="0.15" />
                <text
                  textAnchor="middle"
                  dy="4"
                  className="text-[11px] fill-white font-bold"
                >
                  AI
                </text>
              </g>
            </svg>
          </div>

          {/* Stats bar below */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-8 sm:gap-12 mt-6"
          >
            {[
              { label: "Meetings", value: "2,847" },
              { label: "Decisions", value: "12,431" },
              { label: "Connections", value: "89K" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <motion.p
                  className="text-[20px] sm:text-[22px] font-bold tracking-[-0.02em] text-gray-900"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-[12px] text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
