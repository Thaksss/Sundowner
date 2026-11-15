import {useEffect,useRef} from 'react'

import {motion,useReducedMotion} from 'framer-motion'
import {X,ArrowLeft,ArrowRight,ScanLine} from 'lucide-react'
import {systems} from '../data/missionData'
import SystemGuide from './SystemGuide'
import {useMissionStore,getSystemReading,getSystemStatus} from '../store/useMissionStore'

const summaries=[
 {title:'Radiation exposure',label:'Accumulated dose',meaning:'Radiation recorded over the mission.',next:'Review dosimeter readings and shielding before an EVA.'},
 {title:'Muscle & bone',label:'Reserve remaining',meaning:'Modeled capacity for muscle and bone loading.',next:'Review resistance exercise and loading logs.'},
 {title:'Sleep & focus',label:'Reserve remaining',meaning:'Modeled capacity for alertness and recovery.',next:'Check sleep duration and repeat the alertness test.'},
 {title:'Heart & circulation',label:'Reserve remaining',meaning:'Modeled cardiovascular conditioning.',next:'Review heart rate trends, hydration and activity.'},
 {title:'Immune resilience',label:'Reserve remaining',meaning:'Modeled resilience under mission stress.',next:'Monitor changes in sleep, stress and symptoms.'}
]
const labels={unknown:'No data',nominal:'Within model range',caution:'Monitor closely',critical:'Review needed'}
export default function SystemDrawer(){const s=useMissionStore();const ref=useRef<HTMLDivElement>(null);const reduced=useReducedMotion();const index=s.selected
 useEffect(()=>{if(index===null)return;const timer=setTimeout(()=>ref.current?.focus({preventScroll:true}),reduced?0:650);return()=>clearTimeout(timer)},[index,reduced]); if(index===null)return null;const sys=systems[index],copy=summaries[index],reading=getSystemReading(s,index),status=getSystemStatus(s,index);const remaining=reading===null?0:index===0?Math.max(0,100-reading/6):reading
 return <motion.div ref={ref} key={index} tabIndex={-1} initial={reduced?false:{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:reduced?0:.55,duration:.45}} className={`inline-system-card status-${status}`} role="region" aria-labelledby="system-title"><div className="focus-top"><span className="eyebrow"><ScanLine size={14}/> BODY SCAN / {sys.code}</span><button className="icon-button" aria-label="Close body scan" onClick={()=>s.select(null)}><X size={18}/></button></div><article className="focus-card"><span className="focus-provenance">{s.mode==='demo'?'SIMULATED OBSERVATION':'RECORDED OBSERVATION'}</span><h2 id="system-title">{copy.title}</h2><div className="focus-reading"><span>{copy.label}</span><strong>{reading===null?'—':Math.round(reading)}<small>{sys.unit}</small></strong><span className={`health-badge ${status}`}>{labels[status]}</span></div><div className="focus-meter" role="img" aria-label={reading===null?'No reading':`${Math.round(remaining)} percent ${index===0?'of reference budget remaining':'modeled reserve'}`}><i style={{width:`${remaining}%`}}/></div><p className="focus-meaning">{reading===null?'Enter values or import an observation to view this system.':index===0?`${Math.round(remaining)}% of the 600 mSv career reference remains in this model.`:copy.meaning}</p><SystemGuide index={index}/><p className="focus-disclaimer">{index===0?'NASA reference; demo colors use app thresholds.':'Illustrative reserve score, not a clinical measurement.'} Educational use only.</p></article><div className="focus-bottom"><button className="text-button" onClick={()=>s.select((index+4)%5)}><ArrowLeft size={14}/> Previous system</button><button className="outline-button" onClick={()=>s.select(null)}>Full body view</button><button className="text-button" onClick={()=>s.select((index+1)%5)}>Next system <ArrowRight size={14}/></button></div></motion.div>
}
