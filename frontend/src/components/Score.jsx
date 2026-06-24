import React, { useEffect } from 'react';
import bgScore from '../assets/bg_score.png';

function Score({ score, onFinished }) {
  useEffect(() => {
    // 5 seconds timeout to reload/redirect back to home
    const timeout = setTimeout(() => {
      onFinished();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [onFinished]);

  return (
    <div
      className="w-full h-full flex flex-col justify-center items-center relative select-none"
      style={{
        backgroundImage: `url(${bgScore})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Logos and header/footer are baked in bg_score.png */}

      {/* Final Score text positioned exactly inside the cyan pill container */}
      {/* Container occupies ~40-50% height vertically */}
      <div className="absolute top-[1700px] w-full flex flex-col items-center justify-center">
        <span
          className="text-white text-[160px] font-black tracking-wide leading-none animate-pulse drop-shadow-md"
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {score}
        </span>
        <span className="text-white/80 text-[40px] font-bold tracking-wider mt-8 uppercase">
          Poin
        </span>
      </div>

      {/* Floating redirect indicator at the bottom */}
      <div className="absolute bottom-[300px] text-center w-full">
        <p className="text-cyan-700/60 text-[44px] font-semibold tracking-wide animate-bounce">
          Kembali ke Menu Utama dalam 5 detik...
        </p>
      </div>
    </div>
  );
}

export default Score;
