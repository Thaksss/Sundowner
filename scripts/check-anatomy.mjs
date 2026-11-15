import fs from 'node:fs'
import assert from 'node:assert/strict'
import * as T from 'three'
// Inspect source GLB geometry, independently of the rendering pipeline.
import {HEART_PLACEMENT as H,SKELETON_PLACEMENT as S} from '../src/data/anatomyPlacement.ts'
function bounds(path){const b=fs.readFileSync(path),j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12))),total=new T.Box3(),meshes=[];function walk(i,parent){const n=j.nodes[i];if(n.name?.toLowerCase().includes('outline'))return;const m=n.matrix?new T.Matrix4().fromArray(n.matrix):new T.Matrix4().compose(new T.Vector3(...n.translation||[0,0,0]),new T.Quaternion(...n.rotation||[0,0,0,1]),new T.Vector3(...n.scale||[1,1,1]));m.premultiply(parent);if(n.mesh!==undefined){const box=new T.Box3();for(const p of j.meshes[n.mesh].primitives){const a=j.accessors[p.attributes.POSITION];box.union(new T.Box3(new T.Vector3(...a.min),new T.Vector3(...a.max)).applyMatrix4(m))}total.union(box);meshes.push({name:n.name,box})}for(const c of n.children||[])walk(c,m)}j.scenes[0].nodes.forEach(i=>walk(i,new T.Matrix4()));return {total,meshes}}
const sk=bounds('public/skeleton.glb'),heart=bounds('public/heart.glb'),center=sk.total.getCenter(new T.Vector3()),scale=S.height/sk.total.getSize(new T.Vector3()).y
const rib=sk.meshes.find(m=>m.name.startsWith('SM_HumanSkeleton_08_')).box.clone();rib.translate(center.negate());rib.min.multiplyScalar(scale).add(new T.Vector3(...S.position));rib.max.multiplyScalar(scale).add(new T.Vector3(...S.position))
const hb=heart.total.clone(),hc=hb.getCenter(new T.Vector3());hb.translate(hc.negate());const hs=H.height/hb.getSize(new T.Vector3()).y;hb.applyMatrix4(new T.Matrix4().compose(new T.Vector3(...H.position),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),H.rotationZ),new T.Vector3(hs,hs,hs)))
assert(rib.containsBox(hb),'Heart must sit within the rib cage bounding volume')
assert(hb.getSize(new T.Vector3()).y<rib.getSize(new T.Vector3()).y*.65,'Heart must fit comfortably below rib cage height')
console.log('Anatomy geometry checks passed: heart fits inside the normalized rib cage.')
