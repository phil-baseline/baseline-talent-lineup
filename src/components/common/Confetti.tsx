import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
}

const colors = [
  '#6B7B6E', // sage
  '#4A5D4A', // moss
  '#8B7355', // brown
  '#D4DDD6', // light sage
  '#E5DCC8', // cream gold
  '#10B981', // emerald
  '#F59E0B', // amber
];

export function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Create initial particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 150; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        speedX: (Math.random() - 0.5) * 8,
        speedY: 3 + Math.random() * 5,
      });
    }
    setParticles(newParticles);

    // Animate particles
    let animationId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16; // Normalize to ~60fps
      lastTime = currentTime;

      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.speedX * deltaTime,
            y: p.y + p.speedY * deltaTime,
            rotation: p.rotation + 3 * deltaTime,
            speedY: p.speedY + 0.1 * deltaTime, // gravity
          }))
          .filter((p) => p.y < window.innerHeight + 50)
      );

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  );
}
