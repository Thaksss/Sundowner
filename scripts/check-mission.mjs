import assert from 'node:assert/strict'
import {rolldown} from 'rolldown'
import {mkdtemp,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
const dir=await mkdtemp(join(tmpdir(),'mission-test-'))
try{
 const bundle=await rolldown({input:'src/store/useMissionStore.ts',platform:'node'})
 const entry=join(dir,'store.mjs');await bundle.write({file:entry,format:'esm'});await bundle.close()
 const {useMissionStore:store,getSystemReading:reading,getSystemStatus:status,validateTelemetry}=await import(pathToFileURL(entry).href)
 let checks=0;const check=(fn)=>{fn();checks++}
 check(()=>assert.equal(reading(store.getState(),0),156))
 store.getState().setScenario('Solar flare')
 check(()=>assert.equal(reading(store.getState(),0),251))
 check(()=>assert.equal(status(store.getState(),0),'caution'))
 store.getState().commit(2)
 check(()=>assert.equal(reading(store.getState(),0),156))
 store.getState().reset();store.getState().setDay(200)
 check(()=>assert.equal(status(store.getState(),1),'caution'))
 store.getState().setMode('real')
 check(()=>assert.equal(reading(store.getState(),0),null))
 check(()=>assert.equal(status(store.getState(),1),'unknown'))
 const before=store.getState().dose;store.getState().commit(0)
 check(()=>assert.equal(store.getState().dose,before))
 const observation={source:'Test instrument',timestamp:'2020-01-01T00:00:00Z',radiationDoseMsv:300,reserves:[80,55,40,90]}
 store.getState().loadTelemetry(observation)
 check(()=>assert.equal(reading(store.getState(),0),300))
 check(()=>assert.equal(reading(store.getState(),3),40))
 check(()=>assert.equal(status(store.getState(),3),'critical'))
 store.getState().setMode('demo');store.getState().commit(0);store.getState().setMode('real')
 check(()=>assert.equal(reading(store.getState(),0),300))
 for(const bad of [null,{}, {...observation,reserves:[1,2]}, {...observation,reserves:[1,2,3,101]}, {...observation,radiationDoseMsv:-1}, {...observation,radiationDoseMsv:Infinity}, {...observation,timestamp:'invalid'}, {...observation,timestamp:'2999-01-01'}, {...observation,source:''}])check(()=>assert.throws(()=>validateTelemetry(bad)))
 console.log(`${checks} telemetry, mode isolation and warning checks passed.`)
}finally{await rm(dir,{recursive:true,force:true})}
