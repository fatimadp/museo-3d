import * as THREE from 'three'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js'
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

export function getMuseumMode(era){
  if(era==='La Colonia')return'colonial'
  if(era==='La Independencia')return'independence'
  if(era==='La Revolución')return'revolution'
  if(era==='Post Revolución')return'postrevolution'
  return'prehispanic'
}

export function getMuseumViewportSize(container,mode){
  const fullWidth=container.clientWidth||innerWidth
  const height=container.clientHeight||innerHeight
  const ratio=mode==='colonial'?.62:mode==='independence'?.64:1
  return{width:Math.floor(fullWidth*ratio),height}
}

export function createMuseumSetup(container,mode){
  const colors={
    colonial:0x17130f,
    independence:0xd9dee4,
    revolution:0xd7d0c3,
    postrevolution:0xd8d7cf,
    prehispanic:0xe2d9ca
  }

  const scene=new THREE.Scene()
  scene.background=new THREE.Color(colors[mode])

  const fogDensity=
    mode==='colonial'?.009:
    mode==='independence'?.01:
    mode==='revolution'?.0045:
    mode==='postrevolution'?.004:
    .0045

  scene.fog=new THREE.FogExp2(colors[mode],fogDensity)

  const{width,height}=getMuseumViewportSize(container,mode)

  const camera=new THREE.PerspectiveCamera(40,width/height,.1,180)

  camera.position.set(
    0,
    mode==='colonial'?8.2:
    mode==='independence'?8.1:
    mode==='revolution'?7:
    mode==='postrevolution'?7.2:
    5.4,
    mode==='colonial'?24:
    mode==='independence'?22:
    mode==='revolution'?21:
    mode==='postrevolution'?21.5:
    18.5
  )

  const renderer=new THREE.WebGLRenderer({
    antialias:true,
    powerPreference:'high-performance'
  })

  renderer.setSize(width,height)
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5))
  renderer.shadowMap.enabled=true
  renderer.shadowMap.type=THREE.PCFSoftShadowMap
  renderer.outputColorSpace=THREE.SRGBColorSpace
  renderer.toneMapping=THREE.ACESFilmicToneMapping

  renderer.toneMappingExposure=
    mode==='independence'?1.12:
    mode==='prehispanic'?1.18:
    mode==='postrevolution'?1.1:
    1.08

  renderer.domElement.style.position='absolute'
  renderer.domElement.style.left='0'
  renderer.domElement.style.top='0'
  container.appendChild(renderer.domElement)

  const composer=new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene,camera))

  const bloom=new UnrealBloomPass(
    new THREE.Vector2(width,height),
    .3,
    .4,
    .9
  )

  bloom.threshold=1.15

  bloom.strength=
    mode==='prehispanic'?.05:
    mode==='independence'?.08:
    mode==='postrevolution'?.035:
    .05

  bloom.radius=
    mode==='prehispanic'?.08:
    mode==='postrevolution'?.08:
    .12

  composer.addPass(bloom)

  createBaseLighting(scene,mode)

  return{scene,camera,renderer,composer,bloom}
}

function createBaseLighting(scene,mode){
  if(mode==='colonial'){
    scene.add(new THREE.HemisphereLight(0xfff1d7,0x25180e,.9))

    const main=new THREE.DirectionalLight(0xffe3bd,1)
    main.position.set(5,15,12)
    main.castShadow=true
    main.shadow.mapSize.set(2048,2048)

    scene.add(main)
    return
  }

  if(mode==='independence'){
    scene.add(new THREE.HemisphereLight(0xd8dfec,0x11131a,.65))

    const main=new THREE.DirectionalLight(0xffe4c4,.9)
    main.position.set(4,15,10)
    main.castShadow=true
    main.shadow.mapSize.set(2048,2048)

    const fill=new THREE.DirectionalLight(0x667a9f,.3)
    fill.position.set(-7,8,4)

    scene.add(main,fill)
    return
  }

  if(mode==='revolution'){
    scene.add(new THREE.HemisphereLight(0xfff1df,0x5c554d,.85))

    const main=new THREE.DirectionalLight(0xffe8c9,.9)
    main.position.set(4,14,10)
    main.castShadow=false

    const fill=new THREE.DirectionalLight(0xa99b8c,.28)
    fill.position.set(-7,8,5)

    const front=new THREE.DirectionalLight(0xffffff,.18)
    front.position.set(0,7,12)

    scene.add(main,fill,front)
    return
  }

  if(mode==='postrevolution'){
    scene.add(new THREE.HemisphereLight(0xf7f4ea,0x59645f,.88))

    const main=new THREE.DirectionalLight(0xffead2,.82)
    main.position.set(5,14,11)
    main.castShadow=false

    const fill=new THREE.DirectionalLight(0xb8c1bb,.32)
    fill.position.set(-7,8,5)

    const front=new THREE.DirectionalLight(0xffffff,.22)
    front.position.set(0,7,12)

    const accent=new THREE.DirectionalLight(0x9fb6ae,.12)
    accent.position.set(8,6,4)

    scene.add(main,fill,front,accent)
    return
  }

  /* Prehispánico */
  scene.add(new THREE.HemisphereLight(0xfff8eb,0x8b7761,.95))

  const main=new THREE.DirectionalLight(0xffead0,.95)
  main.position.set(4,14,10)
  main.castShadow=false

  const fill=new THREE.DirectionalLight(0xc49263,.3)
  fill.position.set(-8,7,5)

  const front=new THREE.DirectionalLight(0xffffff,.2)
  front.position.set(0,6,12)

  scene.add(main,fill,front)
}

export function createMuseumFloor(scene,width,mode){
  const color=
    mode==='colonial'?0x302218:
    mode==='independence'?0x8b8f92:
    mode==='revolution'?0x756d64:
    mode==='postrevolution'?0x7c847f:
    0xb9ad9b

  const floor=new THREE.Mesh(
    new THREE.PlaneGeometry(width,70),
    new THREE.MeshStandardMaterial({
      color,
      roughness:
        mode==='colonial'?.68:
        mode==='prehispanic'?.92:
        mode==='postrevolution'?.86:
        .88,
      metalness:
        mode==='independence'?.06:
        mode==='postrevolution'?.025:
        0
    })
  )

  floor.rotation.x=-Math.PI/2
  floor.receiveShadow=true
  scene.add(floor)
}