import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {themeColor,createParticles} from './utils.js'
import {createMuseumSetup,createMuseumFloor,getMuseumViewportSize,getMuseumMode} from './setup.js'
import {createMuseumControls} from './controls.js'
import {createColonialSection} from './colonial.js'
import {createPrehispanicSection} from './prehispanic.js'
import {createIndependenceSection} from './independencia.js'
import {createRevolutionSection} from './revolucion.js'
import {createPostRevolutionSection} from './postrevolucion.js'

export function createMuseum(container,data,onPick,era){
  if(container.__museumDispose)container.__museumDispose()

  const mode=getMuseumMode(era)
  container.classList.add(`${mode}-museum`)

  const{scene,camera,renderer,composer,bloom}=createMuseumSetup(container,mode)

  const spacing=
    mode==='colonial'?30:
    mode==='independence'?29:
    mode==='revolution'?29:
    mode==='postrevolution'?29:
    27

  const positions=data.map((_,i)=>(i-(data.length-1)/2)*spacing)
  const width=Math.max(data.length*spacing+40,70)

  createMuseumFloor(scene,width,mode)

  const textureLoader=new THREE.TextureLoader()
  const gltfLoader=new GLTFLoader()

  const objects=[]
  const lights=[]
  const floating=[]
  const clickable=[]
  const groups=[]
  const particles=[]

  let disposed=false
  let animationFrame=null
  let lastCurrent=-1

  data.forEach((c,i)=>{
    const group=new THREE.Group()
    group.position.x=positions[i]
    group.userData.index=i
    scene.add(group)
    groups.push(group)

    const wallColor=
      mode==='colonial'?0xe4d7bf:
      mode==='independence'?0xd9dee4:
      mode==='revolution'?0xd7d0c3:
      mode==='postrevolution'?0xd8d7cf:
      0xd8cfbf

    const wallWidth=
      mode==='independence'?25:
      mode==='revolution'?25:
      mode==='postrevolution'?25:
      mode==='colonial'?24:
      26

    const wall=new THREE.Mesh(
      new THREE.BoxGeometry(wallWidth,18,.45),
      new THREE.MeshStandardMaterial({
        color:wallColor,
        roughness:
          mode==='prehispanic'?.96:
          mode==='colonial'?.94:
          mode==='revolution'?.96:
          mode==='postrevolution'?.96:
          .9,
        metalness:
          mode==='prehispanic'||mode==='revolution'||mode==='postrevolution'
            ?0
            :.01
      })
    )

    wall.position.set(0,9,-4.5)
    wall.receiveShadow=true
    group.add(wall)

    if(mode==='colonial'){
      createColonialSection({
        group,c,index:i,renderer,textureLoader,clickable,lights
      })
    }else if(mode==='independence'){
      createIndependenceSection({
        group,c,index:i,renderer,textureLoader,clickable,lights,total:data.length
      })
    }else if(mode==='revolution'){
      createRevolutionSection({
        group,c,index:i,renderer,textureLoader,clickable,lights
      })
    }else if(mode==='postrevolution'){
      createPostRevolutionSection({
        group,c,index:i,renderer,textureLoader,clickable,lights
      })
    }else{
      createPrehispanicSection({
        group,c,index:i,accent:themeColor(c.themeColor),
        textureLoader,gltfLoader,clickable,objects,floating,lights
      })

      const particleSystem=createParticles(c.themeColor,18)
      particleSystem.position.set(0,0,-1.5)
      particleSystem.visible=i===0
      group.add(particleSystem)
      particles.push(particleSystem)
    }
  })

  const controls=createMuseumControls({
    renderer,camera,clickable,positions,data,onPick,mode,spacing
  })

  controls.setInitial(0)

  const clock=new THREE.Clock()

  if(mode==='prehispanic')syncPrehispanicState(0)
  else syncSectionVisibility(0)

  function animate(){
    if(disposed)return

    animationFrame=requestAnimationFrame(animate)

    const time=clock.getElapsedTime()
    controls.updateCamera()

    const current=controls.getCurrentIndex()

    if(current!==lastCurrent){
      if(mode==='prehispanic')syncPrehispanicState(current)
      else syncSectionVisibility(current)

      lastCurrent=current
    }

    if(mode==='prehispanic')animatePrehispanic(time,current)

    animateLights(current)
    composer.render()
  }

  /* Visibilidad */
  function syncSectionVisibility(current){
    groups.forEach((group,i)=>{
      group.visible=Math.abs(i-current)<=1
    })
  }

  /* Prehispánicos */
  function syncPrehispanicState(current){
    groups.forEach((group,i)=>{
      group.visible=Math.abs(i-current)<=1
    })

    particles.forEach((system,i)=>{
      system.visible=i===current
    })

    lights.forEach((lightGroup,i)=>{
      const groupLights=Array.isArray(lightGroup)?lightGroup:[lightGroup]

      groupLights.forEach(light=>{
        if(light.userData.isMainSpot){
          const shouldCastShadow=i===current
          if(light.castShadow!==shouldCastShadow)light.castShadow=shouldCastShadow
        }
      })
    })
  }

  function animatePrehispanic(time,current){
    objects.forEach((wrapper,i)=>{
      const distance=Math.abs(i-current)
      if(distance>1)return

      const active=i===current
      const baseY=wrapper.userData.baseY??wrapper.position.y
      const floatAmount=wrapper.userData.floatAmount??.015

      if(active){
        // Aumentamos la velocidad de rotación considerablemente (de .00055 a .0065)
        wrapper.rotation.y+=.0065
        wrapper.position.y=baseY+Math.sin(time*.48+i*.7)*floatAmount

        const targetScale=1
        wrapper.scale.x+=(targetScale-wrapper.scale.x)*.03
        wrapper.scale.y+=(targetScale-wrapper.scale.y)*.03
        wrapper.scale.z+=(targetScale-wrapper.scale.z)*.03
      }else{
        // Añadimos una rotación lenta para las piezas que están de fondo (opcional pero se ve mejor)
        wrapper.rotation.y+=.0015
        
        const targetScale=.985
        wrapper.position.y+=(baseY-wrapper.position.y)*.04
        wrapper.scale.x+=(targetScale-wrapper.scale.x)*.025
        wrapper.scale.y+=(targetScale-wrapper.scale.y)*.025
        wrapper.scale.z+=(targetScale-wrapper.scale.z)*.025
      }
    })

    floating.forEach((item,i)=>{
      const sectionIndex=item.userData.sectionIndex
      if(sectionIndex!==current)return

      const baseY=item.userData.baseY??item.position.y
      item.position.y=baseY+Math.sin(time*.35+i*.8)*.007
    })

    const activeParticles=particles[current]
    if(activeParticles)activeParticles.rotation.y+=.00012
  }

  /* Luces */
  function animateLights(current){
    lights.forEach((lightGroup,i)=>{
      const active=i===current
      const groupLights=Array.isArray(lightGroup)?lightGroup:[lightGroup]

      groupLights.forEach(light=>{
        if(!light)return

        const target=active
          ?(light.userData.activeIntensity??5)
          :(light.userData.inactiveIntensity??0)

        if(active&&!light.visible)light.visible=true

        light.intensity+=(target-light.intensity)*.075

        if(!active&&light.intensity<.015){
          light.intensity=0
          light.visible=false
        }
      })
    })
  }

  function handleResize(){
    if(disposed)return

    const{width,height}=getMuseumViewportSize(container,mode)

    camera.aspect=width/height
    camera.updateProjectionMatrix()

    renderer.setSize(width,height)
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5))

    composer.setSize(width,height)
    bloom.setSize(width,height)
  }

  function disposeMaterial(material){
    if(!material)return

    Object.values(material).forEach(value=>{
      if(value?.isTexture)value.dispose()
    })

    material.dispose?.()
  }

  function disposeObject(object){
    object.traverse(child=>{
      child.geometry?.dispose()

      if(Array.isArray(child.material)){
        child.material.forEach(disposeMaterial)
      }else if(child.material){
        disposeMaterial(child.material)
      }
    })
  }

  function dispose(){
    if(disposed)return
    disposed=true

    if(animationFrame)cancelAnimationFrame(animationFrame)

    window.removeEventListener('resize',handleResize)
    controls.dispose()

    groups.forEach(group=>{
      disposeObject(group)
      scene.remove(group)
    })

    composer.dispose?.()
    renderer.dispose()

    if(renderer.domElement?.parentNode===container){
      container.removeChild(renderer.domElement)
    }

    container.classList.remove(
      'colonial-museum',
      'prehispanic-museum',
      'independence-museum',
      'revolution-museum',
      'postrevolution-museum'
    )

    if(container.__museumDispose===dispose){
      delete container.__museumDispose
    }
  }

  window.addEventListener('resize',handleResize)

  handleResize()
  animate()

  container.__museumDispose=dispose

  return{
    goTo:controls.goTo,
    dispose
  }
}