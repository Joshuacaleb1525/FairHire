import type {InputHTMLAttributes} from 'react';
import {cn} from '../../lib/utils';
export function Input({className,...p}:InputHTMLAttributes<HTMLInputElement>){return <input className={cn('w-full rounded-2xl border border-[#cbdff2] bg-white/78 px-3.5 py-2.5 text-[#17385e] shadow-inner outline-none backdrop-blur focus:border-[#73a9df] focus:ring-4 focus:ring-[#dceeff]/70',className)} {...p}/>}
