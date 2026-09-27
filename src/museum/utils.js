import * as THREE from 'three'

export const themeColor=value=>new THREE.Color(value||'#b65d3b')

export function fitModel(model,options={}){
  const{
    maxWidth=3.8,
    maxHeight=4,
    maxDepth=3.8,
    offsetX=0,
    offsetY=0,
    offsetZ=0,
    scaleMultiplier=1
  }=typeof options==='number'
    ?{maxWidth:options,maxHeight:options,maxDepth:options}
    :options

  model.updateMatrixWorld(true)

  let box=new THREE.Box3().setFromObject(model)
  let size=box.getSize(new THREE.Vector3())

  if(
    !Number.isFinite(size.x)||
    !Number.isFinite(size.y)||
    !Number.isFinite(size.z)
  )return

  if(size.x===0||size.y===0||size.z===0)return

  const scaleX=maxWidth/size.x
  const scaleY=maxHeight/size.y
  const scaleZ=maxDepth/size.z

  const scale=
    Math.min(scaleX,scaleY,scaleZ)*
    scaleMultiplier

  model.scale.multiplyScalar(scale)
  model.updateMatrixWorld(true)

  box=new THREE.Box3().setFromObject(model)

  const center=box.getCenter(new THREE.Vector3())
  const min=box.min

  model.position.x-=center.x
  model.position.z-=center.z
  model.position.y-=min.y

  model.position.x+=offsetX
  model.position.y+=offsetY
  model.position.z+=offsetZ

  model.updateMatrixWorld(true)
}

function wrapText(ctx,text,x,y,maxWidth,lineHeight){
  const words=(text||'').split(' ')
  let line=''

  for(let i=0;i<words.length;i++){
    const test=line+words[i]+' '

    if(ctx.measureText(test).width>maxWidth&&line){
      ctx.fillText(line.trim(),x,y)

      line=words[i]+' '
      y+=lineHeight
    }else{
      line=test
    }
  }

  if(line){
    ctx.fillText(line.trim(),x,y)
  }

  return y+lineHeight
}

function drawInfoIcon(ctx,type,x,y,color){
  ctx.save()
  ctx.translate(x,y)

  ctx.strokeStyle=color
  ctx.fillStyle=color
  ctx.lineWidth=3
  ctx.lineCap='round'
  ctx.lineJoin='round'

  if(type===0){
    ctx.beginPath()
    ctx.arc(0,0,13,0,Math.PI*2)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(-9,4)
    ctx.lineTo(9,4)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0,-9)
    ctx.lineTo(0,9)
    ctx.stroke()
  }

  if(type===1){
    ctx.beginPath()
    ctx.moveTo(-14,8)
    ctx.lineTo(0,-12)
    ctx.lineTo(14,8)
    ctx.closePath()
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(-9,8)
    ctx.lineTo(9,8)
    ctx.stroke()
  }

  if(type===2){
    ctx.beginPath()
    ctx.moveTo(-13,-8)
    ctx.lineTo(0,0)
    ctx.lineTo(-13,8)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0,0)
    ctx.lineTo(13,0)
    ctx.stroke()
  }

  if(type===3){
    ctx.strokeRect(-12,-12,24,24)

    ctx.beginPath()
    ctx.moveTo(-7,-2)
    ctx.lineTo(-1,5)
    ctx.lineTo(8,-7)
    ctx.stroke()
  }

  ctx.restore()
}

export function infoWallTexture(data){
  const canvas=document.createElement('canvas')

  /*
  Antes 2048x2048.
  1536 reduce bastante memoria sin perder legibilidad.
  */
  canvas.width=1536
  canvas.height=1536

  const ctx=canvas.getContext('2d')

  /* Mantiene coordenadas lógicas 1024x1024 */
  ctx.scale(1.5,1.5)

  const accent=data.themeColor||'#b65d3b'
  const text='#1f1b17'
  const secondary='#3b352f'
  const muted='#655d55'
  const paper='#f1e9dc'
  const line='#c8bdaf'

  ctx.fillStyle=paper
  ctx.fillRect(0,0,1024,1024)

  /* Barra lateral */
  ctx.fillStyle=accent
  ctx.fillRect(0,0,10,1024)

  /* Letra decorativa */
  ctx.save()
  ctx.globalAlpha=.055
  ctx.fillStyle=accent
  ctx.font='700 210px "Playfair Display",Georgia,serif'
  ctx.fillText(
    (data.title||'').slice(0,1).toUpperCase(),
    770,
    210
  )
  ctx.restore()

  /* Encabezado */
  ctx.fillStyle=accent
  ctx.font='700 20px Inter,Arial,sans-serif'
  ctx.fillText('EXPOSICIÓN HISTÓRICA',64,64)

  ctx.fillStyle=text
  ctx.font='600 76px "Playfair Display",Georgia,serif'
  ctx.fillText(data.title||'',64,140)

  ctx.fillStyle=secondary
  ctx.font='italic 500 30px "Playfair Display",Georgia,serif'
  ctx.fillText(
    `${data.period||''}  ·  ${data.region||''}`,
    64,
    192
  )

  ctx.fillStyle=accent
  ctx.fillRect(64,224,88,4)

  const focus=data.politicalFocus||{}

  const sections=[
    {
      label:'FORMA DE GOBIERNO',
      value:focus.gobierno
    },
    {
      label:'DESIGNACIÓN DEL PODER',
      value:focus.designacionPoder
    },
    {
      label:'CAMBIO SIGNIFICATIVO',
      value:focus.cambiosSignificativos
    },
    {
      label:'CONCENTRACIÓN Y PODER',
      value:focus.reformasYPoderes
    }
  ]

  let y=292

  sections.forEach((section,index)=>{
    drawInfoIcon(
      ctx,
      index,
      80,
      y-8,
      accent
    )

    ctx.fillStyle=accent
    ctx.font='700 22px Inter,Arial,sans-serif'
    ctx.fillText(section.label,112,y)

    y+=42

    ctx.fillStyle=secondary
    ctx.font='500 30px Inter,Arial,sans-serif'

    y=wrapText(
      ctx,
      section.value||'',
      112,
      y,
      820,
      41
    )

    if(index<sections.length-1){
      y+=20

      ctx.fillStyle=line
      ctx.fillRect(112,y,805,1)

      y+=38
    }
  })

  /* Pie */
  ctx.fillStyle=muted
  ctx.font='600 15px Inter,Arial,sans-serif'

  ctx.fillText(
    '',
    64,
    970
  )

  const texture=new THREE.CanvasTexture(canvas)

  texture.colorSpace=THREE.SRGBColorSpace

  /* Antes 16 */
  texture.anisotropy=4

  texture.needsUpdate=true

  return texture
}

export function captionTexture(data){
  const canvas=document.createElement('canvas')

  canvas.width=1400
  canvas.height=340

  const ctx=canvas.getContext('2d')

  const accent=data.themeColor||'#b65d3b'
  const paper='#f1e9dc'
  const text='#1f1b17'
  const secondary='#403a34'

  ctx.fillStyle=paper
  ctx.fillRect(0,0,canvas.width,canvas.height)

  ctx.fillStyle=accent
  ctx.fillRect(0,0,12,canvas.height)

  ctx.fillStyle=accent
  ctx.font='700 24px Inter,Arial,sans-serif'

  ctx.fillText(
    'PIEZA / REFERENCIA VISUAL',
    70,
    56
  )

  ctx.fillStyle=text
  ctx.font='600 72px "Playfair Display",Georgia,serif'

  ctx.fillText(
    data.title||'',
    70,
    135
  )

  ctx.fillStyle=secondary
  ctx.font='500 34px Inter,Arial,sans-serif'

  ctx.fillText(
    data.region||'',
    70,
    205
  )

  ctx.fillStyle=accent
  ctx.font='italic 500 34px "Playfair Display",Georgia,serif'

  ctx.fillText(
    data.period||'',
    70,
    272
  )

  /* Elemento decorativo */
  ctx.globalAlpha=.12
  ctx.fillStyle=accent

  ctx.beginPath()
  ctx.arc(1260,170,95,0,Math.PI*2)
  ctx.fill()

  ctx.globalAlpha=1
  ctx.strokeStyle=accent
  ctx.globalAlpha=.32
  ctx.lineWidth=3

  ctx.beginPath()
  ctx.arc(1260,170,62,0,Math.PI*2)
  ctx.stroke()

  ctx.globalAlpha=1

  const texture=new THREE.CanvasTexture(canvas)

  texture.colorSpace=THREE.SRGBColorSpace

  /* Antes 16 */
  texture.anisotropy=4

  texture.needsUpdate=true

  return texture
}

export function artifact(index,color){
  const mat=new THREE.MeshPhysicalMaterial({
    color:themeColor(color),
    metalness:.08,
    roughness:.62,
    clearcoat:.15,
    clearcoatRoughness:.7
  })

  let geo

  switch(index%6){
    case 0:
      geo=new THREE.IcosahedronGeometry(1.2,1)
      break

    case 1:
      geo=new THREE.CylinderGeometry(
        .75,
        1.05,
        2.1,
        8
      )
      break

    case 2:
      geo=new THREE.TorusKnotGeometry(
        .72,
        .24,
        80,
        14
      )
      break

    case 3:
      geo=new THREE.OctahedronGeometry(1.3,1)
      break

    case 4:
      geo=new THREE.TorusGeometry(
        .85,
        .3,
        24,
        48
      )
      break

    default:
      geo=new THREE.DodecahedronGeometry(1.2,1)
  }

  const mesh=new THREE.Mesh(geo,mat)

  mesh.castShadow=true
  mesh.receiveShadow=false

  return mesh
}

export function createFrame(width,height,color){
  const group=new THREE.Group()

  const depth=.09
  const thickness=.065

  const mat=new THREE.MeshStandardMaterial({
    color:themeColor(color),
    metalness:.06,
    roughness:.72,
    emissive:themeColor(color),
    emissiveIntensity:.01
  })

  const top=new THREE.Mesh(
    new THREE.BoxGeometry(
      width+thickness*2,
      thickness,
      depth
    ),
    mat
  )

  const bottom=new THREE.Mesh(
    new THREE.BoxGeometry(
      width+thickness*2,
      thickness,
      depth
    ),
    mat
  )

  const left=new THREE.Mesh(
    new THREE.BoxGeometry(
      thickness,
      height,
      depth
    ),
    mat
  )

  const right=new THREE.Mesh(
    new THREE.BoxGeometry(
      thickness,
      height,
      depth
    ),
    mat
  )

  top.position.y=
    height/2+
    thickness/2

  bottom.position.y=
    -height/2-
    thickness/2

  left.position.x=
    -width/2-
    thickness/2

  right.position.x=
    width/2+
    thickness/2

  group.add(
    top,
    bottom,
    left,
    right
  )

  return group
}

export function createParticles(color,count=60){
  const positions=new Float32Array(count*3)

  for(let i=0;i<count;i++){
    positions[i*3]=(Math.random()-.5)*7
    positions[i*3+1]=1+Math.random()*7
    positions[i*3+2]=(Math.random()-.5)*5
  }

  const geometry=new THREE.BufferGeometry()

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
      positions,
      3
    )
  )

  const material=new THREE.PointsMaterial({
    color:themeColor(color),
    size:.022,
    transparent:true,
    opacity:.11,
    depthWrite:false
  })

  return new THREE.Points(
    geometry,
    material
  )
}