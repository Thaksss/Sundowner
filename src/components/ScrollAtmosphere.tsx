import {useEffect} from 'react'
import {motion,useScroll,useTransform,useReducedMotion} from 'framer-motion'
/** Ember light tiles, glass surfaces and staggered scroll rhythm inspired by
 * Mosaic Prompt Template by Kedhareswer Naidu (MIT), supplied by the user.
 * Uses our existing motion library and keeps all mission behavior intact. */
export default function ScrollAtmosphere(){
 const reduced=useReducedMotion();const {scrollYProgress}=useScroll()
 const y=useTransform(scrollYProgress,[0,1],['-12%','12%'])
 const rotate=useTransform(scrollYProgress,[0,1],[-12,12])
 useEffect(()=>{
  if(reduced)return
  const animations=new Set<Animation>()
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target as HTMLElement;const siblings=el.parentElement?Array.from(el.parentElement.children):[];const delay=Math.min(siblings.indexOf(el)%5,4)*65;const a=el.animate([{opacity:0,transform:'translateY(32px)'},{opacity:1,transform:'translateY(0)'}],{duration:750,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});animations.add(a);a.onfinish=()=>animations.delete(a);observer.unobserve(el)})},{threshold:.12})
  document.querySelectorAll('.section-label,.section-top,.panel,.planet-panel,.source-grid>a,.action,.telemetry-control,.system-row').forEach(el=>observer.observe(el))
  return()=>{observer.disconnect();animations.forEach(a=>a.cancel())}
 },[reduced])
 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(!e.isIntersecting)return;document.querySelectorAll('header nav a').forEach(a=>{if(a.getAttribute('href')===`#${e.target.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})})},{rootMargin:'-15% 0px -55% 0px'})
  document.querySelectorAll('main>section[id]').forEach(el=>observer.observe(el));return()=>observer.disconnect()
 },[])
 return <div className="scroll-atmosphere" aria-hidden="true"><motion.div className="mosaic-light-field" style={reduced?{}:{y,rotate}}>{Array.from({length:20},(_,i)=><span key={i} style={{'--tile-index':i} as React.CSSProperties}/>)}</motion.div><div className="atmosphere-veil"/></div>
}
