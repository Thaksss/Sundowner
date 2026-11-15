import {create} from 'zustand'
import {systems,type Scenario} from '../data/missionData'
export type Telemetry={timestamp:string;radiationDoseMsv:number;reserves:[number,number,number,number];source:string}
export type State={scenario:Scenario;selected:number|null;day:number;dose:number;reserve:number;sheltered:boolean;mode:'demo'|'real';telemetry:Telemetry|null;xray:boolean;setMode:(mode:'demo'|'real')=>void;loadTelemetry:(data:unknown)=>void;setXray:(v:boolean)=>void;setScenario:(s:Scenario)=>void;select:(n:number|null)=>void;setDay:(n:number)=>void;commit:(n:number)=>void;reset:()=>void}
export function validateTelemetry(data:unknown):Telemetry{
 if(!data||typeof data!=='object')throw new Error('Select a JSON telemetry object.')
 const d=data as Record<string,unknown>
 if(typeof d.timestamp!=='string'||!Number.isFinite(Date.parse(d.timestamp))||Date.parse(d.timestamp)>Date.now()+60000)throw new Error('Provide a valid observation timestamp, not in the future.')
 if(typeof d.source!=='string'||!d.source.trim()||d.source.length>120)throw new Error('Provide a source name of 1 to 120 characters.')
 if(typeof d.radiationDoseMsv!=='number'||!Number.isFinite(d.radiationDoseMsv)||d.radiationDoseMsv<0)throw new Error('radiationDoseMsv must be a finite nonnegative number.')
 if(!Array.isArray(d.reserves)||d.reserves.length!==4||!d.reserves.every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100))throw new Error('reserves must contain four percentages from 0 to 100: muscle, cognitive, cardiovascular, immune.')
 return {timestamp:d.timestamp,source:d.source.trim(),radiationDoseMsv:d.radiationDoseMsv,reserves:d.reserves as Telemetry['reserves']}
}
export const useMissionStore=create<State>((set)=>({scenario:'Nominal',selected:null,day:0,dose:156,reserve:0,sheltered:false,mode:'demo',telemetry:null,xray:false,
 setMode:mode=>set({mode,selected:null}),loadTelemetry:data=>set({telemetry:validateTelemetry(data),mode:'real'}),setXray:xray=>set({xray}),setScenario:scenario=>set(s=>s.mode==='demo'?{scenario}:{}),select:selected=>set({selected}),setDay:day=>set({day}),
 commit:n=>set(s=>s.mode!=='demo'?{}:n===0?{dose:s.dose+12,reserve:s.reserve-4}:n===1?{reserve:s.reserve-4}:{sheltered:true,reserve:Math.min(0,s.reserve+2)}),reset:()=>set({scenario:'Nominal',day:0,dose:156,reserve:0,sheltered:false,selected:null,xray:false})}))
export function getSystemReading(s:State,i:number):number|null{
 if(s.mode==='real')return !s.telemetry?null:i===0?s.telemetry.radiationDoseMsv:s.telemetry.reserves[i-1]
 const flare=s.scenario==='Solar flare'&&!s.sheltered
 return i===0?s.dose+(flare?95:0):Math.max(0,systems[i].base+s.reserve-s.day*(i===1?.15:.06)-(s.scenario==='High CO₂'&&i===2?18:0)-(s.scenario==='Headache'&&i===3?24:0))
}
export function getSystemStatus(s:State,i:number):'unknown'|'nominal'|'caution'|'critical'{const v=getSystemReading(s,i);return v===null?'unknown':i===0?v>=480?'critical':v>=240?'caution':'nominal':v<45?'critical':v<75?'caution':'nominal'}
