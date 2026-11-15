import {useGLTF} from '@react-three/drei'
import {useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {HEART_PLACEMENT as H,SKELETON_PLACEMENT as S} from '../data/anatomyPlacement'
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js'
function normalize(scene:THREE.Group,height:number,hideOutline=false){
 const copy=clone(scene)
 if(hideOutline)copy.traverse(o=>{if(o.name.toLowerCase().includes('outline'))o.visible=false})
 // Exclude the outline shell from the anatomical model bounds.
 const bounds=new THREE.Box3();copy.updateMatrixWorld(true)
 copy.traverse(o=>{if(o instanceof THREE.Mesh&&o.visible){o.geometry.computeBoundingBox();if(o.geometry.boundingBox)bounds.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld))}})
 const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());const scale=height/Math.max(size.y,.001)
 const holder=new THREE.Group();copy.position.sub(center);holder.add(copy);holder.scale.setScalar(scale);return holder
}
function Skeleton(){const {scene}=useGLTF('/skeleton.glb');const model=useMemo(()=>normalize(scene,S.height,true),[scene]);return <group position={S.position}><primitive object={model}/></group>}
// Rib cage center is ~0.65 after normalizing the skeleton to 2.65 units.
// Place the heart inside that cage, slightly to the subject's left (viewer right).
function Heart({reduced}:{reduced:boolean}){const {scene}=useGLTF('/heart.glb');const model=useMemo(()=>normalize(scene,H.height),[scene]);const ref=useRef<THREE.Group>(null);useFrame(({clock})=>{if(ref.current)ref.current.scale.setScalar(reduced?1:1+Math.sin(clock.elapsedTime*6)*.025)});return <group position={H.position} rotation={[0,0,H.rotationZ]}><group ref={ref}><primitive object={model}/></group><pointLight intensity={.2} color="#ff8060" distance={.8}/></group>}
export default function AnatomyAssets({bones,heart,reduced}:{bones:boolean;heart:boolean;reduced:boolean}){return <>{bones&&<Skeleton/>}{heart&&<Heart reduced={reduced}/>}</>}
