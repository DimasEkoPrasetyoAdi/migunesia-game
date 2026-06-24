import React, { useState } from 'react';
import bgBase from '../assets/bg_base.png';

function Register({ backendUrl, config, difficulty, setDifficulty, onRegisterSuccess, onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    noHp: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    const clientErrors = [];
    if (!formData.name.trim()) {
      clientErrors.push('Nama lengkap wajib diisi.');
    }
    if (config.showNoHp && !formData.noHp.trim()) {
      clientErrors.push('Nomor HP wajib diisi.');
    }
    if (config.showEmail && !formData.email.trim()) {
      clientErrors.push('Email wajib diisi.');
    } else if (config.showEmail && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        clientErrors.push('Format Email tidak valid.');
      }
    }

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          noHp: config.showNoHp ? formData.noHp : undefined,
          email: config.showEmail ? formData.email : undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        onRegisterSuccess(data.participant);
      } else {
        setErrors(data.errors || [data.error || 'Terjadi kesalahan saat pendaftaran.']);
      }
    } catch (err) {
      console.error(err);
      setErrors(['Tidak dapat terhubung ke server backend. Pastikan server aktif.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col justify-between items-center relative py-24 px-20 select-none"
      style={{
        backgroundImage: `url(${bgBase})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Spacer to push content down below the header logos */}
      <div className="h-[430px]"></div>

      {/* Main Registration Form Card - Premium Styled */}
      <div className="w-[1720px] bg-white/95 border-[12px] border-cyan-500/10 rounded-[80px] shadow-[0_40px_90px_rgba(6,182,212,0.18)] p-20 flex flex-col items-center">
        
        {/* Title using Lilita One for playful gaming layout */}
        <h2 
          className="text-[96px] italic text-[#009FAD] mb-12 text-center leading-tight tracking-wider uppercase"
          style={{ fontFamily: "'Lilita One', sans-serif" }}
        >
          REGISTRASI PESERTA
        </h2>

        {/* Display Validation Errors */}
        {errors.length > 0 && (
          <div className="w-full bg-red-50 border-l-[16px] border-red-500 rounded-[30px] p-8 mb-10 shadow-sm animate-pulse">
            <h3 className="text-red-700 text-[40px] font-black mb-2 uppercase tracking-wide">Pendaftaran Gagal:</h3>
            <ul className="list-disc pl-8 space-y-2">
              {errors.map((err, i) => (
                <li key={i} className="text-red-600 text-[38px] font-bold">
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-10">
          
          {/* 1. Nama Input */}
          <div className="flex flex-col space-y-3">
            <label className="text-[44px] font-black text-cyan-800 uppercase tracking-widest pl-6">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap Anda"
              className="w-full h-[150px] rounded-full border-[6px] border-cyan-100 bg-cyan-50/20 px-12 text-[46px] font-semibold text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* 2. No HP Input (Conditional) */}
          {config.showNoHp && (
            <div className="flex flex-col space-y-3">
              <label className="text-[44px] font-black text-cyan-800 uppercase tracking-widest pl-6">
                Nomor HP
              </label>
              <input
                type="tel"
                name="noHp"
                value={formData.noHp}
                onChange={handleChange}
                placeholder="Contoh: 081234567890"
                className="w-full h-[150px] rounded-full border-[6px] border-cyan-100 bg-cyan-50/20 px-12 text-[46px] font-semibold text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:outline-none transition-all shadow-inner"
              />
            </div>
          )}

          {/* 3. Email Input (Conditional) */}
          {config.showEmail && (
            <div className="flex flex-col space-y-3">
              <label className="text-[44px] font-black text-cyan-800 uppercase tracking-widest pl-6">
                Alamat Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan alamat email Anda"
                className="w-full h-[150px] rounded-full border-[6px] border-cyan-100 bg-cyan-50/20 px-12 text-[46px] font-semibold text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:outline-none transition-all shadow-inner"
              />
            </div>
          )}

          {/* Tingkat Kesulitan Game - Gaming Selector Design */}
          <div className="flex flex-col space-y-4 pt-2">
            <label className="text-[44px] font-black text-cyan-800 uppercase tracking-widest pl-6">
              Pilih Tingkat Kesulitan
            </label>
            <div className="grid grid-cols-3 gap-6">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`h-[120px] rounded-full text-[40px] font-black tracking-widest uppercase transition-all cursor-pointer ${
                    difficulty === level
                      ? 'bg-cyan-400 text-white border-[6px] border-white outline outline-[6px] outline-cyan-400 shadow-md shadow-cyan-400/20'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border-4 border-slate-200'
                  }`}
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons - Styled matching the Home START button */}
          <div className="pt-16 flex flex-col space-y-12">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[160px] rounded-full bg-[#00B9CE] hover:bg-[#00a6b8] border-[10px] border-white outline outline-[8px] outline-[#00B9CE] text-white text-[56px] tracking-[6px] uppercase cursor-pointer transition-all duration-300 transform hover:scale-102 active:scale-98 shadow-[0_15px_40px_rgba(0,185,206,0.3)] flex items-center justify-center disabled:opacity-50 pl-[6px]"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 500
              }}
            >
              {loading ? 'Memproses...' : 'NEXT'}
            </button>

            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="w-full h-[130px] rounded-full bg-slate-200 hover:bg-slate-300 border-[8px] border-white outline outline-[8px] outline-slate-200 text-slate-600 text-[46px] tracking-[6px] uppercase cursor-pointer transition-all duration-300 transform hover:scale-102 active:scale-98 flex items-center justify-center pl-[6px]"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 500
              }}
            >
              Kembali
            </button>
          </div>
        </form>
      </div>

      {/* Spacer to push content up above the bottom waves */}
      <div className="h-[360px]"></div>
    </div>
  );
}

export default Register;
