import React, { useState, useRef, useEffect } from 'react';
import { Printer, Type, AlignJustify, Move, Trash2, Check, Upload } from 'lucide-react';

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
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Posisi relatif tanda tangan
  
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
    
    // Handle both mouse and touch events safely
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
    
    // Prevent scrolling on touch
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
    
    // Calculate offset logic here if needed, keeping simple for this snippet
  };

  // Global mouse move/up listener for dragging
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

      // Simple relative positioning within the signature container
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
    <div className="flex flex-col items-center w-full bg-zinc-100 dark:bg-black py-8 min-h-screen">
      
      {/* --- CONTROL PANEL --- */}
      <div className="bg-zinc-800 text-white p-4 rounded-xl shadow-lg mb-8 flex flex-wrap gap-6 items-center sticky top-20 z-20 print:hidden">
        <div className="font-bold flex items-center gap-2">
            <span>🎛️ Atur Halaman</span>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-700 px-3 py-1.5 rounded-lg">
            <Type size={16} className="text-zinc-400" />
            <span className="text-sm">Huruf: {settings.fontSize}pt</span>
            <div className="flex gap-1 ml-2">
                <button onClick={() => adjust('font', -1)} className="px-2 bg-zinc-600 hover:bg-zinc-500 rounded">-</button>
                <button onClick={() => adjust('font', 1)} className="px-2 bg-zinc-600 hover:bg-zinc-500 rounded">+</button>
            </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-700 px-3 py-1.5 rounded-lg">
            <AlignJustify size={16} className="text-zinc-400" />
            <span className="text-sm">Spasi: {settings.lineHeight}</span>
            <div className="flex gap-1 ml-2">
                <button onClick={() => adjust('line', -0.1)} className="px-2 bg-zinc-600 hover:bg-zinc-500 rounded">-</button>
                <button onClick={() => adjust('line', 0.1)} className="px-2 bg-zinc-600 hover:bg-zinc-500 rounded">+</button>
            </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-700 px-3 py-1.5 rounded-lg">
            <Move size={16} className="text-zinc-400" />
            <span className="text-sm">Margin: {settings.margin}cm</span>
            <div className="flex gap-1 ml-2">
                <button onClick={() => adjust('margin', -0.2)} className="px-2 bg-zinc-600 hover:bg-zinc-500 rounded">-</button>
                <button onClick={() => adjust('margin', 0.2)} className="px-2 bg-zinc-600 hover:bg-zinc-500 rounded">+</button>
            </div>
        </div>

        <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold transition-colors ml-auto"
        >
            <Printer size={18} /> Cetak / PDF
        </button>
      </div>

      {/* --- HALAMAN KERTAS (A4) --- */}
      <div 
        className="bg-white text-black shadow-2xl print:shadow-none relative mx-auto"
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
                /* Hide sidebar, headers, etc when printing */
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

                {/* Text Nama (Static) */}
                <p className="font-bold underline mt-20 relative z-0">Frendy Rikal Gerung</p>
            </div>
        </div>
      </div>

      {/* --- TOOLS TANDA TANGAN (Hanya muncul di layar/no-print) --- */}
      <div className="mt-8 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm text-center print:hidden w-full max-w-md">
        <h3 className="text-zinc-900 dark:text-white font-bold mb-4">Area Tanda Tangan</h3>
        
        <canvas 
            ref={canvasRef}
            width={300} 
            height={100} 
            className="bg-white border border-zinc-300 rounded-lg mx-auto touch-none cursor-crosshair shadow-inner"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        />

        <div className="flex gap-2 justify-center mt-4">
            <button onClick={clearCanvas} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 font-medium text-sm">
                <Trash2 size={16} /> Hapus
            </button>
            <button onClick={useSignature} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 font-medium text-sm">
                <Check size={16} /> Pakai
            </button>
            <label className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 font-medium text-sm cursor-pointer">
                <Upload size={16} /> Upload
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
        </div>
        <p className="text-xs text-zinc-400 mt-2">*Tanda tangan di kotak, klik "Pakai", lalu geser posisi tanda tangan di surat.</p>
      </div>

    </div>
  );
};