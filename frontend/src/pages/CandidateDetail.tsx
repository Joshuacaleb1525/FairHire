import {useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {ArrowLeft,BrainCircuit,CheckCircle2,RefreshCw,ShieldCheck,ThumbsDown,ThumbsUp} from 'lucide-react';
import {Bar,BarChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
import {api} from '../lib/api';
import type {Candidate} from '../types';
import {Button} from '../components/ui/button';
import {Card} from '../components/ui/card';
import {Badge} from '../components/ui/badge';

export function CandidateDetail(){
  const{id}=useParams();
  const[c,setC]=useState<Candidate|null>(null);
  const[error,setError]=useState('');
  const[busy,setBusy]=useState(false);
  const[notice,setNotice]=useState('');

  async function load(){try{setC(await api(`/candidates/${id}`));setError('')}catch(e:any){setError(e.message)}}
  useEffect(()=>{void load()},[id]);

  async function status(s:string){
    try{await api(`/candidates/${id}/status`,{method:'PATCH',body:JSON.stringify({status:s})});await load()}catch(e:any){setError(e.message)}
  }
  async function rerun(){
    setBusy(true);setError('');setNotice('');
    try{await api(`/candidates/${id}/score`,{method:'POST'});await load();setNotice('Double-Judge review regenerated from the stored resume evidence.')}catch(e:any){setError(e.message)}finally{setBusy(false)}
  }

  if(error&&!c)return <Card className="p-6 text-rose-700">{error}</Card>;
  if(!c)return <p className="text-sm text-slate-500">Loading candidate…</p>;

  const m=c.match;
  const review=m?.explanation?.double_judge;
  const doubleJudgeActive=Boolean(review?.judge1&&review?.judge2);
  const chart=m?[{n:'Skills',v:m.skills_score},{n:'Experience',v:m.experience_score},{n:'Education',v:m.education_score},{n:'3D',v:m.coordinate_score},{n:'ML relevance',v:m.ml_relevance_score??0}]:[];

  return <div className="space-y-6">
    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={16}/>Dashboard</Link>

    {error&&<Card className="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</Card>}
    {notice&&<Card className="border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</Card>}

    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-[#173d78] to-[#2f6fc0] p-6 text-white lg:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/20 bg-white/10 text-white">Anonymous screening</Badge>
              <Badge className={doubleJudgeActive?'border-emerald-300/40 bg-emerald-300/15 text-emerald-50':'border-amber-300/40 bg-amber-300/15 text-amber-50'}>
                {doubleJudgeActive?'Double Judge ACTIVE':'Double Judge needs review'}
              </Badge>
            </div>
            <h1 className="mt-3 text-3xl font-black">{c.candidate_code}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20" onClick={rerun} disabled={busy}><RefreshCw size={16} className={`mr-2 ${busy?'animate-spin':''}`}/>{busy?'Running judges…':'Run Double-Judge Review'}</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={()=>status('shortlisted')}><ThumbsUp size={16} className="mr-2"/>Shortlist</Button>
            <Button variant="danger" onClick={()=>status('rejected')}><ThumbsDown size={16} className="mr-2"/>Reject</Button>
          </div>
        </div>
      </div>
    </Card>

    <AuditStatus active={doubleJudgeActive} review={review}/>

    {m?<>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Ranking score" value={m.ranking_score??m.final_score} emphasis/>
        <Metric label="Transparent score" value={m.final_score}/>
        <Metric label="ML relevance" value={m.ml_relevance_score??0}/>
        <Card className="p-5"><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Candidate coordinate</div><div className="mt-3 font-mono text-xl font-black text-slate-900">({m.coordinate?.x}, {m.coordinate?.y}, {m.coordinate?.z})</div><div className="mt-2 text-xs text-slate-400">Ideal = (100, 100, 100)</div></Card>
      </div>

      <DoubleJudgePanel review={review}/>
      <MlPanel ml={m.explanation?.ml_relevance} score={m.ml_relevance_score??0}/>

      <div className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
        <Card className="p-6">
          <h2 className="text-lg font-black">Score profile</h2>
          <p className="mt-1 text-sm text-slate-500">The three transparent dimensions used in ranking.</p>
          <div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart} layout="vertical" margin={{left:15,right:15}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" domain={[0,100]}/><YAxis type="category" dataKey="n" width={80}/><Tooltip/><Bar dataKey="v" fill="#2f6fc0" radius={[0,6,6,0]}/></BarChart></ResponsiveContainer></div>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-black">How the ranking score was built</h2>
          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-4 font-mono text-xs leading-6 text-[#173d78]">{m.explanation?.formula}</div>
          <div className="mt-2 rounded-xl border border-violet-100 bg-violet-50 p-4 font-mono text-xs leading-6 text-violet-800">{m.explanation?.ranking_formula||'Ranking score = Transparent score + Explainable ML ensemble'}</div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3"><Mini label="Skills" value={m.skills_score}/><Mini label="Experience" value={m.experience_score}/><Mini label="Education" value={m.education_score}/></div>
          <p className="mt-5 text-sm leading-6 text-slate-500">{m.explanation?.scoring_owner||'FAIRHIRE calculates the deterministic score. The judges provide resume-supported claims and job-match assessments.'}</p>
        </Card>
      </div>

      <RequirementEvidence rows={m.explanation?.requirements||[]}/>
    </>:<Card className="p-6 text-sm text-slate-500">This candidate has not been scored yet. Click <b>Run Double-Judge Review</b>.</Card>}

    <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-black">Anonymous candidate profile</h2>
          <p className="mt-1 text-sm text-slate-500">Job-relevant information only. Identity remains separate during screening.</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2"><Label>Professional summary</Label><p className="mt-2 text-sm leading-6 text-slate-600">{friendlyProfileSummary(c.profile?.professional_summary,c.profile)}</p></div>
            <div><Label>Total experience</Label><p className="mt-2 text-2xl font-black">{c.profile?.years_experience??0} <span className="text-sm font-medium text-slate-400">years</span></p></div>
            <div><Label>Certifications</Label><div className="mt-2 flex flex-wrap gap-2">{displayItems(c.profile?.certifications).length?displayItems(c.profile?.certifications).map((x:string)=><Badge key={x}>{x}</Badge>):<span className="text-sm text-slate-400">None detected</span>}</div></div>
            <div className="md:col-span-2"><Label>Skills</Label><div className="mt-2 flex flex-wrap gap-2">{displayItems(c.profile?.skills).length?displayItems(c.profile?.skills).map((s:string)=><Badge key={s}>{s}</Badge>):<span className="text-sm text-slate-400">No skills detected</span>}</div></div>
          </div>
        </Card>

        <Card className="p-6"><h2 className="text-lg font-black">Work experience</h2><div className="mt-4 space-y-3">{c.profile?.roles?.length?c.profile.roles.map((r:any,i:number)=><div key={i} className="rounded-xl border border-slate-200 p-4"><div className="font-bold text-slate-900">{r.title||'Role'}</div><div className="mt-1 text-sm text-slate-500">{r.company||'Company not detected'}{r.years!=null?` · ${r.years} years`:''}</div>{r.highlights?.length?<ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">{r.highlights.slice(0,8).map((x:string,j:number)=><li key={j}>{friendlyEvidenceText(x)}</li>)}</ul>:null}</div>):<div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">No structured work history detected.</div>}</div></Card>

        <Card className="p-6"><h2 className="text-lg font-black">Education</h2><div className="mt-4 space-y-3">{c.profile?.education?.length?c.profile.education.map((e:any,i:number)=><div key={i} className="rounded-xl border border-slate-200 p-4"><div className="font-bold">{tidySentence(e.degree||e.field||'Qualification')}</div>{e.institution&&<div className="mt-1 text-sm text-slate-500">{tidySentence(e.institution)}</div>}{e.year&&<div className="mt-1 text-xs font-semibold text-slate-400">{tidySentence(e.year)}</div>}</div>):<div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">No education record detected.</div>}</div></Card>
    </div>
  </div>
}

function AuditStatus({active,review}:{active:boolean;review:any}){
  return <Card className={`p-5 ${active?'border-emerald-200 bg-emerald-50/50':'border-amber-200 bg-amber-50/60'}`}>
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3"><div className={`rounded-xl p-2.5 ${active?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}><ShieldCheck size={21}/></div><div><div className="font-black">Double-Judge audit: {active?'ACTIVE':'NOT GENERATED'}</div><p className="mt-1 text-sm text-slate-600">{active?'Judge 1 reviewed resume-supported claims without seeing the job. Judge 2 matched only the anonymous claim profile to the job requirements.':'This looks like a legacy score. Run the Double-Judge Review to regenerate it.'}</p></div></div>
      {active&&<div className="flex flex-wrap gap-2 text-xs"><Badge className="border-emerald-200 bg-white text-emerald-700">Judge 1: job hidden</Badge><Badge className="border-emerald-200 bg-white text-emerald-700">Judge 2: identity hidden</Badge><Badge className="border-emerald-200 bg-white text-emerald-700">FAIRHIRE calculates score</Badge></div>}
    </div>
    {active&&<div className="mt-3 text-xs text-slate-500">Audit version: {review?.judge1?.judge?'Judge 1 + Judge 2':'—'}</div>}
  </Card>
}

function DoubleJudgePanel({review}:{review:any}){
  if(!review)return null;
  const j1=review.judge1;const j2=review.judge2;
  return <Card className="p-6">
    <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-[#2f6fc0]"/><h2 className="text-lg font-black">Double-Judge Review</h2></div>
    <p className="mt-1 text-sm text-slate-500">The two stages are isolated before the deterministic FAIRHIRE score is calculated.</p>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Judge 1</div><div className="mt-1 text-lg font-black">Resume Claim Review</div>
        <p className="mt-2 text-sm leading-6 text-slate-600">Reads the resume only and records what the candidate claims and what text supports each claim. The job requirements and ranking are hidden.</p>
        <div className="mt-4 grid grid-cols-2 gap-2"><MiniStat label="Resume-supported" value={j1?.summary?.document_supported??0}/><MiniStat label="Mentioned only" value={j1?.summary?.partially_supported??0}/><MiniStat label="No supporting text" value={j1?.summary?.not_evidenced??0}/><MiniStat label="Avg confidence" value={`${j1?.summary?.average_confidence??0}%`}/></div>
      </div>
      <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-violet-700">Judge 2</div><div className="mt-1 text-lg font-black">Blind Job Match Review</div>
        <p className="mt-2 text-sm leading-6 text-slate-600">Compares the anonymous resume-supported profile with the approved job requirements. Candidate identity is hidden.</p>
        <div className="mt-4 grid grid-cols-3 gap-2"><MiniStat label="Full" value={j2?.evaluations?.filter((x:any)=>x.decision==='full_match').length??0}/><MiniStat label="Partial" value={j2?.evaluations?.filter((x:any)=>x.decision==='partial_match').length??0}/><MiniStat label="No match" value={j2?.evaluations?.filter((x:any)=>x.decision==='no_match').length??0}/></div>
      </div>
    </div>
    <div className="mt-5"><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Judge 1 — resume-supported claims</div><div className="mt-3 space-y-2">{j1?.claims?.slice(0,16).map((x:any,i:number)=><div key={i} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-semibold text-slate-800">{friendlyClaim(x.claim,x.type)}</div>{friendlyClaimEvidence(x)&&<div className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">{friendlyClaimEvidence(x)}</div>}</div><div className="flex items-center gap-2"><Badge>{claimStatusLabel(x.status)}</Badge><span className="text-xs font-bold text-slate-400">{x.confidence}% confidence</span></div></div>)}</div></div>
  </Card>
}

function MlPanel({ml,score}:{ml:any;score:number}){
  const c=ml?.components||{};
  const metrics=[
    ['TF-IDF similarity',c.tfidf_similarity_percent],['BM25 relevance',c.bm25_relevance_percent],
    ['Phrase overlap',c.phrase_overlap_percent],['Requirement coverage',c.requirement_coverage_percent],
    ['Skill coverage',c.skill_coverage_percent],['Experience fit',c.experience_fit_percent],
    ['Education similarity',c.education_similarity_percent],['Certification similarity',c.certification_similarity_percent]
  ];
  return <Card className="p-6">
    <div className="flex flex-wrap items-center gap-2"><BrainCircuit size={19} className="text-violet-600"/><h2 className="text-lg font-black">Explainable ML ensemble</h2><Badge className="border-violet-200 bg-violet-50 text-violet-700">ML Ensemble</Badge></div>
    <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">Eight independent job-fit signals are combined into one ML relevance score. The ensemble uses only the anonymous job-related profile and approved requirements. It does not use name, gender, location, historical hiring outcomes or recruiter decisions.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label,value]:any)=><MiniStat key={label} label={label} value={`${Number(value??0).toFixed(1)}%`}/>)}</div>
    <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/50 p-4"><div className="text-xs font-bold uppercase tracking-wider text-violet-700">Ensemble score</div><div className="mt-1 text-3xl font-black text-slate-900">{score}<span className="ml-1 text-sm text-slate-400">/100</span></div><div className="mt-2 text-sm font-semibold text-slate-800">{ml?.model||'Explainable ML ensemble v2'}</div><div className="mt-2 text-sm leading-6 text-slate-600">{ml?.method||'Unsupervised job-fit ensemble. No training on previous hiring decisions.'}</div>{Array.isArray(ml?.matched_terms)&&ml.matched_terms.length?<div className="mt-3"><div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Strong shared terms</div><div className="flex flex-wrap gap-2">{ml.matched_terms.map((t:string)=><Badge key={t}>{humanLabel(t)}</Badge>)}</div></div>:null}</div>
  </Card>
}

function RequirementEvidence({rows}:{rows:any[]}){
  const fullMatches=(rows||[]).filter((r:any)=>r.decision==='full_match');
  return <Card className="p-6">
    <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-[#2f6fc0]"/><h2 className="text-lg font-black">Recruiter explanation — strong matches</h2></div>
    <p className="mt-1 text-sm text-slate-500">To keep this view clear, only requirements that fully match the anonymous resume-supported profile are shown here. Partial and unmatched items still remain in the scoring calculation.</p>
    <div className="mt-4 space-y-3">{fullMatches.length?fullMatches.map((r:any,i:number)=><div key={i} className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><Badge>{categoryLabel(r.category)}</Badge><Badge>{importanceLabel(r.importance)}</Badge><Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Full match</Badge></div><div className="mt-2 font-bold">{r.requirement}</div></div><div className="text-xl font-black text-[#173d78]">{Math.round(r.score)}<span className="text-xs text-slate-400"> /100</span></div></div>
      <p className="mt-2 text-sm text-slate-500">{plainReason(r)}</p>
      {friendlyEvidenceList(r.evidence,r).length?<div className="mt-3"><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Why this matches</div><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">{friendlyEvidenceList(r.evidence,r).slice(0,4).map((e:string,x:number)=><li key={x}>{e}</li>)}</ul></div>:null}
    </div>):<div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No fully matched requirements are available yet. Run the Double-Judge Review after adding approved job requirements.</div>}</div>
  </Card>
}


function displayItems(values:any){
  const rows=Array.isArray(values)?values:values?[values]:[];
  return [...new Set(rows.flatMap((v:any)=>{
    if(typeof v!=='string')return [];
    const parsed=tryParseObject(v);
    if(Array.isArray(parsed))return parsed.map((x:any)=>tidySentence(x)).filter(Boolean);
    const text=v.trim();
    if(!text)return [];
    return text.includes(',')&&text.length<180?text.split(',').map(x=>tidySentence(x)).filter(Boolean):[tidySentence(text)];
  }))];
}
function friendlyProfileSummary(value:any,profile:any){
  const parsed=tryParseObject(value);
  if(parsed)return profileSentence(parsed);
  const text=tidySentence(value);
  if(text&&!text.startsWith('{'))return text;
  if(profile?.years_experience)return `The resume reports ${profile.years_experience} years of relevant experience.`;
  return 'No professional summary was detected in the resume.';
}

function tryParseObject(value:any){
  if(typeof value!=='string')return null;
  const t=value.trim();
  if(!(t.startsWith('{')||t.startsWith('[')))return null;
  try{return JSON.parse(t)}catch{return null}
}
function tidySentence(value:any){
  const s=String(value||'').replace(/[{}\[\]"']/g,' ').replace(/\s+/g,' ').trim();
  return s.length>260?`${s.slice(0,257)}…`:s;
}
function friendlyClaim(claim:any,type?:string){
  const c=String(claim||'').trim();
  if(!c)return type==='experience'?'Experience':type==='education'?'Education':type==='certification'?'Certification':'Skill';
  return c.replaceAll('_',' ');
}
function profileSentence(obj:any,claim?:string,type?:string){
  if(!obj||typeof obj!=='object')return '';
  const skills=Array.isArray(obj.skills)?obj.skills:[];
  const roles=Array.isArray(obj.roles)?obj.roles:[];
  const education=Array.isArray(obj.education)?obj.education:[];
  const certifications=Array.isArray(obj.certifications)?obj.certifications:[];
  const wanted=String(claim||'').toLowerCase().replace(/[^a-z0-9+#.]+/g,' ').trim();
  if(type==='skill'||wanted){
    const skill=skills.find((s:any)=>wanted.includes(String(s).toLowerCase())||String(s).toLowerCase().includes(wanted));
    const highlight=roles.flatMap((r:any)=>r?.highlights||[]).find((h:any)=>wanted&&String(h).toLowerCase().includes(wanted.split(' ')[0]));
    if(highlight)return `Professional experience described in the resume: ${tidySentence(highlight)}`;
    if(skill)return `${skill} is listed in the candidate's technical skills.`;
  }
  if(type==='experience'&&Number(obj.years_experience||0)>0)return `The resume reports ${obj.years_experience} years of relevant experience.`;
  if(type==='education'&&education.length){const e=education[0];return `Education reported: ${[e.degree,e.field,e.institution,e.year].filter(Boolean).join(' · ')}.`}
  if(type==='certification'&&certifications.length)return `Certification reported: ${certifications.join(', ')}.`;
  if(obj.professional_summary)return tidySentence(obj.professional_summary);
  return '';
}
function friendlyEvidenceText(value:any,context?:any){
  if(value==null)return '';
  const parsed=tryParseObject(value);
  if(parsed)return profileSentence(parsed,context?.claim||context?.requirement,context?.type||context?.category);
  const s=String(value).trim();
  if(!s)return '';
  if(/^skill:\s*/i.test(s))return `${s.replace(/^skill:\s*/i,'')} is listed in the candidate's technical skills.`;
  if(/^professional summary:/i.test(s))return tidySentence(s.replace(/^professional summary:\s*/i,''));
  if(/^total experience reported:/i.test(s))return `The resume reports ${tidySentence(s.replace(/^total experience reported:\s*/i,''))}.`;
  if(/^work experience:/i.test(s))return `Work history: ${tidySentence(s.replace(/^work experience:\s*/i,''))}.`;
  if(/^work evidence:/i.test(s))return tidySentence(s.replace(/^work evidence:\s*/i,''));
  if(/^education:/i.test(s))return `Education reported: ${tidySentence(s.replace(/^education:\s*/i,''))}.`;
  if(/^certification listed:/i.test(s))return `Certification reported: ${tidySentence(s.replace(/^certification listed:\s*/i,''))}.`;
  return tidySentence(s);
}
function friendlyClaimEvidence(claim:any){
  const rows=(claim?.evidence||[]).map((e:any)=>friendlyEvidenceText(e,claim)).filter(Boolean);
  return rows[0]||fallbackClaimSentence(claim);
}
function fallbackClaimSentence(claim:any){
  const name=friendlyClaim(claim?.claim,claim?.type);
  if(claim?.status==='not_evidenced')return `No supporting resume text was found for ${name}.`;
  if(claim?.type==='skill')return `${name} is mentioned in the resume.`;
  if(claim?.type==='experience')return `The resume contains experience information supporting this claim.`;
  if(claim?.type==='education')return `The resume contains education information supporting this claim.`;
  if(claim?.type==='certification')return `The certification is listed in the resume.`;
  return 'Supporting information was found in the resume.';
}
function friendlyEvidenceList(values:any[],context?:any){
  const clean=(values||[]).map(v=>friendlyEvidenceText(v,context)).filter(Boolean);
  return [...new Set(clean)];
}

function categoryLabel(value:string){return ({skill:'Skill',experience:'Experience',education:'Education',certification:'Certification',other:'Other'} as Record<string,string>)[value]||humanLabel(value)}
function importanceLabel(value:string){return value==='required'?'Required':value==='preferred'?'Preferred':humanLabel(value)}
function claimStatusLabel(value:string){return value==='document_supported'?'Supported by resume text':value==='partially_supported'?'Mentioned in resume':value==='not_evidenced'?'No supporting text found':humanLabel(value)}
function humanLabel(value:string){return String(value||'').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase())}
function plainReason(r:any){
  if(r.category==='skill')return 'The resume contains clear, job-related evidence for this skill.';
  if(r.category==='experience')return 'The resume-reported experience meets or exceeds this requirement.';
  if(r.category==='education')return 'The resume-reported education directly meets this requirement.';
  if(r.category==='certification')return 'The resume lists a certification that directly matches this requirement.';
  return r.reason||'The anonymous profile fully matches this requirement.';
}

function Metric({label,value,emphasis=false}:{label:string;value:number;emphasis?:boolean}){return <Card className={`p-5 ${emphasis?'border-blue-200 bg-blue-50/60':''}`}><div className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div><div className={`mt-2 text-4xl font-black ${emphasis?'text-[#173d78]':'text-slate-900'}`}>{value}<span className="ml-1 text-sm text-slate-400">/100</span></div></Card>}
function Mini({label,value}:{label:string;value:number}){return <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs font-semibold text-slate-400">{label}</div><div className="mt-1 text-2xl font-black">{value}</div></div>}
function MiniStat({label,value}:{label:string;value:any}){return <div className="rounded-xl bg-white p-3"><div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div><div className="mt-1 text-xl font-black text-slate-900">{value}</div></div>}
function Label({children}:{children:any}){return <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{children}</div>}
