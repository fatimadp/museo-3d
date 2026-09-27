import * as THREE from 'three'

export function createMuseumControls({
  renderer,camera,clickable,positions,data,onPick,mode,spacing
}){
  const raycaster=new THREE.Raycaster()
  const pointer=new THREE.Vector2()
  const dom=renderer.domElement

  // Nuevas variables para rastrear el arrastre vertical
  let isDragging=false,startDragX=0,dragDelta=0
  let startDragY=0,dragDeltaY=0,panY=0
  let mouseX=0,mouseY=0
  let targetX=positions[0]??0
  let targetZ=getDefaultZ()
  let currentIndex=0,hoverFrame=null,disposed=false

  dom.style.cursor='grab'
  dom.style.touchAction='none'

  function getDefaultZ(){
    if(mode==='colonial')return 24
    if(mode==='independence')return 21
    if(mode==='revolution')return 20 // Ajusta la distancia base de revolución
    return 15.8
  }

  function getDefaultY(){
    if(mode==='colonial')return 8.2
    if(mode==='independence')return 8
    if(mode==='revolution')return 8.5 // Altura base
    return 5.35
  }

  function getLookY(){
    if(mode==='colonial')return 8.6
    if(mode==='independence')return 8.2
    if(mode==='revolution')return 8.0
    return 4.25
  }

  function getLookZ(){
    if(mode==='colonial')return-4.15
    if(mode==='independence')return-3
    return-1
  }

  function clampIndex(index){
    return Math.max(0,Math.min(data.length-1,index))
  }

  function raycast(e){
    const rect=dom.getBoundingClientRect()
    if(!rect.width||!rect.height)return null
    pointer.x=((e.clientX-rect.left)/rect.width)*2-1
    pointer.y=-((e.clientY-rect.top)/rect.height)*2+1
    raycaster.setFromCamera(pointer,camera)
    return raycaster.intersectObjects(clickable,false)[0]??null
  }

  function updatePointer(e){
    const rect=dom.getBoundingClientRect()
    if(!rect.width||!rect.height)return
    mouseX=(e.clientX-(rect.left+rect.width/2))/rect.width
    mouseY=(e.clientY-(rect.top+rect.height/2))/rect.height
  }

  function handlePointerDown(e){
    if(e.button!==undefined&&e.button!==0)return
    isDragging=true
    startDragX=e.clientX
    startDragY=e.clientY
    dragDelta=0
    dragDeltaY=0
    dom.style.cursor='grabbing'
    try{dom.setPointerCapture?.(e.pointerId)}catch{}
  }

  function handlePointerMove(e){
    updatePointer(e)
    if(isDragging){
      dragDelta=e.clientX-startDragX
      // Solo calculamos arrastre vertical en revolución
      if(mode==='revolution') dragDeltaY=e.clientY-startDragY
      return
    }

    if(hoverFrame)return
    hoverFrame=requestAnimationFrame(()=>{
      hoverFrame=null
      if(disposed||isDragging)return
      dom.style.cursor=raycast(e)?'pointer':'grab'
    })
  }

  function handlePointerUp(e){
    if(!isDragging)return
    isDragging=false
    try{dom.releasePointerCapture?.(e.pointerId)}catch{}

    if(mode==='revolution'){
      const height=dom.getBoundingClientRect().height||1
      panY+=(dragDeltaY/height)*15 
      panY=Math.max(-4.5,Math.min(panY,6)) 
    }

    if(Math.abs(dragDelta)>45){
      const isDraggingLeft = dragDelta < 0; // Arrastrar a la izquierda significa avanzar

      if(isDraggingLeft && currentIndex === data.length - 1){
        // ¡Llegó al final e intenta avanzar!
        onPick('next-section')
      } else if(!isDraggingLeft && currentIndex === 0){
        // Opcional: ¡Está al inicio e intenta retroceder!
        onPick('prev-section')
      } else {
        // Navegación normal entre cuadros
        const next = clampIndex(currentIndex + (isDraggingLeft ? 1 : -1))
        if(next !== currentIndex) onPick(next)
      }
    } else if(Math.abs(dragDelta)<10 && (mode!=='revolution' || Math.abs(dragDeltaY)<10)){ 
      const hit=raycast(e)
      const index=hit?.object?.userData?.index
      if(Number.isInteger(index))onPick(index)
    }

    dragDelta=0
    if(mode==='revolution') dragDeltaY=0
    dom.style.cursor='grab'
  }

  function handleCancel(){
    isDragging=false
    dragDelta=0
    dragDeltaY=0
    dom.style.cursor='grab'
  }

  function handleWheel(e){
    targetZ+=e.deltaY*.012
    if(mode==='colonial')targetZ=Math.max(18,Math.min(targetZ,31))
    else if(mode==='independence')targetZ=Math.max(16,Math.min(targetZ,27))
    else if(mode==='revolution')targetZ=Math.max(14,Math.min(targetZ,25))
    else targetZ=Math.max(10.5,Math.min(targetZ,22))
  }

  function goTo(index){
    const safe=clampIndex(index)
    currentIndex=safe
    targetX=positions[safe]??0
    panY=0 // Reiniciar paneo al cambiar de imagen
  }

  function setInitial(index=0){
    const safe=clampIndex(index)
    currentIndex=safe
    targetX=positions[safe]??0
    targetZ=getDefaultZ()
    mouseX=0
    mouseY=0
    dragDelta=0
    dragDeltaY=0
    panY=0

    camera.position.set(targetX,getDefaultY(),targetZ)
    camera.lookAt(targetX,getLookY(),getLookZ())
  }

  function updateCamera(){
    if(disposed)return
    const rect=dom.getBoundingClientRect()
    const width=Math.max(rect.width,1)
    const height=Math.max(rect.height,1)

    const dragOffset=isDragging?(dragDelta/width)*spacing*1.15:0
    // Sumar el paneo temporal mientras se arrastra
    const dragOffsetY=(isDragging&&mode==='revolution')?(dragDeltaY/height)*15:0

    const hParallax=mode==='colonial'?1:mode==='independence'?.7:.65
    const vParallax=mode==='colonial'?.55:mode==='independence'?.4:.4

    const desiredX=targetX-dragOffset+mouseX*hParallax
    // Incorporar panY (guardado) y dragOffsetY (en vivo) a la altura de la cámara
    const desiredY=getDefaultY()+panY+dragOffsetY-mouseY*vParallax
    const desiredZ=targetZ+Math.abs(mouseY)*(mode==='prehispanic'?.25:.2)

    camera.position.x+=(desiredX-camera.position.x)*.065
    camera.position.y+=(desiredY-camera.position.y)*.055
    camera.position.z+=(desiredZ-camera.position.z)*.05

    // Acompañar sutilmente la mirada hacia arriba/abajo en revolución
    const lookOffset=mode==='revolution'?(panY+dragOffsetY)*0.6:0
    camera.lookAt(camera.position.x,getLookY()+lookOffset,getLookZ())
  }

  function dispose(){
    if(disposed)return
    disposed=true
    if(hoverFrame)cancelAnimationFrame(hoverFrame)
    dom.removeEventListener('pointerdown',handlePointerDown)
    dom.removeEventListener('pointermove',handlePointerMove)
    dom.removeEventListener('pointerup',handlePointerUp)
    dom.removeEventListener('pointercancel',handleCancel)
    dom.removeEventListener('pointerleave',handleCancel)
    dom.removeEventListener('wheel',handleWheel)
    dom.style.cursor=''
    dom.style.touchAction=''
  }

  dom.addEventListener('pointerdown',handlePointerDown)
  dom.addEventListener('pointermove',handlePointerMove)
  dom.addEventListener('pointerup',handlePointerUp)
  dom.addEventListener('pointercancel',handleCancel)
  dom.addEventListener('pointerleave',handleCancel)
  dom.addEventListener('wheel',handleWheel,{passive:true})

  return{goTo,setInitial,updateCamera,getCurrentIndex:()=>currentIndex,dispose}
}