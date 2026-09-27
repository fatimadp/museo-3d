import * as THREE from 'three'
import {createColonialFrame,createColonialPlaque,fitArtwork} from './colonialHelpers.js'

export function createColonialSection({
  group,c,index,renderer,textureLoader,clickable,lights
}){
  createWallArchitecture(group,c.themeColor)

  const artworks=new THREE.Group()
  artworks.position.z=-4.01
  group.add(artworks)

  const layouts=getLayouts(c.gallery?.length||0)

  createArtworks({
    c,
    index,
    renderer,
    textureLoader,
    artworks,
    layouts,
    clickable
  })

  createMainPlaque(artworks,c)
  createDecorativeMedallion(group,c.themeColor)
  createBench(group)

  lights.push(
    createMuseumLighting(group,layouts)
  )
}

function getLayouts(count){
  if(count<=1)return[
    {
      x:0,
      y:10,
      maxW:9.4,
      maxH:6.5,
      main:true,
      rotation:0
    }
  ]

  if(count===2)return[
    {
      x:-3.65,
      y:9.9,
      maxW:5.6,
      maxH:6.2,
      main:true,
      rotation:.012
    },
    {
      x:3.65,
      y:9.9,
      maxW:5.6,
      maxH:6.2,
      main:true,
      rotation:-.012
    }
  ]

  if(count===3)return[
    {
      x:0,
      y:11,
      maxW:7.9,
      maxH:5.45,
      main:true,
      rotation:0
    },
    {
      x:-4.2,
      y:6.1,
      maxW:4.15,
      maxH:3,
      rotation:.018
    },
    {
      x:4.2,
      y:6.1,
      maxW:4.15,
      maxH:3,
      rotation:-.018
    }
  ]

  return[
    {
      x:0,
      y:11.25,
      maxW:7.3,
      maxH:5,
      main:true,
      rotation:0
    },
    {
      x:-4.5,
      y:6.05,
      maxW:3.65,
      maxH:2.75,
      rotation:.018
    },
    {
      x:0,
      y:6,
      maxW:3.65,
      maxH:2.75,
      rotation:0
    },
    {
      x:4.5,
      y:6.05,
      maxW:3.65,
      maxH:2.75,
      rotation:-.018
    }
  ]
}

/* Arquitectura del muro */
function createWallArchitecture(group,color){
  const plaster=new THREE.MeshStandardMaterial({
    color:0xcbb99b,
    roughness:.96,
    metalness:0
  })

  const lowerMaterial=new THREE.MeshStandardMaterial({
    color:0x8e7452,
    roughness:.88,
    metalness:0
  })

  const wood=new THREE.MeshStandardMaterial({
    color:0x5a402a,
    roughness:.73,
    metalness:.02
  })

  const gold=new THREE.MeshStandardMaterial({
    color:0x9e7a32,
    roughness:.58,
    metalness:.18
  })

  /* Panel central */
  const centerPanel=new THREE.Mesh(
    new THREE.BoxGeometry(17.6,12.8,.08),
    plaster
  )

  centerPanel.position.set(0,9.4,-4.18)
  centerPanel.receiveShadow=true
  group.add(centerPanel)

  /* Paneles laterales */
  const leftPanel=new THREE.Mesh(
    new THREE.BoxGeometry(2.6,12.8,.07),
    new THREE.MeshStandardMaterial({
      color:0xbba789,
      roughness:.96
    })
  )

  const rightPanel=leftPanel.clone()

  leftPanel.position.set(-10.3,9.4,-4.17)
  rightPanel.position.set(10.3,9.4,-4.17)

  group.add(leftPanel,rightPanel)

  /* Zócalo */
  const baseboard=new THREE.Mesh(
    new THREE.BoxGeometry(24,.34,.26),
    wood
  )

  baseboard.position.set(0,.24,-4.12)
  baseboard.castShadow=true
  group.add(baseboard)

  /* Parte baja */
  const lowerPanel=new THREE.Mesh(
    new THREE.BoxGeometry(23.7,2.25,.12),
    lowerMaterial
  )

  lowerPanel.position.set(0,1.42,-4.2)
  lowerPanel.receiveShadow=true
  group.add(lowerPanel)

  /* Moldura inferior */
  const lowerTrim=new THREE.Mesh(
    new THREE.BoxGeometry(23.85,.15,.18),
    gold
  )

  lowerTrim.position.set(0,2.58,-4.1)
  group.add(lowerTrim)

  /* Moldura superior */
  const cornice=new THREE.Mesh(
    new THREE.BoxGeometry(24,.34,.28),
    wood
  )

  cornice.position.set(0,17.76,-4.1)
  cornice.castShadow=true
  group.add(cornice)

  /* Moldura intermedia */
  const middleTrim=new THREE.Mesh(
    new THREE.BoxGeometry(18,.075,.1),
    gold
  )

  middleTrim.position.set(0,15.9,-4.02)
  group.add(middleTrim)

  createWallPanels(group,gold)
}

/* Molduras tipo salón */
function createWallPanels(group,material){
  const createPanel=(x,y,w,h)=>{
    const root=new THREE.Group()
    const thickness=.055
    const depth=.07

    const top=new THREE.Mesh(
      new THREE.BoxGeometry(w,thickness,depth),
      material
    )

    const bottom=top.clone()

    const left=new THREE.Mesh(
      new THREE.BoxGeometry(thickness,h,depth),
      material
    )

    const right=left.clone()

    top.position.y=h/2
    bottom.position.y=-h/2
    left.position.x=-w/2
    right.position.x=w/2

    root.add(top,bottom,left,right)
    root.position.set(x,y,-4.02)

    group.add(root)
  }

  createPanel(0,10.05,16.8,10.8)
  createPanel(-10.25,10.05,2,10.8)
  createPanel(10.25,10.05,2,10.8)
}

/* Obras */
function createArtworks({
  c,index,renderer,textureLoader,artworks,layouts,clickable
}){
  if(!c.gallery?.length)return

  c.gallery
    .slice(0,layouts.length)
    .forEach((imgUrl,imgIndex)=>{
      const layout=layouts[imgIndex]

      textureLoader.load(imgUrl,tex=>{
        tex.colorSpace=THREE.SRGBColorSpace
        tex.anisotropy=Math.min(
          renderer.capabilities.getMaxAnisotropy(),
          4
        )

        const aspect=tex.image.width/tex.image.height

        const{
          width:artWidth,
          height:artHeight
        }=fitArtwork(
          aspect,
          layout.maxW,
          layout.maxH
        )

        const painting=new THREE.Group()

        painting.position.set(
          layout.x,
          layout.y,
          imgIndex*.015
        )

        painting.rotation.z=layout.rotation||0

        artworks.add(painting)

        /* Sombra */
        const shadow=new THREE.Mesh(
          new THREE.PlaneGeometry(
            artWidth+.5,
            artHeight+.5
          ),
          new THREE.MeshBasicMaterial({
            color:0x3b2b20,
            transparent:true,
            opacity:layout.main?.16:.11,
            depthWrite:false
          })
        )

        shadow.position.set(
          .12,
          -.14,
          -.07
        )

        painting.add(shadow)

        /* Marco */
        const frame=createColonialFrame(
          artWidth,
          artHeight
        )

        frame.position.z=.02
        painting.add(frame)

        /* Passe-partout */
        const matte=new THREE.Mesh(
          new THREE.PlaneGeometry(
            artWidth+.18,
            artHeight+.18
          ),
          new THREE.MeshStandardMaterial({
            color:0xeadfce,
            roughness:.93,
            metalness:0
          })
        )

        matte.position.z=.055
        painting.add(matte)

        /* Pintura */
        const photo=new THREE.Mesh(
          new THREE.PlaneGeometry(
            artWidth,
            artHeight
          ),
          new THREE.MeshStandardMaterial({
            map:tex,
            color:0xffffff,
            roughness:.8,
            metalness:0
          })
        )

        photo.position.z=.09
        photo.castShadow=false
        photo.receiveShadow=false
        photo.userData.index=index

        painting.add(photo)
        clickable.push(photo)

        /* Punto de luz visual */
        if(layout.main){
          createPictureLight(
            artworks,
            layout.x,
            layout.y+artHeight/2+.65,
            c.themeColor
          )
        }
      })
    })
}

/* Luz decorativa encima de la obra */
function createPictureLight(group,x,y,color){
  const root=new THREE.Group()

  const fixture=new THREE.Mesh(
    new THREE.BoxGeometry(1.1,.12,.18),
    new THREE.MeshStandardMaterial({
      color:0x65503b,
      roughness:.55,
      metalness:.25
    })
  )

  fixture.position.z=.35

  const stem=new THREE.Mesh(
    new THREE.BoxGeometry(.06,.42,.06),
    new THREE.MeshStandardMaterial({
      color:0x65503b,
      roughness:.55,
      metalness:.2
    })
  )

  stem.position.set(0,.24,.22)

  const glow=new THREE.Mesh(
    new THREE.PlaneGeometry(1.2,.08),
    new THREE.MeshBasicMaterial({
      color:color||0xd2a84a,
      transparent:true,
      opacity:.14,
      depthWrite:false
    })
  )

  glow.position.set(0,-.12,.38)

  root.add(fixture,stem,glow)

  root.position.set(
    x,
    y,
    .25
  )

  group.add(root)
}

/* Placa principal */
function createMainPlaque(group,c){
  const root=new THREE.Group()
  root.position.set(0,2.92,.08)

  const shadow=new THREE.Mesh(
    new THREE.PlaneGeometry(10.1,2.72),
    new THREE.MeshBasicMaterial({
      color:0x291b11,
      transparent:true,
      opacity:.16,
      depthWrite:false
    })
  )

  shadow.position.set(
    .12,
    -.12,
    -.03
  )

  const backing=new THREE.Mesh(
    new THREE.PlaneGeometry(9.85,2.55),
    new THREE.MeshStandardMaterial({
      color:0x302117,
      roughness:.66,
      metalness:.03
    })
  )

  const inner=new THREE.Mesh(
    new THREE.PlaneGeometry(9.5,2.25),
    new THREE.MeshStandardMaterial({
      color:0xe8dcc7,
      roughness:.92,
      metalness:0
    })
  )

  inner.position.z=.035

  const plaque=createColonialPlaque(
    c.title,
    c.period,
    c.region
  )

  plaque.position.z=.07

  root.add(
    shadow,
    backing,
    inner,
    plaque
  )

  group.add(root)
}

/* Medallón decorativo */
function createDecorativeMedallion(group,color){
  const accent=color||'#8b0000'

  const root=new THREE.Group()

  const outer=new THREE.Mesh(
    new THREE.RingGeometry(.42,.47,48),
    new THREE.MeshBasicMaterial({
      color:new THREE.Color(accent),
      transparent:true,
      opacity:.35,
      side:THREE.DoubleSide
    })
  )

  const inner=new THREE.Mesh(
    new THREE.RingGeometry(.18,.22,48),
    new THREE.MeshBasicMaterial({
      color:new THREE.Color(accent),
      transparent:true,
      opacity:.22,
      side:THREE.DoubleSide
    })
  )

  root.add(outer,inner)

  root.position.set(
    9.9,
    15.9,
    -3.91
  )

  group.add(root)
}

/* Iluminación */
function createMuseumLighting(group,layouts){
  const rail=new THREE.Mesh(
    new THREE.BoxGeometry(18,.1,.12),
    new THREE.MeshStandardMaterial({
      color:0x34291f,
      roughness:.55,
      metalness:.22
    })
  )

  rail.position.set(
    0,
    17.05,
    1.5
  )

  group.add(rail)

  const lights=[]

  const createSpot=(
    x,
    targetX,
    targetY,
    intensity,
    shadow=false
  )=>{
    const spot=new THREE.SpotLight(
      0xffe5bf,
      0,
      34,
      Math.PI/7,
      .7,
      1.45
    )

    spot.position.set(
      x,
      16.7,
      1.65
    )

    spot.target.position.set(
      targetX,
      targetY,
      -4
    )

    spot.userData.activeIntensity=intensity
    spot.userData.inactiveIntensity=0

    /*
    Solo la luz central genera sombra.
    Reduce mucho el costo de GPU.
    */
    spot.castShadow=shadow

    if(shadow){
      spot.shadow.mapSize.set(1024,1024)
      spot.shadow.bias=-.0002
    }

    group.add(
      spot,
      spot.target
    )

    lights.push(spot)
  }

  if(layouts.length===1){
    createSpot(
      0,
      0,
      layouts[0]?.y||10,
      5.5,
      true
    )
  }else{
    createSpot(-6,-4.5,9.5,3.8,false)
    createSpot(0,0,10.5,5.2,true)
    createSpot(6,4.5,9.5,3.8,false)
  }

  const ambient=new THREE.PointLight(
    0xffd6ad,
    0,
    20,
    2
  )

  ambient.position.set(0,9,5)
  ambient.userData.activeIntensity=.7
  ambient.userData.inactiveIntensity=0

  group.add(ambient)
  lights.push(ambient)

  return lights
}

/* Banca */
function createBench(group){
  const wood=new THREE.MeshStandardMaterial({
    color:0x493324,
    roughness:.74,
    metalness:0
  })

  const metal=new THREE.MeshStandardMaterial({
    color:0x75614e,
    roughness:.6,
    metalness:.22
  })

  const bench=new THREE.Group()

  const seat=new THREE.Mesh(
    new THREE.BoxGeometry(4.5,.26,1.05),
    wood
  )

  seat.position.y=1.2
  seat.castShadow=true

  const support=new THREE.Mesh(
    new THREE.BoxGeometry(3.8,.12,.7),
    metal
  )

  support.position.y=.9

  const legGeo=new THREE.BoxGeometry(
    .18,
    .9,
    .72
  )

  const left=new THREE.Mesh(
    legGeo,
    metal
  )

  const right=new THREE.Mesh(
    legGeo,
    metal
  )

  left.position.set(
    -1.55,
    .47,
    0
  )

  right.position.set(
    1.55,
    .47,
    0
  )

  bench.add(
    seat,
    support,
    left,
    right
  )

  /*
  No totalmente centrada:
  parece más una galería real.
  */
  bench.position.set(
    -2.2,
    0,
    5.2
  )

  bench.rotation.y=.04

  group.add(bench)
}