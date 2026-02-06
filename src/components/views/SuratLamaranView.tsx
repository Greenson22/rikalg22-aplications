import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, Type, AlignJustify, Move, Trash2, Check, Upload, 
  Settings2, Plus, Minus, User, Briefcase, Bot, Copy, 
  ArrowDownToLine, Edit3, ToggleLeft, ToggleRight, X, PlusCircle, Save
} from 'lucide-react';
import { Button } from '../elements/Button';

// --- INTERFACES ---
interface DataRow {
  id: string;
  label: string;
  value: string;
  isBold?: boolean;
}

interface UserProfile {
  id: string;
  profileName: string; // Nama profil simpanan (misal: "Profil Frendy Utama")
  fullName: string;
  details: DataRow[]; // Menyimpan seluruh baris data (TTL, Alamat, dll)
}

export const SuratLamaranView = () => {
  // --- STATE CONTROL PANEL ---
  const [activeTab, setActiveTab] = useState<'design' | 'data' | 'ai'>('data');
  const [jsonInput, setJsonInput] = useState(''); 
  const [settings, setSettings] = useState({ fontSize: 12, lineHeight: 1.4, margin: 2.5 });
  const [isEditMode, setIsEditMode] = useState(false);

  // --- STATE TARGET LAMARAN (Untuk AI Prompt) ---
  const [targetJob, setTargetJob] = useState({
    position: '',
    company: '',
    requirements: '' // Opsional: skill khusus yang diminta lowongan
  });

  // --- STATE MODAL EDIT ---
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    label: string;
    text: string;
    onSave: ((val: string) => void) | null;
  }>({ isOpen: false, label: '', text: '', onSave: null });

  // --- STATE DATA SURAT ---
  
  // 1. Header
  const [headerData, setHeaderData] = useState({
    cityDate: 'Manado, 6 Februari 2026',
    labelSubject: 'Perihal',
    subject: 'Lamaran Pekerjaan',
    labelTo: 'Yth.',
    recipientTitle: 'Bapak/Ibu HRD',
    companyName: 'PT Teknologi Masa Depan',
    recipientAddress: 'di Tempat'
  });

  // 2. Struktur
  const [structure, setStructure] = useState({
    greeting: 'Dengan hormat,',
    dataIntro: 'Adapun data diri saya sebagai berikut:',
    attachmentIntro: 'Sebagai bahan pertimbangan, saya lampirkan:',
  });

  // 3. Isi Surat
  const [bodyParagraphs, setBodyParagraphs] = useState<string[]>([
    "Berdasarkan informasi yang saya peroleh, perusahaan yang Bapak/Ibu pimpin sedang membuka lowongan pekerjaan untuk posisi Frontend Developer.",
    "Melalui surat ini saya bermaksud untuk melamar pekerjaan dan bergabung dengan perusahaan Bapak/Ibu. Latar belakang pendidikan dan pengalaman saya di bidang teknologi sangat relevan dengan posisi tersebut.",
    "Saya memiliki kemampuan adaptasi yang cepat, disiplin, dan mampu bekerja dalam tim maupun individu."
  ]);

  // 4. Data Diri (Bisa ditambah/dikurang)
  const [personalDetails, setPersonalDetails] = useState<DataRow[]>([
    { id: '1', label: 'Nama', value: 'Frendy Rikal Gerung', isBold: true },
    { id: '2', label: 'Tempat, Tgl. Lahir', value: 'Raanan Baru, 22 Februari 2002' },
    { id: '3', label: 'Pendidikan Terakhir', value: 'S1 Teknik Informatika' },
    { id: '4', label: 'Alamat', value: 'Raanan Baru Satu Jaga IV' },
    { id: '5', label: 'No. Telepon', value: '0852-9893-7694' },
    { id: '6', label: 'Email', value: 'frendegerung634@gmail.com' },
  ]);

  // 5. Lampiran
  const [attachments, setAttachments] = useState<string[]>([
    "Daftar Riwayat Hidup (CV)",
    "Portofolio",
    "Fotokopi Ijazah & Transkrip Nilai",
    "Pas Foto Terbaru"
  ]);

  // 6. Penutup
  const [closingData, setClosingData] = useState({
    intro: "Besar harapan saya untuk dapat diberikan kesempatan wawancara agar dapat menjelaskan lebih mendalam mengenai potensi diri saya. Demikian surat lamaran ini saya buat, atas perhatian Bapak/Ibu saya ucapkan terima kasih.",
    greeting: "Hormat Saya,",
    signerName: "Frendy Rikal Gerung"
  });

  const [savedProfiles, setSavedProfiles] = useState<UserProfile[]>([]);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  
  // --- HELPERS ---
  const openEdit = (label: string, initialText: string, onSaveHandler: (val: string) => void) => {
    if (!isEditMode) return;
    setEditModal({ isOpen: true, label, text: initialText, onSave: onSaveHandler });
  };

  const deleteItem = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number) => {
    if(!confirm("Hapus baris ini?")) return;
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const addItem = (type: 'paragraph' | 'detail' | 'attachment', index?: number) => {
    if (type === 'paragraph') {
      const newText = "Paragraf baru... (Klik untuk edit)";
      setBodyParagraphs(prev => {
        const arr = [...prev];
        const insertIdx = index !== undefined ? index + 1 : arr.length;
        arr.splice(insertIdx, 0, newText);
        return arr;
      });
    } else if (type === 'detail') {
      setPersonalDetails(prev => [...prev, { id: Date.now().toString(), label: 'Label Baru', value: 'Isi Data...' }]);
    } else if (type === 'attachment') {
      setAttachments(prev => [...prev, "Lampiran Baru..."]);
    }
  };

  // --- LOGIC PROFIL & SAVE ---
  useEffect(() => {
    const stored = localStorage.getItem('userProfiles');
    if (stored) setSavedProfiles(JSON.parse(stored));
  }, []);

  const handleSaveCurrentProfile = () => {
    const profileName = prompt("Masukkan nama untuk profil ini (contoh: Profil IT, Profil Admin):", "Profil Saya");
    if (!profileName) return;

    // Cari nama lengkap dari data details
    const nameRow = personalDetails.find(d => d.label.toLowerCase().includes('nama'))?.value || "Tanpa Nama";

    const newProfile: UserProfile = {
      id: Date.now().toString(),
      profileName,
      fullName: nameRow,
      details: personalDetails // Simpan struktur tabel saat ini
    };

    const updated = [...savedProfiles, newProfile];
    setSavedProfiles(updated);
    localStorage.setItem('userProfiles', JSON.stringify(updated));
    alert("Profil berhasil disimpan!");
  };

  const handleLoadProfile = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = savedProfiles.find(p => p.id === selectedId);
    if (selected) {
      setPersonalDetails(selected.details);
      setClosingData(prev => ({ ...prev, signerName: selected.fullName }));
    }
  };

  const handleDeleteProfile = (id: string) => {
      if(!confirm("Hapus profil tersimpan ini?")) return;
      const updated = savedProfiles.filter(p => p.id !== id);
      setSavedProfiles(updated);
      localStorage.setItem('userProfiles', JSON.stringify(updated));
  }

  // --- LOGIC JSON & AI ---
  const handleSaveModal = () => { if (editModal.onSave) { editModal.onSave(editModal.text); setEditModal({ ...editModal, isOpen: false }); }};
  
  const handleImportJson = () => { 
      try {
        const data = JSON.parse(jsonInput);
        if(data.header) setHeaderData(prev => ({...prev, ...data.header}));
        if(data.paragraphs && Array.isArray(data.paragraphs)) setBodyParagraphs(data.paragraphs);
        if(data.details && Array.isArray(data.details)) setPersonalDetails(data.details);
        if(data.closing) setClosingData(prev => ({...prev, ...data.closing}));
        alert("Surat berhasil diperbarui dari JSON!");
        setActiveTab('design'); // Pindah ke tampilan
      } catch (e) {
        alert("Format JSON tidak valid. Pastikan Anda menyalin kode JSON dengan benar dari AI.");
      }
  };

  const generateDynamicPrompt = () => { 
    // Mengambil data pribadi saat ini di tabel (Ditambahkan titik koma ;)
    const personalInfoString = personalDetails.map(d => `- ${d.label}: ${d.value}`).join('\n');
    const attachmentsString = attachments.join(', ');

    return `Bertindaklah sebagai pelamar kerja profesional. Saya ingin membuat surat lamaran kerja dalam format JSON yang valid.

DATA SAYA:
${personalInfoString}
Lampiran: ${attachmentsString}

TUJUAN LAMARAN:
- Posisi: ${targetJob.position || '[Isi Posisi]'}
- Perusahaan: ${targetJob.company || '[Isi Nama Perusahaan]'}
${targetJob.requirements ? `- Syarat/Konteks Khusus: ${targetJob.requirements}` : ''}

INSTRUKSI:
1. Buat kalimat pembuka yang menarik dan profesional sesuai posisi di atas.
2. Buat 3 paragraf isi yang relevan dengan posisi tersebut.
3. Gunakan bahasa Indonesia formal (EYD).
4. Output HANYA JSON (tanpa markdown \`\`\`json) dengan struktur berikut:
{
  "header": {
    "cityDate": "Kota, Tanggal Hari Ini",
    "subject": "Lamaran Pekerjaan - ${targetJob.position || '...'}",
    "recipientTitle": "HRD Manager",
    "companyName": "${targetJob.company || '...'}"
  },
  "paragraphs": [
    "Paragraf 1 (Intro & Ketertarikan)",
    "Paragraf 2 (Skill & Pengalaman yang cocok dengan posisi)",
    "Paragraf 3 (Soft skill & Harapan)"
  ],
  "closing": {
    "intro": "Kalimat penutup yang sopan mengharapkan wawancara."
  }
}`; 
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(generateDynamicPrompt()); alert("Prompt disalin! Tempelkan ke ChatGPT/Gemini."); };
  const adjust = (type: 'font' | 'line' | 'margin', val: number) => { setSettings(prev => { if (type === 'font') return { ...prev, fontSize: Math.max(10, Math.min(14, prev.fontSize + val)) }; if (type === 'line') return { ...prev, lineHeight: parseFloat((prev.lineHeight + val).toFixed(1)) }; return { ...prev, margin: parseFloat((prev.margin + val).toFixed(1)) }; }); };

  // Canvas Logic (Signature)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragItemRef = useRef<HTMLImageElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const getPos = (e: any) => { const rect = canvasRef.current?.getBoundingClientRect(); return rect ? { x: (e.touches?e.touches[0].clientX:e.clientX)-rect.left, y: (e.touches?e.touches[0].clientY:e.clientY)-rect.top } : {x:0,y:0} };
  const startDrawing = (e: any) => { isDrawing.current = true; lastPos.current = getPos(e); };
  const draw = (e: any) => { if(!isDrawing.current || !canvasRef.current) return; const ctx=canvasRef.current.getContext('2d'); if(ctx){ if(e.touches)e.preventDefault(); const p=getPos(e); ctx.beginPath();ctx.moveTo(lastPos.current.x,lastPos.current.y);ctx.lineTo(p.x,p.y);ctx.stroke();lastPos.current=p; }};
  const stopDrawing = () => { isDrawing.current = false; };
  const clearCanvas = () => { const ctx = canvasRef.current?.getContext('2d'); ctx?.clearRect(0, 0, 300, 100); setSignatureImage(null); };
  const useSignature = () => { if (canvasRef.current) setSignatureImage(canvasRef.current.toDataURL('image/png')); };
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) { const reader = new FileReader(); reader.onload = (ev) => setSignatureImage(ev.target?.result as string); reader.readAsDataURL(e.target.files[0]); }};
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); setIsDragging(true); };
  useEffect(() => {
    const handleGlobalMove = (e: any) => { if (!isDragging || !dragItemRef.current) return; const pRect = dragItemRef.current.parentElement?.getBoundingClientRect(); if(pRect) setPosition({ x: (e.touches?e.touches[0].clientX:e.clientX) - pRect.left - (dragItemRef.current.width/2), y: (e.touches?e.touches[0].clientY:e.clientY) - pRect.top - (dragItemRef.current.height/2) }); };
    const handleGlobalUp = () => setIsDragging(false);
    if (isDragging) { window.addEventListener('mousemove', handleGlobalMove); window.addEventListener('mouseup', handleGlobalUp); window.addEventListener('touchmove', handleGlobalMove, {passive:false}); window.addEventListener('touchend', handleGlobalUp); }
    return () => { window.removeEventListener('mousemove', handleGlobalMove); window.removeEventListener('mouseup', handleGlobalUp); window.removeEventListener('touchmove', handleGlobalMove); window.removeEventListener('touchend', handleGlobalUp); };
  }, [isDragging]);

  return (
    <div className="flex flex-col items-center w-full min-h-full pb-10 relative">
      
      {/* --- MODAL EDIT --- */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                        <Edit3 size={20} className="text-blue-500"/> Edit {editModal.label}
                    </h3>
                    <button onClick={() => setEditModal({...editModal, isOpen: false})} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={20} className="text-zinc-500"/></button>
                </div>
                <textarea 
                    value={editModal.text}
                    onChange={(e) => setEditModal({...editModal, text: e.target.value})}
                    className="w-full h-48 p-4 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed mb-6 font-serif"
                />
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setEditModal({...editModal, isOpen: false})}>Batal</Button>
                    <Button onClick={handleSaveModal}><Check size={18} /> Simpan</Button>
                </div>
            </div>
        </div>
      )}

      {/* --- CONTROL PANEL --- */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 mb-8 w-full max-w-5xl print:hidden transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {[
                  { id: 'data', icon: User, label: 'Data & Profil' },
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
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm text-sm border ${
                        isEditMode 
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50 ring-2 ring-blue-200 ring-offset-1' 
                        : 'bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                    }`}
                >
                    {isEditMode ? <ToggleRight size={20} className="text-blue-600"/> : <ToggleLeft size={20}/>}
                    <span>{isEditMode ? 'Edit: ON' : 'Edit: OFF'}</span>
                </button>

                <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 px-5 py-2 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm whitespace-nowrap">
                    <Printer size={18} /> <span>PDF</span>
                </button>
            </div>
        </div>

        {activeTab === 'data' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-200">
             <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Pilih Profil Tersimpan</label>
                <div className="flex gap-2">
                    <select onChange={handleLoadProfile} className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Pilih Data Profil --</option>
                        {savedProfiles.map(p => <option key={p.id} value={p.id}>{p.profileName}</option>)}
                    </select>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-sm text-blue-700 dark:text-blue-300 space-y-2">
                    <p><strong>Tips:</strong> Ubah data diri langsung di kertas surat di bawah (klik teks garis putus-putus).</p>
                    <p>Setelah selesai mengedit data diri, klik tombol simpan di bawah untuk menyimpannya sebagai preset profil baru.</p>
                </div>

                <Button onClick={handleSaveCurrentProfile} className="w-full justify-center">
                    <Save size={18} /> Simpan Data di Surat sebagai Profil Baru
                </Button>
             </div>
             
             {savedProfiles.length > 0 && (
                 <div className="space-y-2">
                    <h4 className="text-sm font-medium text-zinc-700">Daftar Profil Tersimpan:</h4>
                    <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {savedProfiles.map(p => (
                            <li key={p.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg border border-zinc-100 dark:border-zinc-700 text-sm">
                                <span>{p.profileName} <span className="text-xs text-zinc-400">({p.fullName})</span></span>
                                <button onClick={() => handleDeleteProfile(p.id)} className="text-zinc-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                            </li>
                        ))}
                    </ul>
                 </div>
             )}
           </div>
        )}

        {activeTab === 'design' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-200">
             {[ { label: 'Ukuran Huruf', type: 'font', val: settings.fontSize, unit: 'pt', step: 1, icon: Type, color: 'text-blue-500' }, { label: 'Spasi Baris', type: 'line', val: settings.lineHeight, unit: '', step: 0.1, icon: AlignJustify, color: 'text-indigo-500' }, { label: 'Margin', type: 'margin', val: settings.margin, unit: 'cm', step: 0.2, icon: Move, color: 'text-emerald-500' } ].map((ctrl: any, idx) => (<div key={idx} className="space-y-3"><div className="flex justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300"><span className="flex items-center gap-2"><ctrl.icon size={16} className={ctrl.color}/> {ctrl.label}</span><span className="badge">{ctrl.val}{ctrl.unit}</span></div><div className="control-buttons"><button onClick={() => adjust(ctrl.type, -ctrl.step)}><Minus size={16}/></button><div className="separator"></div><button onClick={() => adjust(ctrl.type, ctrl.step)}><Plus size={16}/></button></div></div>))}
          </div>
        )}

        {/* --- BAGIAN AI (DIPERBARUI) --- */}
        {activeTab === 'ai' && (
            <div className="animate-in fade-in zoom-in-95 duration-200 grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* KOLOM KIRI: INPUT TARGET LAMARAN + PILIH PROFIL */}
               <div className="space-y-4">
                  
                  {/* --- FITUR BARU: PILIH PROFIL PELAMAR --- */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                      <h4 className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 mb-3 text-sm">
                          <User size={16} className="text-blue-500"/> 0. Pilih Data Pelamar
                      </h4>
                      <div className="space-y-2">
                          <p className="text-xs text-zinc-500">
                              Data diri siapa yang ingin dimasukkan ke dalam Prompt AI?
                          </p>
                          <select 
                            onChange={handleLoadProfile} 
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          >
                              <option value="">-- Gunakan Data yang Tampil Saat Ini --</option>
                              {savedProfiles.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.profileName} ({p.fullName})
                                  </option>
                              ))}
                          </select>
                          
                          {/* Preview Nama Aktif */}
                          <div className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-zinc-600 dark:text-zinc-400 mt-2 border border-zinc-200 dark:border-zinc-700">
                             Data Aktif: <span className="font-bold text-zinc-900 dark:text-zinc-200">
                                {personalDetails.find(d => d.label.toLowerCase().includes('nama'))?.value || "Belum ada nama"}
                             </span>
                          </div>
                      </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4">
                      <h4 className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-4 text-sm"><Briefcase size={16}/> 1. Info Lowongan</h4>
                      <div className="space-y-3">
                          <div>
                              <label className="text-xs font-semibold text-zinc-500 uppercase">Posisi Dilamar</label>
                              <input 
                                type="text" 
                                placeholder="Contoh: Frontend Developer" 
                                value={targetJob.position}
                                onChange={e => setTargetJob({...targetJob, position: e.target.value})}
                                className="w-full mt-1 p-2 text-sm border rounded-lg bg-white dark:bg-black dark:border-zinc-700"
                              />
                          </div>
                          <div>
                              <label className="text-xs font-semibold text-zinc-500 uppercase">Nama Perusahaan</label>
                              <input 
                                type="text" 
                                placeholder="Contoh: PT Google Indonesia" 
                                value={targetJob.company}
                                onChange={e => setTargetJob({...targetJob, company: e.target.value})}
                                className="w-full mt-1 p-2 text-sm border rounded-lg bg-white dark:bg-black dark:border-zinc-700"
                              />
                          </div>
                           <div>
                              <label className="text-xs font-semibold text-zinc-500 uppercase">Syarat / Konteks Khusus</label>
                              <textarea 
                                rows={2}
                                placeholder="Contoh: Harus bisa React.js dan Tailwind, pengalaman 2 tahun." 
                                value={targetJob.requirements}
                                onChange={e => setTargetJob({...targetJob, requirements: e.target.value})}
                                className="w-full mt-1 p-2 text-sm border rounded-lg bg-white dark:bg-black dark:border-zinc-700 resize-none"
                              />
                          </div>
                      </div>
                  </div>
                  
                  <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                     <h4 className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 mb-2 text-sm"><Copy size={16}/> 2. Generate Prompt</h4>
                     <p className="text-xs text-zinc-500 mb-3">Sistem akan menggabungkan <strong>Data Pelamar (di atas)</strong> dengan <strong>Info Lowongan</strong>.</p>
                     <button onClick={copyToClipboard} className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-bold hover:shadow-lg transition-all active:scale-95">
                        Salin Prompt ke Clipboard
                     </button>
                  </div>
               </div>

               {/* KOLOM KANAN: IMPORT JSON */}
               <div className="space-y-3">
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 h-full flex flex-col">
                        <h4 className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-2 text-sm"><ArrowDownToLine size={16}/> 3. Import JSON Result</h4>
                        <p className="text-xs text-zinc-500 mb-2">Paste kode JSON dari ChatGPT/Gemini di sini untuk membuat surat otomatis.</p>
                        <textarea 
                            value={jsonInput} 
                            onChange={(e) => setJsonInput(e.target.value)} 
                            placeholder='Contoh: { "header": { ... } }' 
                            className="w-full flex-1 p-3 text-xs font-mono bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                        <button onClick={handleImportJson} disabled={!jsonInput} className="mt-3 w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                            Terapkan ke Surat
                        </button>
                    </div>
               </div>
            </div>
        )}
      </div>

      {/* --- HALAMAN KERTAS (A4) --- */}
      <div 
        className="bg-white text-black shadow-2xl print:shadow-none relative mx-auto transition-all duration-300"
        style={{ width: '21cm', minHeight: '29.7cm', padding: `${settings.margin}cm`, fontSize: `${settings.fontSize}pt`, lineHeight: settings.lineHeight, fontFamily: '"Times New Roman", Times, serif' }}
      >
        <style jsx global>{`
            /* KOTAK PENANDA EDIT */
            .editable-highlight { 
                @apply cursor-pointer relative rounded border border-dashed border-zinc-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 px-1 -mx-1 py-0.5;
            }
            .editable-highlight:hover::after {
                content: '✎';
                @apply absolute -top-2 -right-2 text-[8px] bg-blue-500 text-white w-4 h-4 flex items-center justify-center rounded-full shadow-sm pointer-events-none z-10;
            }
            
            /* TOMBOL AKSI (HAPUS/TAMBAH) */
            .action-btn { @apply absolute hidden items-center justify-center w-6 h-6 rounded-full bg-white shadow-md border border-zinc-200 cursor-pointer z-20 hover:scale-110 transition-transform text-zinc-500 hover:text-red-500; }
            .editable-container:hover .action-btn { @apply flex; }
            .add-btn { @apply flex items-center justify-center gap-1 w-full py-1 mt-1 mb-2 border-2 border-dashed border-zinc-200 rounded-lg text-zinc-300 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 cursor-pointer transition-all text-[10px] font-sans font-bold uppercase tracking-wider; }
            
            @media print { 
                .no-print, .action-btn, .add-btn, .editable-highlight { border: none !important; background: none !important; padding: 0 !important; margin: 0 !important; }
                .editable-highlight::after { display: none !important; }
            }
        `}</style>

        <div className="page-container-print">
            {/* Header: Date */}
            <div className={`text-right mb-6 editable-container relative group`}>
                <span 
                    className={isEditMode ? 'editable-highlight' : ''}
                    onClick={() => openEdit('Tanggal Surat', headerData.cityDate, (val) => setHeaderData({...headerData, cityDate: val}))}
                >
                    {headerData.cityDate}
                </span>
            </div>

            {/* Header: Recipient */}
            <div className="text-left mb-8 space-y-1">
                <div>
                    <span 
                        className={`mr-2 ${isEditMode ? 'editable-highlight' : ''}`}
                        onClick={() => openEdit('Label Perihal', headerData.labelSubject, (val) => setHeaderData({...headerData, labelSubject: val}))}
                    >
                        {headerData.labelSubject}:
                    </span>
                    <strong 
                        className={isEditMode ? 'editable-highlight' : ''}
                        onClick={() => openEdit('Isi Perihal', headerData.subject, (val) => setHeaderData({...headerData, subject: val}))}
                    >
                        {headerData.subject}
                    </strong>
                </div>
                
                <div className="pt-4">
                    <span
                        className={`block w-fit mb-1 ${isEditMode ? 'editable-highlight' : ''}`}
                        onClick={() => openEdit('Label Yth', headerData.labelTo, (val) => setHeaderData({...headerData, labelTo: val}))}
                    >
                        {headerData.labelTo}
                    </span>
                    <strong 
                        className={`block w-fit ${isEditMode ? 'editable-highlight' : ''}`}
                        onClick={() => openEdit('Penerima', headerData.recipientTitle, (val) => setHeaderData({...headerData, recipientTitle: val}))}
                    >
                        {headerData.recipientTitle}
                    </strong>
                    <strong 
                        className={`block w-fit ${isEditMode ? 'editable-highlight' : ''}`}
                        onClick={() => openEdit('Nama Perusahaan', headerData.companyName, (val) => setHeaderData({...headerData, companyName: val}))}
                    >
                        {headerData.companyName}
                    </strong>
                    <div 
                        className={`block w-fit ${isEditMode ? 'editable-highlight' : ''}`}
                        onClick={() => openEdit('Alamat Penerima', headerData.recipientAddress, (val) => setHeaderData({...headerData, recipientAddress: val}))}
                    >
                        {headerData.recipientAddress}
                    </div>
                </div>
            </div>

            <div className="text-justify">
                {/* SALAM PEMBUKA */}
                <p 
                    className={`mb-4 w-fit ${isEditMode ? 'editable-highlight' : ''}`}
                    onClick={() => openEdit('Salam Pembuka', structure.greeting, (val) => setStructure({...structure, greeting: val}))}
                >
                    {structure.greeting}
                </p>

                {/* BODY PARAGRAPHS */}
                {bodyParagraphs.map((para, idx) => (
                    <div key={idx} className="relative editable-container group mb-4">
                        {isEditMode && (
                            <button onClick={() => deleteItem(setBodyParagraphs, idx)} className="action-btn -right-8 top-0" title="Hapus Paragraf">
                                <Trash2 size={12} />
                            </button>
                        )}
                        <p 
                            className={`${isEditMode ? 'editable-highlight' : ''}`}
                            onClick={() => openEdit(`Paragraf ke-${idx+1}`, para, (val) => setBodyParagraphs(prev => { const n = [...prev]; n[idx] = val; return n; }))}
                        >
                            {para}
                        </p>
                        {isEditMode && (
                             <button onClick={() => addItem('paragraph', idx)} className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-sm hover:scale-110" title="Sisipkan Paragraf Di Sini">
                                <Plus size={14} />
                             </button>
                        )}
                    </div>
                ))}
                
                {isEditMode && <button onClick={() => addItem('paragraph')} className="add-btn"><PlusCircle size={14} /> Tambah Paragraf</button>}

                {/* INTRO DATA DIRI */}
                <p 
                    className={`mb-4 w-fit ${isEditMode ? 'editable-highlight' : ''}`}
                    onClick={() => openEdit('Intro Data Diri', structure.dataIntro, (val) => setStructure({...structure, dataIntro: val}))}
                >
                    {structure.dataIntro}
                </p>

                {/* PERSONAL DATA TABLE */}
                <table className="w-full border-collapse mb-4 mt-2">
                    <tbody>
                        {personalDetails.map((row, idx) => (
                            <tr key={row.id} className="relative editable-container group hover:bg-zinc-50/50">
                                <td className="w-40 align-top pb-1">
                                    <span 
                                        className={`font-bold ${isEditMode ? 'editable-highlight' : ''}`}
                                        onClick={() => openEdit('Label Data', row.label, (val) => setPersonalDetails(prev => { const n = [...prev]; n[idx].label = val; return n; }))}
                                    >
                                        {row.label}
                                    </span>
                                </td>
                                <td className="w-4 align-top text-center">:</td>
                                <td className="align-top pb-1">
                                    <span
                                        className={`${isEditMode ? 'editable-highlight' : ''} ${row.isBold ? 'font-bold' : ''}`}
                                        onClick={() => openEdit('Isi Data', row.value, (val) => setPersonalDetails(prev => { const n = [...prev]; n[idx].value = val; return n; }))}
                                    >
                                        {row.value}
                                    </span>
                                </td>
                                {isEditMode && (
                                    <td className="w-8 align-middle text-right">
                                        <button onClick={() => deleteItem(setPersonalDetails, idx)} className="text-zinc-300 hover:text-red-500 p-1">
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {isEditMode && <button onClick={() => addItem('detail')} className="add-btn"><PlusCircle size={14} /> Tambah Baris Data</button>}

                {/* INTRO LAMPIRAN */}
                <p 
                    className={`mb-4 w-fit ${isEditMode ? 'editable-highlight' : ''}`}
                    onClick={() => openEdit('Intro Lampiran', structure.attachmentIntro, (val) => setStructure({...structure, attachmentIntro: val}))}
                >
                    {structure.attachmentIntro}
                </p>

                {/* ATTACHMENTS */}
                <ol className="list-decimal ml-6 pl-2 mb-4">
                    {attachments.map((item, idx) => (
                         <li key={idx} className="relative editable-container group pl-1 mb-1">
                            <span 
                                className={`capitalize ${isEditMode ? 'editable-highlight' : ''}`}
                                onClick={() => openEdit(`Lampiran ke-${idx+1}`, item, (val) => setAttachments(prev => { const n = [...prev]; n[idx] = val; return n; }))}
                            >
                                {item}
                            </span>
                            {isEditMode && (
                                <button onClick={() => deleteItem(setAttachments, idx)} className="action-btn -left-8 top-0" title="Hapus Lampiran">
                                    <Trash2 size={12} />
                                </button>
                            )}
                         </li>
                    ))}
                </ol>
                {isEditMode && <button onClick={() => addItem('attachment')} className="add-btn"><PlusCircle size={14} /> Tambah Lampiran</button>}

                {/* CLOSING PARAGRAPH */}
                <p 
                    className={`mb-4 ${isEditMode ? 'editable-highlight' : ''}`}
                    onClick={() => openEdit('Paragraf Penutup', closingData.intro, (val) => setClosingData({...closingData, intro: val}))}
                >
                    {closingData.intro}
                </p>
            </div>

            <div className="mt-8 relative h-40">
                <p 
                    className={isEditMode ? 'editable-highlight w-fit' : ''}
                    onClick={() => openEdit('Salam Penutup', closingData.greeting, (val) => setClosingData({...closingData, greeting: val}))}
                >
                    {closingData.greeting}
                </p>
                
                {signatureImage && (
                    <img 
                        ref={dragItemRef} src={signatureImage} alt="Tanda Tangan" 
                        onMouseDown={handleDragStart} onTouchStart={handleDragStart}
                        className="absolute h-[70px] cursor-move z-10 hover:outline hover:outline-2 hover:outline-dashed hover:outline-zinc-300"
                        style={{ left: position.x, top: position.y }}
                    />
                )}
                
                <p 
                    className={`font-bold underline mt-20 relative z-0 w-fit ${isEditMode ? 'editable-highlight' : ''}`}
                    onClick={() => openEdit('Nama Penanda Tangan', closingData.signerName, (val) => setClosingData({...closingData, signerName: val}))}
                >
                    {closingData.signerName}
                </p>
            </div>
        </div>
      </div>
      
      {/* Footer Tools Tanda Tangan */}
      <div className="mt-8 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center print:hidden w-full max-w-md">
        <h3 className="text-zinc-900 dark:text-white font-bold mb-4">Area Tanda Tangan</h3>
        <div className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl inline-block"><canvas ref={canvasRef} width={300} height={100} className="bg-white border border-zinc-200 dark:border-zinc-700 rounded-lg mx-auto touch-none cursor-crosshair shadow-inner" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} /></div>
        <div className="flex gap-2 justify-center mt-6"><button onClick={clearCanvas} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"><Trash2 size={16}/> Hapus</button><button onClick={useSignature} className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium text-sm transition-colors"><Check size={16}/> Pakai</button><label className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm cursor-pointer transition-colors"><Upload size={16}/> Upload <input type="file" accept="image/*" onChange={handleUpload} className="hidden"/></label></div>
      </div>
    </div>
  );
};