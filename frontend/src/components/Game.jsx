import React, { useEffect, useRef, useState } from 'react';
import bgGame from '../assets/bg_game.png';
import bgLogoDafoxa from '../assets/bg_logo_dafoxa.png';
import bgLogoHalal from '../assets/bg_logo_halal.png';
import bgPoinPlus from '../assets/bg_poin+1.png';
import bgPoinMinus from '../assets/bg_poin-1.png';

// Helper: Dynamically filter out white backgrounds from brand logo assets
function makeImageTransparent(imgElement) {
  const offCanvas = document.createElement('canvas');
  offCanvas.width = imgElement.naturalWidth || imgElement.width;
  offCanvas.height = imgElement.naturalHeight || imgElement.height;
  const offCtx = offCanvas.getContext('2d');
  offCtx.drawImage(imgElement, 0, 0);

  try {
    const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const data = imgData.data;
    // Loop through pixels in RGBA
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // If the pixel is close to pure white, set alpha to 0 (transparent)
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0;
      }
    }
    offCtx.putImageData(imgData, 0, 0);
    return offCanvas;
  } catch (e) {
    console.error("Failed to make image transparent:", e);
    return imgElement;
  }
}

function Game({ participant, difficulty, backendUrl, onGameOver }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [trackingActive, setTrackingActive] = useState(false);

  // References for the game loop to avoid React re-render lag
  const gameStateRef = useRef({
    score: 0,
    timeLeft: 30,
    basket: {
      x: 2160 / 2 - 300, // Centered
      y: 3100,          // Positioned above the wave graphics
      width: 600,
      height: 320,
      targetX: 2160 / 2 - 300
    },
    items: [],
    difficultySettings: {
      easy: { spawnInterval: 1500, minSpeed: 10, maxSpeed: 16, spawnCount: 1 },
      medium: { spawnInterval: 1000, minSpeed: 16, maxSpeed: 24, spawnCount: 1 },
      hard: { spawnInterval: 650, minSpeed: 24, maxSpeed: 34, spawnCount: 2 }
    },
    gameActive: true,
    lastSpawnTime: 0,
    particles: [],
    splashes: []
  });

  // Track pointer movements to move the basket (mouse/touch fallback)
  const handlePointerMove = (e) => {
    if (!containerRef.current || trackingActive) return;

    // Get mouse/touch position relative to the 2160x3840 canvas scale
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const relativeX = (clientX - rect.left) / rect.width; // 0.0 to 1.0

    // Map to canvas width
    const targetX = relativeX * 2160 - gameStateRef.current.basket.width / 2;
    // Constrain to canvas boundary
    gameStateRef.current.basket.targetX = Math.max(0, Math.min(2160 - gameStateRef.current.basket.width, targetX));
  };

  // Camera Motion Tracking (Stage 4) placeholder to coordinate with Stage 3
  useEffect(() => {
    let stream = null;
    let animationFrameId = null;
    let prevFrameData = null;

    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setTrackingActive(true);
        }
      } catch (err) {
        console.warn('Webcam not accessible, falling back to mouse/touch controls:', err);
      }
    }

    initCamera();

    // Custom frame-differencing logic for motion tracking (Stage 4 implementation inside the loop)
    const processMotion = () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        animationFrameId = requestAnimationFrame(processMotion);
        return;
      }

      const video = videoRef.current;
      const width = video.videoWidth || 320;
      const height = video.videoHeight || 240;

      // Offscreen canvas for frame processing
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const ctx = tempCanvas.getContext('2d');

      try {
        ctx.drawImage(video, 0, 0, width, height);
        const frame = ctx.getImageData(0, 0, width, height);
        const data = frame.data;

        if (prevFrameData) {
          let motionSumX = 0;
          let motionPixelCount = 0;

          // Process pixels (step by 4 for performance)
          for (let i = 0; i < data.length; i += 16) {
            const rDiff = Math.abs(data[i] - prevFrameData[i]);
            const gDiff = Math.abs(data[i + 1] - prevFrameData[i + 1]);
            const bDiff = Math.abs(data[i + 2] - prevFrameData[i + 2]);
            const diff = (rDiff + gDiff + bDiff) / 3;

            // Movement threshold
            if (diff > 35) {
              const pixelIndex = i / 4;
              const x = pixelIndex % width;
              motionSumX += x;
              motionPixelCount++;
            }
          }

          if (motionPixelCount > 30) {
            const centroidX = motionSumX / motionPixelCount;
            // Mirror coordinates: move left when user moves left (since webcam is mirrored)
            const normalizedX = 1.0 - (centroidX / width);

            // Map to basket target center
            const basketWidth = gameStateRef.current.basket.width;
            const targetX = normalizedX * 2160 - basketWidth / 2;
            gameStateRef.current.basket.targetX = Math.max(0, Math.min(2160 - basketWidth, targetX));
          }
        }

        prevFrameData = data;
      } catch (e) {
        // Handle cross-origin or canvas read errors silently
      }

      animationFrameId = requestAnimationFrame(processMotion);
    };

    if (trackingActive) {
      processMotion();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [trackingActive]);

  // Main game timer countdown (30s)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          gameStateRef.current.gameActive = false;
          // Game Over - Save final score
          saveFinalScore();
          return 0;
        }
        gameStateRef.current.timeLeft = prev - 1;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // API Call to update final score at the end of the game
  const saveFinalScore = async () => {
    const finalGameScore = gameStateRef.current.score;
    if (participant && participant.id) {
      try {
        await fetch(`${backendUrl}/api/score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: participant.id,
            score: finalGameScore
          })
        });
      } catch (err) {
        console.error('Failed to submit final score to backend:', err);
      }
    }
    // Transition to score page
    onGameOver(finalGameScore);
  };

  // Main Canvas Rendering & Physics updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Preload falling object logo images
    const dafoxaImg = new Image();
    dafoxaImg.src = bgLogoDafoxa;
    let dafoxaDrawable = dafoxaImg;
    dafoxaImg.onload = () => {
      dafoxaDrawable = makeImageTransparent(dafoxaImg);
    };

    const halalImg = new Image();
    halalImg.src = bgLogoHalal;
    let halalDrawable = halalImg;
    halalImg.onload = () => {
      halalDrawable = makeImageTransparent(halalImg);
    };

    const poinPlusImg = new Image();
    poinPlusImg.src = bgPoinPlus;
    let poinPlusDrawable = poinPlusImg;
    poinPlusImg.onload = () => {
      poinPlusDrawable = makeImageTransparent(poinPlusImg);
    };

    const poinMinusImg = new Image();
    poinMinusImg.src = bgPoinMinus;
    let poinMinusDrawable = poinMinusImg;
    poinMinusImg.onload = () => {
      poinMinusDrawable = makeImageTransparent(poinMinusImg);
    };

    // Scale drawings for the canvas size
    canvas.width = 2160;
    canvas.height = 3840;

    let loopId;

    const updatePhysics = (timestamp) => {
      const state = gameStateRef.current;
      if (!state.gameActive) return;

      const diffSettings = state.difficultySettings[difficulty] || state.difficultySettings.medium;

      // 1. Smoothly interpolate basket position (linear easing)
      state.basket.x += (state.basket.targetX - state.basket.x) * 0.25;

      // 2. Obstacles spawning
      if (timestamp - state.lastSpawnTime > diffSettings.spawnInterval) {
        for (let s = 0; s < diffSettings.spawnCount; s++) {
          const isPositive = Math.random() > 0.4; // 60% chance positive, 40% negative

          // Make Dafoxa logo larger (e.g. width = 300, height = 225)
          // Make Halal logo larger (width = 240, height = 240)
          const width = isPositive ? 300 : 240;
          const height = isPositive ? 225 : 240;

          const x = Math.random() * (2160 - width);
          const speed = diffSettings.minSpeed + Math.random() * (diffSettings.maxSpeed - diffSettings.minSpeed);

          state.items.push({
            id: Math.random().toString(36).substring(2, 9),
            x,
            y: -height,
            width,
            height,
            speed,
            isPositive,
            rotation: 0,
            rotSpeed: 0
          });
        }
        state.lastSpawnTime = timestamp;
      }

      // 3. Update items position & check collision
      state.items = state.items.filter((item) => {
        // Fall down
        item.y += item.speed;
        item.rotation += item.rotSpeed;

        // Collision Check (AABB Bounding Box)
        const basket = state.basket;
        const collided =
          item.x + item.width >= basket.x + 40 && // margin insets to make hitbox tight
          item.x <= basket.x + basket.width - 40 &&
          item.y + item.height >= basket.y + 20 &&
          item.y <= basket.y + basket.height;

        if (collided) {
          // Collision reaction
          // Pushes a splash pop-up image (+1 / -1) from assets
          state.splashes.push({
            id: Math.random().toString(36).substring(2, 9),
            x: item.x + item.width / 2,
            y: basket.y - 80, // positioned slightly above the basket Y
            vy: -4, // floats upwards
            alpha: 1.0,
            isPositive: item.isPositive,
            width: 160, // size of points indicator image
            height: 160
          });

          if (item.isPositive) {
            state.score += 1;
            createParticles(item.x + item.width / 2, item.y + item.height / 2, '#06b6d4');
          } else {
            state.score = Math.max(0, state.score - 1); // Avoid negative scores if desired, or allow them. Let's do max 0.
            createParticles(item.x + item.width / 2, item.y + item.height / 2, '#ef4444');
          }
          // Sync with component state
          setScore(state.score);
          return false; // Remove item
        }

        // Remove if out of screen
        return item.y < 3840;
      });

      // 4. Update particles animation
      state.particles = state.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        return p.alpha > 0;
      });

      // 5. Update splash popup animations
      state.splashes = state.splashes.filter((s) => {
        s.y += s.vy;
        s.alpha -= 0.025; // fades out in 40 frames (~0.6s)
        return s.alpha > 0;
      });
    };

    const createParticles = (x, y, color) => {
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 12;
        gameStateRef.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 10 + Math.random() * 20,
          color,
          alpha: 1
        });
      }
    };

    const drawGame = () => {
      const state = gameStateRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, 2160, 3840);

      // Draw background
      // Note: We overlay canvas over bgGame element to keep rendering performance high

      // 1. Draw falling items
      state.items.forEach((item) => {
        ctx.save();
        ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
        ctx.rotate(item.rotation);

        if (item.isPositive) {
          // Draw transparent Dafoxa logo
          ctx.drawImage(dafoxaDrawable, -item.width / 2, -item.height / 2, item.width, item.height);
        } else {
          // Draw transparent Halal logo
          ctx.drawImage(halalDrawable, -item.width / 2, -item.height / 2, item.width, item.height);
        }
        ctx.restore();
      });

      // 2. Draw particle bursts
      state.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 2.5 Draw score splash (+1 / -1) popups
      state.splashes.forEach((s) => {
        ctx.save();
        ctx.globalAlpha = s.alpha;
        const drawable = s.isPositive ? poinPlusDrawable : poinMinusDrawable;
        // Center the splash image
        ctx.drawImage(drawable, s.x - s.width / 2, s.y - s.height / 2, s.width, s.height);
        ctx.restore();
      });

      // 3. Draw Medical Basket (First-Aid Kit Box)
      const basket = state.basket;
      ctx.save();
      // Draw white body
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 8;
      // Draw body shadow
      ctx.shadowBlur = 40;
      ctx.shadowColor = 'rgba(0,0,0,0.15)';

      // Draw body
      ctx.beginPath();
      ctx.roundRect(basket.x, basket.y + 50, basket.width, basket.height - 50, 40);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw top lid handles
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.roundRect(basket.x + 40, basket.y + 30, basket.width - 80, 24, 8);
      ctx.fill();

      // Draw main handle
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(basket.x + basket.width / 2, basket.y + 30, 60, Math.PI, 0);
      ctx.stroke();

      // Draw latches
      ctx.fillStyle = '#64748b';
      ctx.fillRect(basket.x + (basket.width * 0.2), basket.y + 50, 36, 40);
      ctx.fillRect(basket.x + (basket.width * 0.8) - 36, basket.y + 50, 36, 40);

      // Draw medical red cross circle logo in center
      const centerY = basket.y + 185;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(basket.x + basket.width / 2, centerY, 70, 0, Math.PI * 2);
      ctx.fill();

      // White cross inside
      ctx.fillStyle = '#ffffff';
      // Vertical bar
      ctx.fillRect(basket.x + basket.width / 2 - 16, centerY - 45, 32, 90);
      // Horizontal bar
      ctx.fillRect(basket.x + basket.width / 2 - 45, centerY - 16, 90, 32);

      ctx.restore();
    };

    const gameLoop = (timestamp) => {
      updatePhysics(timestamp);
      drawGame();
      if (gameStateRef.current.gameActive) {
        loopId = requestAnimationFrame(gameLoop);
      }
    };

    // Begin loop
    loopId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(loopId);
  }, [difficulty]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col justify-between items-center relative select-none cursor-none"
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
      style={{
        backgroundImage: `url(${bgGame})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Hidden webcam stream for background body centroid calculation */}
      <video
        ref={videoRef}
        className="hidden-video"
        playsInline
        muted
      />

      {/* Sleek Top Panel: HUD Timer & Live Score */}
      <div className="w-[2000px] mt-16 px-12 flex justify-between items-center z-10">

        {/* Score Board */}
        <div className="bg-cyan-900/60 backdrop-blur border-4 border-cyan-400 rounded-3xl py-6 px-12 flex items-center space-x-6 shadow-lg shadow-cyan-950/20">
          <span className="text-[44px] font-black text-cyan-300 uppercase tracking-widest">SKOR:</span>
          <span className="text-[96px] font-black text-white leading-none game-hud w-[160px] text-center">
            {score}
          </span>
        </div>

        {/* Level Indicator */}
        <div className="bg-slate-900/60 backdrop-blur border-4 border-slate-700 rounded-3xl py-4 px-8">
          <span className="text-[36px] font-extrabold text-cyan-400 uppercase tracking-widest">
            Level: {difficulty}
          </span>
        </div>

        {/* Timer Board */}
        <div className={`backdrop-blur border-4 rounded-3xl py-6 px-12 flex items-center space-x-6 shadow-lg transition-all ${timeLeft <= 5
          ? 'bg-red-950/70 border-red-500 animate-pulse text-red-100'
          : 'bg-cyan-900/60 border-cyan-400 text-white'
          }`}>
          <span className="text-[44px] font-black uppercase tracking-widest">WAKTU:</span>
          <span className="text-[96px] font-black leading-none game-hud w-[120px] text-center">
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Floating Tracking Indicator */}
      <div className="absolute top-[280px] bg-slate-950/75 text-[32px] font-black tracking-wide rounded-full px-6 py-2 text-cyan-300 flex items-center space-x-3 shadow-md z-10">
        <span className={`w-4 h-4 rounded-full ${trackingActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
        <span>
          {trackingActive
            ? 'KAMERA AKTIF: Gerakkan badan Anda ke kiri/kanan'
            : 'MOUSE MODE: Geser mouse ke kiri/kanan untuk bermain'}
        </span>
      </div>

      {/* Core Canvas Element */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block z-0"
      />
    </div>
  );
}

export default Game;
