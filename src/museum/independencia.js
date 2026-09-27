import * as THREE from 'three'
import {
  createIndependenceFrame,
  createIndependencePlaque,
  createTimelineLabel,
  createArchiveStamp,
  fitIndependenceArtwork
} from './independenciaHelpers.js'

const YEARS=['1810','1813','1815','1820','1821','1821']

export function createIndependenceSection({
  group,c,index,renderer,textureLoader,clickable,lights,total
}){
  createArchitecture(group,c,index)

  const gallery=new THREE.Group()
  gallery.position.z=-3.74
  group.add(gallery)

  createGallery({
    c,
    index,
    renderer,
    textureLoader,
    gallery,
    clickable
  })

  createPlaque(gallery,c,index)
  createTimeline(gallery,index,total,c.themeColor)
  createArchiveDetails(group,c,index)

  lights.push(
    createLighting(group,c.themeColor)
  )
}

/* Arquitectura */
function createArchitecture(group,c,index){
  const accent=new THREE.Color(c.themeColor||'#9f3040')

  const mainWall=new THREE.Mesh(
    new THREE.BoxGeometry(23.5,15.2,.12),
    new THREE.MeshStandardMaterial({
      color:0xe8e6df,
      roughness:0.8,
      metalness:0
    })
  )
  mainWall.position.set(0,9.35,-4.15)
  mainWall.receiveShadow=true
  group.add(mainWall)

  const lowerWall=new THREE.Mesh(
    new THREE.BoxGeometry(23.65,2.4,.14),
    new THREE.MeshStandardMaterial({
      color:0x222428,
      roughness:0.9,
      metalness:0.1
    })
  )
  lowerWall.position.set(0,1.4,-4.12)
  lowerWall.receiveShadow=true
  group.add(lowerWall)

  const baseboard=new THREE.Mesh(
    new THREE.BoxGeometry(23.8,.18,.18),
    new THREE.MeshStandardMaterial({
      color:0x111111,
      roughness:0.9,
      metalness:0
    })
  )
  baseboard.position.set(0,.18,-4.05)
  group.add(baseboard)

  const redLine=new THREE.Mesh(
    new THREE.BoxGeometry(23.5,.055,.055),
    new THREE.MeshBasicMaterial({
      color:accent,
      transparent:true,
      opacity:0.9
    })
  )
  redLine.position.set(0,15.55,-3.98)
  group.add(redLine)

  createArchiveNumber(group,index,c.themeColor)
}

/* Línea del tiempo */
function createTimeline(group,current,total,color){
  const timeline=new THREE.Group()
  timeline.position.set(0,1.6,.22)

  const length=17
  const accent=new THREE.Color(color||'#9f3040')

  const baseLine=new THREE.Mesh(
    new THREE.PlaneGeometry(length,.06),
    new THREE.MeshBasicMaterial({
      color:0x555a60,
      transparent:false
    })
  )
  timeline.add(baseLine)

  const progress=current<=0 ? 0 : current/Math.max(total-1,1)

  if(progress>0){
    const progressLine=new THREE.Mesh(
      new THREE.PlaneGeometry(length*progress, .08),
      new THREE.MeshBasicMaterial({
        color:accent,
        transparent:false 
      })
    )
    progressLine.position.set(-length/2+(length*progress)/2, 0, .015)
    timeline.add(progressLine)
  }

  const count=Math.max(total,1)

  for(let i=0;i<count;i++){
    const x=count===1 ? 0 : -length/2+(length/(count-1))*i
    const active=i===current
    const passed=i<current

    const outer=new THREE.Mesh(
      new THREE.CircleGeometry(active ? .22 : .14, 32),
      new THREE.MeshBasicMaterial({
        color: active || passed ? accent : 0x88929c
      })
    )
    outer.position.set(x,0,.04)
    timeline.add(outer)

    if(active){
      const ring=new THREE.Mesh(
        new THREE.RingGeometry(.30, .36, 32),
        new THREE.MeshBasicMaterial({
          color:0xffffff,
          transparent:true,
          opacity:0.8
        })
      )
      ring.position.set(x,0,.035)
      timeline.add(ring)
    }

    const labelColor = active ? color : '#ffffff'
    const label=createTimelineLabel(YEARS[i]||'', active, labelColor)
    
    label.position.set(x, -.65, .05)
    timeline.add(label)
  }

  group.add(timeline)
}

/* Número grande */
function createArchiveNumber(group,index,color){
  const canvas=document.createElement('canvas')
  canvas.width=700
  canvas.height=700

  const ctx=canvas.getContext('2d')
  const accent=color||'#9f3040'

  ctx.clearRect(0,0,700,700)
  ctx.globalAlpha=.075
  ctx.fillStyle=accent
  ctx.textAlign='center'
  ctx.textBaseline='middle'
  ctx.font='700 430px "Playfair Display",Georgia,serif'
  ctx.fillText(String(index+1).padStart(2,'0'),350,350)

  const texture=new THREE.CanvasTexture(canvas)
  texture.colorSpace=THREE.SRGBColorSpace

  const number=new THREE.Mesh(
    new THREE.PlaneGeometry(5.2,5.2),
    new THREE.MeshBasicMaterial({
      map:texture,
      transparent:true,
      depthWrite:false,
      toneMapped:false
    })
  )

  number.position.set(8.7,12.2,-3.91)
  group.add(number)
}

/* Galería documental */
function createGallery({
  c,index,renderer,textureLoader,gallery,clickable
}){
  if(!c.gallery?.length)return

  const count=Math.min(c.gallery.length,3)

  const layouts=count===1
    ?[
      {x:0,y:9.8,maxW:9,maxH:6.1,main:true,rotation:0}
    ]
    :count===2
      ?[
        {x:-3.4,y:9.6,maxW:5.4,maxH:5.8,main:true,rotation:-.008},
        {x:3.4,y:9.6,maxW:5.4,maxH:5.8,main:true,rotation:.008}
      ]
      :[
        {x:0,y:10.4,maxW:7.2,maxH:4.75,main:true,rotation:0},
        {x:-4.45,y:6.25,maxW:3.95,maxH:2.75,rotation:-.022},
        {x:4.45,y:6.25,maxW:3.95,maxH:2.75,rotation:.022}
      ]

  c.gallery.slice(0,3).forEach((url,i)=>{
    textureLoader.load(
      url,
      tex=>{
        tex.colorSpace=THREE.SRGBColorSpace
        tex.anisotropy=Math.min(
          renderer.capabilities.getMaxAnisotropy(),
          4
        )

        const layout=layouts[i]
        const aspect=tex.image.width/tex.image.height

        const{width,height}=fitIndependenceArtwork(
          aspect,
          layout.maxW,
          layout.maxH
        )

        const documentGroup=new THREE.Group()

        documentGroup.position.set(
          layout.x,
          layout.y,
          .14+i*.018
        )

        documentGroup.rotation.z=layout.rotation||0

        gallery.add(documentGroup)

        createDocumentShadow(
          documentGroup,
          width,
          height,
          layout.main
        )

        createPaperBacking(
          documentGroup,
          width,
          height,
          c.themeColor
        )

        const frame=createIndependenceFrame(
          width,
          height,
          c.themeColor,
          layout.main
        )

        frame.position.z=.05
        documentGroup.add(frame)

        const image=new THREE.Mesh(
          new THREE.PlaneGeometry(width,height),
          new THREE.MeshBasicMaterial({
            map:tex,
            color:0xffffff,
            toneMapped:false
          })
        )

        image.position.z=.12
        image.userData.index=index

        documentGroup.add(image)
        clickable.push(image)

        if(layout.main){
          const stamp=createArchiveStamp(
            'DOCUMENTO',
            c.themeColor
          )

          stamp.position.set(
            width/2-.55,
            -height/2+.5,
            .17
          )

          stamp.rotation.z=-.1

          documentGroup.add(stamp)
        }
      },
      undefined,
      err=>console.error('Error cargando imagen:',url,err)
    )
  })
}

function createDocumentShadow(group,width,height,main){
  const shadow=new THREE.Mesh(
    new THREE.PlaneGeometry(
      width+.4,
      height+.4
    ),
    new THREE.MeshBasicMaterial({
      color:0x2d3744,
      transparent:true,
      opacity:main?.14:.09,
      depthWrite:false
    })
  )

  shadow.position.set(.12,-.14,-.08)
  group.add(shadow)
}

function createPaperBacking(group,width,height,color){
  const paper=new THREE.Mesh(
    new THREE.PlaneGeometry(
      width+.22,
      height+.22
    ),
    new THREE.MeshStandardMaterial({
      color:0xf1eee8,
      roughness:.94,
      metalness:0
    })
  )

  paper.position.z=.025
  group.add(paper)

  const accent=new THREE.Mesh(
    new THREE.PlaneGeometry(
      .055,
      height+.22
    ),
    new THREE.MeshBasicMaterial({
      color:new THREE.Color(color||'#9f3040')
    })
  )

  accent.position.set(
    -width/2-.08,
    0,
    .04
  )

  group.add(accent)
}

/* Cédula */
function createPlaque(group,c,index){
  const root=new THREE.Group()
  root.position.set(0,3.55,.1)

  const shadow=new THREE.Mesh(
    new THREE.PlaneGeometry(9.65,2.35),
    new THREE.MeshBasicMaterial({
      color:0x33404d,
      transparent:true,
      opacity:.12,
      depthWrite:false
    })
  )

  shadow.position.set(.1,-.1,-.03)

  const backing=new THREE.Mesh(
    new THREE.PlaneGeometry(9.4,2.15),
    new THREE.MeshStandardMaterial({
      color:0xf1eee8,
      roughness:.92,
      metalness:0
    })
  )

  const plaque=createIndependencePlaque(c,index)
  plaque.position.z=.04

  root.add(shadow,backing,plaque)
  group.add(root)
}

/* Detalles de archivo */
function createArchiveDetails(group,c,index){
  const accent=new THREE.Color(c.themeColor||'#9f3040')

  const sideLine=new THREE.Mesh(
    new THREE.PlaneGeometry(.04,4.6),
    new THREE.MeshBasicMaterial({
      color:accent,
      transparent:true,
      opacity:.38
    })
  )

  sideLine.position.set(
    -10.5,
    11.8,
    -3.9
  )

  group.add(sideLine)

  for(let i=0;i<3;i++){
    const mark=new THREE.Mesh(
      new THREE.PlaneGeometry(.75,.035),
      new THREE.MeshBasicMaterial({
        color:accent,
        transparent:true,
        opacity:.22
      })
    )

    mark.position.set(
      -10.1,
      13.5-i*.35,
      -3.9
    )

    group.add(mark)
  }

  const seal=new THREE.Mesh(
    new THREE.RingGeometry(.34,.4,32),
    new THREE.MeshBasicMaterial({
      color:accent,
      transparent:true,
      opacity:.26
    })
  )

  seal.position.set(
    9.8,
    4.4,
    -3.9
  )

  group.add(seal)
}

/* Iluminación */
function createLighting(group,color){
  const lights=[]

  const rail=new THREE.Mesh(
    new THREE.BoxGeometry(14,.08,.1),
    new THREE.MeshStandardMaterial({
      color:0x4a5662,
      roughness:.62,
      metalness:.18
    })
  )

  rail.position.set(0,16.45,1.1)
  group.add(rail)

  const main=new THREE.SpotLight(
    0xfff2dd,
    0,
    35,
    Math.PI/6,
    .72,
    1.5
  )

  main.position.set(0,16.2,1.4)
  main.target.position.set(0,9,-3.6)

  main.userData.activeIntensity=4.5
  main.userData.inactiveIntensity=0

  main.castShadow=true
  main.shadow.mapSize.set(1024,1024)
  main.shadow.bias=-.0002

  group.add(main,main.target)
  lights.push(main)

  const left=new THREE.SpotLight(
    0xe8eff7,
    0,
    30,
    Math.PI/6,
    .8,
    1.5
  )

  left.position.set(-6,14.5,2)
  left.target.position.set(-4.5,7,-3.6)

  left.userData.activeIntensity=2.2
  left.userData.inactiveIntensity=0
  left.castShadow=false

  group.add(left,left.target)
  lights.push(left)

  const right=new THREE.SpotLight(
    0xe8eff7,
    0,
    30,
    Math.PI/6,
    .8,
    1.5
  )

  right.position.set(6,14.5,2)
  right.target.position.set(4.5,7,-3.6)

  right.userData.activeIntensity=2.2
  right.userData.inactiveIntensity=0
  right.castShadow=false

  group.add(right,right.target)
  lights.push(right)

  const accent=new THREE.PointLight(
    new THREE.Color(color||'#9f3040'),
    0,
    13,
    2
  )

  accent.position.set(0,5,3.5)
  accent.userData.activeIntensity=.45
  accent.userData.inactiveIntensity=0

  group.add(accent)
  lights.push(accent)

  return lights
}