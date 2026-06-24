import React, { useState } from 'react';

function AdminSettings({ backendUrl, config, difficulty, setDifficulty, onConfigChange, onClose }) {
  const [showNoHp, setShowNoHp] = useState(config.showNoHp);
  const [showEmail, setShowEmail] = useState(config.showEmail);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveConfig = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch(`${backendUrl}/api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ showNoHp, showEmail })
      });
      const data = await res.json();
      if (res.ok) {
        onConfigChange(data.config);
        setSuccessMsg('Konfigurasi berhasil disimpan!');
        setTimeout(() => setSuccessMsg(''), 2000);
      } else {
        setErrorMsg(data.error || 'Gagal menyimpan konfigurasi.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Koneksi ke backend gagal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-16">
      <div className="w-[1600px] bg-slate-900 border-4 border-cyan-500 rounded-[50px] p-16 text-white shadow-2xl flex flex-col space-y-12">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b-4 border-slate-800 pb-6">
          <h2 className="text-[72px] font-black text-cyan-400 uppercase tracking-wider">
            Pengaturan Game & API
          </h2>
          <button
            onClick={onClose}
            className="text-[64px] text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Status Indicators */}
        {successMsg && (
          <div className="w-full bg-emerald-950/80 border-4 border-emerald-500 rounded-3xl p-6 text-[44px] text-emerald-400 text-center font-bold">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="w-full bg-red-950/80 border-4 border-red-500 rounded-3xl p-6 text-[44px] text-red-400 text-center font-bold">
            {errorMsg}
          </div>
        )}

        {/* Section 1: Field Visibility */}
        <div className="flex flex-col space-y-6">
          <h3 className="text-[52px] font-bold text-slate-300 border-l-8 border-cyan-500 pl-4 uppercase tracking-wide">
            Form Pendaftaran (Config Backend)
          </h3>
          <div className="space-y-6 pl-4">
            
            {/* No HP Toggle */}
            <label className="flex items-center space-x-6 cursor-pointer">
              <input
                type="checkbox"
                checked={showNoHp}
                onChange={(e) => setShowNoHp(e.target.checked)}
                className="w-16 h-16 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500 accent-cyan-500 cursor-pointer"
              />
              <span className="text-[48px] font-medium text-slate-200">
                Tampilkan Kolom "No HP"
              </span>
            </label>

            {/* Email Toggle */}
            <label className="flex items-center space-x-6 cursor-pointer">
              <input
                type="checkbox"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="w-16 h-16 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500 accent-cyan-500 cursor-pointer"
              />
              <span className="text-[48px] font-medium text-slate-200">
                Tampilkan Kolom "Email"
              </span>
            </label>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="w-full h-[140px] rounded-2xl bg-cyan-600 hover:bg-cyan-500 active:scale-98 transition-all text-[44px] font-black tracking-wider uppercase cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Simpan Toggle Kolom (Update Config)'}
          </button>
        </div>

        {/* Section 2: Difficulty Selection */}
        <div className="flex flex-col space-y-6 pt-6 border-t-4 border-slate-800">
          <h3 className="text-[52px] font-bold text-slate-300 border-l-8 border-cyan-500 pl-4 uppercase tracking-wide">
            Tingkat Kesulitan Game (Local State)
          </h3>
          <div className="grid grid-cols-3 gap-6 pl-4 pt-4">
            {['easy', 'medium', 'hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`h-[160px] rounded-3xl text-[48px] font-black tracking-widest uppercase transition-all cursor-pointer ${
                  difficulty === diff
                    ? 'bg-cyan-500 text-white border-[6px] border-white shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-8">
          <button
            onClick={onClose}
            className="w-full h-[160px] rounded-full bg-slate-800 hover:bg-slate-700 transition-all text-slate-300 hover:text-white text-[48px] font-black tracking-widest uppercase cursor-pointer flex items-center justify-center"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}

export default AdminSettings;
