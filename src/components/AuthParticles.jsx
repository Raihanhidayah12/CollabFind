import { useMemo } from 'react';

/* Generates floating particle dots for auth backgrounds */
export default function AuthParticles({ count = 18 }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      dur:  `${6 + Math.random() * 10}s`,
      delay:`${Math.random() * 8}s`,
      drift:`${(Math.random() - 0.5) * 80}px`,
      color: i % 3 === 0 ? '#9D50BB' : '#00D2FF',
      size: Math.random() > 0.7 ? 3 : 2,
    }));
  }, [count]);

  return (
    <div className="auth-particles" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="auth-particle"
          style={{
            left: p.left,
            bottom: 0,
            width: p.size,
            height: p.size,
            background: p.color,
            '--dur':   p.dur,
            '--delay': p.delay,
            '--drift': p.drift,
          }}
        />
      ))}
    </div>
  );
}
