import {useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {Sparkles} from '@react-three/drei'
import * as THREE from 'three'
import {useMissionStore} from '../store/useMissionStore'

// Aurora breathing and liquid highlights adapted to a spherical solar surface.
// Everything is procedural: no textures, additional render passes or dependencies.
const vertex = `
 varying vec3 vPosition;
 varying vec3 vNormal;
 varying vec3 vView;
 void main(){
   vPosition=position;
   vec4 mv=modelViewMatrix*vec4(position,1.0);
   vNormal=normalize(normalMatrix*normal);
   vView=-mv.xyz;
   gl_Position=projectionMatrix*mv;
 }
`
const surface = `
 precision highp float;
 uniform float uTime;
 uniform float uFlare;
 varying vec3 vPosition;
 varying vec3 vNormal;
 varying vec3 vView;
 float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
 float noise(vec3 p){
   vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
   return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
              mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
 }
 float fbm(vec3 p){float n=0.;float a=.5;for(int i=0;i<4;i++){n+=a*noise(p);p=p*2.03+vec3(7.1,3.4,1.7);a*=.5;}return n;}
 void main(){
   vec3 p=normalize(vPosition);
   float t=uTime*.065;
   float flow=fbm(p*4.+vec3(t,-t*.6,t*.3));
   float grain=fbm(p*19.+flow*2.5+vec3(-t,t,0.));
   float cells=smoothstep(.28,.73,grain);
   float bands=sin(p.y*28.+flow*9.+uTime*.12)*.5+.5;
   float filaments=pow(1.-abs(sin(grain*18.+flow*5.)),7.);
   float fresnel=pow(1.-max(dot(normalize(vNormal),normalize(vView)),0.),2.5);
   vec3 ember=vec3(.46,.035,.008);
   vec3 solar=vec3(1.,.23,.035);
   vec3 gold=vec3(1.,.7,.29);
   vec3 c=mix(ember,solar,cells*.85+.15);
   c=mix(c,gold,filaments*(.3+uFlare*.3)+bands*.09);
   c+=gold*fresnel*(.6+uFlare*.35);
   c*=1.+sin(uTime*.65)*.025+uFlare*.22;
   gl_FragColor=vec4(c,1.);
   #include <colorspace_fragment>
 }
`
const haloVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`
const haloFragment=`
 precision highp float;
 uniform float uTime;
 uniform float uFlare;
 varying vec2 vUv;
 void main(){
   vec2 p=(vUv-.5)*2.;
   float r=length(p);
   float angle=atan(p.y,p.x);
   float wave=sin(angle*9.+uTime*.15)+.5*sin(angle*17.-uTime*.22);
   float rays=pow(.5+.5*sin(angle*27.+wave*1.4),5.);
   float breathing=1.+sin(uTime*.65)*.035;
   float edge=.39*breathing;
   float rim=exp(-abs(r-edge)*55.);
   float corona=exp(-max(r-edge,0.)*(12.-uFlare*3.))*(.16+rays*.18);
   float aura=exp(-r*r*6.)*.11;
   float ripple=exp(-abs(r-(.52+.025*sin(angle*5.+uTime*.2)))*65.)*.055;
   float alpha=(rim*.65+corona+aura+ripple)*smoothstep(.32,.40,r)*(1.-smoothstep(.7,1.,r));
   vec3 c=mix(vec3(1.,.16,.025),vec3(1.,.61,.2),rim*.65+rays*.15);
   gl_FragColor=vec4(c,alpha*(1.+uFlare*.45));
   #include <colorspace_fragment>
 }
`
export default function ProceduralSun({reduced=false,compact=false}:{reduced?:boolean;compact?:boolean}){
 const flare=useMissionStore(s=>s.mode==='demo'&&s.scenario==='Solar flare'&&!s.sheltered)
 const core=useRef<THREE.Mesh>(null),halo=useRef<THREE.Mesh>(null),light=useRef<THREE.PointLight>(null)
 const uniforms=useMemo(()=>({uTime:{value:0},uFlare:{value:0}}),[])
 useFrame(({camera},delta)=>{
   if(!reduced)uniforms.uTime.value+=Math.min(delta,.05)
   uniforms.uFlare.value=THREE.MathUtils.damp(uniforms.uFlare.value,flare?1:0,3,Math.min(delta,.05))
   if(core.current&&!reduced)core.current.rotation.y+=Math.min(delta,.05)*.025
   // Face the camera without a second Canvas or a postprocessing bloom pass.
   if(halo.current)halo.current.quaternion.copy(camera.quaternion)
   if(light.current)light.current.intensity=10+uniforms.uFlare.value*25
 })
 return <group position={[2.7,1.55,-3.8]}>
   <mesh ref={halo} renderOrder={1}>
     <planeGeometry args={[7,7]}/>
     <shaderMaterial vertexShader={haloVertex} fragmentShader={haloFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/>
   </mesh>
   <mesh ref={core}>
     <sphereGeometry args={[1.32,compact?32:48,compact?24:40]}/>
     <shaderMaterial vertexShader={vertex} fragmentShader={surface} uniforms={uniforms} toneMapped={false}/>
   </mesh>
   <pointLight ref={light} color="#ff7741" intensity={10} distance={18}/>
   {!reduced&&<Sparkles count={compact?18:42} scale={flare?6:3.6} size={flare?4:2} speed={flare?1.2:.18} color="#ffbc70"/>}
 </group>
}
