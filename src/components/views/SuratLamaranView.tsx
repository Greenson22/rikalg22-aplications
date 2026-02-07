// src/components/views/SuratLamaranView.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, Check, Settings2, User, Bot, ToggleLeft, ToggleRight, 
  PlusCircle, Trash2, PenTool, Image as ImageIcon, Save, X, Edit3, Upload 
} from 'lucide-react';
import { Button } from '../elements/Button';
import { ProfileTab } from '../fragments/surat-control/ProfileTab';
import { DesignTab } from '../fragments/surat-control/DesignTab';
import { AIGeneratorTab } from '../fragments/surat-control/AIGeneratorTab';
import { DataRow, AttachmentItem, UserProfile, SavedSignature } from '../../types/surat'; 

export const SuratLamaranView = () => {
  // --- STATE CONTROL PANEL ---
  const [activeTab, setActiveTab] = useState<'design' | 'data' | 'ai'>('data');
  const [isEditMode, setIsEditMode] = useState(false);
  const [settings, setSettings] = useState({ fontSize: 12, lineHeight: 1.4, margin: 2.5 });

  // --- STATE DATA SURAT ---
  const [headerData, setHeaderData] = useState({
    cityDate: 'Manado, 6 Februari 2026',
    labelSubject: 'Perihal',
    subject: 'Lamaran Pekerjaan',
    labelTo: 'Yth.',
    recipientTitle: 'Bapak/Ibu HRD',
    companyName: 'PT Teknologi Masa Depan',
    recipientAddress: 'di Tempat'
  });

  const [structure, setStructure] = useState({
    greeting: 'Dengan hormat,',
    dataIntro: 'Adapun data diri saya sebagai berikut:',
    attachmentIntro: 'Sebagai bahan pertimbangan, saya lampirkan:',
  });

  const [bodyParagraphs, setBodyParagraphs] = useState<string[]>([
    "Berdasarkan informasi yang saya peroleh...",
    "Melalui surat ini saya bermaksud untuk melamar...",
    "Saya memiliki kemampuan adaptasi yang cepat..."
  ]);

  const [personalDetails, setPersonalDetails] = useState<DataRow[]>([
    { id: '1', label: 'Nama', value: 'Frendy Rikal Gerung', isBold: true },
    { id: '2', label: 'Tempat, Tgl. Lahir', value: 'Raanan Baru, 22 Februari 2002' },
    { id: '3', label: 'Pendidikan Terakhir', value: 'S1 Teknik Informatika' },
    { id: '4', label: 'Alamat', value: 'Raanan Baru Satu Jaga IV' },
    { id: '5', label: 'No. Telepon', value: '0852-9893-7694' },
    { id: '6', label: 'Email', value: 'frendegerung634@gmail.com' },
  ]);

  const [attachments, setAttachments] = useState<AttachmentItem[]>([
    { id: '1', text: "Daftar Riwayat Hidup (CV)", isChecked: true },
    { id: '2', text: "Portofolio", isChecked: true },
    { id: '3', text: "Fotokopi Ijazah", isChecked: true },
    { id: '4', text: "Pas Foto Terbaru", isChecked: true },
  ]);

  const [closingData, setClosingData] = useState({
    intro: "Besar harapan saya...",
    greeting: "Hormat Saya,",
    signerName: "Frendy Rikal Gerung"
  });

  const [savedProfiles, setSavedProfiles] = useState<UserProfile[]>([]);
  
  // --- STATE AI ---
  const [jsonInput, setJsonInput] = useState('');
  const [promptLength, setPromptLength] = useState<'normal' | 'short'>('normal');
  const [targetJob, setTargetJob] = useState({ position: '', company: '', requirements: '' });

  // --- STATE MODAL & TEXT EDIT ---
  const [editModal, setEditModal] = useState<{ isOpen: boolean; label: string; text: string; onSave: ((val: string) => void) | null; }>({ isOpen: false, label: '', text: '', onSave: null });

  // --- STATE TANDA TANGAN (NEW) ---
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [savedSignatures, setSavedSignatures] = useState<SavedSignature[]>([]);
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [renamingSigId, setRenamingSigId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // --- LOGIC: HELPER UI ---
  const adjust = (type: 'font' | 'line' | 'margin', val: number) => { 
      setSettings(prev => { 
          if (type === 'font') return { ...prev, fontSize: Math.max(10, Math.min(14, prev.fontSize + val)) }; 
          if (type === 'line') return { ...prev, lineHeight: parseFloat((prev.lineHeight + val).toFixed(1)) }; 
          return { ...prev, margin: parseFloat((prev.margin + val).toFixed(1)) }; 
      }); 
  };
  
  const openEdit = (label: string, initialText: string, onSaveHandler: (val: string) => void) => {
    if (!isEditMode) return;
    setEditModal({ isOpen: true, label, text: initialText, onSave: onSaveHandler });
  };
  const handleSaveModal = () => { if (editModal.onSave) { editModal.onSave(editModal.text); setEditModal({ ...editModal, isOpen: false }); }};

  const addItem = (type: 'paragraph' | 'detail' | 'attachment', index?: number) => {
    if (type === 'paragraph') {
      const newText = "Paragraf baru... (Klik untuk edit)";
      setBodyParagraphs(prev => { const arr = [...prev]; arr.splice(index !== undefined ? index + 1 : arr.length, 0, newText); return arr; });
    } else if (type === 'detail') {
      setPersonalDetails(prev => [...prev, { id: Date.now().toString(), label: 'Label Baru', value: 'Isi Data...' }]);
    } else if (type === 'attachment') {
      setAttachments(prev => [...prev, { id: Date.now().toString(), text: "Dokumen Baru...", isChecked: true }]);
    }
  };

  const deleteItem = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number) => {
    if(!confirm("Hapus baris ini?")) return;
    setter(prev => prev.filter((_, i) => i !== index));
  };

  // --- LOGIC: ATTACHMENTS ---
  const toggleAttachment = (id: string) => setAttachments(prev => prev.map(a => a.id === id ? { ...a, isChecked: !a.isChecked } : a));
  const updateAttachmentText = (id: string, newText: string) => setAttachments(prev => prev.map(a => a.id === id ? { ...a, text: newText } : a));
  const deleteAttachmentById = (id: string) => { if(confirm("Hapus?")) setAttachments(prev => prev.filter(a => a.id !== id)); };
  const addNewAttachment = () => setAttachments(prev => [...prev, { id: Date.now().toString(), text: "", isChecked: true }]);

  // --- LOGIC: API INITIALIZATION ---
  useEffect(() => { 
    // Load Profiles
    fetch('/api/profiles')
      .then(res => res.ok ? res.json() : [])
      .then(data => setSavedProfiles(data))
      .catch(err => console.error("Error loading profiles:", err));

    // Load Signatures
    fetchSignatures();
  }, []);

  // --- LOGIC: PROFILE MANAGEMENT ---
  const handleSaveCurrentProfile = async () => {
    const profileName = prompt("Nama Profil:", "Profil Saya");
    if (!profileName) return;
    
    const newProfile: UserProfile = {
      id: Date.now().toString(), 
      profileName, 
      fullName: personalDetails.find(d => d.label.toLowerCase().includes('nama'))?.value || "Tanpa Nama",
      details: personalDetails, 
      attachments: attachments
    };

    try {
      await fetch('/api/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newProfile) });
      setSavedProfiles(prev => [...prev, newProfile]);
      alert("Profil Tersimpan!");
    } catch (e) { alert("Gagal menyimpan profil."); }
  };

  const handleLoadProfile = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = savedProfiles.find(p => p.id === e.target.value);
    if (selected) {
      setPersonalDetails(selected.details);
      setClosingData(prev => ({ ...prev, signerName: selected.fullName }));
      if (selected.attachments) setAttachments(selected.attachments);
    }
  };

  const handleDeleteProfile = async (id: string) => {
      if(!confirm("Hapus profil ini?")) return;
      try {
        await fetch(`/api/profiles?id=${id}`, { method: 'DELETE' });
        setSavedProfiles(prev => prev.filter(p => p.id !== id));
      } catch (e) { alert("Gagal menghapus."); }
  };

  const handleCreateNewProfile = () => {
      if(!confirm("Reset Data inputan saat ini?")) return;
      setPersonalDetails([{ id: '1', label: 'Nama', value: '', isBold: true }, { id: '2', label: 'No. HP', value: '' }]); 
      setAttachments([{ id: '1', text: "CV", isChecked: true }]);
  };

  // --- LOGIC: SIGNATURE MANAGEMENT ---
  
  // 1. Fetch Signatures
  const fetchSignatures = async () => {
    try {
      const res = await fetch('/api/signatures');
      if (res.ok) setSavedSignatures(await res.json());
    } catch (e) { console.error("Err fetch sigs", e); }
  };

  // 2. Save Signature (dari Canvas atau Upload)
  const handleSaveSignatureToDb = async () => {
    if (!signatureImage) return alert("Area tanda tangan kosong!");
    const name = prompt("Beri nama tanda tangan ini:", "TTD Digital");
    if (!name) return;

    const newSig: SavedSignature = {
      id: Date.now().toString(),
      name,
      image: signatureImage
    };

    try {
      const res = await fetch('/api/signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSig)
      });
      if (!res.ok) throw new Error("Gagal simpan");
      setSavedSignatures(prev => [...prev, newSig]);
      alert("Tanda tangan tersimpan!");
    } catch (e) { alert("Gagal menyimpan."); }
  };

  // 3. Rename Signature
  const handleRenameSignature = async (id: string) => {
    try {
        await fetch('/api/signatures', {
            method: 'PUT', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id, name: renameValue })
        });
        setSavedSignatures(prev => prev.map(s => s.id === id ? { ...s, name: renameValue } : s));
        setRenamingSigId(null);
    } catch (e) { alert("Gagal rename"); }
  };

  // 4. Delete Signature
  const handleDeleteSignature = async (id: string) => {
    if(!confirm("Hapus tanda tangan ini permanen?")) return;
    try {
        await fetch(`/api/signatures?id=${id}`, { method: 'DELETE' });
        setSavedSignatures(prev => prev.filter(s => s.id !== id));
    } catch (e) { alert("Gagal hapus"); }
  };

  // 5. Upload Image Logic
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- LOGIC: AI GENERATOR ---
  const handleDetailChange = (index: number, newValue: string) => {
      setPersonalDetails(prev => { const updated = [...prev]; updated[index].value = newValue; return updated; });
      if (personalDetails[index].label.toLowerCase().includes('nama')) setClosingData(prev => ({ ...prev, signerName: newValue }));
  };

  const generateDynamicPrompt = () => {
    const personal = personalDetails.map(d => `- ${d.label}: ${d.value}`).join('\n');
    const att = attachments.filter(a => a.isChecked).map(a => a.text).join(', ');
    const style = promptLength === 'short' ? "SINGKAT (maks 2 paragraf)" : "Standar (3 paragraf)";
    
    const prompt = `Posisi: ${targetJob.position}\nPerusahaan: ${targetJob.company}\nSyarat: ${targetJob.requirements}\n\nDATA SAYA:\n${personal}\nLampiran: ${att}\n\nINSTRUKSI: Buat surat lamaran ${style} dalam format JSON valid.`;
    navigator.clipboard.writeText(prompt);
    alert("Prompt disalin!");
  };

  const handleImportJson = () => {
      try {
        const data = JSON.parse(jsonInput);
        if(data.header) setHeaderData(prev => ({...prev, ...data.header}));
        if(data.paragraphs) setBodyParagraphs(data.paragraphs);
        alert("Success!");
        setActiveTab('design');
      } catch(e) { alert("Invalid JSON"); }
  };

  // --- LOGIC: CANVAS ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const startDrawing = (e: any) => { isDrawing.current = true; const ctx=canvasRef.current?.getContext('2d'); if(ctx) { ctx.beginPath(); ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); } };
  const draw = (e: any) => { if(!isDrawing.current || !canvasRef.current) return; const ctx=canvasRef.current.getContext('2d'); if(ctx) { ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); ctx.stroke(); } };
  const stopDrawing = () => { if(isDrawing.current && canvasRef.current) { setSignatureImage(canvasRef.current.toDataURL()); } isDrawing.current = false; };
  const clearCanvas = () => { canvasRef.current?.getContext('2d')?.clearRect(0,0,300,100); setSignatureImage(null); };
  const useSignature = () => { if (canvasRef.current) setSignatureImage(canvasRef.current.toDataURL()); };

  return (
    <div className="flex flex-col items-center w-full min-h-full pb-10 relative">
      
      {/* --- MODAL EDIT TEXT --- */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl p-6 border dark:border-zinc-800">
                <textarea value={editModal.text} onChange={(e) => setEditModal({...editModal, text: e.target.value})} className="w-full h-48 p-4 border rounded-xl mb-4 bg-transparent dark:text-white" />
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setEditModal({...editModal, isOpen: false})}>Batal</Button>
                    <Button onClick={handleSaveModal}><Check size={18} /> Simpan</Button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL: MANAGE SIGNATURES --- */}
      {isSigModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl p-6 border dark:border-zinc-800 shadow-xl max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                 <h3 className="font-bold text-lg text-zinc-800 dark:text-white flex items-center gap-2">
                    <PenTool size={20} className="text-blue-500"/> Koleksi Tanda Tangan
                 </h3>
                 <button onClick={() => setIsSigModalOpen(false)}><X size={20} className="text-zinc-400 hover:text-red-500"/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar p-1">
                 {savedSignatures.length === 0 && <p className="text-center text-zinc-400 text-sm py-4">Belum ada tanda tangan tersimpan.</p>}
                 {savedSignatures.map(sig => (
                    <div key={sig.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 transition-colors group">
                       <div className="flex items-center gap-3 overflow-hidden">
                           <div className="w-16 h-10 bg-white rounded border border-dashed border-zinc-300 flex items-center justify-center overflow-hidden shrink-0">
                               <img src={sig.image} alt="Sig" className="max-w-full max-h-full" />
                           </div>
                           <div className="min-w-0">
                               {renamingSigId === sig.id ? (
                                   <div className="flex gap-1">
                                       <input autoFocus type="text" value={renameValue} onChange={e=>setRenameValue(e.target.value)} className="w-32 px-1 py-0.5 text-xs border rounded bg-white dark:bg-zinc-900" />
                                       <button onClick={() => handleRenameSignature(sig.id)} className="text-green-600"><Check size={14}/></button>
                                   </div>
                               ) : (
                                   <p className="font-bold text-sm text-zinc-700 dark:text-zinc-200 truncate cursor-pointer hover:underline" onClick={() => { setSignatureImage(sig.image); setIsSigModalOpen(false); }}>{sig.name}</p>
                               )}
                               <button onClick={() => { setSignatureImage(sig.image); setIsSigModalOpen(false); }} className="text-[10px] text-blue-600 font-bold mt-0.5 hover:underline">Gunakan</button>
                           </div>
                       </div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => { setRenamingSigId(sig.id); setRenameValue(sig.name); }} className="p-1.5 text-zinc-400 hover:text-blue-500 bg-white dark:bg-zinc-800 rounded shadow-sm"><Edit3 size={14}/></button>
                           <button onClick={() => handleDeleteSignature(sig.id)} className="p-1.5 text-zinc-400 hover:text-red-500 bg-white dark:bg-zinc-800 rounded shadow-sm"><Trash2 size={14}/></button>
                       </div>
                    </div>
                 ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
                  <p className="text-xs text-zinc-400">Pilih tanda tangan untuk langsung diterapkan ke surat.</p>
              </div>
           </div>
        </div>
      )}

      {/* --- CONTROL PANEL CONTAINER --- */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 mb-8 w-full max-w-5xl print:hidden">
        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
                {[ { id: 'data', icon: User, label: 'Data & Profil' }, { id: 'design', icon: Settings2, label: 'Tampilan' }, { id: 'ai', icon: Bot, label: 'AI Generator' } ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-zinc-500 hover:text-zinc-900'}`}>
                    <tab.icon size={18} /> {tab.label}
                  </button>
                ))}
            </div>
            
            <div className="flex items-center gap-3">
                <button onClick={() => setIsEditMode(!isEditMode)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border ${isEditMode ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-zinc-50'}`}>
                    {isEditMode ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>} <span>Edit: {isEditMode ? 'ON' : 'OFF'}</span>
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2 rounded-xl text-sm font-bold"><Printer size={18} /> PDF</button>
            </div>
        </div>

        {/* --- RENDER ACTIVE TAB --- */}
        {activeTab === 'data' && (
            <ProfileTab 
                savedProfiles={savedProfiles}
                onLoadProfile={handleLoadProfile}
                onSaveCurrentProfile={handleSaveCurrentProfile}
                onDeleteProfile={handleDeleteProfile}
            />
        )}

        {activeTab === 'design' && (
            <DesignTab settings={settings} onAdjust={adjust} />
        )}

        {activeTab === 'ai' && (
            <AIGeneratorTab 
                personalDetails={personalDetails}
                onDetailChange={handleDetailChange}
                // Props Lampiran
                attachments={attachments}
                onToggleAttachment={toggleAttachment}
                onUpdateAttachment={updateAttachmentText}
                onDeleteAttachment={deleteAttachmentById}
                onAddAttachment={addNewAttachment}
                
                targetJob={targetJob}
                setTargetJob={setTargetJob}
                promptLength={promptLength}
                setPromptLength={setPromptLength}
                onGeneratePrompt={generateDynamicPrompt}
                jsonInput={jsonInput}
                setJsonInput={setJsonInput}
                onImportJson={handleImportJson}
                onResetData={handleCreateNewProfile}
                onSaveProfile={handleSaveCurrentProfile}
                // Pass props for Profile Management in AI Tab
                savedProfiles={savedProfiles}
                setSavedProfiles={setSavedProfiles}
                onLoadProfile={handleLoadProfile}
            />
        )}
      </div>

      {/* --- PREVIEW KERTAS (A4) --- */}
      <div 
        className="bg-white text-black shadow-2xl print:shadow-none relative mx-auto transition-all duration-300"
        style={{ width: '21cm', minHeight: '29.7cm', padding: `${settings.margin}cm`, fontSize: `${settings.fontSize}pt`, lineHeight: settings.lineHeight, fontFamily: '"Times New Roman", Times, serif' }}
      >
        <style jsx global>{`
            .editable-highlight { @apply cursor-pointer relative rounded border border-dashed border-zinc-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 px-1 -mx-1 py-0.5; }
            .editable-highlight:hover::after { content: '✎'; @apply absolute -top-2 -right-2 text-[8px] bg-blue-500 text-white w-4 h-4 flex items-center justify-center rounded-full shadow-sm pointer-events-none z-10; }
            .add-btn { @apply flex items-center justify-center gap-1 w-full py-1 mt-1 mb-2 border-2 border-dashed border-zinc-200 rounded-lg text-zinc-300 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 cursor-pointer transition-all text-[10px] font-sans font-bold uppercase tracking-wider; }
            @media print { .no-print, .add-btn, .editable-highlight { border: none !important; background: none !important; padding: 0 !important; } .editable-highlight::after { display: none !important; } }
        `}</style>

        {/* Header Kertas */}
        <div className={`text-right mb-6 editable-container`}>
            <span className={isEditMode ? 'editable-highlight' : ''} onClick={() => openEdit('Tanggal', headerData.cityDate, (val) => setHeaderData({...headerData, cityDate: val}))}>{headerData.cityDate}</span>
        </div>

        {/* Content Body */}
        <div className="text-left mb-8 space-y-1">
             <div><span className="mr-2">{headerData.labelSubject}:</span><strong className={isEditMode ? 'editable-highlight' : ''} onClick={() => openEdit('Subject', headerData.subject, v=>setHeaderData({...headerData, subject: v}))}>{headerData.subject}</strong></div>
             <div className="pt-4">
                <div className={isEditMode ? 'editable-highlight w-fit' : ''} onClick={() => openEdit('Yth', headerData.labelTo, v=>setHeaderData({...headerData, labelTo: v}))}>{headerData.labelTo}</div>
                <strong className={isEditMode ? 'editable-highlight w-fit block' : 'block'} onClick={() => openEdit('Title', headerData.recipientTitle, v=>setHeaderData({...headerData, recipientTitle: v}))}>{headerData.recipientTitle}</strong>
                <strong className={isEditMode ? 'editable-highlight w-fit block' : 'block'} onClick={() => openEdit('Company', headerData.companyName, v=>setHeaderData({...headerData, companyName: v}))}>{headerData.companyName}</strong>
                <div className={isEditMode ? 'editable-highlight w-fit' : ''} onClick={() => openEdit('Address', headerData.recipientAddress, v=>setHeaderData({...headerData, recipientAddress: v}))}>{headerData.recipientAddress}</div>
             </div>
        </div>

        {/* Greeting & Body */}
        <div className="text-justify">
            <p className="mb-4">{structure.greeting}</p>
            {bodyParagraphs.map((para, idx) => (
                <div key={idx} className="relative group mb-4">
                    <p className={isEditMode ? 'editable-highlight' : ''} onClick={() => openEdit(`Para ${idx+1}`, para, (v) => setBodyParagraphs(prev=>{const n=[...prev];n[idx]=v;return n;}))}>{para}</p>
                    {isEditMode && <button onClick={() => deleteItem(setBodyParagraphs, idx)} className="absolute -right-6 top-0 text-red-500 no-print"><Trash2 size={12}/></button>}
                </div>
            ))}
            {isEditMode && <button onClick={() => addItem('paragraph')} className="add-btn"><PlusCircle size={14}/> Add Para</button>}
            
            <p className="mb-4">{structure.dataIntro}</p>
            <table className="w-full border-collapse mb-4 mt-2">
                <tbody>
                    {personalDetails.map((row, idx) => (
                        <tr key={row.id}>
                            <td className="w-40 align-top pb-1 font-bold">{row.label}</td>
                            <td className="w-4 align-top text-center">:</td>
                            <td className="align-top pb-1"><span className={isEditMode ? 'editable-highlight' : ''} onClick={() => openEdit(row.label, row.value, v => handleDetailChange(idx, v))}>{row.value}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <p className="mb-4">{structure.attachmentIntro}</p>
            <ol className="list-decimal ml-6 pl-2 mb-4">
                {attachments.filter(a => a.isChecked).map(item => (
                    <li key={item.id} className="pl-1 mb-1"><span className={isEditMode ? 'editable-highlight' : ''} onClick={() => openEdit('Lampiran', item.text, v => updateAttachmentText(item.id, v))}>{item.text}</span></li>
                ))}
            </ol>

            <p className="mb-4">{closingData.intro}</p>
        </div>

        {/* Signature */}
        <div className="mt-8 relative h-40">
            <p>{closingData.greeting}</p>
            {signatureImage && <img src={signatureImage} alt="TTD" className="absolute h-[70px] left-0 top-8 mix-blend-multiply" />}
            <p className="font-bold underline mt-20">{closingData.signerName}</p>
        </div>
      </div>
      
      {/* Footer Tools Tanda Tangan */}
      <div className="mt-8 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center print:hidden w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-zinc-800 dark:text-white flex items-center gap-2"><PenTool size={18}/> Area Tanda Tangan</h3>
            
            <div className="flex gap-2">
                <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => setIsSigModalOpen(true)}>
                    <Settings2 size={14}/> Kelola ({savedSignatures.length})
                </Button>
                <div className="relative overflow-hidden">
                    <Button variant="ghost" className="!px-2 !py-1 text-xs"><ImageIcon size={14}/> Upload</Button>
                    <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
            </div>
        </div>

        <div className="relative">
            {!signatureImage ? (
                <canvas ref={canvasRef} width={300} height={100} 
                  className="bg-white border-2 border-dashed border-zinc-300 rounded-xl mx-auto touch-none cursor-crosshair hover:border-blue-400 transition-colors" 
                  onMouseMove={draw} onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseOut={stopDrawing} 
                />
            ) : (
                <div className="relative w-[300px] h-[100px] mx-auto bg-white border border-zinc-200 rounded-xl flex items-center justify-center overflow-hidden group">
                    <img src={signatureImage} className="max-h-full max-w-full" alt="Signature" />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-xs px-2 py-1 rounded shadow">Klik Hapus untuk Reset</span>
                    </div>
                </div>
            )}
            
            {!signatureImage && <p className="text-[10px] text-zinc-400 mt-2">Gambar tanda tangan di kotak atas atau upload gambar.</p>}
        </div>

        <div className="flex gap-2 justify-center mt-4">
            <button onClick={clearCanvas} className="flex gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-bold transition">
                <Trash2 size={16}/> {signatureImage ? 'Hapus' : 'Reset'}
            </button>
            {signatureImage && (
                <button onClick={handleSaveSignatureToDb} className="flex gap-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-bold transition border border-blue-200">
                    <Save size={16}/> Simpan ke Koleksi
                </button>
            )}
        </div>
      </div>

    </div>
  );
};