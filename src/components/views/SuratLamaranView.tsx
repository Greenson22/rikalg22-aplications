import React, { useState, useRef, useEffect } from 'react';
import { Printer, Type, AlignJustify, Move, Trash2, Check, Upload, Settings2, Plus, Minus } from 'lucide-react';

export const SuratLamaranView = () => {
  // State untuk pengaturan dokumen
  const [settings, setSettings] = useState({
    fontSize: 12,
    lineHeight: 1.4,
    margin: 2.0
  });

  // State & Ref untuk Tanda Tangan
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); 
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragItemRef = useRef<HTMLImageElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // --- LOGIC PENGATURAN HALAMAN ---
  const adjust = (type: 'font' | 'line' | 'margin', val: number) => {
    setSettings(prev => {
      let newValue;
      switch(type) {
        case 'font':
          newValue = Math.max(10, Math.min(14, prev.fontSize + val));
          return { ...prev, fontSize: newValue };
        case 'line':
          newValue = Math.max(1.0, Math.min(2.0, prev.lineHeight + val));
          return { ...prev, lineHeight: parseFloat(newValue.toFixed(1)) };
        case 'margin':
          newValue = Math.max(1.0, Math.min(3.0, prev.margin + val));
          return { ...prev, margin: parseFloat(newValue.toFixed(1)) };
        default: return prev;
      }
    });
  };

  // --- LOGIC CANVAS DRAWING ---
  const getPos = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
       clientX = e.touches[0].clientX;
       clientY = e.touches[0].clientY;
    } else {
       clientX = (e as React.MouseEvent).clientX;
       clientY = (e as React.MouseEvent).clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const p = getPos(e);
    lastPos.current = p;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    if ('touches' in e) e.preventDefault();
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    lastPos.current = p;
  };

  const stopDrawing = () => { isDrawing.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureImage(null);
  };

  const useSignature = () => {
    if (canvasRef.current) {
      setSignatureImage(canvasRef.current.toDataURL('image/png'));
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if(ev.target?.result) setSignatureImage(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // --- LOGIC DRAG AND DROP ---
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !dragItemRef.current) return;
      const parentRect = dragItemRef.current.parentElement?.getBoundingClientRect();
      if (!parentRect) return;
      let clientX, clientY;
      if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = (e as MouseEvent).clientX;
          clientY = (e as MouseEvent).clientY;
      }
      const x = clientX - parentRect.left - (dragItemRef.current.width / 2);
      const y = clientY - parentRect.top - (dragItemRef.current.height / 2);
      setPosition({ x, y });
    };

    const handleGlobalUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalUp);
      window.addEventListener('touchmove', handleGlobalMove, { passive: false });
      window.addEventListener('touchend', handleGlobalUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isDragging]);


  return (
    <div className="flex flex-col items-center w-full min-h-full pb-10">
      
      {/* --- CONTROL PANEL (Redesigned) --- */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 mb-8 w-full max-w-4xl print:hidden transition-all">
        {/* Header Control Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                    <Settings2 size={22} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Pengaturan Dokumen</h3>
                    <p className="text-sm text-zinc-500">Sesuaikan tampilan surat lamaran Anda</p>
                </div>
            </div>
            <button 
                onClick={() => window.print()} 
                className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 hover:dark:bg-zinc-100 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-zinc-200 dark:shadow-zinc-900/20 active:scale-95"
            >
                <Printer size={18} /> 
                <span>Cetak / PDF</span>
            </button>
        </div>

        {/* Grid Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Font Size Control */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <Type size={16} className="text-blue-500" />
                    Ukuran Huruf
                    <span className="ml-auto text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 font-bold border border-zinc-200 dark:border-zinc-700">
                        {settings.fontSize}pt
                    </span>
                </div>
                <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <button onClick={() => adjust('font', -1)} className="flex-1 p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg shadow-sm transition-all text-zinc-600 dark:text-zinc-400 active:scale-95">
                        <Minus size={16} className="mx-auto" />
                    </button>
                    <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700"></div>
                    <button onClick={() => adjust('font', 1)} className="flex-1 p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg shadow-sm transition-all text-zinc-600 dark:text-zinc-400 active:scale-95">
                        <Plus size={16} className="mx-auto" />
                    </button>
                </div>
            </div>

            {/* Line Height Control */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <AlignJustify size={16} className="text-indigo-500" />
                    Spasi Baris
                    <span className="ml-auto text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 font-bold border border-zinc-200 dark:border-zinc-700">
                        {settings.lineHeight}
                    </span>
                </div>
                <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <button onClick={() => adjust('line', -0.1)} className="flex-1 p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg shadow-sm transition-all text-zinc-600 dark:text-zinc-400 active:scale-95">
                        <Minus size={16} className="mx-auto" />
                    </button>
                    <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700"></div>
                    <button onClick={() => adjust('line', 0.1)} className="flex-1 p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg shadow-sm transition-all text-zinc-600 dark:text-zinc-400 active:scale-95">
                        <Plus size={16} className="mx-auto" />
                    </button>
                </div>
            </div>

            {/* Margin Control */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <Move size={16} className="text-emerald-500" />
                    Margin Kertas
                    <span className="ml-auto text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 font-bold border border-zinc-200 dark:border-zinc-700">
                        {settings.margin}cm
                    </span>
                </div>
                <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <button onClick={() => adjust('margin', -0.2)} className="flex-1 p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg shadow-sm transition-all text-zinc-600 dark:text-zinc-400 active:scale-95">
                        <Minus size={16} className="mx-auto" />
                    </button>
                    <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700"></div>
                    <button onClick={() => adjust('margin', 0.2)} className="flex-1 p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg shadow-sm transition-all text-zinc-600 dark:text-zinc-400 active:scale-95">
                        <Plus size={16} className="mx-auto" />
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* --- HALAMAN KERTAS (A4) --- */}
      <div 
        className="bg-white text-black shadow-2xl print:shadow-none relative mx-auto transition-all duration-300"
        style={{
            width: '21cm',
            minHeight: '29.7cm',
            padding: `${settings.margin}cm`,
            fontSize: `${settings.fontSize}pt`,
            lineHeight: settings.lineHeight,
            fontFamily: '"Times New Roman", Times, serif'
        }}
      >
        <style jsx global>{`
            @media print {
                body * { visibility: hidden; }
                .page-container-print, .page-container-print * { visibility: visible; }
                .page-container-print { 
                    position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; 
                }
                nav, aside, header, .no-print { display: none !important; }
            }
        `}</style>

        <div className="page-container-print">
            {/* Header Date */}
            <div className="text-right mb-6">
                Manado, 5 Februari 2026
            </div>

            {/* Recipient */}
            <div className="text-left mb-8">
                Perihal: <strong>Lamaran Pekerjaan</strong><br /><br />
                Yth.<br />
                <strong>Bapak/Ibu HRD<br />
                PP BRI Manado</strong><br />
                di<br />
                Tempat
            </div>

            {/* Content */}
            <div className="text-justify">
                <p className="mb-4">Dengan hormat,</p>

                <p className="mb-4">Berdasarkan informasi yang saya peroleh bahwa PP BRI Manado yang Bapak/Ibu pimpin saat ini sedang membutuhkan tenaga kerja untuk posisi <strong>Financial Advisor PP BRI</strong>.</p>

                <p className="mb-4">Oleh karena itu, melalui surat ini saya mengajukan permohonan untuk melamar kerja dan mengisi posisi tersebut. Latar belakang pendidikan saya di bidang Teknik Informatika melatih saya untuk berpikir logis, analitis, dan cepat beradaptasi dengan teknologi, yang saya yakini dapat mendukung kinerja saya dalam mengelola data nasabah dan mencapai target perusahaan.</p>

                <p className="mb-4">Adapun data diri saya sebagai berikut:</p>

                <table className="w-full border-collapse mb-4 mt-2">
                    <tbody>
                        <tr><td className="w-40 font-bold align-top pb-1">Nama</td><td className="w-4 align-top text-center">:</td><td><strong>Frendy Rikal Gerung</strong></td></tr>
                        <tr><td className="w-40 font-bold align-top pb-1">Tempat, Tgl. Lahir</td><td className="w-4 align-top text-center">:</td><td>Raanan Baru, 22 Februari 2002</td></tr>
                        <tr><td className="w-40 font-bold align-top pb-1">Pendidikan Terakhir</td><td className="w-4 align-top text-center">:</td><td>S1 Teknik Informatika</td></tr>
                        <tr><td className="w-40 font-bold align-top pb-1">Alamat</td><td className="w-4 align-top text-center">:</td><td>Raanan Baru Satu Jaga IV</td></tr>
                        <tr><td className="w-40 font-bold align-top pb-1">No. Telepon</td><td className="w-4 align-top text-center">:</td><td>0852-9893-7694</td></tr>
                        <tr><td className="w-40 font-bold align-top pb-1">Email</td><td className="w-4 align-top text-center">:</td><td>frendegerung634@gmail.com</td></tr>
                    </tbody>
                </table>

                <p className="mb-4">Sebagai bahan pertimbangan, saya lampirkan:</p>

                <ol className="list-decimal ml-6 pl-2 mb-4">
                    <li>Surat Lamaran</li>
                    <li>CV</li>
                </ol>

                <p className="mb-4">Besar harapan saya untuk diberi kesempatan wawancara, dan dapat menjelaskan lebih mendalam mengenai diri saya. Saya mempunyai latar belakang pendidikan, motivasi yang tinggi dan mau belajar.</p>

                <p className="mb-4">Demikian saya sampaikan, terima kasih atas perhatian Bapak/Ibu.</p>
            </div>

            {/* Signature Section */}
            <div className="mt-8 relative h-40">
                <p>Hormat Saya,</p>

                {/* Draggable Signature Result */}
                {signatureImage && (
                    <img 
                        ref={dragItemRef}
                        src={signatureImage} 
                        alt="Tanda Tangan" 
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                        className="absolute h-[70px] cursor-move z-10 hover:outline hover:outline-2 hover:outline-dashed hover:outline-zinc-300"
                        style={{
                            left: position.x,
                            top: position.y
                        }}
                    />
                )}

                <p className="font-bold underline mt-20 relative z-0">Frendy Rikal Gerung</p>
            </div>
        </div>
      </div>

      {/* --- TOOLS TANDA TANGAN (Redesigned) --- */}
      <div className="mt-8 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center print:hidden w-full max-w-md">
        <h3 className="text-zinc-900 dark:text-white font-bold mb-4">Area Tanda Tangan</h3>
        
        <div className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl inline-block">
            <canvas 
                ref={canvasRef}
                width={300} 
                height={100} 
                className="bg-white border border-zinc-200 dark:border-zinc-700 rounded-lg mx-auto touch-none cursor-crosshair shadow-inner"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
        </div>

        <div className="flex gap-2 justify-center mt-6">
            <button onClick={clearCanvas} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors">
                <Trash2 size={16} /> Hapus
            </button>
            <button onClick={useSignature} className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium text-sm transition-colors">
                <Check size={16} /> Pakai
            </button>
            <label className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm cursor-pointer transition-colors">
                <Upload size={16} /> Upload
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
        </div>
        <p className="text-xs text-zinc-400 mt-4 px-4">*Tanda tangan di kotak atau upload gambar, klik "Pakai", lalu geser tanda tangan di surat ke posisi yang pas.</p>
      </div>

    </div>
  );
};