import React, { useState, useEffect } from 'react';
import bgCountdown3 from '../assets/bg_countdown_3.png';
import bgCountdown2 from '../assets/bg_countdown_2.png';
import bgCountdown1 from '../assets/bg_countdown_1.png';
import bgBase from '../assets/bg_base.png';

function Countdown({ onComplete }) {
  const [count, setCount] = useState(3);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    setAnimate(true);

    const timer = setInterval(() => {
      setAnimate(false);
      setTimeout(() => {
        setCount((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            // Wait 1 second to show "START!" and then transition
            setTimeout(() => {
              onComplete();
            }, 800);
            return 'START!';
          }
          setAnimate(true);
          return prev - 1;
        });
      }, 100); // Animation delay transition
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [onComplete]);

  // Select background image based on current countdown tick
  let bgImage;
  if (count === 3) bgImage = bgCountdown3;
  else if (count === 2) bgImage = bgCountdown2;
  else if (count === 1) bgImage = bgCountdown1;
  else bgImage = bgBase;

  return (
    <div
      className="w-full h-full flex flex-col justify-center items-center relative select-none"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.2s ease-in-out'
      }}
    >
      {count === 'START!' && (
        <div className="flex justify-center items-center h-full">
          <span
            className={`font-black text-emerald-400 text-[350px] leading-none uppercase tracking-wide select-none drop-shadow-[0_10px_20px_rgba(16,185,129,0.3)] transition-all duration-300 ${
              animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            }`}
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            START!
          </span>
        </div>
      )}
    </div>
  );
}

export default Countdown;
