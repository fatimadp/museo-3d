import * as THREE from 'three'

export function createIndependenceFrame(
  w,
  h,
  color='#9f3040',
  main=false
){
  const group=new THREE.Group()

  const paperEdge=new THREE.MeshStandardMaterial({
    color:0xe4e0d9,
    roughness:.9,
    metalness:0
  })

  const dark=new THREE.MeshStandardMaterial({
    color:0x384552,
    roughness:.68,
    metalness:.05
  })

  const accent=new THREE.MeshStandardMaterial({
    color:new THREE.Color(color),
    roughness:.58,
    metalness:.08
  })

  const border=main?.13:.105
  const depth=.075
  const line=.04

  const top=new THREE.Mesh(
    new THREE.BoxGeometry(
      w+border*2,
      border,
      depth
    ),
    dark
  )

  const bottom=top.clone()

  const left=new THREE.Mesh(
    new THREE.BoxGeometry(
      border,
      h,
      depth
    ),
    dark
  )

  const right=left.clone()

  top.position.y=h/2+border/2
  bottom.position.y=-h/2-border/2
  left.position.x=-w/2-border/2
  right.position.x=w/2+border/2

  const paperTop=new THREE.Mesh(
    new THREE.BoxGeometry(
      w+.1,
      .045,
      .03
    ),
    paperEdge
  )

  const paperBottom=paperTop.clone()

  paperTop.position.set(
    0,
    h/2+.025,
    .045
  )

  paperBottom.position.set(
    0,
    -h/2-.025,
    .045
  )

  const accentLeft=new THREE.Mesh(
    new THREE.BoxGeometry(
      line,
      h,
      .035
    ),
    accent
  )

  accentLeft.position.set(
    -w/2-.02,
    0,
    .07
  )

  ;[
    top,
    bottom,
    left,
    right
  ].forEach(mesh=>{
    mesh.castShadow=main
    mesh.receiveShadow=false
  })

  group.add(
    top,
    bottom,
    left,
    right,
    paperTop,
    paperBottom,
    accentLeft
  )

  return group
}

/* Cédula principal */
export function createIndependencePlaque(data,index=0){
  const canvas=document.createElement('canvas')

  canvas.width=2400
  canvas.height=550

  const ctx=canvas.getContext('2d')

  const accent=data.themeColor||'#9f3040'
  const paper='#f1eee8'
  const text='#202933'
  const secondary='#55616c'
  const line='#c6ccd1'

  ctx.fillStyle=paper
  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  )

  /* Franja izquierda */
  ctx.fillStyle=accent
  ctx.fillRect(
    0,
    0,
    22,
    canvas.height
  )

  /* Número de archivo */
  ctx.save()

  ctx.globalAlpha=.055
  ctx.fillStyle=accent
  ctx.textAlign='right'
  ctx.font='700 310px "Playfair Display",Georgia,serif'

  ctx.fillText(
    String(index+1).padStart(2,'0'),
    2260,
    320
  )

  ctx.restore()

  /* Kicker */
  ctx.fillStyle=accent
  ctx.font='700 42px Inter,Arial,sans-serif'

  ctx.fillText(
    'ARCHIVO HISTÓRICO',
    100,
    62
  )

  /* Título */
  ctx.fillStyle=text
  ctx.textBaseline='top'
  ctx.font='600 120px "Playfair Display",Georgia,serif'

  drawWrappedText(
    ctx,
    data.title||'',
    100,
    105,
    2050,
    125,
    2
  )

  /* Línea */
  ctx.fillStyle=line
  ctx.fillRect(
    100,
    352,
    600,
    3
  )

  /* Periodo */
  ctx.fillStyle=accent
  ctx.font='700 50px "Playfair Display",Georgia,serif'

  ctx.fillText(
    data.period||'',
    100,
    390
  )

  /* Región */
  ctx.fillStyle=secondary
  ctx.font='600 38px Inter,Arial,sans-serif'

  ctx.fillText(
    data.region||'',
    100,
    462
  )

  const texture=new THREE.CanvasTexture(canvas)

  texture.colorSpace=THREE.SRGBColorSpace
  texture.anisotropy=4
  texture.needsUpdate=true

  return new THREE.Mesh(
    new THREE.PlaneGeometry(
      9.15,
      2.05
    ),
    new THREE.MeshBasicMaterial({
      map:texture,
      toneMapped:false
    })
  )
}

/* Sello */
export function createArchiveStamp(
  text='ARCHIVO',
  color='#9f3040'
){
  const canvas=document.createElement('canvas')

  canvas.width=400
  canvas.height=400

  const ctx=canvas.getContext('2d')

  ctx.clearRect(0,0,400,400)

  ctx.translate(200,200)

  ctx.strokeStyle=color
  ctx.fillStyle=color
  ctx.globalAlpha=.75
  ctx.lineWidth=8

  ctx.beginPath()
  ctx.arc(0,0,145,0,Math.PI*2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0,0,112,0,Math.PI*2)
  ctx.stroke()

  ctx.textAlign='center'
  ctx.textBaseline='middle'
  ctx.font='700 42px Inter,Arial,sans-serif'

  ctx.fillText(
    text,
    0,
    0
  )

  ctx.font='700 28px Inter,Arial,sans-serif'

  ctx.fillText(
    '1810–1821',
    0,
    55
  )

  const texture=new THREE.CanvasTexture(canvas)

  texture.colorSpace=THREE.SRGBColorSpace
  texture.needsUpdate=true

  return new THREE.Mesh(
    new THREE.PlaneGeometry(.9,.9),
    new THREE.MeshBasicMaterial({
      map:texture,
      transparent:true,
      toneMapped:false,
      depthWrite:false
    })
  )
}

/* Años */
export function createTimelineLabel(
  year,
  active,
  color
){
  const canvas=document.createElement('canvas')
  canvas.width=800
  canvas.height=220

  const ctx=canvas.getContext('2d')
  ctx.clearRect(0,0,800,220)

  ctx.textAlign='center'
  ctx.textBaseline='middle'

  // Tipografía más grande y nítida
  ctx.font=`${active?'700':'600'} ${active?90:68}px "Playfair Display",Georgia,serif`

  // Si está activo usa tu color de acento brillante, si no, un gris claro plateado (#cbd5e1) que contraste con el fondo oscuro
  ctx.fillStyle=active?(color||'#ff4d5e'):'#cbd5e1'

  // Sutil sombra de texto para darle profundidad y legibilidad
  ctx.shadowColor='rgba(0, 0, 0, 0.8)'
  ctx.shadowBlur=6
  ctx.shadowOffsetX=0
  ctx.shadowOffsetY=2

  ctx.fillText(year||'',400,110)

  const texture=new THREE.CanvasTexture(canvas)
  texture.colorSpace=THREE.SRGBColorSpace
  texture.anisotropy=4

  return new THREE.Mesh(
    new THREE.PlaneGeometry(
      active?2.2:1.8,
      active?.68:.52
    ),
    new THREE.MeshBasicMaterial({
      map:texture,
      transparent:true,
      toneMapped:false,
      depthWrite:false
    })
  )
}

export function fitIndependenceArtwork(
  aspect,
  maxW,
  maxH
){
  let width=maxW
  let height=width/aspect

  if(height>maxH){
    height=maxH
    width=height*aspect
  }

  return{
    width,
    height
  }
}

function drawWrappedText(
  ctx,
  text,
  x,
  y,
  maxWidth,
  lineHeight,
  maxLines=2
){
  const words=String(text||'').split(' ')

  let line=''
  let currentY=y
  let lines=0

  for(let i=0;i<words.length;i++){
    const test=line+words[i]+' '

    if(
      ctx.measureText(test).width>maxWidth&&
      line
    ){
      ctx.fillText(
        line.trim(),
        x,
        currentY
      )

      line=words[i]+' '
      currentY+=lineHeight
      lines++

      if(lines>=maxLines-1){
        break
      }
    }else{
      line=test
    }
  }

  if(line&&lines<maxLines){
    ctx.fillText(
      line.trim(),
      x,
      currentY
    )
  }
}