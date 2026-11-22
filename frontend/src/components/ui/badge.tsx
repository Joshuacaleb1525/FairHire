import type {HTMLAttributes} from 'react';
import {cn} from '../../lib/utils';
export function Badge({className,...p}:HTMLAttributes<HTMLSpanElement>){return <span className={cn('inline-flex items-center rounded-full border border-[#cfe0f1] bg-white/65 px-2.5 py-1 text-xs font-semibold capitalize text-[#567493] backdrop-blur',className)} {...p}/>}
