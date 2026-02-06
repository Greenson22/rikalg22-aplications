import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, Type, AlignJustify, Move, Trash2, Check, Upload, 
  Settings2, Plus, Minus, User, Briefcase, Bot, Copy, 
  ArrowDownToLine, Edit3
} from 'lucide-react';
import { Button } from '../elements/Button';

// --- INTERFACES ---
interface UserProfile {
  id: string;
  profileName: string;
  fullName: string;
  birthPlaceDate: string;
  education: string;
  address: string;
  phone: string;
  email: string;
}

interface JobInfo {
  cityDate: string;
  destination: string;
  companyName: string;
  position: string;
  attachments: string;
}

interface LetterContent {
  paragraphOpening: string;
  paragraphBody: string;
  paragraphClosing: string;
}

export const SuratLamaranView = () => {
  // --- STATE CONTROL PANEL ---
  const [activeTab, setActiveTab] = useState<'design' | 'data' | 'ai'>('data');
  const [jsonInput, setJsonInput] = useState(''); // Untuk menampung input JSON dari user
  
  // State Pengaturan Tampilan
  const [settings, setSettings] = useState({
    fontSize: 12,
    lineHeight: 1.4,
    margin: 2.5
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
    cityDate: 'Manado, 6 Februari 2026',
    destination: 'Bapak/Ibu HRD',
    companyName: 'PT Teknologi Masa Depan',
    position: 'Frontend Developer',
    attachments: 'Surat Lamaran, CV, Portofolio, Ijazah'
  });

  // State Isi Surat (Supaya bisa diganti AI)
  const [letterContent, setLetterContent] = useState<LetterContent>({
    paragraphOpening: "Berdasarkan informasi yang saya peroleh, perusahaan yang Bapak/Ibu pimpin sedang membuka lowongan pekerjaan.",
    paragraphBody: "Melalui surat ini saya bermaksud untuk melamar pekerjaan dan bergabung dengan perusahaan Bapak/Ibu. Latar belakang pendidikan dan pengalaman saya di bidang teknologi sangat relevan dengan posisi tersebut. Saya memiliki kemampuan adaptasi yang cepat, disiplin, dan mampu bekerja dalam tim maupun individu.",
    paragraphClosing: "Besar harapan saya untuk dapat diberikan kesempatan wawancara agar dapat menjelaskan lebih mendalam mengenai potensi diri saya. Demikian surat lamaran ini saya buat, atas perhatian Bapak/Ibu saya ucapkan terima kasih."
  });

  // State Instruksi Prompt AI (NEW)
  const [promptInstructions, setPromptInstructions] = useState({
    opening: "Kalimat pembuka yang menyebutkan sumber info lowongan...",
    body: "Paragraf inti yang menjelaskan skill, pengalaman, dan motivasi...",
    closing: "Kalimat penutup yang berisi harapan wawancara..."
  });

  // State Profil Tersimpan
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
    const stored = localStorage.getItem('userProfiles');
    if (stored) setSavedProfiles(JSON.parse(stored));
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
    if (selected) setUserData(selected);
  };

  // --- LOGIC AI JSON GENERATOR & IMPORT ---
  const generateAIPrompt = () => {
    return `Bertindaklah sebagai asisten karir profesional. Saya ingin melamar pekerjaan dan membutuhkan surat lamaran yang personal dan profesional.
    
Gunakan data saya berikut ini sebagai dasar:
- Nama: ${userData.fullName}
- TTL: ${userData.birthPlaceDate}
- Pendidikan: ${userData.education}
- Alamat: ${userData.address}
- Kontak: ${userData.phone} / ${userData.email}

Tugas Anda:
1. Lengkapi data lamaran (posisi, perusahaan, tanggal, dll) dengan data dummy yang relevan JIKA saya belum mengisinya, atau gunakan data yang logis.
2. Buat isi surat (paragraf pembuka, inti, penutup) yang meyakinkan, sopan, dan sesuai dengan posisi yang dilamar.

PENTING: Berikan output HANYA dalam format JSON valid (tanpa markdown \`\`\`json) dengan struktur berikut agar bisa saya import ke aplikasi saya:

{
  "jobInfo": {
    "cityDate": "Kota, Tanggal Surat (misal: Jakarta, 20 Februari 2026)",
    "destination": "Penerima (misal: Bapak/Ibu HRD)",
    "companyName": "Nama Perusahaan Tujuan",
    "position": "Posisi yang Dilamar",
    "attachments": "Daftar lampiran dipisah koma"
  },
  "letterContent": {
    "paragraphOpening": "${promptInstructions.opening}",
    "paragraphBody": "${promptInstructions.body}",
    "paragraphClosing": "${promptInstructions.closing}"
  }
}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateAIPrompt());
    alert("Prompt disalin! Paste ke AI, lalu copy JSON balasannya ke kotak input di bawah.");
  };

  const handleImportJson = () => {
    try {
      // Membersihkan string json jika ada markdown block code
      const cleanJson = jsonInput.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      if (parsed.jobInfo) setJobData({ ...jobData, ...parsed.jobInfo });
      if (parsed.letterContent) setLetterContent({ ...letterContent, ...parsed.letterContent });
      
      alert("Surat berhasil diperbarui dari JSON AI!");
      setJsonInput(''); // Clear input
      setActiveTab('data'); // Kembali ke tab data/preview
    } catch (error) {
      alert("Gagal import JSON. Pastikan format dari AI sudah benar dan valid JSON.");
      console.error(error);
    }
  };

  // --- LOGIC TAMPILAN & CANVAS ---
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

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => { isDrawing.current = true; lastPos.current = getPos(e); };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    if ('touches' in e) e.preventDefault();
    const p = getPos(e);
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
    lastPos.current = p;
  };
  const stopDrawing = () => { isDrawing.current = false; };
  const clearCanvas = () => { const ctx = canvasRef.current?.getContext('2d'); ctx?.clearRect(0, 0, 300, 100); setSignatureImage(null); };
  const useSignature = () => { if (canvasRef.current) setSignatureImage(canvasRef.current.toDataURL('image/png')); };
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => { if(ev.target?.result) setSignatureImage(ev.target.result as string); };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); setIsDragging(true); };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !dragItemRef.current) return;
      const parentRect = dragItemRef.current.parentElement?.getBoundingClientRect();
      if (!parentRect) return;
      let clientX, clientY;
      if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; } 
      else { clientX = (e as MouseEvent).clientX; clientY = (e as MouseEvent).clientY; }
      setPosition({ x: clientX - parentRect.left - (dragItemRef.current.width / 2), y: clientY - parentRect.top - (dragItemRef.current.height / 2) });
    };
    const handleGlobalUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMove); window.addEventListener('mouseup', handleGlobalUp);
      window.addEventListener('touchmove', handleGlobalMove, { passive: false }); window.addEventListener('touchend', handleGlobalUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove); window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchmove', handleGlobalMove); window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col items-center w-full min-h-full pb-10">
      
      {/* --- CONTROL PANEL --- */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 mb-8 w-full max-w-5xl print:hidden transition-all">
        
        {/* Header Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {[
                  { id: 'data', icon: User, label: 'Data Diri' },
                  { id: 'design', icon: Settings2, label: 'Tampilan' },
                  { id: 'ai', icon: Bot, label: 'AI Generator' },
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                    }`}
                  >
                    <tab.icon size={18} /> {tab.label}
                  </button>
                ))}
            </div>
            
            <button 
                onClick={() => window.print()} 
                className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 px-5 py-2 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm whitespace-nowrap"
            >
                <Printer size={18} /> 
                <span>Cetak PDF</span>
            </button>
        </div>

        {/* --- TAB: DATA DIRI --- */}
        {activeTab === 'data' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-200">
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2"><User size={16}/> Informasi Pelamar</h4>
                  <select 
                    onChange={handleLoadProfile}
                    className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg p-1 outline-none dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <option value="">Pilih Profil...</option>
                    {savedProfiles.map(p => <option key={p.id} value={p.id}>{p.profileName}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-3">
                   <input type="text" placeholder="Nama Lengkap" value={userData.fullName} onChange={e => setUserData({...userData, fullName: e.target.value})} className="input-field" />
                   <input type="text" placeholder="Tempat, Tanggal Lahir" value={userData.birthPlaceDate} onChange={e => setUserData({...userData, birthPlaceDate: e.target.value})} className="input-field" />
                   <input type="text" placeholder="Pendidikan" value={userData.education} onChange={e => setUserData({...userData, education: e.target.value})} className="input-field" />
                   <input type="text" placeholder="Alamat" value={userData.address} onChange={e => setUserData({...userData, address: e.target.value})} className="input-field" />
                   <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="No. Telepon" value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} className="input-field" />
                      <input type="text" placeholder="Email" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} className="input-field" />
                   </div>
                   <Button variant="ghost" onClick={handleSaveProfile} className="w-full mt-2 border border-dashed border-zinc-300 text-xs h-8">
                      Simpan Profil Ini
                   </Button>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2"><Briefcase size={16}/> Informasi Lowongan</h4>
                <div className="grid grid-cols-1 gap-3">
                   <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Kota, Tgl" value={jobData.cityDate} onChange={e => setJobData({...jobData, cityDate: e.target.value})} className="input-field" />
                      <input type="text" placeholder="Tujuan (Yth...)" value={jobData.destination} onChange={e => setJobData({...jobData, destination: e.target.value})} className="input-field" />
                   </div>
                   <input type="text" placeholder="Perusahaan" value={jobData.companyName} onChange={e => setJobData({...jobData, companyName: e.target.value})} className="input-field" />
                   <input type="text" placeholder="Posisi" value={jobData.position} onChange={e => setJobData({...jobData, position: e.target.value})} className="input-field" />
                   <textarea rows={3} placeholder="Lampiran (koma)" value={jobData.attachments} onChange={e => setJobData({...jobData, attachments: e.target.value})} className="input-field resize-none" />
                </div>
             </div>
          </div>
        )}

        {/* --- TAB: TAMPILAN --- */}
        {activeTab === 'design' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-200">
             {[
               { label: 'Ukuran Huruf', type: 'font' as const, val: settings.fontSize, unit: 'pt', step: 1, icon: Type, color: 'text-blue-500' },
               { label: 'Spasi Baris', type: 'line' as const, val: settings.lineHeight, unit: '', step: 0.1, icon: AlignJustify, color: 'text-indigo-500' },
               { label: 'Margin', type: 'margin' as const, val: settings.margin, unit: 'cm', step: 0.2, icon: Move, color: 'text-emerald-500' },
             ].map((ctrl, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      <span className="flex items-center gap-2"><ctrl.icon size={16} className={ctrl.color}/> {ctrl.label}</span>
                      <span className="badge">{ctrl.val}{ctrl.unit}</span>
                  </div>
                  <div className="control-buttons">
                      <button onClick={() => adjust(ctrl.type, -ctrl.step)}><Minus size={16}/></button>
                      <div className="separator"></div>
                      <button onClick={() => adjust(ctrl.type, ctrl.step)}><Plus size={16}/></button>
                  </div>
                </div>
             ))}
          </div>
        )}

        {/* --- TAB: AI GENERATOR (UPDATED) --- */}
        {activeTab === 'ai' && (
          <div className="animate-in fade-in zoom-in-95 duration-200 grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             {/* Kolom Kiri: Konfigurasi Prompt */}
             <div className="space-y-3 lg:col-span-1">
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl p-4">
                  <h4 className="font-bold text-orange-700 dark:text-orange-300 flex items-center gap-2 mb-2 text-sm">
                    <Edit3 size={16}/> Konfigurasi Instruksi
                  </h4>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
                    Ubah instruksi di bawah ini untuk mengarahkan gaya bahasa AI (misal: "Buat lebih santai").
                  </p>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase">Instruksi Pembuka</label>
                      <input 
                        className="input-field text-xs" 
                        value={promptInstructions.opening}
                        onChange={(e) => setPromptInstructions({...promptInstructions, opening: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase">Instruksi Isi</label>
                      <input 
                        className="input-field text-xs" 
                        value={promptInstructions.body}
                        onChange={(e) => setPromptInstructions({...promptInstructions, body: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase">Instruksi Penutup</label>
                      <input 
                        className="input-field text-xs" 
                        value={promptInstructions.closing}
                        onChange={(e) => setPromptInstructions({...promptInstructions, closing: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
             </div>

             {/* Kolom Tengah: Copy Prompt */}
             <div className="space-y-3 lg:col-span-1">
                <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4 h-full">
                   <h4 className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-2 text-sm">
                     <Copy size={16}/> 1. Salin Prompt
                   </h4>
                   <p className="text-xs text-purple-600 dark:text-purple-400 mb-3">
                     Salin instruksi ini (termasuk konfigurasi Anda) ke Gemini/ChatGPT.
                   </p>
                   <div className="relative h-[200px] lg:h-[250px]">
                     <textarea readOnly value={generateAIPrompt()} className="w-full h-full p-3 text-xs font-mono bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg resize-none focus:outline-none" />
                     <button onClick={copyToClipboard} className="absolute top-2 right-2 bg-white p-1.5 rounded-md shadow-sm border border-zinc-200 hover:bg-zinc-50 text-zinc-600" title="Copy">
                        <Copy size={14} />
                     </button>
                   </div>
                </div>
             </div>

             {/* Kolom Kanan: Import JSON */}
             <div className="space-y-3 lg:col-span-1">
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 h-full flex flex-col">
                   <h4 className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-2 text-sm">
                     <ArrowDownToLine size={16}/> 2. Import JSON
                   </h4>
                   <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                     Paste balasan JSON dari AI di sini untuk mengisi surat otomatis.
                   </p>
                   <textarea 
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder='Paste JSON di sini... Contoh: { "jobInfo": { ... } }'
                      className="w-full flex-1 p-3 text-xs font-mono bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                   />
                   <button 
                      onClick={handleImportJson}
                      disabled={!jsonInput}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                   >
                      <ArrowDownToLine size={16} /> Terapkan
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
            .input-field { @apply w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all; }
            .badge { @apply text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 font-bold border border-zinc-200 dark:border-zinc-700; }
            .control-buttons { @apply flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800; }
            .control-buttons button { @apply flex-1 p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg shadow-sm transition-all text-zinc-600 dark:text-zinc-400 active:scale-95 flex justify-center; }
            .separator { @apply w-px h-4 bg-zinc-200 dark:bg-zinc-700; }
            @media print {
                body * { visibility: hidden; }
                .page-container-print, .page-container-print * { visibility: visible; }
                .page-container-print { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
                nav, aside, header, .no-print { display: none !important; }
            }
        `}</style>

        <div className="page-container-print">
            {/* Header Date */}
            <div className="text-right mb-6">{jobData.cityDate}</div>

            {/* Recipient */}
            <div className="text-left mb-8">
                Perihal: <strong>Lamaran Pekerjaan</strong><br /><br />
                Yth.<br />
                <strong>{jobData.destination}<br />{jobData.companyName}</strong><br />
                di<br />Tempat
            </div>

            {/* Content */}
            <div className="text-justify">
                <p className="mb-4">Dengan hormat,</p>

                {/* Paragraf Pembuka Dinamis */}
                <p className="mb-4">
                  {letterContent.paragraphOpening.includes('posisi') ? letterContent.paragraphOpening : 
                   `${letterContent.paragraphOpening} posisi ${jobData.position}.`}
                </p>

                {/* Paragraf Isi Dinamis */}
                <p className="mb-4">{letterContent.paragraphBody}</p>

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

                {/* Paragraf Penutup Dinamis */}
                <p className="mb-4">{letterContent.paragraphClosing}</p>
            </div>

            {/* Signature Section */}
            <div className="mt-8 relative h-40">
                <p>Hormat Saya,</p>
                {signatureImage && (
                    <img 
                        ref={dragItemRef} src={signatureImage} alt="Tanda Tangan" 
                        onMouseDown={handleDragStart} onTouchStart={handleDragStart}
                        className="absolute h-[70px] cursor-move z-10 hover:outline hover:outline-2 hover:outline-dashed hover:outline-zinc-300"
                        style={{ left: position.x, top: position.y }}
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
            <canvas ref={canvasRef} width={300} height={100} className="bg-white border border-zinc-200 dark:border-zinc-700 rounded-lg mx-auto touch-none cursor-crosshair shadow-inner"
                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
        </div>
        <div className="flex gap-2 justify-center mt-6">
            <button onClick={clearCanvas} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"><Trash2 size={16}/> Hapus</button>
            <button onClick={useSignature} className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium text-sm transition-colors"><Check size={16}/> Pakai</button>
            <label className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm cursor-pointer transition-colors"><Upload size={16}/> Upload <input type="file" accept="image/*" onChange={handleUpload} className="hidden"/></label>
        </div>
      </div>
    </div>
  );
};