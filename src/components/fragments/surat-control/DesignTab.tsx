// src/components/fragments/surat-control/DesignTab.tsx
import React from 'react';
import { Type, AlignJustify, Move, Minus, Plus } from 'lucide-react';

interface DesignTabProps {
  settings: { fontSize: number; lineHeight: number; margin: number };
  onAdjust: (type: 'font' | 'line' | 'margin', val: number) => void;
}

export const DesignTab = ({ settings, onAdjust }: DesignTabProps) => {
  const controls = [
    { label: 'Ukuran Huruf', type: 'font' as const, val: settings.fontSize, unit: 'pt', step: 1, icon: Type, color: 'text-blue-500' },
    { label: 'Spasi Baris', type: 'line' as const, val: settings.lineHeight, unit: '', step: 0.1, icon: AlignJustify, color: 'text-indigo-500' },
    { label: 'Margin', type: 'margin' as const, val: settings.margin, unit: 'cm', step: 0.2, icon: Move, color: 'text-emerald-500' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-200">
      {controls.map((ctrl, idx) => (
        <div key={idx} className="space-y-3">
          <div className="flex justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <span className="flex items-center gap-2"><ctrl.icon size={16} className={ctrl.color} /> {ctrl.label}</span>
            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs">{ctrl.val}{ctrl.unit}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onAdjust(ctrl.type, -ctrl.step)} className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"><Minus size={16} /></button>
            <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-300 dark:bg-zinc-600" style={{ width: '50%' }}></div>
            </div>
            <button onClick={() => onAdjust(ctrl.type, ctrl.step)} className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"><Plus size={16} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};