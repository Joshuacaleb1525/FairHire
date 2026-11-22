import type {ButtonHTMLAttributes} from 'react';
import {cn} from '../../lib/utils';
export function Button({className,variant='default',...p}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'default'|'outline'|'danger'|'ghost'|'soft'}){
  const v={
    default:'border border-[#3d7fd1]/20 bg-[linear-gradient(135deg,#236fc1,#4f98e8)] text-white shadow-[0_10px_24px_rgba(45,116,192,.20)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(45,116,192,.26)]',
    outline:'border border-[#c8dbef] bg-white/78 text-[#2d527b] shadow-sm backdrop-blur hover:border-[#a8c6e5] hover:bg-white',
    danger:'border border-rose-500/20 bg-[linear-gradient(135deg,#e94f70,#f43f5e)] text-white shadow-sm hover:-translate-y-0.5',
    ghost:'text-[#547392] hover:bg-white/70 hover:text-[#173f6f]',
    soft:'border border-[#cfe1f6] bg-[#eaf5ff]/80 text-[#1e5c9e] hover:bg-[#dceeff]'
  }[variant];
  return <button className={cn('inline-flex min-h-10 items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50',v,className)} {...p}/>
}
