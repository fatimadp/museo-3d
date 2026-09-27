import * as THREE from 'three'

export function createColonialFrame(w,h){
  const group=new THREE.Group()

  const wood=new THREE.MeshStandardMaterial({
    color:0x4a3425,
    roughness:.66,
    metalness:.02
  })

  const woodInner=new THREE.MeshStandardMaterial({
    color:0x6a4a32,
    roughness:.6,
    metalness:.02
  })

  const gold=new THREE.MeshStandardMaterial({
    color:0xb5944f,
    roughness:.5,
    metalness:.24
  })

  const border=.16
  const depth=.1
  const innerBorder=.055

  const top=new THREE.Mesh(
    new THREE.BoxGeometry(w+border*2,border,depth),
    wood
  )

  const bottom=top.clone()

  const left=new THREE.Mesh(
    new THREE.BoxGeometry(border,h,depth),
    wood
  )

  const right=left.clone()

  top.position.set(0,h/2+border/2,0)
  bottom.position.set(0,-h/2-border/2,0)
  left.position.set(-w/2-border/2,0,0)
  right.position.set(w/2+border/2,0,0)

  const innerTop=new THREE.Mesh(
    new THREE.BoxGeometry(w+.09,innerBorder,.04),
    gold
  )

  const innerBottom=innerTop.clone()

  const innerLeft=new THREE.Mesh(
    new THREE.BoxGeometry(innerBorder,h+.09,.04),
    gold
  )

  const innerRight=innerLeft.clone()

  innerTop.position.set(0,h/2+.035,.065)
  innerBottom.position.set(0,-h/2-.035,.065)
  innerLeft.position.set(-w/2-.035,0,.065)
  innerRight.position.set(w/2+.035,0,.065)

  const outerTop=new THREE.Mesh(
    new THREE.BoxGeometry(w+border*.85,.045,.025),
    woodInner
  )

  const outerBottom=outerTop.clone()

  const outerLeft=new THREE.Mesh(
    new THREE.BoxGeometry(.045,h+border*.85,.025),
    woodInner
  )

  const outerRight=outerLeft.clone()

  outerTop.position.set(0,h/2+border*.65,.058)
  outerBottom.position.set(0,-h/2-border*.65,.058)
  outerLeft.position.set(-w/2-border*.65,0,.058)
  outerRight.position.set(w/2+border*.65,0,.058)

  ;[
    top,
    bottom,
    left,
    right
  ].forEach(mesh=>{
    mesh.castShadow=true
    mesh.receiveShadow=false
  })

  group.add(
    top,
    bottom,
    left,
    right,
    innerTop,
    innerBottom,
    innerLeft,
    innerRight,
    outerTop,
    outerBottom,
    outerLeft,
    outerRight
  )

  return group
}

export function createColonialPlaque(title='',period='',region=''){
  const canvas=document.createElement('canvas')

  /*
  Antes era 4096x1050.
  Lo bajamos para reducir memoria sin perder calidad visible.
  */
  canvas.width=3072
  canvas.height=788

  const ctx=canvas.getContext('2d')

  const scale=canvas.width/4096

  ctx.scale(scale,scale)

  const width=4096
  const height=1050

  const background='#ede2d0'
  const backgroundAlt='#e3d4bf'
  const text='#2b2119'
  const secondary='#5d5044'
  const muted='#7a6c5f'
  const gold='#aa8341'
  const darkGold='#80602f'
  const line='#c8b698'

  /* Fondo */
  const gradient=ctx.createLinearGradient(0,0,width,height)

  gradient.addColorStop(0,background)
  gradient.addColorStop(.5,'#f2e8d8')
  gradient.addColorStop(1,backgroundAlt)

  ctx.fillStyle=gradient
  ctx.fillRect(0,0,width,height)

  /* Franja lateral */
  const stripe=ctx.createLinearGradient(0,0,0,height)

  stripe.addColorStop(0,'#c5a75f')
  stripe.addColorStop(.5,gold)
  stripe.addColorStop(1,darkGold)

  ctx.fillStyle=stripe
  ctx.fillRect(0,0,64,height)

  /* Borde exterior */
  ctx.strokeStyle='rgba(128,96,47,.55)'
  ctx.lineWidth=8
  ctx.strokeRect(
    18,
    18,
    width-36,
    height-36
  )

  /* Detalle decorativo */
  ctx.strokeStyle='rgba(170,131,65,.22)'
  ctx.lineWidth=3

  ctx.beginPath()
  ctx.arc(3720,150,105,0,Math.PI*2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(3720,150,65,0,Math.PI*2)
  ctx.stroke()

  ctx.fillStyle=gold
  ctx.fillRect(200,145,240,8)

  /* Kicker */
  ctx.textBaseline='top'
  ctx.fillStyle=gold
  ctx.font='700 58px Inter,Arial,sans-serif'
  ctx.fillText(
    'EXPOSICIÓN COLONIAL',
    200,
    190
  )

  /* Título */
  ctx.fillStyle=text
  ctx.font='600 215px "Playfair Display",Georgia,serif'

  drawWrappedText(
    ctx,
    title,
    200,
    280,
    3450,
    222,
    2
  )

  /* Separador */
  ctx.fillStyle=line
  ctx.fillRect(
    200,
    710,
    1000,
    5
  )

  /* Periodo */
  ctx.fillStyle=gold
  ctx.font='600 98px "Playfair Display",Georgia,serif'
  ctx.fillText(
    period||'',
    200,
    755
  )

  /* Región */
  ctx.fillStyle=secondary
  ctx.font='600 72px Inter,Arial,sans-serif'
  ctx.fillText(
    region||'',
    200,
    875
  )

  /* Pie */
  ctx.fillStyle=muted
  ctx.font='600 38px Inter,Arial,sans-serif'

  ctx.fillText(
    '',
    200,
    975
  )

  const texture=new THREE.CanvasTexture(canvas)

  texture.colorSpace=THREE.SRGBColorSpace
  texture.anisotropy=4
  texture.magFilter=THREE.LinearFilter
  texture.minFilter=THREE.LinearMipmapLinearFilter
  texture.generateMipmaps=true
  texture.needsUpdate=true

  return new THREE.Mesh(
    new THREE.PlaneGeometry(9.6,2.45),
    new THREE.MeshBasicMaterial({
      map:texture,
      toneMapped:false
    })
  )
}

function drawWrappedText(ctx,text,x,y,maxWidth,lineHeight,maxLines=2){
  const words=String(text||'').split(' ')

  let line=''
  let currentY=y
  let lines=0

  for(let i=0;i<words.length;i++){
    const test=line+words[i]+' '

    if(ctx.measureText(test).width>maxWidth&&line){
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

export function fitArtwork(aspect,maxWidth,maxHeight){
  let width=maxWidth
  let height=width/aspect

  if(height>maxHeight){
    height=maxHeight
    width=height*aspect
  }

  return{
    width,
    height
  }
}