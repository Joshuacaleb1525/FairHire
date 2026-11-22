import type {HTMLAttributes} from 'react';
import {cn} from '../../lib/utils';
export function Card({className,...p}:HTMLAttributes<HTMLDivElement>){return <div className={cn('glass-panel rounded-[26px]',className)} {...p}/>}
