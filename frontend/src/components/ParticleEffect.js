import React, { useEffect, useState } from 'react';
import './ParticleEffect.css';

const ParticleEffect = ({ count = 20, emoji = '✨', duration = 5 }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const newParticles = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 20 + 10,
            delay: Math.random() * duration,
            duration: duration + Math.random() * 2,
        }));
        setParticles(newParticles);
    }, [count, duration]);

    return (
        <div className="particle-container">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="particle"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        fontSize: `${particle.size}px`,
                        animationDelay: `${particle.delay}s`,
                        animationDuration: `${particle.duration}s`,
                    }}
                >
                    {emoji}
                </div>
            ))}
        </div>
    );
};

export default ParticleEffect;
