import {useEffect,useMemo,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {ArrowLeft,CheckCircle2,FileUp,Plus,Save,Sparkles,Trophy,WandSparkles} from 'lucide-react';
import {api} from '../lib/api';
import type {Candidate,Job,Requirement} from '../types';
import {Button} from '../components/ui/button';
import {Card} from '../components/ui/card';
import {Badge} from '../components/ui/badge';

const categoryLabels:Record<string,string>={skill:'Skill',experience:'Experience',education:'Education',certification:'Certification',other:'Other'};
const importanceLabels:Record<string,string>={required:'Required',preferred:'Preferred'};
const statusLabels:Record<string,string>={new:'New',shortlisted:'Shortlisted',rejected:'Rejected',analyzed:'Ready for screening',draft:'Draft',open:'Open',screening:'Screening in progress',completed:'Screening complete',full_time:'Full time',part_time:'Part time'};
const human=(value?:string)=>statusLabels[String(value||'').toLowerCase()]||String(value||'').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());

export function JobWorkspace(){
  const{id}=useParams();
  const[job,setJob]=useState<Job|null>(null);
  const[reqs,setReqs]=useState<Requirement[]>([]);
  const[cands,setCands]=useState<Candidate[]>([]);
  const[files,setFiles]=useState<FileList|null>(null);
  const[requirementsText,setRequirementsText]=useState('');
  const[busy,setBusy]=useState('');
  const[msg,setMsg]=useState('');
  const[error,setError]=useState('');

  async function load(){try{setError('');const j=await api(`/jobs/${id}`);setJob(j);setReqs(j.requirements||[]);setCands(await api(`/candidates/job/${id}`))}catch(e:any){setError(e.message)}}
  useEffect(()=>{void load()},[id]);
  async function run(name:string,fn:()=>Promise<void>){setBusy(name);setMsg('');setError('');try{await fn()}catch(e:any){setError(e.message)}finally{setBusy('')}}

  const analyze=()=>run('analyze',async()=>{
    setReqs(await api(`/jobs/${id}/analyze`,{method:'POST',body:JSON.stringify({requirements_text:requirementsText})}));
    setMsg('Requirements prepared. Review and save them when you are happy with the list.');
  });
  const saveReqs=()=>run('save',async()=>{setReqs(await api(`/jobs/${id}/requirements`,{method:'PUT',body:JSON.stringify({requirements:reqs})}));setMsg('Requirements saved successfully.')});
  const upload=()=>run('upload',async()=>{if(!files?.length)throw new Error('Select at least one resume');const fd=new FormData();Array.from(files as FileList).forEach((f:File)=>fd.append('resumes',f));const result=await api(`/candidates/job/${id}/upload`,{method:'POST',body:fd});const failed=result.filter((x:any)=>x.error);setMsg(failed.length?`${result.length-failed.length} resumes processed; ${failed.length} could not be processed.`:'Resumes processed and added to anonymous screening.');setFiles(null);await load()});
  const score=()=>run('score',async()=>{await api(`/candidates/job/${id}/score`,{method:'POST'});setMsg('Candidate ranking updated.');await load()});
  function edit(i:number,p:Partial<Requirement>){const a=[...reqs];a[i]={...a[i],...p};setReqs(a)}

  const ranked=useMemo(()=>cands.filter(c=>c.match).length,[cands]);
  if(error&&!job)return <Card className="p-6 text-rose-700">{error}</Card>;
  if(!job)return <p className="text-sm text-slate-500">Loading job…</p>;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={16}/>Dashboard</Link>
      <div className="text-xs font-semibold text-slate-400">Job workspace</div>
    </div>

    <Card className="overflow-hidden border-0 shadow-[0_16px_45px_rgba(15,23,42,.08)]">
      <div className="bg-gradient-to-br from-[#0f2747] via-[#153d70] to-[#24599a] p-6 text-white lg:p-8">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
          <div className="max-w-5xl">
            <div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-black tracking-tight lg:text-4xl">{job.title}</h1><Badge className="border-white/20 bg-white/10 text-white">{human(job.status)}</Badge></div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-blue-100/80"><span>{job.department}</span><span>•</span><span>{human(job.employment_type)}</span></div>
            <p className="mt-5 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-blue-50/85">{job.job_description||'No detailed job description added yet. Add the key requirements below and FAIRHIRE can complete the structured criteria.'}</p>
          </div>
          <div className="grid min-w-[220px] grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/8 p-3 backdrop-blur-sm">
            <div className="rounded-xl bg-white/10 p-3"><div className="text-2xl font-black">{reqs.length}</div><div className="mt-1 text-[11px] text-blue-100/70">Requirements</div></div>
            <div className="rounded-xl bg-white/10 p-3"><div className="text-2xl font-black">{cands.length}</div><div className="mt-1 text-[11px] text-blue-100/70">Applicants</div></div>
          </div>
        </div>
      </div>
    </Card>

    {msg&&<Notice>{msg}</Notice>}{error&&<Notice error>{error}</Notice>}

    <Card className="p-6 lg:p-7">
      <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
        <div><div className="text-xs font-bold uppercase tracking-[.16em] text-[#2f6fc0]">AI-assisted setup</div><h2 className="mt-1 text-2xl font-black text-slate-900">Build the job requirements</h2><p className="mt-1 text-sm leading-6 text-slate-500">Write the essentials in your own words. FAIRHIRE turns them into structured requirements that you can review and edit.</p></div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#2f6fc0]"><Sparkles size={14}/>You remain in control</div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[.78fr_1.22fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <h3 className="font-black text-slate-900">What are you looking for?</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">Short notes are enough. AI will combine them with the job description.</p>
          <textarea value={requirementsText} onChange={e=>setRequirementsText(e.target.value)} className="mt-4 min-h-52 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 shadow-sm outline-none transition focus:border-[#2f6fc0] focus:ring-4 focus:ring-blue-50" placeholder={'Example:\nReact, Node.js and MongoDB are mandatory\nMinimum 3 years full-stack experience\nBachelor’s degree preferred\nAWS or Docker is an advantage'}/>
          <Button className="mt-3 w-full" onClick={analyze} disabled={!!busy}><WandSparkles size={16} className="mr-2"/>{busy==='analyze'?'Preparing requirements…':'Complete requirements with AI'}</Button>
          <p className="mt-2 text-xs leading-5 text-slate-400">AI suggests job-related criteria only. Nothing is saved until you approve it.</p>
        </div>

        <div>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-black text-slate-900">Requirements to use for screening</h3><p className="mt-1 text-sm text-slate-500">Review the list, adjust priority or weight, then save.</p></div><Button variant="outline" onClick={saveReqs} disabled={!reqs.length||!!busy}><Save size={16} className="mr-2"/>{busy==='save'?'Saving…':'Save requirements'}</Button></div>
          {!reqs.length?<div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-sm"><Sparkles className="text-slate-300"/></div><div className="mt-3 font-bold text-slate-700">No requirements yet</div><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">Enter a few requirements on the left and choose <b>Complete requirements with AI</b>. You can also add criteria manually.</p></div>:<div className="mt-5 space-y-3">{reqs.map((r,i)=><div key={r.id||i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,.03)]"><div className="grid gap-3 md:grid-cols-[145px_1fr_130px_90px_38px]"><label className="text-xs font-semibold text-slate-500">Type<select className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 outline-none focus:border-[#2f6fc0]" value={r.category} onChange={e=>edit(i,{category:e.target.value as any})}>{Object.entries(categoryLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs font-semibold text-slate-500">Requirement<input className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800 outline-none focus:border-[#2f6fc0]" value={r.requirement} onChange={e=>edit(i,{requirement:e.target.value})}/></label><label className="text-xs font-semibold text-slate-500">Priority<select className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 outline-none focus:border-[#2f6fc0]" value={r.importance} onChange={e=>edit(i,{importance:e.target.value as any})}>{Object.entries(importanceLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs font-semibold text-slate-500">Weight<input className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800 outline-none focus:border-[#2f6fc0]" type="number" min="1" max="10" value={r.weight} onChange={e=>edit(i,{weight:Number(e.target.value)})}/></label><button aria-label="Remove requirement" title="Remove requirement" className="mt-6 h-10 rounded-xl text-xl text-rose-500 hover:bg-rose-50" onClick={()=>setReqs(reqs.filter((_,x)=>x!==i))}>×</button></div></div>)}</div>}
          <Button variant="ghost" className="mt-3" onClick={()=>setReqs([...reqs,{category:'skill',requirement:'',importance:'required',weight:5}])}><Plus size={15} className="mr-1"/>Add requirement manually</Button>
        </div>
      </div>
    </Card>

    <Card className="p-6 lg:p-7">
      <div className="mb-6"><div className="text-xs font-bold uppercase tracking-[.16em] text-[#2f6fc0]">Applicant screening</div><h2 className="mt-1 text-2xl font-black text-slate-900">Add resumes and build the ranking</h2><p className="mt-1 text-sm leading-6 text-slate-500">Upload applicant documents, then let FAIRHIRE anonymize, match and rank them using the approved requirements.</p></div>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-2xl border border-slate-200 p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-2.5 text-[#2f6fc0]"><FileUp size={20}/></div><div><h3 className="font-black">Add applicants</h3><p className="text-xs text-slate-500">PDF, DOCX or TXT · multiple files supported</p></div></div><label className="mt-5 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-8 text-center hover:border-[#91add5] hover:bg-blue-50/40"><FileUp className="text-slate-400"/><span className="mt-2 text-sm font-bold">Choose resume documents</span><span className="mt-1 text-xs text-slate-400">Select one or more files from your computer</span><input className="hidden" type="file" multiple accept=".pdf,.docx,.txt" onChange={e=>setFiles(e.target.files)}/></label>{files?.length?<div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">{files.length} file{files.length>1?'s':''} selected</div>:null}<Button className="mt-3 w-full" onClick={upload} disabled={!files?.length||!!busy}><FileUp size={16} className="mr-2"/>{busy==='upload'?'Processing resumes…':'Add applicants'}</Button></div>
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-white p-2.5 text-[#2f6fc0] shadow-sm"><Sparkles size={20}/></div><div><h3 className="font-black">Match & rank</h3><p className="text-xs text-slate-500">{cands.length} applicant{cands.length===1?'':'s'} added · {ranked} currently ranked</p></div></div><Button variant="soft" className="mt-5 w-full" onClick={score} disabled={!cands.length||!reqs.length||!!busy}><Sparkles size={16} className="mr-2"/>{busy==='score'?'Ranking candidates…':'Match & rank all'}</Button><div className="mt-4 rounded-xl border border-blue-100 bg-white p-4 text-xs leading-5 text-slate-500"><b className="text-slate-700">Transparent scoring</b><br/>Skills 50% · Experience 30% · Education 20%<br/>Final score combines the weighted result with the 3D coordinate score.</div></div>
      </div>
    </Card>

    <Card className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-2 text-[#2f6fc0]"><Trophy size={18}/></div><div><h2 className="font-black">Anonymous candidate ranking</h2><p className="text-xs text-slate-500">Candidates are ordered by their final transparent score.</p></div></div><div className="text-xs font-semibold text-slate-400">Identity hidden during screening</div></div>{!cands.length?<p className="p-10 text-center text-sm text-slate-500">No applicants added yet.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Candidate</th><th className="px-3 py-3">Skills</th><th className="px-3 py-3">Experience</th><th className="px-3 py-3">Education</th><th className="px-3 py-3">3D score</th><th className="px-3 py-3">Final score</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr></thead><tbody>{cands.map((c,i)=><tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/60"><td className="px-4 py-3.5 font-black">{c.match?`#${i+1}`:'—'}</td><td className="px-4 py-3.5"><div className="font-bold text-slate-900">{c.candidate_code}</div><div className="mt-0.5 text-xs text-slate-400">{c.profile?.years_experience??0} yrs exp · {(c.profile?.skills||[]).slice(0,3).join(', ')||'Profile extracted'}</div></td><td className="px-3 py-3.5 font-semibold text-slate-700">{c.match?.skills_score??'—'}</td><td className="px-3 py-3.5 font-semibold text-slate-700">{c.match?.experience_score??'—'}</td><td className="px-3 py-3.5 font-semibold text-slate-700">{c.match?.education_score??'—'}</td><td className="px-3 py-3.5 font-semibold text-slate-700">{c.match?.coordinate_score??'—'}</td><td className="px-3 py-3.5 text-base font-black text-[#173d78]">{c.match?.final_score??'—'}</td><td className="px-4 py-3.5"><Badge>{human(c.status)}</Badge></td><td className="px-4 py-3.5"><Link to={`/candidates/${c.id}`}><Button variant="ghost" className="h-8 px-2.5 text-xs">View explanation</Button></Link></td></tr>)}</tbody></table></div>}</Card>
  </div>;
}

function Notice({children,error=false}:{children:any;error?:boolean}){return <div className={`flex items-center gap-2 rounded-xl border p-3.5 text-sm ${error?'border-rose-200 bg-rose-50 text-rose-700':'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{!error&&<CheckCircle2 size={17}/>}<span>{children}</span></div>}
