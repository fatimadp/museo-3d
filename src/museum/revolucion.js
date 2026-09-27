import * as THREE from 'three'
import { createRevolutionPhotoFrame, fitRevolutionArtwork } from './revolucionHelpers.js'

export function createRevolutionSection({ group, c, index, renderer, textureLoader, clickable, lights }) {
  createArchitecture(group, c, index)

  const gallery = new THREE.Group()
  gallery.position.z = -3.9
  group.add(gallery)

  const layouts = getLayouts(c.gallery?.length || 0)
  // Pasamos el array de luces a createPhotoWall para registrar los focos de piso
  createPhotoWall({ c, index, renderer, textureLoader, gallery, clickable, layouts, lights })
  createSectionTitle(group, c, index)

  lights.push(...createAmbientLighting(group, c.themeColor))
}

// 1. Espaciado mejorado para que las obras luzcan más amplias y proporcionales
function getLayouts(count) {
  if (count <= 1) return [{ x: 0, y: 8.5, maxW: 10.5, maxH: 6.5, main: true }]
  if (count === 2) return [
    { x: -4.8, y: 8.2, maxW: 7.5, maxH: 5.8, main: true },
    { x: 4.8, y: 8.2, maxW: 7.5, maxH: 5.8, main: true }
  ]
  return [
    { x: -7.2, y: 8.0, maxW: 5.5, maxH: 5.2 },
    { x: 0, y: 8.4, maxW: 6.2, maxH: 5.8, main: true },
    { x: 7.2, y: 8.0, maxW: 5.5, maxH: 5.2 }
  ]
}

function createArchitecture(group, c, index) {
  const accent = new THREE.Color(c.themeColor || '#8e4132')
  
  const wall = new THREE.Mesh(new THREE.BoxGeometry(23.7, 15.5, .14), new THREE.MeshStandardMaterial({ color: 0xd9d1c3, roughness: .97, metalness: 0 }))
  wall.position.set(0, 9.25, -4.18); wall.receiveShadow = true; group.add(wall)

  const exhibitPanel = new THREE.Mesh(new THREE.BoxGeometry(21.6, 9.4, .08), new THREE.MeshStandardMaterial({ color: 0xc8b9a5, roughness: .96, metalness: 0 }))
  exhibitPanel.position.set(0, 8.2, -4.02); exhibitPanel.receiveShadow = true; group.add(exhibitPanel)

  const upperBand = new THREE.Mesh(new THREE.BoxGeometry(21.6, 1.15, .06), new THREE.MeshStandardMaterial({ color: 0xe6dfd3, roughness: .96 }))
  upperBand.position.set(0, 13.45, -3.98); group.add(upperBand)

  const lower = new THREE.Mesh(new THREE.BoxGeometry(23.8, 2, .14), new THREE.MeshStandardMaterial({ color: 0x5f4b3a, roughness: .9 }))
  lower.position.set(0, 1.2, -4.12); group.add(lower)

  const divider = new THREE.Mesh(new THREE.BoxGeometry(21.6, .06, .05), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: .45 }))
  divider.position.set(0, 12.85, -3.93); group.add(divider)

  createSectionNumber(group, index, accent)
}

function createSectionNumber(group, index, color) {
  const canvas = document.createElement('canvas'); canvas.width = 500; canvas.height = 300
  const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, 500, 300)
  ctx.fillStyle = `#${color.getHexString()}`; ctx.globalAlpha = .07
  ctx.font = '700 220px "Playfair Display",Georgia,serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(String(index + 1).padStart(2, '0'), 250, 150)

  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.4), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }))
  mesh.position.set(9.2, 13, -3.92); group.add(mesh)
}

// 2. Eliminación de etiquetas blancas e integración de luces de piso
function createPhotoWall({ c, index, renderer, textureLoader, gallery, clickable, layouts, lights }) {
  if (!c.gallery?.length) return

  c.gallery.slice(0, layouts.length).forEach((url, i) => {
    const layout = layouts[i]

    textureLoader.load(url, tex => {
      tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4)
      const aspect = tex.image.width / tex.image.height
      const { width, height } = fitRevolutionArtwork(aspect, layout.maxW, layout.maxH)

      const root = new THREE.Group(); root.position.set(layout.x, layout.y, .12 + i * .01); gallery.add(root)

      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(width + .42, height + .42), new THREE.MeshBasicMaterial({ color: 0x332c26, transparent: true, opacity: .13, depthWrite: false }))
      shadow.position.set(.12, -.14, -.06); root.add(shadow)

      const paper = new THREE.Mesh(new THREE.PlaneGeometry(width + .22, height + .22), new THREE.MeshStandardMaterial({ color: 0xf3eee5, roughness: .96 }))
      paper.position.z = .015; root.add(paper)

      const frame = createRevolutionPhotoFrame(width, height, c.themeColor, layout.main)
      frame.position.z = .04; root.add(frame)

      const image = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: tex, color: 0xffffff, toneMapped: false }))
      image.position.z = .11; image.userData.index = index; root.add(image); clickable.push(image)

      // Nueva luminaria física en el piso apuntando a la obra
      const floorLampGroup = new THREE.Group()
      floorLampGroup.position.set(0, -height / 2 - 1.2, 0.4) // Posición debajo del cuadro

      const lampBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 0.15, 16),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 })
      )
      floorLampGroup.add(lampBase)

      const upSpotLight = new THREE.SpotLight(0xffead0, layout.main ? 3.0 : 2.2, 12, Math.PI / 7, 0.6, 1.5)
      upSpotLight.position.set(0, 0.1, 0)
      upSpotLight.target.position.set(0, height / 2 + 1, -0.4) // Apunta hacia el centro del cuadro
      upSpotLight.userData.activeIntensity = layout.main ? 3.0 : 2.2
      upSpotLight.userData.inactiveIntensity = 0

      floorLampGroup.add(upSpotLight, upSpotLight.target)
      root.add(floorLampGroup)
      lights.push(upSpotLight)

    }, undefined, err => console.error('Error cargando imagen:', url, err))
  })
}

function createSectionTitle(group, c, index) {
  const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 260
  const ctx = canvas.getContext('2d'); const accent = c.themeColor || '#8e4132'

  ctx.clearRect(0, 0, 1600, 260); ctx.fillStyle = accent; ctx.font = '700 28px Inter,Arial,sans-serif'
  ctx.fillText(`CRÓNICA ${String(index + 1).padStart(2, '0')}`, 0, 45)
  ctx.fillStyle = '#29241f'; ctx.font = '600 88px "Playfair Display",Georgia,serif'
  ctx.fillText(c.title || '', 0, 145)
  ctx.fillStyle = '#655c53'; ctx.font = '500 31px Inter,Arial,sans-serif'
  ctx.fillText(`${c.period || ''} · ${c.region || ''}`, 0, 205)

  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(8.3, 1.35), new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }))
  mesh.position.set(-5.7, 13.8, -3.91); group.add(mesh)
}

// 3. Iluminación ambiental simplificada (las luces principales ahora vienen del piso)
function createAmbientLighting(group, color) {
  const lights = []; const accent = new THREE.Color(color || '#8e4132')
  
  const fill = new THREE.PointLight(accent, 0, 14, 2)
  fill.position.set(0, 8, 4)
  fill.userData.activeIntensity = 0.5
  fill.userData.inactiveIntensity = 0
  group.add(fill); lights.push(fill)

  return lights
}