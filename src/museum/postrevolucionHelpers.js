import * as THREE from 'three'

export function createPostFrame(w,h,color='#426c68',main=false){
  const group=new THREE.Group()

  const dark=new THREE.MeshStandardMaterial({color:0x4a514d,roughness:.7,metalness:.04})
  const accent=new THREE.MeshStandardMaterial({color:new THREE.Color(color),roughness:.6,metalness:.08})

  const border=main?.11:.075
  const depth=.065

  const top=new THREE.Mesh(new THREE.BoxGeometry(w+border*2,border,depth),dark)
  const bottom=top.clone()
  const left=new THREE.Mesh(new THREE.BoxGeometry(border,h,depth),dark)
  const right=left.clone()

  top.position.y=h/2+border/2
  bottom.position.y=-h/2-border/2
  left.position.x=-w/2-border/2
  right.position.x=w/2+border/2

  const line=new THREE.Mesh(new THREE.BoxGeometry(w,.035,.025),accent)
  line.position.set(0,-h/2-.02,.06)

  group.add(top,bottom,left,right,line)
  return group
}

export function createPostYearLabel(text,color='#426c68'){
  const canvas=document.createElement('canvas')
  canvas.width=720
  canvas.height=170
  const ctx=canvas.getContext('2d')

  ctx.fillStyle='#f1efe9'
  ctx.fillRect(0,0,720,170)

  ctx.fillStyle=color
  ctx.fillRect(0,0,720,8)

  ctx.fillStyle='#343936'
  ctx.textAlign='center'
  ctx.textBaseline='middle'
  ctx.font='600 52px "Playfair Display",Georgia,serif'
  ctx.fillText(text||'',360,90)

  const texture=new THREE.CanvasTexture(canvas)
  texture.colorSpace=THREE.SRGBColorSpace
  texture.anisotropy=2

  return new THREE.Mesh(
    new THREE.PlaneGeometry(1.85,.44),
    new THREE.MeshBasicMaterial({map:texture,toneMapped:false})
  )
}

export function fitPostArtwork(aspect,maxW,maxH){
  let width=maxW
  let height=width/aspect

  if(height>maxH){
    height=maxH
    width=height*aspect
  }

  return{width,height}
}