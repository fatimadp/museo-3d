import './style.css'
import './colonial.css'
import './prehispanic.css'
import './independencia.css'
import './revolucion.css'
import './postrevolucion.css'

import { historicalData } from './data/historyData.js'
import { createUI } from './museum/ui.js'
import { createMuseum } from './museum/scene.js'

const app = document.querySelector('#app')

let current = 0
let maxUnlocked = 0
let currentEraData = []
let museum = null
let ui = null

// Salas
const museumRooms = [
  {
    id: 'prehispanicos',
    number: '01',
    name: 'Pueblos Prehispánicos',
    period: 'Antes de 1521',
    description: 'Civilizaciones, centros de poder y formas de organización política antes de la conquista.',
    accent: '#b99336'
  },
  {
    id: 'colonia',
    number: '02',
    name: 'La Colonia',
    period: '1521 — 1810',
    description: 'La Nueva España y la transformación del poder bajo el dominio de la Corona.',
    accent: '#a57b46'
  },
  {
    id: 'independencia',
    number: '03',
    name: 'La Independencia',
    period: '1810 — 1821',
    description: 'El rompimiento del orden virreinal y el nacimiento de un nuevo Estado.',
    accent: '#9f3040'
  },
  {
    id: 'revolucion',
    number: '04',
    name: 'La Revolución',
    period: '1910 — 1920',
    description: 'La ruptura del orden político y la lucha por una nueva organización del poder.',
    accent: '#8e4132'
  },
  {
    id: 'post-revolucion',
    number: '05',
    name: 'Post Revolución',
    period: '1920 — 1940',
    description: 'La reconstrucción del Estado y la formación de nuevas instituciones políticas.',
    accent: '#426c68'
  }
]

app.innerHTML = `
    <div id="home-menu" class="home-menu">
      <div class="home-noise"></div>
      <div class="home-glow"></div>

      <main class="home-content">
        <header class="home-header">
          <div class="home-heading">
            <p class="home-eyebrow">Museo Virtual Interactivo</p>

            <h1 class="home-title">
              Transformación del
              <span>Poder Político</span>
              en México
            </h1>
          </div>

          <div class="home-intro">
            <p class="home-desc">
              Recorre la transformación de las estructuras de poder,
              el gobierno y sus instituciones a través del tiempo.
            </p>

            <button id="start-tour" class="start-tour" type="button">
              <span>Iniciar recorrido</span>
              <span class="start-tour-arrow">→</span>
            </button>
          </div>
        </header>

        <section class="museum-timeline">
          <div class="timeline-caption">
            <span>Recorrido histórico</span>
            <span>Cinco etapas · Una transformación</span>
          </div>

          <div id="era-buttons" class="era-buttons"></div>
        </section>
      </main>

      <footer class="home-footer">
        <span>01</span>
        <span class="footer-line"></span>
        <span>05</span>
        <span class="footer-copy">Explora el tiempo</span>
      </footer>
    </div>

    <div id="museum-container" class="museum-container hidden"></div>
  `

const eraButtonsContainer = document.querySelector('#era-buttons')

// Crear línea del tiempo
museumRooms.forEach(room => {
  const hasContent = historicalData.some(item => item.era === room.name)
  const button = document.createElement('button')

  button.type = 'button'
  button.className = `era-btn ${hasContent ? '' : 'coming-soon'}`
  button.style.setProperty('--accent', room.accent)

  button.innerHTML = `
      <div class="era-node"><span></span></div>

      <div class="era-content">
        <div class="era-number">${room.number}</div>
        <div class="era-period">${room.period}</div>

        <h2>${room.name}</h2>

        <p class="era-description">${room.description}</p>

        <div class="era-action">
          ${hasContent
      ? '<span>Explorar sala</span><span>→</span>'
      : '<span>Próximamente</span>'
    }
        </div>
      </div>
    `

  if (hasContent) {
    button.addEventListener('click', () => startMuseum(room.name))
  }

  eraButtonsContainer.appendChild(button)
})

// Iniciar recorrido
document.querySelector('#start-tour').addEventListener('click', () => {
  const firstRoom = museumRooms.find(room =>
    historicalData.some(item => item.era === room.name)
  )

  if (firstRoom) startMuseum(firstRoom.name)
})

// Iniciar museo
function startMuseum(selectedEra) {
  const home = document.querySelector('#home-menu')
  const container = document.querySelector('#museum-container')

  if (museum?.dispose) museum.dispose()

  home.classList.add('home-leaving')

  setTimeout(() => {
    home.classList.add('hidden')
    home.classList.remove('home-leaving')

    container.classList.remove('hidden')
    container.innerHTML = ''

    currentEraData = historicalData.filter(item => item.era === selectedEra)

    if (!currentEraData.length) {
      returnToMenu()
      return
    }

    current = 0
    maxUnlocked = 0

    ui = createUI(
      container,
      currentEraData,
      select,
      move,
      returnToMenu,
      selectedEra
    )

    museum = createMuseum(
      container,
      currentEraData,
      select,
      selectedEra
    )

    ui.update(0, 0)
  }, 500)
}

// Volver al menú
function returnToMenu() {
  const container = document.querySelector('#museum-container')
  const home = document.querySelector('#home-menu')

  if (museum?.dispose) museum.dispose()

  museum = null
  ui = null
  current = 0
  maxUnlocked = 0
  currentEraData = []

  container.innerHTML = ''
  container.classList.add('hidden')

  home.classList.remove('hidden')
  home.classList.add('home-entering')

  setTimeout(() => {
    home.classList.remove('home-entering')
  }, 700)
}

// Navegación
function select(index) {
  // 1. Detectar intención de saltar de época hacia adelante
  if (index === 'next-section') {
    const currentRoomIndex = museumRooms.findIndex(room => room.name === currentEraData[0].era);
    if (currentRoomIndex !== -1 && currentRoomIndex < museumRooms.length - 1) {
      // Buscar la siguiente sala que tenga contenido
      let nextRoomIndex = currentRoomIndex + 1;
      while (nextRoomIndex < museumRooms.length) {
        const nextRoomName = museumRooms[nextRoomIndex].name;
        if (historicalData.some(item => item.era === nextRoomName)) {
          // Encontramos la siguiente sala, saltar a ella
          startMuseum(nextRoomName);
          return;
        }
        nextRoomIndex++;
      }
    }
    // Si no hay siguiente sala con contenido, te manda al menú
    returnToMenu();
    return;
  }

  // 2. Detectar intención de regresar a la sala anterior (opcional)
  if (index === 'prev-section') {
    // Si quieres que retroceder en la primera obra te lleve a la sala anterior
    // puedes programarlo aquí. Por ahora, lo mandaremos al menú general.
    returnToMenu();
    return;
  }

  // 3. Comportamiento normal (navegar entre obras)
  if (typeof index !== 'number' || index < 0 || index >= currentEraData.length) return
  if (index > maxUnlocked + 1) return

  current = index

  if (current > maxUnlocked) {
    maxUnlocked = current
  }

  ui?.update(current, maxUnlocked)
  museum?.goTo(current)
}

function move(step){
  const nextIndex = current + step;

  // Si intenta ir más allá de la última imagen
  if (nextIndex >= currentEraData.length) {
    select('next-section');
    return;
  }

  // Si intenta retroceder antes de la primera imagen
  if (nextIndex < 0) {
    select('prev-section');
    return;
  }

  select(nextIndex);
}

// Teclado
addEventListener('keydown',event=>{
  const home=document.querySelector('#home-menu')
  if(!home.classList.contains('hidden'))return

  if(event.key==='ArrowLeft'||event.key==='ArrowUp'){
    event.preventDefault()
    move(-1)
  }

  if(event.key==='ArrowRight'||event.key==='ArrowDown'){
    event.preventDefault()
    move(1)
  }

  if(event.key==='Escape'){
    returnToMenu()
  }
})

// Teclado
addEventListener('keydown', event => {
  const home = document.querySelector('#home-menu')

  if (!home.classList.contains('hidden')) return

  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    move(-1)
  }

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    move(1)
  }

  if (event.key === 'Escape') {
    returnToMenu()
  }
})