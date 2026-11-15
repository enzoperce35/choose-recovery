import React, { useState, useRef } from 'react';

// Default motivation image (serene nature placeholder if none is uploaded)
const DEFAULT_MOTIVATION_IMAGE = "/default-motivation.png";

// Helper: Compress image to fit safely in localStorage (~100KB)
const compressImageToBase64 = (file, maxWidth = 720, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function Recovery({ onBack }) {
  const [recoveryData, setRecoveryData] = useState(() => {
    try {
      const saved = localStorage.getItem('gp_recovery_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [hasSaidYes, setHasSaidYes] = useState(false);
  const [sentenceInput, setSentenceInput] = useState('');
  const [pendingImage, setPendingImage] = useState(null);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef(null);

  const handleSaveRecovery = (e) => {
    e.preventDefault();
    if (!sentenceInput.trim()) {
      setFormError('Mangyaring kumpletuhin ang pangungusap.');
      return;
    }

    const startDate = new Date();
    const targetDate = new Date(startDate);
    targetDate.setMonth(targetDate.getMonth() + 6);

    const newProfile = {
      startDate: startDate.toISOString(),
      targetDate: targetDate.toISOString(),
      formattedTargetDate: targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      sentence: sentenceInput.trim(),
      // Falls back to default image if none was uploaded
      image: pendingImage || DEFAULT_MOTIVATION_IMAGE,
    };

    try {
      localStorage.setItem('gp_recovery_profile', JSON.stringify(newProfile));
      setRecoveryData(newProfile);
      setFormError('');
    } catch {
      setFormError('Puno na ang storage ng browser. Subukan ang mas maliit na larawan.');
    }
  };

  const handleResetRecovery = () => {
    if (window.confirm('Gusto mo bang magsimula ng bagong recovery goal?')) {
      localStorage.removeItem('gp_recovery_profile');
      setRecoveryData(null);
      setHasSaidYes(false);
      setSentenceInput('');
      setPendingImage(null);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageToBase64(file);
      setPendingImage(compressed);
      setFormError('');
    } catch {
      setFormError('Hindi ma-process ang larawan.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#EAE6DF] px-6 py-8 md:py-12 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full space-y-10">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-5">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-600 font-mono text-xs transition-colors cursor-pointer"
          >
            ← Back
          </button>
        </div>

        {/* STEP 1: INITIAL QUESTION */}
        {!recoveryData && !hasSaidYes && (
          <div className="p-10 md:p-14 rounded-2xl bg-[#13161B] border border-stone-800/90 text-center space-y-8 shadow-2xl my-auto">
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-emerald-400/80">
                Bagong Simula
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-100 leading-snug">
                Do you want to start your recovery today?
              </h2>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setHasSaidYes(true)}
                className="px-12 py-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-stone-950 font-bold font-mono text-sm uppercase tracking-widest transition-all duration-200 active:scale-95 cursor-pointer shadow-lg"
              >
                Yes
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GOAL FORM */}
        {!recoveryData && hasSaidYes && (
          <form onSubmit={handleSaveRecovery} className="p-8 rounded-2xl bg-[#13161B] border border-stone-800/90 space-y-8 shadow-2xl">
            <div className="space-y-3">
              <label className="block font-serif text-xl md:text-2xl text-stone-100 font-semibold">
                Pag naka-recover na ako...
              </label>
              <textarea
                value={sentenceInput}
                onChange={(e) => setSentenceInput(e.target.value)}
                rows={3}
                placeholder="babawi ako sa pamilya ko, ibibili ko ang anak ko ng mas magagandang gamit"
                className="w-full bg-[#0D0F12] border border-stone-700/80 rounded-xl p-4 font-serif text-lg text-stone-100 focus:outline-none focus:border-emerald-500/60 placeholder-stone-600"
              />
            </div>

            <div className="space-y-3">
              <label className="block font-serif text-base text-stone-300">
                you can add image for extra motivation
              </label>
              <div className="flex items-center gap-4">
                <label className="px-5 py-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 hover:bg-stone-800 font-mono text-xs uppercase tracking-wider cursor-pointer transition-colors">
                  {pendingImage ? 'Palitan ang Larawan' : 'Pumili ng Larawan'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {pendingImage && (
                  <span className="font-mono text-xs text-emerald-400">✓ Na-upload na</span>
                )}
              </div>
              {pendingImage && (
                <div className="mt-3 aspect-[16/9] w-full max-w-xs rounded-xl overflow-hidden border border-stone-800">
                  <img src={pendingImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {formError && (
              <p className="text-xs text-red-400 font-mono">{formError}</p>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-stone-950 font-bold font-mono text-sm uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
            >
              Simulan ang Recovery Ko
            </button>
          </form>
        )}

        {/* STEP 3: SAVED DASHBOARD (Always has an image, custom or default) */}
        {recoveryData && (
          <div className="p-8 md:p-10 rounded-2xl bg-[#13161B] border border-stone-800/90 space-y-8 text-center shadow-2xl">
            <div className="space-y-2">
              <h2 className="font-serif text-4xl md:text-6xl font-bold text-stone-100 tracking-tight">
                {recoveryData.formattedTargetDate}
              </h2>
            </div>

            <div className="p-6 rounded-xl bg-[#0D0F12] border border-stone-800/80 space-y-2">
              <p className="font-serif text-2xl md:text-3xl text-amber-200/90 italic leading-relaxed">
                "{recoveryData.sentence}"
              </p>
            </div>

            {/* Displays either uploaded image or the default motivation image */}
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 shadow-lg">
              <img
                src={recoveryData.image || DEFAULT_MOTIVATION_IMAGE}
                alt="Recovery Motivation"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="pt-4 border-t border-stone-800/60 items-center justify-between">
              <button
                onClick={handleResetRecovery}
                className="font-mono text-xs text-stone-500 hover:text-red-400 underline underline-offset-4 cursor-pointer transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}

      </div>

      <div className="text-center py-6">
        <span className="font-mono text-[11px] text-stone-600 tracking-widest uppercase">
          Isang araw sa isang pagkakataon.
        </span>
      </div>
    </div>
  );
}
