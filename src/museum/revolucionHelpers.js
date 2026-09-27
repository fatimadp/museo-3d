import * as THREE from 'three'

export function createRevolutionPhotoFrame(w,h,color='#8e4132',main=false){
  const group=new THREE.Group()

  const dark=new THREE.MeshStandardMaterial({
    color:0x36312c,
    roughness:.74,
    metalness:.02
  })

  const accent=new THREE.MeshStandardMaterial({
    color:new THREE.Color(color),
    roughness:.62,
    metalness:.05
  })

  const border=main?.12:.085
  const depth=.07

  const top=new THREE.Mesh(new THREE.BoxGeometry(w+border*2,border,depth),dark)
  const bottom=top.clone()
  const left=new THREE.Mesh(new THREE.BoxGeometry(border,h,depth),dark)
  const right=left.clone()

  top.position.y=h/2+border/2
  bottom.position.y=-h/2-border/2
  left.position.x=-w/2-border/2
  right.position.x=w/2+border/2

  const strip=new THREE.Mesh(
    new THREE.BoxGeometry(.04,h,.025),
    accent
  )

  strip.position.set(-w/2-.018,0,.06)

  group.add(top,bottom,left,right,strip)
  return group
}

export function createRevolutionLabel(text,color='#8e4132'){
  const canvas=document.createElement('canvas')
  canvas.width=760
  canvas.height=180
  const ctx=canvas.getContext('2d')

  ctx.fillStyle='#f3eee5'
  ctx.fillRect(0,0,760,180)

  ctx.fillStyle=color
  ctx.fillRect(0,0,10,180)

  ctx.fillStyle='#302b26'
  ctx.textAlign='center'
  ctx.textBaseline='middle'
  ctx.font='600 55px "Playfair Display",Georgia,serif'
  ctx.fillText(text||'',390,90)

  const texture=new THREE.CanvasTexture(canvas)
  texture.colorSpace=THREE.SRGBColorSpace
  texture.anisotropy=2

  return new THREE.Mesh(
    new THREE.PlaneGeometry(1.9,.45),
    new THREE.MeshBasicMaterial({map:texture,toneMapped:false})
  )
}

export function fitRevolutionArtwork(aspect,maxW,maxH){
  let width=maxW
  let height=width/aspect

  if(height>maxH){
    height=maxH
    width=height*aspect
  }

  return{width,height}
}