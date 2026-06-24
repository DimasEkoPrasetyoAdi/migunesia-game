import React from 'react';
import bgBase from '../assets/bg_base.png';

function Home({ onStart }) {
  return (
    <div
      className="w-full h-full flex flex-col justify-end items-center relative select-none"
      style={{
        backgroundImage: `url(${bgBase})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Logos and footer waves are pre-baked in bg_base.png */}

      {/* Styled Title "TANGKAP OBJEK!" using Lilita One (matches the brush font style) */}
      <div className="absolute top-[1380px] w-full flex flex-col items-center justify-center">
        <h1
          className="text-[200px] italic text-[#009FAD] tracking-wider leading-none text-center select-none uppercase"
          style={{
            fontFamily: "'Lilita One', sans-serif",
          }}
        >
          TANGKAP
        </h1>
        <h1
          className="text-[200px] italic text-[#009FAD] tracking-wider leading-none text-center select-none uppercase mt-4"
          style={{
            fontFamily: "'Lilita One', sans-serif",
          }}
        >
          OBJEK!
        </h1>
      </div>

      {/* Styled START Button with Double Border and Oswald Font */}
      <div className="absolute top-[2280px] w-full flex justify-center">
        <button
          onClick={onStart}
          className="w-[820px] h-[240px] rounded-[120px] bg-[#00B9CE] hover:bg-[#00a6b8] border-[12px] border-white outline outline-[10px] outline-[#00B9CE] text-white text-[96px] tracking-[10px] uppercase cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(0,185,206,0.3)] flex items-center justify-center pulse-btn pl-[10px]"
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 500
          }}
        >
          START
        </button>
      </div>
    </div>
  );
}

export default Home;
