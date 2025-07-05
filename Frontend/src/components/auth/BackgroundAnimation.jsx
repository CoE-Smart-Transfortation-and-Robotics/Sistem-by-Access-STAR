import { useEffect, useRef, useState, useCallback } from 'react';

const CONFIG = {
  particleCount: 150,
  particleColor: 'rgba(217, 226, 245, 1)',
  particleBaseOpacity: 0.8,
  particleOpacityVariation: 0.6,
  
  particleBaseSize: 0.5,
  particleSizeVariation: 1.8,
  
  particleBaseSpeed: 0.05,
  particleSpeedVariation: 0.25,
  
  lineColor: 'rgba(125, 155, 205, 1)',
  connectionDistance: 120,
  
  returnToBaseForce: 0.0005,
  
  flowField: {
    speed: 0.22,
    changeRate: 0.0004,
  },

  clickShockwave: {
    initialRadius: 25,
    maxRadius: 200,
    speed: 6,
    force: 0.1,
    color: 'rgba(150, 180, 255, 0.5)',
  },

  backgroundGradient: {
    centerColor: 'rgba(10, 20, 40, 1)',
    edgeColor: 'rgba(5, 10, 20, 1)',
  }
};

const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

const EnhancedBackgroundAnimation = () => {
  const canvasRef = useRef(null);
  const windowSize = useWindowSize();
  const animationFrameId = useRef(null);
  
  const memoizedDraw = useCallback((ctx, particles, shockwaves) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const gradient = ctx.createRadialGradient(
        ctx.canvas.width / 2,
        ctx.canvas.height / 2,
        0,
        ctx.canvas.width / 2,
        ctx.canvas.height / 2,
        Math.max(ctx.canvas.width, ctx.canvas.height) / 2
    );
    gradient.addColorStop(0, CONFIG.backgroundGradient.centerColor);
    gradient.addColorStop(1, CONFIG.backgroundGradient.edgeColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONFIG.connectionDistance) {
                const combinedOpacity = particles[i].opacity * particles[j].opacity;
                const lineOpacity = (1 - (distance / CONFIG.connectionDistance)) * combinedOpacity * 0.5;
                
                if(lineOpacity > 0){
                    ctx.strokeStyle = `rgba(${parseInt(CONFIG.lineColor.slice(5, -1).split(',')[0])}, ${parseInt(CONFIG.lineColor.slice(5, -1).split(',')[1])}, ${parseInt(CONFIG.lineColor.slice(5, -1).split(',')[2])}, ${lineOpacity})`;
                    ctx.lineWidth = 0.75;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    particles.forEach(p => p.draw(ctx));
    shockwaves.forEach(s => s.draw(ctx));

  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || windowSize.width === 0 || windowSize.height === 0) return;

    const ctx = canvas.getContext('2d');
    canvas.width = windowSize.width;
    canvas.height = windowSize.height;

    let particles = [];
    let shockwaves = [];
    let globalFlow = { angle: Math.random() * Math.PI * 2 };
    
    class Shockwave {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = CONFIG.clickShockwave.initialRadius;
            this.maxRadius = CONFIG.clickShockwave.maxRadius;
            this.speed = CONFIG.clickShockwave.speed;
            this.force = CONFIG.clickShockwave.force;
            this.opacity = 1;
        }

        update() {
            this.radius += this.speed;
            if (this.radius > this.maxRadius) {
                this.opacity = Math.max(0, this.opacity - 0.05);
            }
        }

        draw(context) {
            if (this.opacity <= 0) return;
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.strokeStyle = `rgba(${parseInt(CONFIG.clickShockwave.color.slice(5, -1).split(',')[0])}, ${parseInt(CONFIG.clickShockwave.color.slice(5, -1).split(',')[1])}, ${parseInt(CONFIG.clickShockwave.color.slice(5, -1).split(',')[2])}, ${this.opacity * 0.5})`;
            context.lineWidth = 2;
            context.stroke();
        }
    }

    class Particle {
      constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.baseX = Math.random() * this.canvasWidth;
        this.baseY = Math.random() * this.canvasHeight;
        this.x = this.baseX;
        this.y = this.baseY;
        
        this.depth = Math.random();
        
        this.size = CONFIG.particleBaseSize + this.depth * CONFIG.particleSizeVariation;
        this.opacity = CONFIG.particleBaseOpacity + this.depth * CONFIG.particleOpacityVariation;
        
        const speed = CONFIG.particleBaseSpeed + this.depth * CONFIG.particleSpeedVariation;
        const angle = Math.random() * Math.PI * 2;
        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed;
      }

      update(activeShockwaves, flowAngle) {
        activeShockwaves.forEach(shockwave => {
            if (shockwave.opacity > 0) {
                const dxShock = this.x - shockwave.x;
                const dyShock = this.y - shockwave.y;
                const distanceShock = Math.sqrt(dxShock * dxShock + dyShock * dyShock);
                if (distanceShock < shockwave.radius && distanceShock > shockwave.radius - 20) {
                     const angle = Math.atan2(dyShock, dxShock);
                     const force = (1 - (distanceShock / shockwave.radius)) * shockwave.force * (1 + this.depth);
                     this.x += Math.cos(angle) * force * 20;
                     this.y += Math.sin(angle) * force * 20;
                }
            }
        });

        const flowX = Math.cos(flowAngle) * CONFIG.flowField.speed * this.depth;
        const flowY = Math.sin(flowAngle) * CONFIG.flowField.speed * this.depth;

        const dxBase = this.baseX - this.x;
        const dyBase = this.baseY - this.y;
        this.x += this.speedX + flowX + dxBase * CONFIG.returnToBaseForce;
        this.y += this.speedY + flowY + dyBase * CONFIG.returnToBaseForce;

        if (this.x < -this.size) { this.x = this.canvasWidth + this.size; this.baseX = this.x; }
        if (this.x > this.canvasWidth + this.size) { this.x = -this.size; this.baseX = this.x; }
        if (this.y < -this.size) { this.y = this.canvasHeight + this.size; this.baseY = this.y; }
        if (this.y > this.canvasHeight + this.size) { this.y = -this.size; this.baseY = this.y; }
      }

      draw(context) {
        const colorParts = CONFIG.particleColor.slice(5, -1).split(',');
        context.fillStyle = `rgba(${colorParts[0]}, ${colorParts[1]}, ${colorParts[2]}, ${this.opacity})`;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.closePath();
        context.fill();
      }
    }

    const init = () => {
        particles = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            particles.push(new Particle(canvas.width, canvas.height));
        }
    };

    const animate = () => {
        globalFlow.angle += CONFIG.flowField.changeRate;

        particles.forEach(p => p.update(shockwaves, globalFlow.angle));

        shockwaves.forEach(s => s.update());
        shockwaves = shockwaves.filter(s => s.opacity > 0 && s.radius < s.maxRadius + 50);

        memoizedDraw(ctx, particles, shockwaves);
        animationFrameId.current = requestAnimationFrame(animate);
    };

    const handleClick = (event) => {
        shockwaves.push(new Shockwave(event.clientX, event.clientY));
    };
    
    init();
    animate();

    canvas.addEventListener('click', handleClick);

    return () => {
        cancelAnimationFrame(animationFrameId.current);
        canvas.removeEventListener('click', handleClick);
    };

  }, [windowSize, memoizedDraw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: -1,
        display: 'block',
      }}
    />
  );
};

export default EnhancedBackgroundAnimation;