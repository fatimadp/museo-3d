import * as THREE from 'three'
import {fitModel,infoWallTexture,captionTexture,artifact,createFrame} from './utils.js'

export function createPrehispanicSection({
  group,c,index,accent,textureLoader,gltfLoader,clickable,objects,floating,lights
}){
  const theme=themeValue(c.themeColor)
  const lightConfig=getLighting(c,accent)

  createArchitecture(group,c.themeColor)
  createBackdrop(group,c.themeColor)
  createTimelineMark(group,c)
  createPedestal(group,c,index,theme,clickable)

  const objectWrapper=new THREE.Group()
  objectWrapper.position.set(0,2.72,.15)
  objectWrapper.userData.baseY=2.72
  objectWrapper.userData.floatAmount=.02
  objectWrapper.userData.sectionIndex=index
  group.add(objectWrapper)
  objects.push(objectWrapper)

  createArtifactHalo(group,c.themeColor)
  createBeam(group,lightConfig.beam)

  const sideLights=createSideLights(group,lightConfig)

  loadModel({
    c,
    index,
    gltfLoader,
    objectWrapper,
    clickable
  })

  createInfo({
    group,
    c,
    index,
    clickable,
    floating
  })

  createPhoto({
    group,
    c,
    index,
    textureLoader,
    clickable,
    floating
  })

  lights.push([
    createMainSpot(group,lightConfig),
    createThemeFill(group,lightConfig),
    ...sideLights
  ])
}

function themeValue(color){
  try{
    return new THREE.Color(color||'#b65d3b')
  }catch{
    return new THREE.Color('#b65d3b')
  }
}

function getLighting(c,accent){
  return{
    main:c.lighting?.main??'#fff0d7',
    fill:c.lighting?.fill??accent,
    side:c.lighting?.side??'#e0b47d',
    beam:c.lighting?.beam??'#ffe1b5',
    intensity:c.lighting?.intensity??8,
    fillIntensity:c.lighting?.fillIntensity??.9
  }
}

/* Arquitectura */
function createArchitecture(group,color){
  const theme=themeValue(color)

  const floorAccent=new THREE.Mesh(
    new THREE.CircleGeometry(5.1,64),
    new THREE.MeshStandardMaterial({
      color:0x2b2118,
      roughness:.93,
      metalness:0
    })
  )

  floorAccent.rotation.x=-Math.PI/2
  floorAccent.position.set(0,.025,.25)
  floorAccent.receiveShadow=true
  group.add(floorAccent)

  const ring=new THREE.Mesh(
    new THREE.RingGeometry(4.65,4.78,64),
    new THREE.MeshBasicMaterial({
      color:theme,
      transparent:true,
      opacity:.28,
      side:THREE.DoubleSide,
      depthWrite:false
    })
  )

  ring.rotation.x=-Math.PI/2
  ring.position.set(0,.045,.25)
  group.add(ring)

  const rearColumn=new THREE.Mesh(
    new THREE.BoxGeometry(4.8,13,.75),
    new THREE.MeshStandardMaterial({
      color:0x3a2b20,
      roughness:.94,
      metalness:0
    })
  )

  rearColumn.position.set(0,6,-4.48)
  rearColumn.receiveShadow=true
  group.add(rearColumn)
}

/* Fondo */
function createBackdrop(group,color){
  const theme=themeValue(color)

  const panel=new THREE.Mesh(
    new THREE.PlaneGeometry(9.4,12.5),
    new THREE.MeshStandardMaterial({
      color:0xd8cfbf,
      roughness:.96,
      metalness:0
    })
  )

  panel.position.set(0,6,-4.08)
  group.add(panel)

  const innerPanel=new THREE.Mesh(
    new THREE.PlaneGeometry(8.65,11.8),
    new THREE.MeshStandardMaterial({
      color:0xc9bda9,
      roughness:.98,
      metalness:0
    })
  )

  innerPanel.position.set(0,6,-4.02)
  group.add(innerPanel)

  const halo=new THREE.Mesh(
    new THREE.CircleGeometry(4.05,64),
    new THREE.MeshBasicMaterial({
      color:theme,
      transparent:true,
      opacity:.09,
      depthWrite:false
    })
  )

  halo.position.set(0,5.85,-3.95)
  group.add(halo)

  const haloInner=new THREE.Mesh(
    new THREE.RingGeometry(3.15,3.22,64),
    new THREE.MeshBasicMaterial({
      color:theme,
      transparent:true,
      opacity:.2,
      depthWrite:false
    })
  )

  haloInner.position.set(0,5.85,-3.92)
  group.add(haloInner)

  createDecorativeMarks(group,color)
}

/* Formas decorativas */
function createDecorativeMarks(group,color){
  const theme=themeValue(color)

  for(let i=0;i<5;i++){
    const size=.22+i*.045

    const mark=new THREE.Mesh(
      new THREE.RingGeometry(size,size+.035,4),
      new THREE.MeshBasicMaterial({
        color:theme,
        transparent:true,
        opacity:.14,
        depthWrite:false
      })
    )

    mark.rotation.z=Math.PI/4
    mark.position.set(-3.65+i*.45,10.75,-3.88)
    group.add(mark)
  }

  const vertical=new THREE.Mesh(
    new THREE.PlaneGeometry(.045,2.2),
    new THREE.MeshBasicMaterial({
      color:theme,
      transparent:true,
      opacity:.14,
      depthWrite:false
    })
  )

  vertical.position.set(3.75,9.8,-3.88)
  group.add(vertical)

  for(let i=0;i<3;i++){
    const dash=new THREE.Mesh(
      new THREE.PlaneGeometry(.5,.035),
      new THREE.MeshBasicMaterial({
        color:theme,
        transparent:true,
        opacity:.14,
        depthWrite:false
      })
    )

    dash.position.set(3.5,8.95-i*.28,-3.88)
    group.add(dash)
  }
}

/* Pedestal */
function createPedestal(group,c,index,theme,clickable){
  const base=new THREE.Mesh(
    new THREE.CylinderGeometry(2.05,2.3,.42,48),
    new THREE.MeshStandardMaterial({
      color:0x3b2e23,
      roughness:.82,
      metalness:.02
    })
  )

  base.position.set(0,.23,.15)
  base.castShadow=true
  base.receiveShadow=true

  const body=new THREE.Mesh(
    new THREE.CylinderGeometry(1.68,1.95,2.25,48),
    new THREE.MeshStandardMaterial({
      color:0xbeb2a0,
      roughness:.9,
      metalness:0
    })
  )

  body.position.set(0,1.45,.15)
  body.castShadow=true
  body.receiveShadow=true
  body.userData.index=index

  const trim=new THREE.Mesh(
    new THREE.CylinderGeometry(1.83,1.83,.1,48),
    new THREE.MeshStandardMaterial({
      color:theme,
      roughness:.65,
      metalness:.06
    })
  )

  trim.position.set(0,2.56,.15)
  trim.receiveShadow=true

  const top=new THREE.Mesh(
    new THREE.CylinderGeometry(1.72,1.72,.16,48),
    new THREE.MeshStandardMaterial({
      color:0xe2d8c9,
      roughness:.86,
      metalness:0
    })
  )

  top.position.set(0,2.67,.15)
  top.receiveShadow=true

  const labelBase=new THREE.Mesh(
    new THREE.PlaneGeometry(1.15,.24),
    new THREE.MeshBasicMaterial({
      color:theme,
      transparent:true,
      opacity:.8
    })
  )

  labelBase.position.set(0,.88,1.83)
  labelBase.rotation.x=-.08

  group.add(base,body,trim,top,labelBase)
  clickable.push(body)
}

/* Halo de pieza */
function createArtifactHalo(group,color){
  const theme=themeValue(color)

  const halo=new THREE.Mesh(
    new THREE.RingGeometry(2.25,2.32,64),
    new THREE.MeshBasicMaterial({
      color:theme,
      transparent:true,
      opacity:.16,
      side:THREE.DoubleSide,
      depthWrite:false
    })
  )

  halo.position.set(0,4.42,-1.3)
  group.add(halo)

  const glow=new THREE.Mesh(
    new THREE.CircleGeometry(2.25,64),
    new THREE.MeshBasicMaterial({
      color:theme,
      transparent:true,
      opacity:.03,
      depthWrite:false
    })
  )

  glow.position.set(0,4.42,-1.33)
  group.add(glow)
}

/* Haz de luz */
function createBeam(group,color){
  const beam=new THREE.Mesh(
    new THREE.CylinderGeometry(.92,1.85,9.2,32,1,true),
    new THREE.MeshBasicMaterial({
      color,
      transparent:true,
      opacity:.022,
      side:THREE.DoubleSide,
      depthWrite:false,
      blending:THREE.AdditiveBlending
    })
  )

  beam.position.set(0,5.8,.25)
  group.add(beam)
}

/* Luces laterales */
function createSideLights(group,config){
  const left=new THREE.PointLight(config.side,0,10,2)
  const right=new THREE.PointLight(config.side,0,10,2)

  left.userData.activeIntensity=.5
  left.userData.inactiveIntensity=0
  right.userData.activeIntensity=.32
  right.userData.inactiveIntensity=0

  left.position.set(-3.8,4.7,3)
  right.position.set(3.8,4.7,3)

  group.add(left,right)

  return[left,right]
}

/* Modelo */
function loadModel({c,index,gltfLoader,objectWrapper,clickable}){
  const createFallback=()=>{
    const fallback=artifact(index,c.themeColor)
    fallback.userData.index=index
    clickable.push(fallback)
    objectWrapper.add(fallback)
  }

  if(!c.modelUrl){
    createFallback()
    return
  }

  gltfLoader.load(
    c.modelUrl,
    gltf=>{
      const model=gltf.scene

      model.traverse(child=>{
        if(!child.isMesh)return

        child.castShadow=true
        child.receiveShadow=false
        child.userData.index=index
        clickable.push(child)

        const materials=child.material
          ?Array.isArray(child.material)?child.material:[child.material]
          :[]

        materials.forEach(mat=>{
          if('envMapIntensity' in mat)mat.envMapIntensity=.55
          if('roughness' in mat)mat.roughness=Math.min(mat.roughness??.8,.88)
          mat.needsUpdate=true
        })
      })

      const config=c.modelView||{}

      fitModel(model,{
        maxWidth:config.maxWidth??3.7,
        maxHeight:config.maxHeight??3.9,
        maxDepth:config.maxDepth??3.7,
        scaleMultiplier:config.scale??1,
        offsetX:config.x??0,
        offsetY:config.y??0,
        offsetZ:config.z??0
      })

      if(config.rotationY!==undefined)model.rotation.y=THREE.MathUtils.degToRad(config.rotationY)
      if(config.rotationX!==undefined)model.rotation.x=THREE.MathUtils.degToRad(config.rotationX)
      if(config.rotationZ!==undefined)model.rotation.z=THREE.MathUtils.degToRad(config.rotationZ)

      model.updateMatrixWorld(true)
      objectWrapper.add(model)
    },
    undefined,
    createFallback
  )
}

/* Panel de información */
function createInfo({group,c,index,clickable,floating}){
  const infoGroup=new THREE.Group()

  infoGroup.position.set(6.15,5,-2.6)
  infoGroup.rotation.y=-.025
  infoGroup.userData.baseY=5
  infoGroup.userData.sectionIndex=index

  group.add(infoGroup)
  floating.push(infoGroup)

  const shadow=new THREE.Mesh(
    new THREE.PlaneGeometry(7.05,7.85),
    new THREE.MeshBasicMaterial({
      color:0x594a3a,
      transparent:true,
      opacity:.14,
      depthWrite:false
    })
  )

  shadow.position.set(.12,-.14,.01)

  const backing=new THREE.Mesh(
    new THREE.PlaneGeometry(6.92,7.72),
    new THREE.MeshBasicMaterial({
      color:0xf0e9dc
    })
  )

  backing.position.z=.08

  const accentBar=new THREE.Mesh(
    new THREE.PlaneGeometry(.075,6.8),
    new THREE.MeshBasicMaterial({
      color:themeValue(c.themeColor)
    })
  )

  accentBar.position.set(-3.25,0,.13)

  const infoWall=new THREE.Mesh(
    new THREE.PlaneGeometry(6.75,7.5),
    new THREE.MeshBasicMaterial({
      map:infoWallTexture(c),
      transparent:true
    })
  )

  infoWall.position.z=.14
  infoWall.userData.index=index

  const infoFrame=createFrame(6.75,7.5,c.themeColor)
  infoFrame.position.z=.17

  infoGroup.add(shadow,backing,accentBar,infoWall,infoFrame)
  clickable.push(infoWall)
}

/* Fotografía */
function createPhoto({group,c,index,textureLoader,clickable,floating}){
  const photoRoot=new THREE.Group()

  photoRoot.position.set(-6.15,5,-2.6)
  photoRoot.userData.baseY=5
  photoRoot.userData.sectionIndex=index

  group.add(photoRoot)
  floating.push(photoRoot)

  const photoGroup=new THREE.Group()
  photoGroup.rotation.y=.03
  photoRoot.add(photoGroup)

  const shadow=new THREE.Mesh(
    new THREE.PlaneGeometry(6.55,5.8),
    new THREE.MeshBasicMaterial({
      color:0x594a3a,
      transparent:true,
      opacity:.16,
      depthWrite:false
    })
  )

  shadow.position.set(.12,-.12,-.02)

  const backing=new THREE.Mesh(
    new THREE.PlaneGeometry(6.45,5.68),
    new THREE.MeshStandardMaterial({
      color:0xe3d9c9,
      roughness:.96,
      metalness:0
    })
  )

  backing.position.z=.04

  const photo=new THREE.Mesh(
    new THREE.PlaneGeometry(5.9,4.45),
    new THREE.MeshBasicMaterial({
      color:0xddd3c5
    })
  )

  photo.position.set(0,.35,.13)
  photo.userData.index=index

  const frame=createFrame(6.18,4.75,c.themeColor)
  frame.position.set(0,.35,.17)

  photoGroup.add(shadow,backing,photo,frame)
  clickable.push(photo)

  if(c.image){
    textureLoader.load(c.image,tex=>{
      tex.colorSpace=THREE.SRGBColorSpace
      tex.anisotropy=4

      const aspect=tex.image.width/tex.image.height
      const maxW=5.9
      const maxH=4.45

      let width=maxW
      let height=maxH

      if(aspect>maxW/maxH){
        height=maxW/aspect
      }else{
        width=maxH*aspect
      }

      photo.geometry.dispose()
      photo.geometry=new THREE.PlaneGeometry(width,height)
      photo.material.map=tex
      photo.material.color.set(0xffffff)
      photo.material.needsUpdate=true
    })
  }

  const captionGroup=new THREE.Group()
  captionGroup.position.set(0,-3.03,.2)
  photoRoot.add(captionGroup)

  const captionShadow=new THREE.Mesh(
    new THREE.PlaneGeometry(6.18,1.72),
    new THREE.MeshBasicMaterial({
      color:0x594a3a,
      transparent:true,
      opacity:.13,
      depthWrite:false
    })
  )

  captionShadow.position.set(.07,-.07,-.02)

  const captionBacking=new THREE.Mesh(
    new THREE.PlaneGeometry(6.08,1.6),
    new THREE.MeshBasicMaterial({
      color:0xf0e8da
    })
  )

  const caption=new THREE.Mesh(
    new THREE.PlaneGeometry(6.05,1.55),
    new THREE.MeshBasicMaterial({
      map:captionTexture(c),
      transparent:true
    })
  )

  caption.position.z=.02

  captionGroup.add(captionShadow,captionBacking,caption)
}

/* Marca temporal */
function createTimelineMark(group,c){
  const root=new THREE.Group()
  root.position.set(0,.12,4)

  const line=new THREE.Mesh(
    new THREE.PlaneGeometry(7,.025),
    new THREE.MeshBasicMaterial({
      color:0x756a5c,
      transparent:true,
      opacity:.2,
      side:THREE.DoubleSide
    })
  )

  line.rotation.x=-Math.PI/2

  const active=new THREE.Mesh(
    new THREE.CircleGeometry(.075,24),
    new THREE.MeshBasicMaterial({
      color:themeValue(c.themeColor)
    })
  )

  active.rotation.x=-Math.PI/2
  active.position.set(0,.015,0)

  root.add(line,active)
  group.add(root)
}

/* Luz principal */
function createMainSpot(group,config){
  const spot=new THREE.SpotLight(
    config.main,
    0,
    45,
    Math.PI/6,
    .62,
    1
  )

  spot.userData.activeIntensity=config.intensity
  spot.userData.inactiveIntensity=0
  spot.userData.isMainSpot=true

  spot.position.set(0,13.5,6)
  spot.target.position.set(0,4.1,.15)

  spot.castShadow=false
  spot.shadow.mapSize.set(1024,1024)
  spot.shadow.bias=-.0002

  group.add(spot,spot.target)

  return spot
}

/* Luz temática */
function createThemeFill(group,config){
  const light=new THREE.PointLight(
    config.fill,
    0,
    14,
    2
  )

  light.userData.activeIntensity=config.fillIntensity
  light.userData.inactiveIntensity=0
  light.position.set(0,5.4,4.8)

  group.add(light)

  return light
}