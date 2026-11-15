import {Component,Suspense,useRef,useMemo,useState,useEffect,type ReactNode} from 'react'
import {Canvas,useFrame} from '@react-three/fiber'
import {Stars,useGLTF,Html,Line} from '@react-three/drei'
import {useReducedMotion} from 'framer-motion'
import * as THREE from 'three'
import {clone as cloneSkeleton} from 'three/examples/jsm/utils/SkeletonUtils.js'
import {useMissionStore,getSystemStatus} from '../store/useMissionStore'
import {systems} from '../data/missionData'
import ProceduralSun from './ProceduralSun'
import AnatomyAssets from './AnatomyAssets'
const points: [number,number,number][]=[[.37,.4,.4],[-.38,-.4,.35],[0,1.02,.24],[.05,.64,.26],[.28,-.05,.4]]
const colors={unknown:'#7f8a9d',nominal:'#82c7ad',caution:'#f59e0b',critical:'#f24d29'}
function FocusCamera({index,reduced}:{index?:number;reduced:boolean}){
 const target=useRef(new THREE.Vector3()),scratch=useMemo(()=>new THREE.Vector3(),[])
 useFrame(({camera},delta)=>{
   const alpha=reduced?1:1-Math.exp(-5*Math.min(delta,.05))
   const wide=camera instanceof THREE.PerspectiveCamera&&camera.aspect>1.1
   const point=index===undefined?[0,0,0]:points[index]
   scratch.set(point[0]+(index!==undefined&&wide?.45:0),point[1],point[2])
   target.current.lerp(scratch,alpha)
   scratch.z+=index===undefined?4.55:wide?2.3:2.05
   camera.position.lerp(scratch,alpha)
   camera.lookAt(target.current)
 })
 return null
}function Bone({from,to}:{from:[number,number,number];to:[number,number,number]}){
 const {position,quaternion,length}=useMemo(()=>{const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to);return {position:a.clone().add(b).multiplyScalar(.5),quaternion:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()),length:a.distanceTo(b)}},[from,to])
 return <mesh position={position} quaternion={quaternion}><capsuleGeometry args={[.028,length,3,6]}/><meshStandardMaterial color="#b6efff" emissive="#3f9ba5" emissiveIntensity={.8}/></mesh>
}
function ProceduralAnatomy({bones,heart,reduced}:{bones:boolean;heart:boolean;reduced:boolean}){
 const ref=useRef<THREE.Group>(null)
 useFrame(({clock})=>{if(ref.current&&!reduced)ref.current.scale.setScalar(1+Math.sin(clock.elapsedTime*6)*.055)})
 return <group position={[0,0,.12]}>{bones&&<group><mesh position={[0,1.02,0]}><sphereGeometry args={[.14,16,12]}/><meshStandardMaterial color="#c4edff" emissive="#378d99" emissiveIntensity={.8} wireframe/></mesh><Bone from={[0,.84,0]} to={[0,-.28,0]}/>{[-1,1].map(side=><group key={side}><Bone from={[0,.65,0]} to={[side*.38,.61,0]}/><Bone from={[side*.38,.61,0]} to={[side*.5,.05,0]}/><Bone from={[side*.5,.05,0]} to={[side*.48,-.42,.04]}/><Bone from={[0,-.28,0]} to={[side*.19,-.4,0]}/><Bone from={[side*.19,-.4,0]} to={[side*.2,-.85,0]}/><Bone from={[side*.2,-.85,0]} to={[side*.24,-1.3,.05]}/>{[.55,.42,.29,.16].map(y=><Line key={y} points={[[0,y,0],[side*.23,y+.04,.05],[side*.27,y-.04,.1],[0,y-.1,.15]]} color="#92d8e8" lineWidth={2}/>)}</group>)}</group>}{heart&&<group><group ref={ref} position={[-.12,.39,.2]}><mesh rotation={[0,0,-.3]}><sphereGeometry args={[.105,20,16]}/><meshStandardMaterial color="#f24d29" emissive="#ff321d" emissiveIntensity={2}/></mesh><pointLight intensity={.3} color="#f24d29" distance={1}/></group>{[-1,1].map(side=><group key={side}><Line points={[[-.12,.39,.2],[0,.65,.12],[side*.32,.6,.12],[side*.45,0,.12],[side*.45,-.4,.12]]} color="#f24d29" lineWidth={3}/><Line points={[[0,.6,.12],[0,-.25,.12],[side*.18,-.45,.12],[side*.22,-1.25,.12]]} color={side===1?'#e65439':'#5486bc'} lineWidth={3}/></group>)}</group>}</group>
}
function BodyModel3D({hotspots=false,yaw,reduced,focus}:{hotspots?:boolean;yaw:React.RefObject<number>;reduced:boolean;focus?:number}){
 const {scene}=useGLTF('/astronaut.glb');const s=useMissionStore();const group=useRef<THREE.Group>(null)
 const revealBones=hotspots&&(s.xray||s.selected===1||['caution','critical'].includes(getSystemStatus(s,1)))
 const revealHeart=hotspots&&(s.xray||s.selected===3||['caution','critical'].includes(getSystemStatus(s,3)))
 const ghost=revealBones||revealHeart
 const model=useMemo(()=>{const copy=cloneSkeleton(scene);copy.traverse(o=>{if(o instanceof THREE.Mesh){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>{m.transparent=ghost;m.opacity=ghost?.13:1;m.depthWrite=!ghost})}});const box=new THREE.Box3().setFromObject(copy),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());const scale=2.8/Math.max(size.x,size.y,size.z);copy.scale.multiplyScalar(scale);copy.position.sub(center.multiplyScalar(scale));return copy},[scene,ghost])
 useEffect(()=>()=>{model.traverse(o=>{if(o instanceof THREE.Mesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())})},[model])
 useFrame(({clock},delta)=>{if(group.current){group.current.rotation.y=THREE.MathUtils.damp(group.current.rotation.y,focus===undefined?yaw.current:0,7,Math.min(delta,.05));group.current.position.y=reduced||focus!==undefined?0:Math.sin(clock.elapsedTime*.6)*.035}})
 return <group ref={group}><group rotation={[0,Math.PI,0]}><primitive object={model}/></group>{hotspots&&(revealBones||revealHeart)&&<Suspense fallback={<ProceduralAnatomy bones={revealBones} heart={revealHeart} reduced={reduced}/>}><AnatomyAssets bones={revealBones} heart={revealHeart} reduced={reduced}/></Suspense>} {hotspots&&points.map((p,i)=> (focus===undefined||i===focus)&&<Html key={i} position={p} center zIndexRange={[20,10]}><button style={{'--hotspot-color':colors[getSystemStatus(s,i)]} as React.CSSProperties} className={`hotspot status-${getSystemStatus(s,i)}`} aria-label={`Inspect ${systems[i].name} system`} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();s.select(i)}}><span>{i+1}</span><span className="hotspot-label">{systems[i].code}</span></button></Html>)}</group>
}
export function PlanetGlobes({earth=false}:{earth?:boolean}){return <mesh rotation={[.3,0,.2]}><sphereGeometry args={[1,32,32]}/><meshStandardMaterial color={earth?'#246d89':'#963b28'} roughness={.9} wireframe={earth}/></mesh>}
class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?<div className="scene-loading">3D view unavailable. Use the system cards below to inspect telemetry.</div>:this.props.children}}
export default function SpaceScene({hotspots=false,planet=false,earth=false,focus}:{hotspots?:boolean;planet?:boolean;earth?:boolean;focus?:number}){
 const host=useRef<HTMLDivElement>(null),yaw=useRef(0),drag=useRef<{x:number;y:number;angle:number}|null>(null);const [active,setActive]=useState(false),[compact,setCompact]=useState(false),[contextLost,setContextLost]=useState(false);const reduced=!!useReducedMotion()
 useEffect(()=>{const obs=new IntersectionObserver(([entry])=>setActive(entry.isIntersecting),{rootMargin:'100px'});if(host.current)obs.observe(host.current);const media=matchMedia('(max-width: 768px)');setCompact(media.matches);const update=()=>setCompact(media.matches);media.addEventListener('change',update);const visible=()=>setActive(document.visibilityState==='visible'&&!!host.current&&host.current.getBoundingClientRect().bottom>0&&host.current.getBoundingClientRect().top<innerHeight);document.addEventListener('visibilitychange',visible);return()=>{obs.disconnect();media.removeEventListener('change',update);document.removeEventListener('visibilitychange',visible)}},[])
 return <div ref={host} className="space-scene" onPointerDown={e=>{if(focus===undefined&&e.button===0)drag.current={x:e.clientX,y:e.clientY,angle:yaw.current}}} onPointerMove={e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){drag.current=null;return}if(Math.abs(dx)>6){e.currentTarget.setPointerCapture(e.pointerId);yaw.current=d.angle+dx*.008}}} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}}><SceneBoundary>{contextLost?<div className="scene-loading">Graphics context paused. Reload to restore 3D; all system cards remain available.</div>:<Canvas camera={{position:[0,0,5.3],fov:38}} dpr={compact?1:[1,1.5]} frameloop={active?'always':'never'} style={{touchAction:'pan-y'}} gl={{alpha:true,antialias:!compact,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.domElement.style.touchAction='pan-y';gl.domElement.addEventListener('webglcontextlost',()=>setContextLost(true),{once:true})}}>{hotspots&&<FocusCamera index={focus} reduced={reduced}/>}<ambientLight intensity={1.6}/><directionalLight position={[3,5,5]} intensity={4} color="#dceeff"/><directionalLight position={[-4,1,-2]} intensity={5} color="#f24d29"/><Stars radius={70} depth={40} count={compact?450:1000} factor={3} fade speed={reduced?0:.2}/><Suspense fallback={<Html center><span className="mono">Loading flight asset…</span></Html>}>{planet?<PlanetGlobes earth={earth}/>:<BodyModel3D hotspots={hotspots} yaw={yaw} reduced={reduced} focus={focus}/>}</Suspense>{!planet&&hotspots&&focus===undefined&&<ProceduralSun reduced={reduced} compact={compact}/>}</Canvas>}</SceneBoundary></div>
}
