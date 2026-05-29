import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatusCheckboxProps {
  label: string;
  checked: boolean;
  onClick: () => void;
}

export function StatusCheckbox({ label, checked, onClick }: StatusCheckboxProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-none-none border text-xs font-medium transition-all text-left",
        checked 
          ? "bg-white border-black/30 text-black" 
          : "bg-white border-black text-neutral-600 hover:border-black"
      )}
    >
      {checked ? (
        <CheckCircle2 className="w-4 h-4 text-black shrink-0" strokeWidth={1.5} />
      ) : (
        <Circle className="w-4 h-4 text-neutral-300 shrink-0" strokeWidth={1.5} />
      )}
      <span className="leading-tight">{label}</span>
    </button>
  );
}
