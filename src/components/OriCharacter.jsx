// src/components/OriCharacter.jsx
// Personaje terapéutico animado "Ori" — un búho cálido y sabio

import { useState, useEffect } from 'react';

const FACES = {
  neutral: `
    <ellipse cx="50" cy="55" rx="6" ry="5" fill="#2d1810"/>
    <ellipse cx="72" cy="55" rx="6" ry="5" fill="#2d1810"/>
    <ellipse cx="50" cy="53" rx="3" ry="2.5" fill="white" opacity="0.3"/>
    <ellipse cx="72" cy="53" rx="3" ry="2.5" fill="white" opacity="0.3"/>
    <!-- pico -->
    <path d="M55 62 Q61 70 67 62" fill="#e8a040" stroke="#c8822a" stroke-width="1"/>
  `,
  thinking: `
    <ellipse cx="48" cy="52" rx="7" ry="6" fill="#2d1810"/>
    <ellipse cx="72" cy="52" rx="7" ry="6" fill="#2d1810"/>
    <ellipse cx="48" cy="49" rx="3.5" ry="3" fill="white" opacity="0.3"/>
    <ellipse cx="72" cy="49" rx="3.5" ry="3" fill="white" opacity="0.3"/>
    <!-- ojo semi-cerrado pensando -->
    <path d="M41 52 Q48 47 55 52" fill="none" stroke="#2d1810" stroke-width="2"/>
    <path d="M65 52 Q72 47 79 52" fill="none" stroke="#2d1810" stroke-width="2"/>
    <!-- pico -->
    <path d="M55 62 Q61 70 67 62" fill="#e8a040" stroke="#c8822a" stroke-width="1"/>
  `,
  talking: `
    <ellipse cx="50" cy="55" rx="6" ry="5" fill="#2d1810"/>
    <ellipse cx="72" cy="55" rx="6" ry="5" fill="#2d1810"/>
    <ellipse cx="50" cy="53" rx="3" ry="2.5" fill="white" opacity="0.3"/>
    <ellipse cx="72" cy="53" rx="3" ry="2.5" fill="white" opacity="0.3"/>
    <!-- pico abierto -->
    <path d="M55 62 Q61 72 67 62" fill="#e8a040" stroke="#c8822a" stroke-width="1"/>
    <path d="M57 64 Q61 68 65 64" fill="#d97040" stroke="#c8822a" stroke-width="0.5"/>
  `,
  listening: `
    <ellipse cx="50" cy="55" rx="6" ry="5" fill="#2d1810"/>
    <ellipse cx="72" cy="55" rx="6" ry="5" fill="#2d1810"/>
    <ellipse cx="50" cy="53" rx="3" ry="2.5" fill="white" opacity="0.3"/>
    <ellipse cx="72" cy="53" rx="3" ry="2.5" fill="white" opacity="0.3"/>
    <!-- cejas levantadas (interés) -->
    <path d="M42 47 Q50 42 58 47" fill="none" stroke="#2d1810" stroke-width="2"/>
    <path d="M64 47 Q72 42 80 47" fill="none" stroke="#2d1810" stroke-width="2"/>
    <!-- pico sonrisa suave -->
    <path d="M55 63 Q61 69 67 63" fill="#e8a040" stroke="#c8822a" stroke-width="1"/>
  `,
};

export default function OriCharacter({ estado = 'neutral', tamaño = 'md' }) {
  const [animState, setAnimState] = useState('idle');
  const [face, setFace] = useState('neutral');

  useEffect(() => {
    // Ciclo de respiración suave
    const breathInterval = setInterval(() => {
      setAnimState(prev => prev === 'idle' ? 'breathe' : 'idle');
    }, 3000);

    return () => clearInterval(breathInterval);
  }, []);

  useEffect(() => {
    if (estado === 'talking') {
      // Parpadeo y movimiento de pico al hablar
      const talkInterval = setInterval(() => {
        setFace(prev => prev === 'talking' ? 'neutral' : 'talking');
      }, 600);
      return () => {
        clearInterval(talkInterval);
        setFace('neutral');
      };
    }

    if (estado === 'thinking') {
      setFace('thinking');
      return;
    }

    if (estado === 'listening') {
      setFace('listening');
      return;
    }

    setFace('neutral');
    return;
  }, [estado]);

  const tamaños = {
    sm: { w: 80, h: 90 },
    md: { w: 120, h: 140 },
    lg: { w: 160, h: 180 },
  };

  const { w, h } = tamaños[tamaño] || tamaños.md;

  const scale = w / 100;

  return (
    <div
      className={`relative inline-block transition-transform duration-300 ${
        animState === 'breathe' ? 'scale-105' : 'scale-100'
      }`}
      style={{ width: w, height: h }}
    >
      <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-md">
        <defs>
          {/* Gradiente del cuerpo */}
          <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f5e6d3"/>
            <stop offset="100%" stopColor="#e8d5c0"/>
          </radialGradient>
          {/* Gradiente de la bufanda */}
          <linearGradient id="scarfGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d9488"/>
            <stop offset="100%" stopColor="#0f766e"/>
          </linearGradient>
        </defs>

        {/* Alas laterales */}
        <g className={animState === 'breathe' ? 'animate-[wingWave_3s_ease-in-out_infinite]' : ''}>
          <path d="M12 55 Q5 45 8 35 Q12 30 18 38 Q15 45 18 52 Z" fill="#d4c4b0" opacity="0.7">
            <animate attributeName="d" 
              values="M12 55 Q5 45 8 35 Q12 30 18 38 Q15 45 18 52 Z;M10 55 Q3 48 6 38 Q10 33 16 40 Q13 47 16 54 Z;M12 55 Q5 45 8 35 Q12 30 18 38 Q15 45 18 52 Z" 
              dur="3s" repeatCount="indefinite"/>
          </path>
          <path d="M88 55 Q95 45 92 35 Q88 30 82 38 Q85 45 82 52 Z" fill="#d4c4b0" opacity="0.7">
            <animate attributeName="d" 
              values="M88 55 Q95 45 92 35 Q88 30 82 38 Q85 45 82 52 Z;M90 55 Q97 48 94 38 Q90 33 84 40 Q87 47 84 54 Z;M88 55 Q95 45 92 35 Q88 30 82 38 Q85 45 82 52 Z" 
              dur="3s" repeatCount="indefinite"/>
          </path>
        </g>

        {/* Cuerpo principal */}
        <ellipse cx="50" cy="60" rx="28" ry="25" fill="url(#bodyGrad)" stroke="#c8b8a4" strokeWidth="1"/>

        {/* Plumaje textura */}
        <path d="M30 52 Q40 48 50 52 Q60 48 70 52" fill="none" stroke="#d4c4b0" strokeWidth="0.8" opacity="0.5"/>
        <path d="M28 58 Q40 54 50 58 Q60 54 72 58" fill="none" stroke="#d4c4b0" strokeWidth="0.8" opacity="0.5"/>
        <path d="M30 64 Q40 60 50 64 Q60 60 70 64" fill="none" stroke="#d4c4b0" strokeWidth="0.8" opacity="0.5"/>

        {/* Vientre claro */}
        <ellipse cx="50" cy="62" rx="16" ry="14" fill="#faf0e6" opacity="0.6"/>

        {/* Cabeza */}
        <ellipse cx="50" cy="38" rx="22" ry="20" fill="#f5e6d3" stroke="#c8b8a4" strokeWidth="1"/>

        {/* Mechitas de plumas en cabeza */}
        <path d="M38 22 Q42 16 40 10" fill="none" stroke="#d4c4b0" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="d" 
            values="M38 22 Q42 16 40 10;M38 22 Q44 15 42 9;M38 22 Q42 16 40 10" 
            dur="4s" repeatCount="indefinite"/>
        </path>
        <path d="M50 18 Q52 12 50 6" fill="none" stroke="#d4c4b0" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="d" 
            values="M50 18 Q52 12 50 6;M50 18 Q54 11 52 5;M50 18 Q52 12 50 6" 
            dur="4s" repeatCount="indefinite"/>
        </path>
        <path d="M62 22 Q58 16 60 10" fill="none" stroke="#d4c4b0" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="d" 
            values="M62 22 Q58 16 60 10;M62 22 Q56 15 58 9;M62 22 Q58 16 60 10" 
            dur="4s" repeatCount="indefinite"/>
        </path>

        {/* Círculos ojos (manchas de búho) */}
        <circle cx="50" cy="38" r="20" fill="none" stroke="#c8b8a4" strokeWidth="1" opacity="0.3"/>

        {/* Cara — expresiones variables */}
        <g dangerouslySetInnerHTML={{ __html: FACES[face] || FACES.neutral }} />

        {/* Bufanda terapéutica */}
        <path d="M28 72 Q30 68 35 70 L50 75 L65 70 Q70 68 72 72 Q70 78 60 78 Q55 80 50 82 Q45 80 40 78 Q30 78 28 72 Z" 
              fill="url(#scarfGrad)" stroke="#0b7a6e" strokeWidth="1"/>
        <path d="M65 70 Q68 75 72 78 Q70 82 62 80" fill="#0d9488" stroke="#0b7a6e" strokeWidth="1"/>
        <path d="M60 78 Q62 85 58 90" fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round">
          <animate attributeName="d" 
            values="M60 78 Q62 85 58 90;M60 78 Q63 84 60 88;M60 78 Q62 85 58 90" 
            dur="2s" repeatCount="indefinite"/>
        </path>
        {/* Borlas bufanda */}
        <circle cx="58" cy="90" r="2" fill="#0d9488">
          <animate attributeName="cy" values="90;88;90" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  );
}
