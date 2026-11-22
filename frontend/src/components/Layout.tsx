import {BarChart3,BriefcaseBusiness,Scale,ShieldCheck,Sparkles} from 'lucide-react';
import {Link,Outlet,useLocation} from 'react-router-dom';
import {cn} from '../lib/utils';

export function Layout(){
  const location=useLocation();
  const active=location.pathname==='/'?'dashboard':location.pathname.startsWith('/jobs')?'jobs':'candidates';
  return <div className="fh-shell min-h-screen lg:grid lg:grid-cols-[210px_1fr]">
    <span className="fh-orb fh-orb-a"/><span className="fh-orb fh-orb-b"/>
    <aside className="hidden min-h-screen border-r border-white/30 bg-[linear-gradient(180deg,rgba(20,61,116,.94),rgba(19,71,134,.88))] text-white shadow-[18px_0_60px_rgba(38,89,145,.08)] backdrop-blur-xl lg:block">
      <div className="sticky top-0 flex h-screen flex-col p-4">
        <Link to="/" className="flex items-center gap-2.5 px-1 py-2">
          <div className="rounded-xl border border-white/20 bg-white/12 p-2 shadow-inner"><Scale size={19}/></div>
          <div><div className="font-black text-sm tracking-wide">FAIRHIRE AI</div><div className="text-[10px] text-blue-100/75">Fair · Explainable</div></div>
        </Link>
        <nav className="mt-6 space-y-1">
          <Nav active={active==='dashboard'} to="/" icon={<BarChart3 size={17}/>} label="Dashboard"/>
          <Nav active={active==='jobs'} to="/jobs/new" icon={<BriefcaseBusiness size={17}/>} label="Create job"/>
        </nav>
        <div className="mt-auto rounded-2xl border border-white/15 bg-white/8 p-3 shadow-inner backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold"><ShieldCheck size={15}/> Explainable by design</div>
          <p className="mt-1 text-[11px] leading-4 text-blue-100/72">Transparent server-side candidate ranking.</p>
        </div>
      </div>
    </aside>
    <div className="min-w-0">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/58 shadow-[0_1px_0_rgba(148,180,216,.18)] backdrop-blur-2xl">
        <div className="flex h-16 items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-2 lg:hidden"><Scale className="text-[#1f5fa8]" size={21}/><b>FAIRHIRE AI</b></Link>
          <div className="hidden lg:block"><div className="text-[11px] font-bold uppercase tracking-[.22em] text-[#8ba4c1]">Recruitment intelligence workspace</div></div>
          <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/68 px-3.5 py-2 text-xs font-semibold text-[#42688f] shadow-[0_8px_24px_rgba(76,125,167,.08)] backdrop-blur-xl"><Sparkles size={14} className="text-[#438ee6]"/> Gemini-ready</div>
        </div>
      </header>
      <main className="fh-main mx-auto max-w-[1600px] px-5 py-6 lg:px-8 lg:py-8"><Outlet/></main>
    </div>
  </div>
}
function Nav({active,to,icon,label}:{active:boolean;to:string;icon:any;label:string}){return <Link to={to} className={cn('flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',active?'bg-white text-[#123a6c] shadow-[0_8px_24px_rgba(8,40,78,.12)]':'text-blue-100/82 hover:bg-white/10 hover:text-white')}>{icon}{label}</Link>}
