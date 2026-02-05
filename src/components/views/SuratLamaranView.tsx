import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, Type, AlignJustify, Move, Trash2, Check, Upload, 
  Settings2, Plus, Minus, User, Briefcase, Bot, Copy, Save
} from 'lucide-react';
import { Button } from '../elements/Button'; // Pastikan path import sesuai

// Interface untuk Data Diri
interface UserProfile {
  id: string;
  profileName: string; // Nama simpanan profil (misal: "Frendy - Formal")
  fullName: string;
  birthPlaceDate: string;
  education: string;
  address: string;
  phone: string;
  email: string;
}

// Interface untuk Info Lowongan
interface JobInfo {
  destination: string; // Yth...
  companyName: string; // PP BRI Manado
  position: string; // Financial Advisor
  cityDate: string; // Manado, 5 Februari 2026
  attachments: string; // Surat, CV, KTP (dipisah koma)
}

export const SuratLamaranView = () => {
  // --- STATE CONTROL PANEL ---
  const [activeTab, setActiveTab] = useState<'design' | 'data' | 'ai'>('data');
  
  // State Pengaturan Tampilan
  const [settings, setSettings] = useState({
    fontSize: 12,
    lineHeight: 1.4,
    margin: 2.0
  });

  // State Data Diri (Default)
  const [userData, setUserData] = useState<UserProfile>({
    id: 'default',
    profileName: 'Default User',
    fullName: 'Frendy Rikal Gerung',
    birthPlaceDate: 'Raanan Baru, 22 Februari 2002',
    education: 'S1 Teknik Informatika',
    address: 'Raanan Baru Satu Jaga IV',
    phone: '0852-9893-7694',
    email: 'frendegerung634@gmail.com'
  });

  // State Data Pekerjaan
  const [jobData, setJobData] = useState<JobInfo>({
    destination: 'Bapak/Ibu HRD',
    companyName: 'PP BRI Manado',
    position: 'Financial Advisor',
    cityDate: 'Manado, 5 Februari 2026',
    attachments: 'Surat Lamaran, CV, Fotokopi Ijazah, Transkrip Nilai, Pas Foto'
  });

  // State Profil Tersimpan (Disimulasikan dengan LocalStorage nanti)
  const [savedProfiles, setSavedProfiles] = useState<UserProfile[]>([]);

  // State Tanda Tangan
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); 
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragItemRef = useRef<HTMLImageElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // --- LOGIC LOAD/SAVE PROFIL ---
  useEffect(() => {
    // Load profiles from local storage on mount
    const stored = localStorage.getItem('userProfiles');
    if (stored) {
      setSavedProfiles(JSON.parse(stored));
    }
  }, []);

  const handleSaveProfile = () => {
    const profileName = prompt("Simpan profil dengan nama:", userData.profileName);
    if (profileName) {
      const newProfile = { ...userData, id: Date.now().toString(), profileName };
      const newList = [...savedProfiles, newProfile];
      setSavedProfiles(newList);
      localStorage.setItem('userProfiles', JSON.stringify(newList));
      alert("Profil berhasil disimpan!");
    }
  };

  const handleLoadProfile = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = savedProfiles.find(p => p.id === selectedId);
    if (selected) {
      setUserData(selected);
    }
  };

  // --- LOGIC AI PROMPT GENERATOR ---
  const generateAIPrompt = () => {
    const lampiranList = jobData.attachments.split(',').map(item => `- ${item.trim()}`).join('\n');
    return `Bertindaklah sebagai pelamar kerja profesional. Buatkan saya surat lamaran kerja yang sopan dan meyakinkan.
    
Detail Pelamar:
- Nama: ${userData.fullName}
- TTL: ${userData.birthPlaceDate}
- Pendidikan: ${userData.education}
- Alamat: ${userData.address}
- Kontak: ${userData.phone} / ${userData.email}

Detail Lamaran:
- Posisi dilamar: ${jobData.position}
- Perusahaan tujuan: ${jobData.companyName}
- Penerima surat: ${jobData.destination}
- Lokasi & Tanggal Surat: ${jobData.cityDate}

Lampiran yang disertakan:
${lampiranList}

Instruksi Tambahan:
Buat bahasa yang formal namun tidak kaku. Tekankan bahwa latar belakang pendidikan saya mendukung posisi tersebut.`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateAIPrompt());
    alert("Prompt AI berhasil disalin! Silakan paste ke Gemini/ChatGPT.");
  };

  // --- LOGIC TAMPILAN & CANVAS (Existing) ---
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
    if (canvasRef.current) setSignatureImage(canvasRef.current.toDataURL('image/png'));
  };
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => { if(ev.target?.result) setSignatureImage(ev.target.result as string); };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
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
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 mb-8 w-full max-w-5xl print:hidden transition-all">
        
        {/* Header Control Panel & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-4 overflow-x-auto">
                <button 
                  onClick={() => setActiveTab('data')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'data' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                >
                  <User size={18} /> Data Diri
                </button>
                <button 
                  onClick={() => setActiveTab('design')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'design' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                >
                  <Settings2 size={18} /> Tampilan
                </button>
                <button 
                  onClick={() => setActiveTab('ai')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ai' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                >
                  <Bot size={18} /> AI Prompt
                </button>
            </div>
            
            <button 
                onClick={() => window.print()} 
                className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 hover:dark:bg-zinc-100 px-5 py-2 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm"
            >
                <Printer size={18} /> 
                <span>Cetak / PDF</span>
            </button>
        </div>

        {/* --- TAB CONTENT: DATA DIRI --- */}
        {activeTab === 'data' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
             {/* Kolom Kiri: Profil Pelamar */}
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2"><User size={16}/> Informasi Pelamar</h4>
                  
                  {/* Dropdown Load Profile */}
                  <select 
                    onChange={handleLoadProfile}
                    className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg p-1 outline-none dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <option value="">Pilih Profil Tersimpan...</option>
                    {savedProfiles.map(p => (
                      <option key={p.id} value={p.id}>{p.profileName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3">
                   <input type="text" placeholder="Nama Lengkap" value={userData.fullName} onChange={e => setUserData({...userData, fullName: e.target.value})} className="input-field" />
                   <input type="text" placeholder="Tempat, Tanggal Lahir" value={userData.birthPlaceDate} onChange={e => setUserData({...userData, birthPlaceDate: e.target.value})} className="input-field" />
                   <input type="text" placeholder="Pendidikan Terakhir" value={userData.education} onChange={e => setUserData({...userData, education: e.target.value})} className="input-field" />
                   <input type="text" placeholder="Alamat" value={userData.address} onChange={e => setUserData({...userData, address: e.target.value})} className="input-field" />
                   <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="No. Telepon" value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} className="input-field" />
                      <input type="text" placeholder="Email" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} className="input-field" />
                   </div>
                   <Button variant="ghost" onClick={handleSaveProfile} className="w-full mt-2 border border-dashed border-zinc-300">
                      <Save size={16} /> Simpan Profil Ini
                   </Button>
                </div>
             </div>

             {/* Kolom Kanan: Informasi Lowongan */}
             <div className="space-y-4">
                <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2"><Briefcase size={16}/> Informasi Lowongan</h4>
                <div className="grid grid-cols-1 gap-3">
                   <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Kota, Tanggal Surat" value={jobData.cityDate} onChange={e => setJobData({...jobData, cityDate: e.target.value})} className="input-field" />
                      <input type="text" placeholder="Tujuan (Yth...)" value={jobData.destination} onChange={e => setJobData({...jobData, destination: e.target.value})} className="input-field" />
                   </div>
                   <input type="text" placeholder="Nama Perusahaan" value={jobData.companyName} onChange={e => setJobData({...jobData, companyName: e.target.value})} className="input-field" />
                   <input type="text" placeholder="Posisi yang Dilamar" value={jobData.position} onChange={e => setJobData({...jobData, position: e.target.value})} className="input-field" />
                   
                   <div>
                     <label className="text-xs text-zinc-500 mb-1 block">Lampiran (pisahkan dengan koma)</label>
                     <textarea 
                        rows={3}
                        placeholder="Contoh: CV, Ijazah, KTP" 
                        value={jobData.attachments} 
                        onChange={e => setJobData({...jobData, attachments: e.target.value})} 
                        className="input-field resize-none" 
                     />
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* --- TAB CONTENT: TAMPILAN --- */}
        {activeTab === 'design' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
             {/* Font Size */}
             <div className="control-group">
                <div className="flex justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    <span className="flex items-center gap-2"><Type size={16} className="text-blue-500"/> Ukuran Huruf</span>
                    <span className="badge">{settings.fontSize}pt</span>
                </div>
                <div className="control-buttons">
                    <button onClick={() => adjust('font', -1)}><Minus size={16}/></button>
                    <div className="separator"></div>
                    <button onClick={() => adjust('font', 1)}><Plus size={16}/></button>
                </div>
             </div>
             {/* Line Height */}
             <div className="control-group">
                <div className="flex justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    <span className="flex items-center gap-2"><AlignJustify size={16} className="text-indigo-500"/> Spasi Baris</span>
                    <span className="badge">{settings.lineHeight}</span>
                </div>
                <div className="control-buttons">
                    <button onClick={() => adjust('line', -0.1)}><Minus size={16}/></button>
                    <div className="separator"></div>
                    <button onClick={() => adjust('line', 0.1)}><Plus size={16}/></button>
                </div>
             </div>
             {/* Margin */}
             <div className="control-group">
                <div className="flex justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    <span className="flex items-center gap-2"><Move size={16} className="text-emerald-500"/> Margin</span>
                    <span className="badge">{settings.margin}cm</span>
                </div>
                <div className="control-buttons">
                    <button onClick={() => adjust('margin', -0.2)}><Minus size={16}/></button>
                    <div className="separator"></div>
                    <button onClick={() => adjust('margin', 0.2)}><Plus size={16}/></button>
                </div>
             </div>
          </div>
        )}

        {/* --- TAB CONTENT: AI PROMPT --- */}
        {activeTab === 'ai' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4 mb-4">
               <h4 className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-2">
                 <Bot size={20}/> AI Generator Assistant
               </h4>
               <p className="text-sm text-purple-600 dark:text-purple-400 mb-4">
                 Salin prompt di bawah ini, lalu tempel (paste) ke Gemini, ChatGPT, atau Claude untuk membuatkan isi surat lamaran yang lebih variatif berdasarkan data yang sudah Anda isi.
               </p>
               
               <div className="relative">
                 <textarea 
                    readOnly
                    value={generateAIPrompt()}
                    className="w-full h-48 p-4 text-sm font-mono bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                 />
                 <button 
                    onClick={copyToClipboard}
                    className="absolute top-3 right-3 bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 p-2 rounded-md hover:bg-zinc-50 text-zinc-600 dark:text-zinc-300 transition-colors tooltip"
                    title="Copy to Clipboard"
                 >
                    <Copy size={16} />
                 </button>
               </div>
             </div>
          </div>
        )}

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
            .input-field {
               @apply w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all;
            }
            .control-group {
               @apply space-y-3;
            }
            .badge {
               @apply text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 font-bold border border-zinc-200 dark:border-zinc-700;
            }
            .control-buttons {
               @apply flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800;
            }
            .control-buttons button {
               @apply flex-1 p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg shadow-sm transition-all text-zinc-600 dark:text-zinc-400 active:scale-95 flex justify-center;
            }
            .separator {
               @apply w-px h-4 bg-zinc-200 dark:bg-zinc-700;
            }
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
                {jobData.cityDate}
            </div>

            {/* Recipient */}
            <div className="text-left mb-8">
                Perihal: <strong>Lamaran Pekerjaan</strong><br /><br />
                Yth.<br />
                <strong>{jobData.destination}<br />
                {jobData.companyName}</strong><br />
                di<br />
                Tempat
            </div>

            {/* Content */}
            <div className="text-justify">
                <p className="mb-4">Dengan hormat,</p>

                <p className="mb-4">Berdasarkan informasi yang saya peroleh bahwa {jobData.companyName} yang Bapak/Ibu pimpin saat ini sedang membutuhkan tenaga kerja untuk posisi <strong>{jobData.position}</strong>.</p>

                <p className="mb-4">Oleh karena itu, melalui surat ini saya mengajukan permohonan untuk melamar kerja dan mengisi posisi tersebut. Latar belakang pendidikan saya di bidang {userData.education} melatih saya untuk berpikir logis, analitis, dan cepat beradaptasi.</p>

                <p className="mb-4">Adapun data diri saya sebagai berikut:</p>

                <table className="w-full border-collapse mb-4 mt-2">
                    <tbody>
                        <tr><td className="w-40 font-bold align-top pb-1">Nama</td><td className="w-4 align-top text-center">:</td><td><strong>{userData.fullName}</strong></td></tr>
                        <tr><td className="w-40 font-bold align-top pb-1">Tempat, Tgl. Lahir</td><td className="w-4 align-top text-center">:</td><td>{userData.birthPlaceDate}</td></tr>
                        <tr><td className="w-40 font-bold align-top pb-1">Pendidikan Terakhir</td><td className="w-4 align-top text-center">:</td><td>{userData.education}</td></tr>
                        <tr><td className="w-40 font-bold align-top pb-1">Alamat</td><td className="w-4 align-top text-center">:</td><td>{userData.address}</td></tr>
                        <tr><td className="w-40 font-bold align-top pb-1">No. Telepon</td><td className="w-4 align-top text-center">:</td><td>{userData.phone}</td></tr>
                        <tr><td className="w-40 font-bold align-top pb-1">Email</td><td className="w-4 align-top text-center">:</td><td>{userData.email}</td></tr>
                    </tbody>
                </table>

                <p className="mb-4">Sebagai bahan pertimbangan, saya lampirkan:</p>

                <ol className="list-decimal ml-6 pl-2 mb-4">
                    {jobData.attachments.split(',').map((item, idx) => (
                        item.trim() && <li key={idx} className="capitalize">{item.trim()}</li>
                    ))}
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

                <p className="font-bold underline mt-20 relative z-0">{userData.fullName}</p>
            </div>
        </div>
      </div>

      {/* --- TOOLS TANDA TANGAN --- */}
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