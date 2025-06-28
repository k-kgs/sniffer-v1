'use client';

import React, { useRef, useEffect, useState } from 'react';

// 1. Words with indirect, riddle-style hints:
const WORDS_WITH_HINTS = [
  { word: "PLANT", hint: "I'm rooted but I can grow tall, green is my favorite color." },
  { word: "BRAVE", hint: "You need me to face your fears." },
  { word: "SWEET", hint: "I’m how you’d describe honey, but not a person who’s mean." },
  { word: "GRACE", hint: "Ballet dancers move with this." },
  { word: "SHINE", hint: "The sun does this every morning." },
  { word: "EARTH", hint: "I’m blue and green from space, but you stand on me every day." },
  { word: "SMART", hint: "I’m what you call a quick thinker." },
  { word: "TIGER", hint: "I wear stripes, but I’m not a referee." },
  { word: "CLOUD", hint: "I float above, sometimes blocking the sun." },
  { word: "MUSIC", hint: "You hear me in songs, but can’t see me." },
  { word: "PEACH", hint: "I’m both a fruit and a color, and have a fuzzy skin." },
  { word: "BRAIN", hint: "I’m not a computer, but I process your thoughts." },
  { word: "LUCKY", hint: "If you find a four-leaf clover, you might be this." },
  { word: "NOBLE", hint: "Knights and kings are often called this." },
  { word: "SMILE", hint: "You do this when you’re happy, and it shows your teeth." },
  { word: "WATER", hint: "I’m tasteless, but you need me to live." },
  { word: "STONE", hint: "I’m hard and small, but not a gem." },
  { word: "LIGHT", hint: "I chase away darkness." },
  { word: "DREAM", hint: "I visit you when you sleep, but vanish when you wake." },
  { word: "PEARL", hint: "I’m a treasure found in an oyster." },
  { word: "BLOOM", hint: "A flower does this in spring." },
  { word: "GIANT", hint: "I’m bigger than big, but not quite a mountain." },
  { word: "PRIZE", hint: "You get me when you win." },
  { word: "STORY", hint: "I can be told or written, sometimes true, sometimes not." },
  { word: "YOUTH", hint: "I’m the opposite of old age." },
  { word: "TREND", hint: "I’m what’s popular right now." },
  { word: "UNITY", hint: "Many become one with me." },
  { word: "VIVID", hint: "My colors are never dull." },
  { word: "WORLD", hint: "I’m bigger than a country, but smaller than the universe." },
  { word: "ZEBRA", hint: "I wear black and white, but I’m not a piano." },
  { word: "QUEST", hint: "A hero’s journey is often called this." },
  { word: "ROBIN", hint: "I’m a bird with a red chest, not Batman’s friend." },
  { word: "APPLE", hint: "I keep the doctor away, or so they say." },
  { word: "CHAIR", hint: "You use me to rest your legs, but I’m not a bed." },
  { word: "CROWN", hint: "I sit on a royal head." },
  { word: "BREAD", hint: "Slice me for a sandwich." },
  { word: "FROST", hint: "I cover grass on a chilly morning." },
  { word: "GRAPE", hint: "I’m small, round, and can become wine." },
  { word: "HORSE", hint: "I have hooves and a mane, and sometimes win races." },
  { word: "JELLY", hint: "I wiggle on your plate and spread on your toast." },
  { word: "LEMON", hint: "I’m yellow and sour, but make good drinks." },
  { word: "MOUSE", hint: "I’m small, squeaky, and love cheese." },
  { word: "NURSE", hint: "I help doctors and care for the sick." },
  { word: "OCEAN", hint: "I’m salty, vast, and full of waves." },
  { word: "PLANE", hint: "I fly, but I’m not a bird or a superhero." },
  { word: "QUILT", hint: "I keep you warm with many patches." },
  { word: "RIVER", hint: "I flow to the sea, but I’m not rain." },
  { word: "SHEEP", hint: "Count me if you can’t sleep." },
  { word: "TRAIN", hint: "I run on tracks, but I’m not a runner." },
  { word: "VIRUS", hint: "I’m tiny, but can make you sick." },
  { word: "WHALE", hint: "I’m the biggest in the sea, but not a fish." },
  { word: "XENON", hint: "I’m a rare gas, but not a balloon filler." },
  { word: "YACHT", hint: "I’m a boat for the rich." },
  { word: "ZAPPY", hint: "I’m full of energy, like a spark." },
  // ...add more as desired
];

function getRandomWordObj() {
  return WORDS_WITH_HINTS[Math.floor(Math.random() * WORDS_WITH_HINTS.length)];
}

const canvasWidth = 380;
const canvasHeight = 500;
const MAX_BALLOONS = 5;
const MAX_SHOTS = 10;
const BALLOON_RADIUS = 36;
const BALLOON_Y = 230;
const BALLOON_SPEED = 2.3;
const BASE_GUESS_CHANCES = 2;
const MAX_CARRYOVER = 2;
const BURST_DURATION = 180;
const FLY_DURATION = 400;
const EXPLOSION_DURATION = 350;
const PARTICLE_COUNT = 24;

function getBalloonSpeed(currentBalloon: number) {
  // Start at 2.3, increase by 0.7 for each balloon (tweak as desired)
  return 2.3 + currentBalloon * 0.7;
}


export default function MovingBalloonGame() {
  // --- Word and hint state ---
  const [wordObj, setWordObj] = useState(getRandomWordObj());
  const word = wordObj.word;
  const hint = wordObj.hint;
  const [hintRevealed, setHintRevealed] = useState(false);

  // --- Game state ---
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [revealedLetters, setRevealedLetters] = useState(Array(MAX_BALLOONS).fill(''));
  const [currentBalloon, setCurrentBalloon] = useState(0);
  const [shotsLeft, setShotsLeft] = useState(MAX_SHOTS);
  const [phase, setPhase] = useState<'burst'|'guess'|'fail'|'success'>('burst');
  const [result, setResult] = useState('');
  const [inputLetters, setInputLetters] = useState(Array(MAX_BALLOONS).fill(''));
  const [guessChances, setGuessChances] = useState(BASE_GUESS_CHANCES);
  const [carriedChances, setCarriedChances] = useState(0);

  // --- Balloon movement ---
  const [balloonX, setBalloonX] = useState(BALLOON_RADIUS + 8);
  const [balloonDir, setBalloonDir] = useState<1|-1>(1);

  // --- Slingshot ---
  const anchorLeft = { x: canvasWidth / 2 - 70, y: 360 };
  const anchorRight = { x: canvasWidth / 2 + 70, y: 360 };
  const pouchRest = { x: canvasWidth / 2, y: 410 };
  const [pouch, setPouch] = useState({ ...pouchRest, dragging: false });
  const [stone, setStone] = useState<{ x: number; y: number; vx: number; vy: number } | null>(null);

  // --- Canvas-only animation refs ---
  const burstAnimRef = useRef<null | {
    x: number, y: number, radius: number, startTime: number, duration: number
  }>(null);

  const explosionParticlesRef = useRef<{x: number, y: number, vx: number, vy: number, color: string, alpha: number, radius: number}[] | null>(null);
  const explosionStartRef = useRef<number | null>(null);

  const animatingRef = useRef<null | {
    letter: string;
    from: { x: number, y: number };
    to: { x: number, y: number };
    slot: number;
    startTime: number;
    duration: number;
    done: boolean;
  }>(null);

  // --- UI ref ---
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef(false);

  function shuffle<T>(array: T[]): T[] {
    // Fisher-Yates shuffle
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  

  // --- Balloon movement loop ---
  useEffect(() => {
    if (phase !== 'burst' || burstAnimRef.current || explosionParticlesRef.current || animatingRef.current || currentBalloon >= MAX_BALLOONS) return;
    let anim: number;
    function move() {
      setBalloonX(x => {
        const speed = getBalloonSpeed(currentBalloon);
        let next = x + speed * balloonDir;
        if (next > canvasWidth - BALLOON_RADIUS - 8) {
          setBalloonDir(-1);
          next = canvasWidth - BALLOON_RADIUS - 8;
        }
        if (next < BALLOON_RADIUS + 8) {
          setBalloonDir(1);
          next = BALLOON_RADIUS + 8;
        }
        return next;
      });
      anim = requestAnimationFrame(move);
    }
    anim = requestAnimationFrame(move);
    return () => cancelAnimationFrame(anim);
  }, [phase, balloonDir, currentBalloon]);
  
  // useEffect(() => {
  //   if (
  //     phase !== 'burst' ||
  //     burstAnimRef.current ||
  //     explosionParticlesRef.current ||
  //     animatingRef.current
  //   ) return;
  
  //   // Only fail if out of shots AND there are balloons left to burst
  //   if (
  //     shotsLeft === 0 &&
  //     currentBalloon < MAX_BALLOONS - 1 // <-- Only fail if not just finished the last balloon
  //   ) {
  //     setTimeout(() => {
  //       setPhase('fail');
  //       setResult('Mission Failed! Out of shots.');
  //     }, 400);
  //   }
  // }, [shotsLeft, phase, currentBalloon]);
  


  // --- Slingshot controls ---
  function getPointerPosFromEvent(
    e: React.MouseEvent<HTMLCanvasElement> | TouchEvent | Touch
  ) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('clientX' in e && 'clientY' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    } else if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  }

  function handleDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (phase !== 'burst' || burstAnimRef.current || explosionParticlesRef.current || animatingRef.current || currentBalloon >= MAX_BALLOONS) return;
    const { x, y } = getPointerPosFromEvent(e);
    if (Math.hypot(x - pouch.x, y - pouch.y) < 30) {
      dragRef.current = true;
      setPouch(p => ({ ...p, dragging: true }));
    }
  }
  function handleMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (phase !== 'burst' || !dragRef.current || burstAnimRef.current || explosionParticlesRef.current || animatingRef.current || currentBalloon >= MAX_BALLOONS) return;
    const { x, y } = getPointerPosFromEvent(e);
    const dx = x - pouchRest.x;
    const dy = y - pouchRest.y;
    const maxLen = 80;
    let len = Math.sqrt(dx * dx + dy * dy);
    let nx = dx, ny = dy;
    if (len > maxLen) {
      nx = (dx / len) * maxLen;
      ny = (dy / len) * maxLen;
    }
    setPouch({ x: pouchRest.x + nx, y: pouchRest.y + ny, dragging: true });
  }
  function handleUp() {
    if (phase !== 'burst' || !dragRef.current || burstAnimRef.current || explosionParticlesRef.current || animatingRef.current || currentBalloon >= MAX_BALLOONS) return;
    dragRef.current = false;
    if (shotsLeft <= 0) return;
    const dx = pouch.x - pouchRest.x;
    const dy = pouch.y - pouchRest.y;
    const speedFactor = 0.25;
    setStone({
      x: pouch.x,
      y: pouch.y,
      vx: -dx * speedFactor,
      vy: -dy * speedFactor,
    });
    setPouch({ ...pouchRest, dragging: false });
    setShotsLeft(s => s - 1);
  }

  // --- Touch events (mobile) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function handleTouchStart(e: TouchEvent) {
      e.preventDefault();
      if (phase !== 'burst' || burstAnimRef.current || explosionParticlesRef.current || animatingRef.current || currentBalloon >= MAX_BALLOONS) return;
      const { x, y } = getPointerPosFromEvent(e);
      if (Math.hypot(x - pouch.x, y - pouch.y) < 30) {
        dragRef.current = true;
        setPouch(p => ({ ...p, dragging: true }));
      }
    }
    function handleTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (phase !== 'burst' || !dragRef.current || burstAnimRef.current || explosionParticlesRef.current || animatingRef.current || currentBalloon >= MAX_BALLOONS) return;
      const { x, y } = getPointerPosFromEvent(e);
      const dx = x - pouchRest.x;
      const dy = y - pouchRest.y;
      const maxLen = 80;
      let len = Math.sqrt(dx * dx + dy * dy);
      let nx = dx, ny = dy;
      if (len > maxLen) {
        nx = (dx / len) * maxLen;
        ny = (dy / len) * maxLen;
      }
      setPouch({ x: pouchRest.x + nx, y: pouchRest.y + ny, dragging: true });
    }
    function handleTouchEnd(e: TouchEvent) {
      e.preventDefault();
      if (phase !== 'burst' || !dragRef.current || burstAnimRef.current || explosionParticlesRef.current || animatingRef.current || currentBalloon >= MAX_BALLOONS) return;
      dragRef.current = false;
      if (shotsLeft <= 0) return;
      const dx = pouch.x - pouchRest.x;
      const dy = pouch.y - pouchRest.y;
      const speedFactor = 0.25;
      setStone({
        x: pouch.x,
        y: pouch.y,
        vx: -dx * speedFactor,
        vy: -dy * speedFactor,
      });
      setPouch({ ...pouchRest, dragging: false });
      setShotsLeft(s => s - 1);
    }
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [phase, pouch.x, pouch.y, pouchRest.x, pouchRest.y, shotsLeft, currentBalloon]);

  // --- Stone animation and balloon burst detection ---
  useEffect(() => {
    if (!stone || phase !== 'burst' || currentBalloon >= MAX_BALLOONS || burstAnimRef.current || explosionParticlesRef.current || animatingRef.current) return;
    let raf: number;
    function animate() {
      setStone(s => {
        if (!s) return null;
        const gravity = 0.5;
        const newStone = { ...s, x: s.x + s.vx, y: s.y + s.vy, vy: s.vy + gravity };
        const dist = Math.hypot(newStone.x - balloonX, newStone.y - BALLOON_Y);
        if (dist < BALLOON_RADIUS + 12) {
          // Start burst animation (scale/fade) as before, then explosion
          burstAnimRef.current = {
            x: balloonX,
            y: BALLOON_Y,
            radius: BALLOON_RADIUS,
            startTime: performance.now(),
            duration: BURST_DURATION
          };
          requestAnimationFrame(drawBurstAnim);
          return null;
        }
        if (
          newStone.x < 0 ||
          newStone.x > canvasWidth ||
          newStone.y < 0 ||
          newStone.y > canvasHeight
        ) {
          return null;
        }
        return newStone;
      });
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [stone, phase, balloonX, currentBalloon, shuffledLetters, shotsLeft]);

  // --- Helper to create explosion particles ---
  function createExplosionParticles(x: number, y: number) {
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (2 * Math.PI * i) / PARTICLE_COUNT;
      const speed = 2.5 + Math.random() * 2.5;
      const color = `hsl(${Math.floor(Math.random()*360)},85%,60%)`;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        radius: 4 + Math.random() * 4,
      });
    }
    return particles;
  }

  // --- Burst animation (canvas-only) ---
  function drawBurstAnim(now: number) {
    const canvas = canvasRef.current;
    if (!canvas || !burstAnimRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y, radius, startTime, duration } = burstAnimRef.current;
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Redraw background and slots
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < MAX_BALLOONS; ++i) {
      ctx.beginPath();
      ctx.arc(
        ((canvasWidth - 2 * BALLOON_RADIUS) / (MAX_BALLOONS - 1)) * i + BALLOON_RADIUS,
        60,
        BALLOON_RADIUS * 0.7,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = revealedLetters[i] ? '#ffe066' : '#eaf6fb';
      ctx.fill();
      ctx.strokeStyle = '#5bc0eb';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (revealedLetters[i]) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(revealedLetters[i], ((canvasWidth - 2 * BALLOON_RADIUS) / (MAX_BALLOONS - 1)) * i + BALLOON_RADIUS, 60);
      }
    }

    // Animate balloon: scale up and fade out
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.beginPath();
    ctx.arc(x, y, radius * (1 + 0.6 * progress), 0, Math.PI * 2);
    ctx.fillStyle = '#5bc0eb';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw slingshot and stone as before
    if (phase === 'burst') {
      ctx.beginPath();
      ctx.moveTo(anchorLeft.x, anchorLeft.y + 34);
      ctx.lineTo(anchorLeft.x, anchorLeft.y - 20);
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#654321';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(anchorRight.x, anchorRight.y + 34);
      ctx.lineTo(anchorRight.x, anchorRight.y - 20);
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#654321';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(anchorLeft.x, anchorLeft.y);
      ctx.lineTo(pouch.x, pouch.y);
      ctx.lineTo(anchorRight.x, anchorRight.y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#b5651d';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pouch.x, pouch.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#888';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
      if (pouch.dragging) {
        ctx.beginPath();
        ctx.arc(pouch.x, pouch.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
      }
      if (stone) {
        ctx.beginPath();
        ctx.arc(stone.x, stone.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
      }
    }

    if (progress < 1) {
      requestAnimationFrame(drawBurstAnim);
    } else {
      burstAnimRef.current = null;
      // Start explosion animation
      explosionParticlesRef.current = createExplosionParticles(x, y);
      explosionStartRef.current = performance.now();
      requestAnimationFrame(drawExplosionAnim);
    }
  }

  // --- Explosion animation (canvas-only) ---
  function drawExplosionAnim(now: number) {
    const canvas = canvasRef.current;
    if (!canvas || !explosionParticlesRef.current || explosionStartRef.current === null) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const elapsed = now - explosionStartRef.current;
    const progress = Math.min(elapsed / EXPLOSION_DURATION, 1);

    // Redraw background and slots
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < MAX_BALLOONS; ++i) {
      ctx.beginPath();
      ctx.arc(
        ((canvasWidth - 2 * BALLOON_RADIUS) / (MAX_BALLOONS - 1)) * i + BALLOON_RADIUS,
        60,
        BALLOON_RADIUS * 0.7,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = revealedLetters[i] ? '#ffe066' : '#eaf6fb';
      ctx.fill();
      ctx.strokeStyle = '#5bc0eb';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (revealedLetters[i]) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(revealedLetters[i], ((canvasWidth - 2 * BALLOON_RADIUS) / (MAX_BALLOONS - 1)) * i + BALLOON_RADIUS, 60);
      }
    }

    // Animate explosion particles
    if (explosionParticlesRef.current) {
      for (const p of explosionParticlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97; // friction
        p.vy *= 0.97;
        p.alpha *= 0.95;
        ctx.save();
        ctx.globalAlpha = p.alpha * (1 - progress);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }
    }

    // Draw slingshot and stone as before
    if (phase === 'burst') {
      ctx.beginPath();
      ctx.moveTo(anchorLeft.x, anchorLeft.y + 34);
      ctx.lineTo(anchorLeft.x, anchorLeft.y - 20);
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#654321';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(anchorRight.x, anchorRight.y + 34);
      ctx.lineTo(anchorRight.x, anchorRight.y - 20);
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#654321';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(anchorLeft.x, anchorLeft.y);
      ctx.lineTo(pouch.x, pouch.y);
      ctx.lineTo(anchorRight.x, anchorRight.y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#b5651d';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pouch.x, pouch.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#888';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
      if (pouch.dragging) {
        ctx.beginPath();
        ctx.arc(pouch.x, pouch.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
      }
      if (stone) {
        ctx.beginPath();
        ctx.arc(stone.x, stone.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
      }
    }

    if (progress < 1) {
      requestAnimationFrame(drawExplosionAnim);
    } else {
      explosionParticlesRef.current = null;
      explosionStartRef.current = null;
      // Now start the flying letter animation
      const slotX = ((canvasWidth - 2 * BALLOON_RADIUS) / (MAX_BALLOONS - 1)) * currentBalloon + BALLOON_RADIUS;
      const slotY = 60;
      animatingRef.current = {
        letter: shuffledLetters[currentBalloon],
        from: { x: balloonX, y: BALLOON_Y },
        to: { x: slotX, y: slotY },
        slot: currentBalloon,
        startTime: performance.now(),
        duration: FLY_DURATION,
        done: false
      };
      requestAnimationFrame(drawFlyingLetter);
    }
  }

  // --- Flying letter animation (canvas-only) ---
  function drawFlyingLetter(now: number) {
    const canvas = canvasRef.current;
    if (!canvas || !animatingRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { letter, from, to, slot, startTime, duration, done } = animatingRef.current;
    if (done) return;

    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = (t: number) => 1 - Math.pow(1 - t, 2);
    const e = ease(progress);
    const x = from.x + (to.x - from.x) * e;
    const y = from.y + (to.y - from.y) * e;

    // Redraw everything (including flying letter)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < MAX_BALLOONS; ++i) {
      ctx.beginPath();
      ctx.arc(
        ((canvasWidth - 2 * BALLOON_RADIUS) / (MAX_BALLOONS - 1)) * i + BALLOON_RADIUS,
        60,
        BALLOON_RADIUS * 0.7,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = revealedLetters[i] ? '#ffe066' : '#eaf6fb';
      ctx.fill();
      ctx.strokeStyle = '#5bc0eb';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (revealedLetters[i]) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(revealedLetters[i], ((canvasWidth - 2 * BALLOON_RADIUS) / (MAX_BALLOONS - 1)) * i + BALLOON_RADIUS, 60);
      }
    }
    // Draw flying letter
    ctx.save();
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333';
    ctx.globalAlpha = 1;
    ctx.fillText(letter, x, y);
    ctx.restore();

    // Draw slingshot and stone as before
    if (phase === 'burst' && currentBalloon < MAX_BALLOONS && !done && progress < 1) {
      ctx.beginPath();
      ctx.arc(balloonX, BALLOON_Y, BALLOON_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#5bc0eb';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (phase === 'burst') {
      ctx.beginPath();
      ctx.moveTo(anchorLeft.x, anchorLeft.y + 34);
      ctx.lineTo(anchorLeft.x, anchorLeft.y - 20);
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#654321';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(anchorRight.x, anchorRight.y + 34);
      ctx.lineTo(anchorRight.x, anchorRight.y - 20);
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#654321';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(anchorLeft.x, anchorLeft.y);
      ctx.lineTo(pouch.x, pouch.y);
      ctx.lineTo(anchorRight.x, anchorRight.y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#b5651d';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pouch.x, pouch.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#888';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
      if (pouch.dragging) {
        ctx.beginPath();
        ctx.arc(pouch.x, pouch.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
      }
      if (stone) {
        ctx.beginPath();
        ctx.arc(stone.x, stone.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
      }
    }

    // Continue or finish animation
    if (progress < 1) {
      requestAnimationFrame(drawFlyingLetter);
    } else {
      animatingRef.current = { ...animatingRef.current, done: true };
      setTimeout(() => {
        setRevealedLetters(prev => {
          const arr = [...prev];
          arr[slot] = letter;
          return arr;
        });
        if (slot + 1 < MAX_BALLOONS) {
          setCurrentBalloon(prev => prev + 1);
          setBalloonX(BALLOON_RADIUS + 8);
          setBalloonDir(1);
        } else {
          const carry = Math.min(shotsLeft, MAX_CARRYOVER);
          setCarriedChances(carry);
          setPhase('guess');
          setGuessChances(BASE_GUESS_CHANCES + carry);
          setInputLetters(Array(MAX_BALLOONS).fill(''));
          setResult('');
        }
        animatingRef.current = null;
      }, 0);
    }
  }

  // --- Redraw canvas when state changes (except during animation) ---
  useEffect(() => {
    if (burstAnimRef.current || explosionParticlesRef.current || animatingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < MAX_BALLOONS; ++i) {
      ctx.beginPath();
      ctx.arc(
        ((canvasWidth - 2 * BALLOON_RADIUS) / (MAX_BALLOONS - 1)) * i + BALLOON_RADIUS,
        60,
        BALLOON_RADIUS * 0.7,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = revealedLetters[i] ? '#ffe066' : '#eaf6fb';
      ctx.fill();
      ctx.strokeStyle = '#5bc0eb';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (revealedLetters[i]) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(revealedLetters[i], ((canvasWidth - 2 * BALLOON_RADIUS) / (MAX_BALLOONS - 1)) * i + BALLOON_RADIUS, 60);
      }
    }
    if (phase === 'burst' && currentBalloon < MAX_BALLOONS) {
      ctx.beginPath();
      ctx.arc(balloonX, BALLOON_Y, BALLOON_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#5bc0eb';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (phase === 'burst') {
      ctx.beginPath();
      ctx.moveTo(anchorLeft.x, anchorLeft.y + 34);
      ctx.lineTo(anchorLeft.x, anchorLeft.y - 20);
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#654321';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(anchorRight.x, anchorRight.y + 34);
      ctx.lineTo(anchorRight.x, anchorRight.y - 20);
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#654321';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(anchorLeft.x, anchorLeft.y);
      ctx.lineTo(pouch.x, pouch.y);
      ctx.lineTo(anchorRight.x, anchorRight.y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#b5651d';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pouch.x, pouch.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#888';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
      if (pouch.dragging) {
        ctx.beginPath();
        ctx.arc(pouch.x, pouch.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
      }
      if (stone) {
        ctx.beginPath();
        ctx.arc(stone.x, stone.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
      }
    }
  }, [balloonX, revealedLetters, phase, currentBalloon, pouch, stone]);

  // --- Game over logic ---
  useEffect(() => {
    if (phase !== 'burst' || burstAnimRef.current || explosionParticlesRef.current || animatingRef.current) return;
    if (shotsLeft === 0 && currentBalloon < MAX_BALLOONS) {
      setTimeout(() => {
        setPhase('fail');
        setResult('Mission Failed! Out of shots.');
      }, 400);
    }
  }, [shotsLeft, phase, currentBalloon]);

  // --- Input logic with auto-advance ---
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const val = e.target.value.toUpperCase();
    if (val.length > 1) return;
    setInputLetters(prev => {
      const arr = [...prev];
      arr[idx] = val.replace(/[^A-Z]/g, '');
      return arr;
    });
    if (val && idx < MAX_BALLOONS - 1) {
      setTimeout(() => {
        inputRefs.current[idx + 1]?.focus();
      }, 0);
    }
  }
  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === 'Backspace' && !inputLetters[idx] && idx > 0) {
      setTimeout(() => {
        inputRefs.current[idx - 1]?.focus();
      }, 0);
    }
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inputLetters.join('') === word) {
      setResult('🎉 Correct! Well done!');
      setPhase('success');
    } else {
      if (guessChances - 1 > 0) {
        setResult('❌ Try again!');
        setGuessChances(c => c - 1);
      } else {
        setResult('Mission Failed! Out of chances.');
        setGuessChances(0);
        setTimeout(() => {
          setPhase('fail');
        }, 1200);
      }
    }
  }
  function handleRestart() {
    const newObj = getRandomWordObj();
    setWordObj(newObj);
    setShuffledLetters(shuffle(newObj.word.split('')));
    setRevealedLetters(Array(MAX_BALLOONS).fill(''));
    setCurrentBalloon(0);
    setPhase('burst');
    setInputLetters(Array(MAX_BALLOONS).fill(''));
    setResult('');
    setStone(null);
    setPouch({ ...pouchRest, dragging: false });
    setShotsLeft(MAX_SHOTS);
    setGuessChances(BASE_GUESS_CHANCES);
    setCarriedChances(0);
    setBalloonX(BALLOON_RADIUS + 8);
    setBalloonDir(1);
    burstAnimRef.current = null;
    explosionParticlesRef.current = null;
    explosionStartRef.current = null;
    animatingRef.current = null;
    setHintRevealed(false);
  }
  // On mount/init
  useEffect(() => {
    setShuffledLetters(shuffle(word.split('')));
    setRevealedLetters(Array(MAX_BALLOONS).fill(''));
    setCurrentBalloon(0);
    setPhase('burst');
    setInputLetters(Array(MAX_BALLOONS).fill(''));
    setResult('');
    setStone(null);
    setPouch({ ...pouchRest, dragging: false });
    setShotsLeft(MAX_SHOTS);
    setGuessChances(BASE_GUESS_CHANCES);
    setCarriedChances(0);
    setBalloonX(BALLOON_RADIUS + 8);
    setBalloonDir(1);
    burstAnimRef.current = null;
    explosionParticlesRef.current = null;
    explosionStartRef.current = null;
    animatingRef.current = null;
    setHintRevealed(false);
  }, [wordObj]);

  // --- CSS (same as before) ---
  const styles = (
    <style>{`
      .input-row {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-bottom: 18px;
        width: 100%;
      }
      .input-card {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(91,192,235,0.10);
        font-size: 2rem;
        text-align: center;
        border: 2px solid #5bc0eb;
        background: rgba(91,192,235,0.08);
        transition: border-color 0.2s, box-shadow 0.2s;
        text-transform: uppercase;
        color: #222;
      }
      .input-card:focus {
        border-color: #ffe066;
        box-shadow: 0 4px 16px rgba(255,224,102,0.18);
        outline: none;
      }
      .button-row {
        display: flex;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
        width: 100%;
      }
      .action-btn {
        min-width: 120px;
        padding: 12px 20px;
        font-size: 1.1rem;
        border-radius: 8px;
        border: none;
        background: #5bc0eb;
        color: #fff;
        font-weight: 600;
        margin-bottom: 8px;
        margin-top: 0;
        box-shadow: 0 2px 8px rgba(91,192,235,0.10);
        cursor: pointer;
        transition: background 0.2s;
      }
      .action-btn.restart {
        background: rgba(91,192,235,0.14);
        color: #333;
        border: 1.5px solid #5bc0eb;
      }
      @media (max-width: 500px) {
        .input-card {
          width: 38px;
          height: 38px;
          font-size: 1.2rem;
        }
        .action-btn {
          width: 100%;
          min-width: 0;
          margin-bottom: 10px;
        }
        .button-row {
          flex-direction: column;
          gap: 8px;
        }
      }
    `}</style>
  );

  return (
    <main style={{
      maxWidth: canvasWidth,
      margin: '0 auto',
      padding: 16,
      background: 'linear-gradient(180deg, #eaf6fb 0%, #f6f7f9 100%)',
      minHeight: '100vh'
    }}>
      {styles}
      <h1 style={{
        textAlign: 'center',
        marginBottom: 8,
        color: '#222',
        textShadow: '0 1px 0 #fff, 0 2px 6px rgba(80,80,120,0.08)'
      }}>
        Sniffer
      </h1>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 18,
        marginBottom: 8,
        fontSize: 16,
        fontWeight: 600,
        color: '#5bc0eb',
        letterSpacing: 1,
      }}>
        {phase === 'burst' && (
          <>
            <span>Shots Left: <span style={{color:'#333'}}>{shotsLeft}</span></span>
            <span>Balloons Left: <span style={{color:'#333'}}>{MAX_BALLOONS - currentBalloon}</span></span>
          </>
        )}
        {phase === 'guess' && (
          <>
            <span>Chances Left: <span style={{color:'#333'}}>{guessChances}</span></span>
            {carriedChances > 0 && (
              <span style={{color:'#888', fontWeight:400, fontSize:14}}>
                (Carried over: {carriedChances})
              </span>
            )}
          </>
        )}
      </div>
      <div style={{height: 30}} />
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          border: '2px solid #5bc0eb',
          borderRadius: 12,
          touchAction: 'none',
          background: 'linear-gradient(180deg, #eaf6fb 0%, #f6f7f9 100%)',
          display: 'block',
          margin: '0 auto',
          maxWidth: '100%',
        }}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
      />
      {phase === 'guess' && (
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            maxWidth: 340,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'transparent',
            borderRadius: 0,
            padding: 0,
            marginTop: 30,
            zIndex: 2,
            position: 'relative',
          }}
        >
          <h3 style={{
            marginBottom: 18,
            fontWeight: 500,
            fontSize: 20,
            color: '#222',
            background: 'transparent',
            textShadow: '0 1px 0 #fff, 0 2px 6px rgba(80,80,120,0.08)'
          }}>Type your guess:</h3>
          <div className="input-row">
            {inputLetters.map((l, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="text"
                autoComplete="off"
                maxLength={1}
                value={l}
                onChange={(e) => handleInputChange(e, i)}
                onKeyDown={(e) => handleInputKeyDown(e, i)}
                className="input-card"
                aria-label={`Letter ${i + 1}`}
                style={{
                  borderColor: '#5bc0eb',
                  background: 'rgba(91,192,235,0.08)',
                  color: '#222',
                }}
              />
            ))}
          </div>
          <div className="button-row">
            <button type="submit" className="action-btn" disabled={guessChances === 0 || result.startsWith('🎉')}>Submit Guess</button>
            <button type="button" onClick={handleRestart} className="action-btn restart">Restart Game</button>
            {guessChances <= 2 && !hintRevealed && (
              <button
                type="button"
                className="action-btn"
                style={{background: "#ffe066", color: "#333"}}
                onClick={() => setHintRevealed(true)}
              >
                Show Hint
              </button>
            )}
          </div>
          {hintRevealed && (
            <div style={{marginTop: 10, color: "#5bc0eb", fontWeight: 500, fontSize: 17}}>
              Hint: {hint}
            </div>
          )}
          <div
            style={{
              marginTop: 14,
              fontSize: 20,
              color: result.startsWith('🎉') ? '#7ed957' : '#ff5a5f',
              minHeight: 28,
              fontWeight: 500,
              textShadow: '0 1px 0 #fff, 0 2px 6px rgba(80,80,120,0.08)'
            }}
          >
            {result}
          </div>
        </form>
      )}
      {phase === 'fail' && (
        <div style={{
          margin: '32px auto 0 auto',
          textAlign: 'center',
          color: '#ff5a5f',
          fontWeight: 700,
          fontSize: 22,
        }}>
          Mission Failed!<br />
          <button
            onClick={handleRestart}
            className="action-btn restart"
            style={{marginTop: 18, fontSize: 18}}
          >
            Restart Game
          </button>
        </div>
      )}
      {phase === 'success' && (
        <div style={{
          margin: '32px auto 0 auto',
          textAlign: 'center',
          color: '#7ed957',
          fontWeight: 700,
          fontSize: 22,
        }}>
          🎉 Correct! Well done!
          <br />
          <button
            onClick={handleRestart}
            className="action-btn restart"
            style={{marginTop: 18, fontSize: 18}}
          >
            Play Again
          </button>
        </div>
      )}
      <footer
        style={{
          marginTop: 40,
          textAlign: 'center',
          color: '#888',
          fontSize: 14,
        }}
      >
        &copy; {new Date().getFullYear()} Mavericks Digital
      </footer>
    </main>
  );
}
