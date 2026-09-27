import * as THREE from 'three'
import {createPostFrame, fitPostArtwork} from './postrevolucionHelpers.js'

export function createPostRevolutionSection({group,c,index,renderer,textureLoader,clickable,lights}){
  createArchitecture(group,c,index)

  const gallery=new THREE.Group()
  gallery.position.z=-3.9
  group.add(gallery)

  const layouts=getLayouts(c.gallery?.length||0)
  // Pasamos el array de luces a createGallery para registrar los focos de piso
  createGallery({c,index,renderer,textureLoader,gallery,clickable,layouts,lights})
  
  const ambientLight = createLighting(group,c.themeColor)
  lights.push(ambientLight)
}

// 1. Ajuste de posiciones (Y bajó de ~8.5 a ~6.2) y tamaños para evitar recortes superiores
function getLayouts(count){
  if(count<=1)return[
    {x:0,y:6.2,maxW:9.5,maxH:5.5,main:true}
  ]

  if(count===2)return[
    {x:-4.2,y:6.2,maxW:6.5,maxH:4.8,main:true},
    {x:4.2,y:6.2,maxW:6.5,maxH:4.8,main:true}
  ]

  return[
    {x:-6.8,y:6.0,maxW:4.8,maxH:4.0},
    {x:0,y:6.3,maxW:5.8,maxH:4.6,main:true},
    {x:6.8,y:6.0,maxW:4.8,maxH:4.0}
  ]
}

/* Sala */
function createArchitecture(group,c,index){
  const accent=new THREE.Color(c.themeColor||'#426c68')

  const wall=new THREE.Mesh(
    new THREE.BoxGeometry(23.7,15.5,.14),
    new THREE.MeshStandardMaterial({color:0xd8d7cf,roughness:.96,metalness:0})
  )
  wall.position.set(0,9.25,-4.18)
  wall.receiveShadow=true
  group.add(wall)

  const panel=new THREE.Mesh(
    new THREE.BoxGeometry(21.3,10.6,.08),
    new THREE.MeshStandardMaterial({color:0xe4e2da,roughness:.97})
  )
  panel.position.set(0,8.5,-4)
  group.add(panel)

  const bottom=new THREE.Mesh(
    new THREE.BoxGeometry(23.8,2,.14),
    new THREE.MeshStandardMaterial({color:0x67716b,roughness:.9})
  )
  bottom.position.set(0,1.2,-4.1)
  group.add(bottom)

  const line=new THREE.Mesh(
    new THREE.BoxGeometry(21.3,.055,.04),
    new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.65})
  )
  line.position.set(0,13.9,-3.92)
  group.add(line)

  createHeader(group,c,index)
  createGeometry(group,accent)
}

function createHeader(group,c,index){
  const canvas=document.createElement('canvas')
  canvas.width=1700
  canvas.height=250
  const ctx=canvas.getContext('2d')
  const accent=c.themeColor||'#426c68'

  ctx.clearRect(0,0,1700,250)
  ctx.fillStyle=accent
  ctx.font='700 27px Inter,Arial,sans-serif'
  ctx.fillText(`CONSTRUCCIÓN DEL ESTADO · ${String(index+1).padStart(2,'0')}`,0,42)

  ctx.fillStyle='#272b29'
  ctx.font='600 82px "Playfair Display",Georgia,serif'
  ctx.fillText(c.title||'',0,138)

  ctx.fillStyle='#646963'
  ctx.font='500 30px Inter,Arial,sans-serif'
  ctx.fillText(`${c.period||''} · ${c.region||''}`,0,198)

  const texture=new THREE.CanvasTexture(canvas)
  texture.colorSpace=THREE.SRGBColorSpace

  const mesh=new THREE.Mesh(
    new THREE.PlaneGeometry(8.8,1.3),
    new THREE.MeshBasicMaterial({map:texture,transparent:true,toneMapped:false})
  )

  mesh.position.set(-5.8,14.7,-3.9)
  group.add(mesh)
}

function createGeometry(group,accent){
  const mat=new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.12})

  const circle=new THREE.Mesh(new THREE.RingGeometry(.5,.54,48),mat)
  circle.position.set(9.7,14.5,-3.9)
  group.add(circle)

  for(let i=0;i<3;i++){
    const line=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.03),mat)
    line.position.set(9.2,13.5-i*.28,-3.9)
    group.add(line)
  }
}

// 2. Integración de luminarias de piso y eliminación de etiquetas blancas
function createGallery({c,index,renderer,textureLoader,gallery,clickable,layouts,lights}){
  if(!c.gallery?.length)return

  c.gallery.slice(0,layouts.length).forEach((url,i)=>{
    const layout=layouts[i]

    textureLoader.load(url,tex=>{
      tex.colorSpace=THREE.SRGBColorSpace
      tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4)

      const aspect=tex.image.width/tex.image.height
      const{width,height}=fitPostArtwork(aspect,layout.maxW,layout.maxH)

      const root=new THREE.Group()
      root.position.set(layout.x,layout.y,.12+i*.012)
      gallery.add(root)

      const shadow=new THREE.Mesh(
        new THREE.PlaneGeometry(width+.4,height+.4),
        new THREE.MeshBasicMaterial({color:0x37403b,transparent:true,opacity:.12,depthWrite:false})
      )
      shadow.position.set(.12,-.14,-.06)
      root.add(shadow)

      const backing=new THREE.Mesh(
        new THREE.PlaneGeometry(width+.2,height+.2),
        new THREE.MeshStandardMaterial({color:0xf2f0e9,roughness:.96})
      )
      backing.position.z=.02
      root.add(backing)

      const frame=createPostFrame(width,height,c.themeColor,layout.main)
      frame.position.z=.04
      root.add(frame)

      const image=new THREE.Mesh(
        new THREE.PlaneGeometry(width,height),
        new THREE.MeshBasicMaterial({map:tex,color:0xffffff,toneMapped:false})
      )
      image.position.z=.11
      image.userData.index=index
      root.add(image)
      clickable.push(image)

      // Creación del foco de piso
      if(lights) {
        const floorLamp=new THREE.Group()
        floorLamp.position.set(0,-height/2-1.0,0.4) 

        const base=new THREE.Mesh(
          new THREE.CylinderGeometry(0.2,0.25,0.15,16),
          new THREE.MeshStandardMaterial({color:0x111111,metalness:0.8,roughness:0.2})
        )
        floorLamp.add(base)

        // Luz apuntando desde abajo hacia la obra
        const spot=new THREE.SpotLight(0xfff0d9,layout.main?3.5:2.5,12,Math.PI/6,0.5,1.2)
        spot.position.set(0,0.1,0)
        spot.target.position.set(0,height/2+1,-0.4) 
        spot.userData.activeIntensity=layout.main?3.5:2.5
        spot.userData.inactiveIntensity=0
        
        floorLamp.add(spot,spot.target)
        root.add(floorLamp)
        lights.push(spot)
      }
    },undefined,err=>console.error('Error cargando imagen:',url,err))
  })
}

// 3. Iluminación general simplificada (quitamos las lámparas de techo)
function createLighting(group,color){
  const accent=new THREE.PointLight(new THREE.Color(color||'#426c68'),0,14,2)
  accent.position.set(0,8,4)
  accent.userData.activeIntensity=.4
  accent.userData.inactiveIntensity=0
  group.add(accent)
  
  return accent
}