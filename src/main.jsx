import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {supabase} from './supabase';
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid} from 'recharts';
import {motion,AnimatePresence} from 'framer-motion';
import {Activity,CalendarDays,Check,ChevronLeft,ChevronRight,CircleDollarSign,Heart,ListChecks,LogOut,Plus,Receipt,Salad,Sparkles,Star,Target,Trash2,TrendingUp,X,Zap} from 'lucide-react';
import './index.css';

const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
const iso=d=>d.toISOString().slice(0,10);
function monthKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function daysInMonth(year,month){return new Date(year,month+1,0).getDate()}

function Auth(){
  const [mode,setMode]=useState('login');
  const [email,setEmail]=useState('');const [password,setPassword]=useState('');
  const [loading,setLoading]=useState(false);const [msg,setMsg]=useState('');
  const submit=async e=>{
    e.preventDefault();setLoading(true);setMsg('');
    let r=mode==='login'?await supabase.auth.signInWithPassword({email,password}):await supabase.auth.signUp({email,password});
    setLoading(false);
    if(r.error)setMsg(r.error.message);else if(mode==='signup')setMsg('Account created! Check your email if confirmation is enabled.');
  };
  return (
    <div className="min-h-screen grid place-items-center px-5 py-10">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#8e4769] text-white shadow-lg"><Heart fill="currentColor"/></div>
          <h1 className="pretty text-4xl">My Little Tracker</h1>
          <p className="mt-2 text-sm text-[#806b78]">your tiny corner for habits, health & money ✿</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input className="w-full rounded-2xl border border-[#eadde5] bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-[#d9a8c1]" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
          <input className="w-full rounded-2xl border border-[#eadde5] bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-[#d9a8c1]" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}/>
          {msg&&<p className="rounded-xl bg-[#fff0f5] p-3 text-sm text-[#8e4769]">{msg}</p>}
          <button disabled={loading} className="w-full rounded-2xl bg-[#8e4769] py-3 font-semibold text-white hover:bg-[#763b57] disabled:opacity-50">{loading?'Please wait…':mode==='login'?'Enter my tracker':'Create my tracker'}</button>
        </form>
        <button onClick={()=>{setMode(mode==='login'?'signup':'login');setMsg('')}} className="mt-5 w-full text-sm text-[#8e4769]">{mode==='login'?"Don't have an account? Create one":"Already have an account? Login"}</button>
      </motion.div>
    </div>
  );
}

function Modal({title,onClose,children}){
  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 grid place-items-center bg-[#2c2030]/30 p-4 backdrop-blur-sm">
        <motion.div initial={{opacity:0,scale:.96,y:12}} animate={{opacity:1,scale:1,y:0}} className="card w-full max-w-lg p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="pretty text-2xl">{title}</h3>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-[#fff0f5]"><X size={18}/></button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MonthNav({date,setDate}){
  return (
    <div className="flex items-center gap-2">
      <button className="rounded-xl bg-white p-2 shadow-sm" onClick={()=>setDate(new Date(date.getFullYear(),date.getMonth()-1,1))}><ChevronLeft size={17}/></button>
      <div className="min-w-36 text-center font-semibold">{monthNames[date.getMonth()]} {date.getFullYear()}</div>
      <button className="rounded-xl bg-white p-2 shadow-sm" onClick={()=>setDate(new Date(date.getFullYear(),date.getMonth()+1,1))}><ChevronRight size={17}/></button>
    </div>
  );
}

function Stat({icon,label,value,sub}){
  return (
    <div className="card p-5">
      <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-[#fff0f5] text-[#8e4769]">{React.cloneElement(icon,{size:19})}</div>
      <p className="text-sm text-[#907a87]">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-[#a18d98]">{sub}</p>
    </div>
  );
}

function Empty({text}){return <div className="rounded-2xl bg-[#fff8fb] p-8 text-center text-sm text-[#907a87]">{text}</div>}

const Field=({label,...p})=>(
  <label className="block text-sm font-semibold text-[#655361]">
    {label}
    <input {...p} className="mt-1 w-full rounded-xl border border-[#eadde5] bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-[#d9a8c1]"/>
  </label>
);

function Dashboard({activities,logs,expenses,monthlyGoals,goalChecks,dim,date,setDate,onAdd,onExpense}){
  const completed=activities.reduce((s,a)=>s+logs.filter(l=>l.activity_id===a.id).length,0);
  const possible=activities.length*dim;
  const pct=possible?Math.round(completed/possible*100):0;
  const data=activities.map(a=>({name:a.name.length>12?a.name.slice(0,12)+'…':a.name,done:logs.filter(l=>l.activity_id===a.id).length,total:dim}));
  const goalsDone=monthlyGoals.filter(g=>goalChecks.filter(c=>c.goal_id===g.id).length>=g.target).length;
  return (
    <div className="space-y-6">
      <div className="card grid-bg overflow-hidden p-7">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[.2em] text-[#b07b96]">{monthNames[date.getMonth()]} reset ✿</p>
            <h1 className="pretty text-4xl md:text-5xl">Small steps, <span className="text-[#8e4769]">big change.</span></h1>
            <p className="mt-3 max-w-xl text-[#806b78]">Track the things you care about without making your life feel like homework.</p>
          </div>
          <MonthNav date={date} setDate={setDate}/>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={<Activity/>} label="Activity progress" value={`${pct}%`} sub={`${completed} check-ins this month`}/>
        <Stat icon={<Target/>} label="Monthly goals done" value={`${goalsDone}/${monthlyGoals.length}`} sub="goals completed"/>
        <Stat icon={<CircleDollarSign/>} label="Spent this month" value={`₹${expenses.reduce((s,e)=>s+Number(e.amount),0).toLocaleString('en-IN')}`} sub={`${expenses.length} expenses`}/>
        <Stat icon={<Sparkles/>} label="Goals tracked" value={activities.length} sub="make your own routine"/>
      </div>
      <section className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div><h2 className="pretty text-2xl">Your progress</h2><p className="text-sm text-[#907a87]">Check-ins across your daily goals</p></div>
          <button onClick={onAdd} className="flex items-center gap-2 rounded-xl bg-[#8e4769] px-4 py-2 text-sm font-semibold text-white"><Plus size={16}/> Add goal</button>
        </div>
        {activities.length?<div className="h-72 w-full"><ResponsiveContainer><BarChart data={data} margin={{left:-20,right:10}}><CartesianGrid vertical={false} strokeDasharray="4 4"/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis allowDecimals={false} tick={{fontSize:11}}/><Tooltip cursor={{fill:'#fff0f5'}}/><Bar dataKey="done" radius={[8,8,0,0]} fill="#b56b8d"/></BarChart></ResponsiveContainer></div>:<Empty text="Add your first goal and start your little streak ✿"/>}
      </section>
    </div>
  );
}

function Activities({activities,logs,date,setDate,toggle,onAdd}){
  const dim=daysInMonth(date.getFullYear(),date.getMonth());
  const key=monthKey(date);
  return (
    <section className="card p-5 md:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="pretty text-3xl">Daily goals</h1><p className="text-sm text-[#907a87]">One tiny tick at a time.</p></div>
        <div className="flex gap-2">
          <MonthNav date={date} setDate={setDate}/>
          <button onClick={onAdd} className="rounded-xl bg-[#8e4769] px-4 py-2 text-sm font-semibold text-white"><Plus size={16} className="mr-1 inline"/>Goal</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-sm">
          <thead><tr>
            <th className="sticky left-0 bg-[#fffafb] p-2 text-left">Goal</th>
            {Array.from({length:dim},(_,i)=><th key={i} className="p-1 text-center text-[10px] font-medium text-[#a18d98]">{i+1}</th>)}
            <th className="p-2 text-center text-[10px] font-medium text-[#a18d98]">Done</th>
          </tr></thead>
          <tbody>{activities.map(a=>{
            const done=logs.filter(l=>l.activity_id===a.id&&l.log_date?.startsWith(key)).length;
            return (
              <tr key={a.id}>
                <td className="sticky left-0 rounded-l-xl bg-white p-3 font-semibold"><span className="mr-2">{a.icon||'♡'}</span>{a.name}</td>
                {Array.from({length:dim},(_,i)=>{
                  const day=i+1;
                  const d=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const checked=logs.some(l=>l.activity_id===a.id&&l.log_date===d);
                  return <td key={day} className="bg-white p-1 text-center"><button onClick={()=>toggle(a.id,day)} className={`mx-auto grid h-7 w-7 place-items-center rounded-lg transition ${checked?'bg-[#8e4769] text-white':'bg-[#f7eef3] text-transparent hover:bg-[#edd9e3]'}`}><Check size={14}/></button></td>;
                })}
                <td className="rounded-r-xl bg-white p-3 text-center"><span className="text-xs font-bold text-[#8e4769]">{done}<span className="text-[#c4a3b5]">/{dim}</span></span></td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
      {!activities.length&&<Empty text="No goals yet. Add things like water, walk, study, yoga, sleep…"/>}
    </section>
  );
}

function MonthlyGoals({goals,checks,date,setDate,onAdd,onCheck,onUncheck,onDelete}){
  const key=monthKey(date);
  const monthGoals=goals.filter(g=>g.month_key===key);
  const done=monthGoals.filter(g=>checks.filter(c=>c.goal_id===g.id).length>=g.target).length;
  const totalChecks=monthGoals.reduce((s,g)=>s+Math.min(checks.filter(c=>c.goal_id===g.id).length,g.target),0);
  const totalTarget=monthGoals.reduce((s,g)=>s+g.target,0);
  const pct=totalTarget?Math.round(totalChecks/totalTarget*100):0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="pretty text-3xl">Monthly goals</h1><p className="text-sm text-[#907a87]">Set bigger intentions for {monthNames[date.getMonth()]}.</p></div>
        <div className="flex gap-2"><MonthNav date={date} setDate={setDate}/><button onClick={onAdd} className="rounded-xl bg-[#8e4769] px-4 py-2 text-sm font-semibold text-white"><Plus size={16} className="mr-1 inline"/>Add goal</button></div>
      </div>

      {monthGoals.length>0&&(
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-5 flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0f5] text-[#8e4769]"><Target size={22}/></div>
            <div><p className="text-xs text-[#907a87]">Goals completed</p><p className="text-2xl font-bold">{done}<span className="text-base text-[#c4a3b5]">/{monthGoals.length}</span></p></div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0f5] text-[#8e4769]"><TrendingUp size={22}/></div>
            <div><p className="text-xs text-[#907a87]">Overall progress</p><p className="text-2xl font-bold">{pct}%</p></div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0f5] text-[#8e4769]"><Check size={22}/></div>
            <div><p className="text-xs text-[#907a87]">Total check-ins</p><p className="text-2xl font-bold">{totalChecks}<span className="text-base text-[#c4a3b5]">/{totalTarget}</span></p></div>
          </div>
        </div>
      )}

      {monthGoals.length>0?(
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fff8fb] border-b border-[#f3e8ee]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#907a87] uppercase tracking-wider">Goal</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#907a87] uppercase tracking-wider w-48">Progress</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#907a87] uppercase tracking-wider">Count</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#907a87] uppercase tracking-wider">Tick</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {monthGoals.map((g,idx)=>{
                const goalChecks=checks.filter(c=>c.goal_id===g.id);
                const cnt=goalChecks.length;
                const isComplete=cnt>=g.target;
                const barPct=Math.min(100,g.target?Math.round(cnt/g.target*100):0);
                return (
                  <motion.tr key={g.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:idx*0.05}}
                    className={`border-t border-[#f3e8ee] ${isComplete?'bg-[#fff8fb]':''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{g.icon||'🎯'}</span>
                        <div>
                          <p className={`font-semibold ${isComplete?'line-through text-[#b07b96]':''}`}>{g.title}</p>
                          {isComplete&&<p className="text-xs text-[#8e4769] font-semibold">✓ Completed!</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 rounded-full bg-[#f3e8ee] overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${isComplete?'bg-[#8e4769]':'bg-[#b56b8d]'}`} style={{width:`${barPct}%`}}/>
                        </div>
                        <span className="text-xs font-bold text-[#8e4769] w-8 text-right">{barPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold">{cnt}</span><span className="text-xs text-[#c4a3b5]">/{g.target}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={()=>onCheck(g.id)} disabled={isComplete}
                          className={`grid h-9 w-9 place-items-center rounded-xl transition ${isComplete?'bg-[#f3e8ee] text-[#c4a3b5] cursor-not-allowed':'bg-[#8e4769] text-white hover:bg-[#763b57] shadow-md'}`}>
                          <Plus size={16}/>
                        </button>
                        {cnt>0&&<button onClick={()=>onUncheck(g.id)}
                          className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff0f5] text-[#b07b96] hover:bg-[#fce4ef] transition text-xl leading-none">
                          −
                        </button>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={()=>onDelete(g.id)} className="rounded-lg p-2 text-[#c4a3b5] hover:bg-[#fff0f5] hover:text-[#8e4769] transition"><Trash2 size={14}/></button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ):<Empty text="No monthly goals for this month yet. Add something you want to achieve! 🎯"/>}
    </div>
  );
}

function DailyExtras({extras,onAdd,onToggle,onDelete}){
  const todayStr=iso(new Date());
  const [viewDate,setViewDate]=useState(todayStr);
  const dayExtras=extras.filter(e=>e.extra_date===viewDate);
  const done=dayExtras.filter(e=>e.done).length;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="pretty text-3xl">Daily extras</h1><p className="text-sm text-[#907a87]">One-off tasks for any day — add as you need.</p></div>
        <button onClick={onAdd} className="rounded-xl bg-[#8e4769] px-4 py-2 text-sm font-semibold text-white flex items-center gap-2"><Plus size={16}/>Add task</button>
      </div>
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-[#655361]">Viewing day:</label>
        <input type="date" value={viewDate} onChange={e=>setViewDate(e.target.value)}
          className="rounded-xl border border-[#eadde5] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d9a8c1]"/>
        <button onClick={()=>setViewDate(todayStr)} className="rounded-xl bg-[#fff0f5] px-3 py-2 text-xs font-semibold text-[#8e4769] hover:bg-[#fce4ef]">Today</button>
        <span className="ml-auto text-sm text-[#907a87]">{done}/{dayExtras.length} done</span>
      </div>
      {dayExtras.length>0&&(
        <div className="card p-4">
          <div className="mb-2 flex justify-between text-xs font-semibold text-[#907a87]"><span>Day progress</span><span>{done}/{dayExtras.length} tasks</span></div>
          <div className="h-3 rounded-full bg-[#f3e8ee] overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-[#b56b8d] to-[#8e4769]"
              animate={{width:`${dayExtras.length?done/dayExtras.length*100:0}%`}} transition={{duration:.5}}/>
          </div>
        </div>
      )}
      <div className="space-y-2">
        <AnimatePresence>
          {dayExtras.length>0?dayExtras.map(e=>(
            <motion.div key={e.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,x:-20}}
              className={`card flex items-center gap-4 p-4 transition ${e.done?'opacity-70':''}`}>
              <button onClick={()=>onToggle(e.id,e.done)}
                className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl transition ${e.done?'bg-[#8e4769] text-white':'bg-[#f7eef3] hover:bg-[#edd9e3] text-transparent'}`}>
                <Check size={15}/>
              </button>
              <span className="text-xl">{e.icon||'⭐'}</span>
              <p className={`flex-1 font-medium ${e.done?'line-through text-[#b07b96]':''}`}>{e.task}</p>
              {e.done&&<span className="text-xs text-[#8e4769] font-semibold">Done ✓</span>}
              <button onClick={()=>onDelete(e.id)} className="rounded-lg p-2 text-[#c4a3b5] hover:bg-[#fff0f5] hover:text-[#8e4769] transition"><Trash2 size={14}/></button>
            </motion.div>
          )):<Empty text="No tasks for this day. Click 'Add task' to get started! ⭐"/>}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Expenses({expenses,date,setDate,onAdd,onEdit,onDelete}){
  const total=expenses.reduce((s,e)=>s+Number(e.amount),0);
  const cats={};expenses.forEach(e=>cats[e.category]=(cats[e.category]||0)+Number(e.amount));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="pretty text-3xl">Money diary</h1><p className="text-sm text-[#907a87]">Every rupee has a little story.</p></div>
        <div className="flex gap-2"><MonthNav date={date} setDate={setDate}/><button onClick={onAdd} className="rounded-xl bg-[#8e4769] px-4 py-2 text-sm font-semibold text-white"><Plus size={16} className="mr-1 inline"/>Expense</button></div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-6 md:col-span-2">
          <p className="text-sm text-[#907a87]">Total spent</p><p className="mt-1 text-4xl font-bold">₹{total.toLocaleString('en-IN')}</p>
          <div className="mt-5 space-y-3">
            {Object.entries(cats).map(([c,v])=>(
              <div key={c}><div className="mb-1 flex justify-between text-sm"><span>{c}</span><b>₹{v.toLocaleString('en-IN')}</b></div>
              <div className="h-2 overflow-hidden rounded-full bg-[#f3e8ee]"><div className="h-full rounded-full bg-[#b56b8d]" style={{width:`${total?Math.min(100,v/total*100):0}%`}}/></div></div>
            ))}
          </div>
        </div>
        <div className="card p-6"><p className="text-sm text-[#907a87]">Entries</p><p className="mt-1 text-4xl font-bold">{expenses.length}</p><Receipt className="mt-8 text-[#b56b8d]" size={42}/></div>
      </div>
      <div className="card overflow-hidden p-5">
        <h2 className="pretty mb-4 text-2xl">{monthNames[date.getMonth()]} expenses</h2>
        {expenses.length?(
          <div className="space-y-2">
            {expenses.map(e=>(
              <div key={e.id} className="flex items-center justify-between rounded-2xl bg-[#fff8fb] p-4 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{e.title}</p>
                  <p className="text-xs text-[#9b8792]">{e.spent_on} · {e.category}{e.note?` · ${e.note}`:''}</p>
                </div>
                <b className="text-[#3d2b35] whitespace-nowrap">₹{Number(e.amount).toLocaleString('en-IN')}</b>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={()=>onEdit(e)} className="rounded-lg p-2 text-[#c4a3b5] hover:bg-[#fff0f5] hover:text-[#8e4769] transition" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={()=>onDelete(e.id)} className="rounded-lg p-2 text-[#c4a3b5] hover:bg-[#fff0f5] hover:text-[#8e4769] transition" title="Delete"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        ):<Empty text="No expenses this month. ✿"/>}
      </div>
    </div>
  );
}


function Cheat({cheatLogs,onAdd,onDelete}){
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff0f5] text-[#8e4769]"><Salad/></div>
        <h1 className="pretty mt-5 text-4xl">Cheat log 🍓</h1>
        <p className="mx-auto mt-2 max-w-lg text-[#806b78]">No guilt, just awareness. Note what you had, when you had it, and move on.</p>
        <button onClick={onAdd} className="mt-6 rounded-xl bg-[#8e4769] px-5 py-3 font-semibold text-white"><Plus size={16} className="mr-1 inline"/>Log a cheat meal</button>
      </div>
      {cheatLogs.length>0&&(
        <div className="card overflow-hidden p-5">
          <h2 className="pretty mb-4 text-2xl">All cheat entries</h2>
          <div className="space-y-3">
            <AnimatePresence>
              {cheatLogs.map((c,i)=>(
                <motion.div key={c.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,x:-20}} transition={{delay:i*0.04}}
                  className="flex items-start justify-between gap-3 rounded-2xl bg-[#fff8fb] p-4">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#b07b96] mb-1">{c.cheat_date}</p>
                    <p className="text-sm text-[#3d2b35] whitespace-pre-wrap">{c.note}</p>
                  </div>
                  <button onClick={()=>onDelete(c.id)} className="rounded-lg p-2 text-[#c4a3b5] hover:bg-[#fff0f5] hover:text-[#8e4769] transition flex-shrink-0"><Trash2 size={14}/></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      {cheatLogs.length===0&&<Empty text="No cheat entries yet. Be honest with yourself! 🍓"/>}
    </div>
  );
}

function ActivityModal({onClose,onSave}){
  const [name,setName]=useState('');const [icon,setIcon]=useState('♡');
  return <Modal title="Add a little goal" onClose={onClose}><div className="space-y-4"><Field label="Goal name" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Walk 30 min"/><Field label="Emoji" value={icon} onChange={e=>setIcon(e.target.value)} placeholder="♡"/><button disabled={!name.trim()} onClick={()=>onSave({name:name.trim(),icon})} className="w-full rounded-xl bg-[#8e4769] py-3 font-semibold text-white disabled:opacity-40">Add goal ✿</button></div></Modal>;
}

function ExpenseModal({onClose,onSave,initial}){
  const [f,setF]=useState(initial||{title:'',amount:'',category:'Food',spent_on:iso(new Date()),note:''});
  const set=(k,v)=>setF(x=>({...x,[k]:v}));
  const isEdit=!!initial;
  return (
    <Modal title={isEdit?'Edit expense':'Add expense'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="What did you spend on?" value={f.title} onChange={e=>set('title',e.target.value)} placeholder="Mess / coffee / shopping…"/>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (₹)" type="number" min="0" value={f.amount} onChange={e=>set('amount',e.target.value)} placeholder="0"/>
          <label className="block text-sm font-semibold text-[#655361]">Category
            <select value={f.category} onChange={e=>set('category',e.target.value)} className="mt-1 w-full rounded-xl border border-[#eadde5] bg-white px-3 py-2.5 font-normal">
              {['Food','Travel','Shopping','Study','Bills','Health','Other'].map(x=><option key={x}>{x}</option>)}
            </select>
          </label>
        </div>
        <Field label="Date" type="date" value={f.spent_on} onChange={e=>set('spent_on',e.target.value)}/>
        <Field label="Note (optional)" value={f.note} onChange={e=>set('note',e.target.value)} placeholder="Anything you want to remember"/>
        <button disabled={!f.title||!f.amount} onClick={()=>onSave(f)} className="w-full rounded-xl bg-[#8e4769] py-3 font-semibold text-white disabled:opacity-40">{isEdit?'Save changes ✿':'Save expense ✿'}</button>
      </div>
    </Modal>
  );
}

function CheatModal({onClose,onSave}){
  const [date,setDate]=useState(iso(new Date()));const [note,setNote]=useState('');
  return <Modal title="Log a cheat meal" onClose={onClose}><div className="space-y-4"><Field label="Date" type="date" value={date} onChange={e=>setDate(e.target.value)}/><label className="block text-sm font-semibold text-[#655361]">What did you have?<textarea value={note} onChange={e=>setNote(e.target.value)} rows="4" placeholder="Pizza + cold drink…" className="mt-1 w-full resize-none rounded-xl border border-[#eadde5] bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-[#d9a8c1]"/></label><button disabled={!note.trim()} onClick={()=>onSave({date,note:note.trim()})} className="w-full rounded-xl bg-[#8e4769] py-3 font-semibold text-white disabled:opacity-40">Save it & move on ✿</button></div></Modal>;
}

function MonthlyGoalModal({onClose,onSave,date}){
  const [title,setTitle]=useState('');const [icon,setIcon]=useState('🎯');const [target,setTarget]=useState(1);
  return (
    <Modal title="Add monthly goal" onClose={onClose}>
      <div className="space-y-4">
        <Field label="What's your goal?" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Read 5 books, Gym 20 times…"/>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Emoji" value={icon} onChange={e=>setIcon(e.target.value)} placeholder="🎯"/>
          <label className="block text-sm font-semibold text-[#655361]">Target count<input type="number" min="1" max="31" value={target} onChange={e=>setTarget(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-[#eadde5] bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-[#d9a8c1]"/></label>
        </div>
        <p className="rounded-xl bg-[#fff8fb] p-3 text-xs text-[#907a87]">For {monthNames[date.getMonth()]} {date.getFullYear()} · You'll tick this {target} time{target>1?'s':''} to complete it.</p>
        <button disabled={!title.trim()||target<1} onClick={()=>onSave({title:title.trim(),icon,target,month_key:monthKey(date)})} className="w-full rounded-xl bg-[#8e4769] py-3 font-semibold text-white disabled:opacity-40">Add monthly goal 🎯</button>
      </div>
    </Modal>
  );
}

function DailyExtraModal({onClose,onSave}){
  const [task,setTask]=useState('');const [icon,setIcon]=useState('⭐');const [extraDate,setExtraDate]=useState(iso(new Date()));
  return (
    <Modal title="Add a task for the day" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Task" value={task} onChange={e=>setTask(e.target.value)} placeholder="e.g. Call doctor, Buy groceries…"/>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Emoji" value={icon} onChange={e=>setIcon(e.target.value)} placeholder="⭐"/>
          <Field label="Date" type="date" value={extraDate} onChange={e=>setExtraDate(e.target.value)}/>
        </div>
        <button disabled={!task.trim()} onClick={()=>onSave({task:task.trim(),icon,extra_date:extraDate})} className="w-full rounded-xl bg-[#8e4769] py-3 font-semibold text-white disabled:opacity-40">Add task ⭐</button>
      </div>
    </Modal>
  );
}

function App(){
  const [session,setSession]=useState(null);
  const [tab,setTab]=useState('dashboard');
  const [date,setDate]=useState(new Date());
  const [activities,setActivities]=useState([]);
  const [logs,setLogs]=useState([]);
  const [expenses,setExpenses]=useState([]);
  const [cheatLogs,setCheatLogs]=useState([]);
  const [monthlyGoals,setMonthlyGoals]=useState([]);
  const [goalChecks,setGoalChecks]=useState([]);
  const [dailyExtras,setDailyExtras]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(null);
  const [editingExpense,setEditingExpense]=useState(null);

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>setSession(data.session));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{if(session)load();},[session]);

  async function load(){
    setLoading(true);
    const [{data:a},{data:l},{data:e},{data:cl},{data:mg},{data:gc},{data:de}]=await Promise.all([
      supabase.from('activities').select('*').order('created_at'),
      supabase.from('daily_logs').select('*'),
      supabase.from('expenses').select('*').order('spent_on',{ascending:false}),
      supabase.from('cheat_logs').select('*').order('cheat_date',{ascending:false}),
      supabase.from('monthly_goals').select('*').order('created_at'),
      supabase.from('monthly_goal_checks').select('*').order('created_at'),
      supabase.from('daily_extras').select('*').order('created_at'),
    ]);
    setActivities(a||[]);setLogs(l||[]);setExpenses(e||[]);setCheatLogs(cl||[]);
    setMonthlyGoals(mg||[]);setGoalChecks(gc||[]);setDailyExtras(de||[]);
    setLoading(false);
  }

  const key=monthKey(date);
  const dim=daysInMonth(date.getFullYear(),date.getMonth());
  const monthLogs=logs.filter(x=>x.log_date?.startsWith(key));
  const monthExpenses=expenses.filter(x=>x.spent_on?.startsWith(key));

  const toggle=async(activityId,day)=>{
    const d=`${key}-${String(day).padStart(2,'0')}`;
    const existing=logs.find(x=>x.activity_id===activityId&&x.log_date===d);
    if(existing){await supabase.from('daily_logs').delete().eq('id',existing.id);setLogs(v=>v.filter(x=>x.id!==existing.id));}
    else{const row={activity_id:activityId,log_date:d,user_id:session.user.id};const{data}=await supabase.from('daily_logs').insert(row).select().single();if(data)setLogs(v=>[...v,data]);}
  };
  const addActivity=async({name,icon,target})=>{
    const{data,error}=await supabase.from('activities').insert({name,icon,target:target||dim,user_id:session.user.id}).select().single();
    if(!error)setActivities(v=>[...v,data]);setModal(null);
  };
  const addExpense=async({title,amount,category,spent_on,note})=>{
    const{data,error}=await supabase.from('expenses').insert({title,amount:Number(amount),category,spent_on,note:note||'',user_id:session.user.id}).select().single();
    if(!error)setExpenses(v=>[data,...v]);setModal(null);
  };
  const addCheat=async({date,note})=>{
    const{data,error}=await supabase.from('cheat_logs').insert({cheat_date:date,note,user_id:session.user.id}).select().single();
    if(!error)setCheatLogs(v=>[data,...v]);
    setModal(null);
  };
  const deleteCheat=async(id)=>{
    await supabase.from('cheat_logs').delete().eq('id',id);
    setCheatLogs(v=>v.filter(c=>c.id!==id));
  };
  const editExpense=async(id,f)=>{
    const{data,error}=await supabase.from('expenses').update({title:f.title,amount:Number(f.amount),category:f.category,spent_on:f.spent_on,note:f.note||''}).eq('id',id).select().single();
    if(!error)setExpenses(v=>v.map(e=>e.id===id?data:e));
    setEditingExpense(null);setModal(null);
  };
  const deleteExpense=async(id)=>{
    await supabase.from('expenses').delete().eq('id',id);
    setExpenses(v=>v.filter(e=>e.id!==id));
  };
  const addMonthlyGoal=async({title,icon,target,month_key})=>{
    const{data,error}=await supabase.from('monthly_goals').insert({title,icon,target,month_key,user_id:session.user.id}).select().single();
    if(!error)setMonthlyGoals(v=>[...v,data]);setModal(null);
  };
  const checkGoal=async(goalId)=>{
    const{data,error}=await supabase.from('monthly_goal_checks').insert({goal_id:goalId,user_id:session.user.id,check_date:iso(new Date())}).select().single();
    if(!error)setGoalChecks(v=>[...v,data]);
  };
  const uncheckGoal=async(goalId)=>{
    const last=goalChecks.filter(c=>c.goal_id===goalId).slice(-1)[0];
    if(!last)return;
    await supabase.from('monthly_goal_checks').delete().eq('id',last.id);
    setGoalChecks(v=>v.filter(c=>c.id!==last.id));
  };
  const deleteGoal=async(goalId)=>{
    await supabase.from('monthly_goals').delete().eq('id',goalId);
    setMonthlyGoals(v=>v.filter(g=>g.id!==goalId));
    setGoalChecks(v=>v.filter(c=>c.goal_id!==goalId));
  };
  const addDailyExtra=async({task,icon,extra_date})=>{
    const{data,error}=await supabase.from('daily_extras').insert({task,icon,extra_date,user_id:session.user.id}).select().single();
    if(!error)setDailyExtras(v=>[...v,data]);setModal(null);
  };
  const toggleExtra=async(id,done)=>{
    await supabase.from('daily_extras').update({done:!done}).eq('id',id);
    setDailyExtras(v=>v.map(e=>e.id===id?{...e,done:!done}:e));
  };
  const deleteExtra=async(id)=>{
    await supabase.from('daily_extras').delete().eq('id',id);
    setDailyExtras(v=>v.filter(e=>e.id!==id));
  };

  if(!session)return <Auth/>;
  if(loading)return <div className="min-h-screen grid place-items-center text-[#8e4769]">Loading your little world ✿</div>;

  const tabs=[
    ['dashboard','Overview',<Sparkles size={15}/>],
    ['activities','Daily Goals',<Activity size={15}/>],
    ['monthly','Monthly Goals',<Target size={15}/>],
    ['extras','Daily Extras',<Zap size={15}/>],
    ['expenses','Expenses',<CircleDollarSign size={15}/>],
    ['cheat','Cheat Log',<Salad size={15}/>],
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-[#fff8fb]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button onClick={()=>setTab('dashboard')} className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#8e4769] text-white"><Heart size={19} fill="currentColor"/></span>
            <span className="pretty text-xl font-bold">My Little Tracker</span>
          </button>
          <button onClick={()=>supabase.auth.signOut()} className="rounded-xl p-2 text-[#806b78] hover:bg-white"><LogOut size={18}/></button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-7">
        <div className="mb-7 flex flex-wrap gap-2">
          {tabs.map(([id,label,icon])=>(
            <button key={id} data-tab={id} onClick={()=>setTab(id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${tab===id?'bg-[#8e4769] text-white':'bg-white/70 text-[#806b78] hover:bg-white'}`}>
              {icon}{label}
            </button>
          ))}
        </div>
        {tab==='dashboard'&&<Dashboard activities={activities} logs={monthLogs} expenses={monthExpenses} monthlyGoals={monthlyGoals.filter(g=>g.month_key===key)} goalChecks={goalChecks} dim={dim} date={date} setDate={setDate} onAdd={()=>setModal('activity')} onExpense={()=>setModal('expense')}/>}
        {tab==='activities'&&<Activities activities={activities} logs={logs} date={date} setDate={setDate} toggle={toggle} onAdd={()=>setModal('activity')}/>}
        {tab==='monthly'&&<MonthlyGoals goals={monthlyGoals} checks={goalChecks} date={date} setDate={setDate} onAdd={()=>setModal('monthly_goal')} onCheck={checkGoal} onUncheck={uncheckGoal} onDelete={deleteGoal}/>}
        {tab==='extras'&&<DailyExtras extras={dailyExtras} onAdd={()=>setModal('daily_extra')} onToggle={toggleExtra} onDelete={deleteExtra}/>}
        {tab==='expenses'&&<Expenses expenses={monthExpenses} date={date} setDate={setDate} onAdd={()=>setModal('expense')} onEdit={e=>{setEditingExpense(e);setModal('edit_expense');}} onDelete={deleteExpense}/>}
        {tab==='cheat'&&<Cheat cheatLogs={cheatLogs} onAdd={()=>setModal('cheat')} onDelete={deleteCheat}/>}
      </main>
      {modal==='activity'&&<ActivityModal onClose={()=>setModal(null)} onSave={addActivity}/>}
      {modal==='expense'&&<ExpenseModal onClose={()=>setModal(null)} onSave={addExpense}/>}
      {modal==='edit_expense'&&editingExpense&&<ExpenseModal onClose={()=>{setModal(null);setEditingExpense(null);}} onSave={f=>editExpense(editingExpense.id,f)} initial={{title:editingExpense.title,amount:String(editingExpense.amount),category:editingExpense.category,spent_on:editingExpense.spent_on,note:editingExpense.note||''}}/>}
      {modal==='cheat'&&<CheatModal onClose={()=>setModal(null)} onSave={addCheat}/>}
      {modal==='monthly_goal'&&<MonthlyGoalModal onClose={()=>setModal(null)} onSave={addMonthlyGoal} date={date}/>}
      {modal==='daily_extra'&&<DailyExtraModal onClose={()=>setModal(null)} onSave={addDailyExtra}/>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App/>);
