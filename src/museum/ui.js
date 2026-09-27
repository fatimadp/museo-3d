export function createUI(root,data,onSelect,onMove,onReturn,era){
  const ui=document.createElement('div')
  const mode=era==='La Colonia'?'colonial':era==='La Independencia'?'independence':era==='La Revolución'?'revolution':era==='Post Revolución'?'postrevolution':'prehispanic'

  ui.className=`museum-ui ${mode}-ui`
  ui.style.pointerEvents='none'

  const panel=mode==='colonial'
    ?createColonialPanel()
    :mode==='independence'
      ?createIndependencePanel()
      :mode==='revolution'
        ?createRevolutionPanel()
        :mode==='postrevolution'
          ?createPostRevolutionPanel()
          :''

  const navigation=mode==='independence'
    ?`
      <button id="prev" class="independence-arrow independence-arrow-left" type="button" aria-label="Anterior">←</button>
      <button id="next" class="independence-arrow independence-arrow-right" type="button" aria-label="Siguiente">→</button>
    `
    :mode==='postrevolution'
      ?`
        <nav class="post-nav" style="pointer-events:auto">
          <button id="prev" type="button" aria-label="Anterior">↑</button>
          <div id="timeline-dots" class="post-nav-dots"></div>
          <button id="next" type="button" aria-label="Siguiente">↓</button>
        </nav>
      `
      :`
        <nav class="nav-timeline" style="pointer-events:auto">
          <button id="prev" type="button" aria-label="Anterior">←</button>
          <div id="timeline-dots" class="timeline-eras dots-only"></div>
          <button id="next" type="button" aria-label="Siguiente">→</button>
        </nav>
      `

  ui.innerHTML=`
    <header class="topbar">
      <div style="pointer-events:auto">
        <button id="btn-back" class="btn-back">← Volver a Salas</button>
        <p id="era-eyebrow" class="eyebrow era-eyebrow">Museo Político</p>
        <h1>Transformación del poder</h1>
      </div>
      <div class="counter">
        <strong id="counterNow">01</strong>
        <span>/ ${String(data.length).padStart(2,'0')}</span>
      </div>
    </header>

    ${navigation}
    ${panel}
  `

  root.appendChild(ui)

  const $=s=>ui.querySelector(s)
  const dotsContainer=$('#timeline-dots')
  const dotElements=[]

  if(dotsContainer){
    data.forEach((item,index)=>{
      const button=document.createElement('button')
      button.type='button'
      button.className='dot locked'
      button.title=item.title
      button.innerHTML='<span></span>'
      button.style.setProperty('--c',item.themeColor)
      button.addEventListener('click',()=>onSelect(index))
      dotsContainer.appendChild(button)
      dotElements[index]=button
    })
  }

  $('#prev')?.addEventListener('click',()=>onMove(-1))
  $('#next')?.addEventListener('click',()=>onMove(1))
  $('#btn-back')?.addEventListener('click',onReturn)

  ui.querySelectorAll('.post-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      const target=tab.dataset.postTab

      ui.querySelectorAll('.post-tab').forEach(item=>{
        item.classList.toggle('active',item===tab)
      })

      ui.querySelectorAll('.post-panel').forEach(panel=>{
        panel.classList.toggle('active',panel.dataset.postPanel===target)
      })
    })
  })

  const fields={
    eyebrow:$('#era-eyebrow'),
    counter:$('#counterNow'),
    name:$('#name'),
    period:$('#period'),
    region:$('#region'),
    government:$('#government'),
    designation:$('#designation'),
    change:$('#change'),
    power:$('#power')
  }

  return{
    update(index,maxUnlocked){
      const item=data[index]
      if(!item)return

      fields.eyebrow.textContent=item.era
      fields.counter.textContent=String(index+1).padStart(2,'0')

      if(mode!=='prehispanic'&&fields.name){
        fields.name.textContent=item.title||''
        fields.period.textContent=item.period||''
        fields.region.textContent=item.region||''
        fields.government.textContent=item.politicalFocus?.gobierno||''
        fields.designation.textContent=item.politicalFocus?.designacionPoder||''
        fields.change.textContent=item.politicalFocus?.cambiosSignificativos||''
        fields.power.textContent=item.politicalFocus?.reformasYPoderes||''

        const activePanel=
          mode==='colonial'
            ?$('#art-legend')
            :mode==='independence'
              ?$('#independence-info')
              :mode==='revolution'
                ?$('#revolution-info')
                :mode==='postrevolution'
                  ?$('#postrevolution-info')
                  :null

        activePanel?.style.setProperty('--accent',item.themeColor||'#d4af37')

        ui.querySelectorAll('.lbl').forEach(label=>{
          label.style.color=item.themeColor||'#d4af37'
        })

        if(activePanel&&mode!=='revolution'&&mode!=='postrevolution'){
          activePanel.style.animation='none'
          void activePanel.offsetWidth

          if(mode==='colonial'){
            activePanel.style.animation='colonialFade .35s ease'
          }else if(mode==='independence'){
            activePanel.style.animation='independenceFade .35s ease'
          }
        }

        if(mode==='postrevolution'){
          const firstTab=ui.querySelector('.post-tab[data-post-tab="government"]')
          if(firstTab&&!firstTab.classList.contains('active'))firstTab.click()
        }
      }

      dotElements.forEach((dot,i)=>{
        dot.classList.toggle('active',i===index)

        if(i>maxUnlocked){
          dot.classList.add('locked')
          dot.classList.remove('unlocked')
        }else{
          dot.classList.remove('locked')
          dot.classList.add('unlocked')
        }
      })

      const prev=$('#prev')
      const next=$('#next')

      if(mode==='independence'){
        prev?.classList.toggle('disabled',index===0)
        next?.classList.toggle('disabled',index===data.length-1)
      }else{
        if(prev)prev.disabled=index===0
        if(next)next.disabled=index===data.length-1
      }
    }
  }
}

function createColonialPanel(){
  return`
    <aside id="art-legend" class="art-legend-side" style="pointer-events:auto">
      <div class="legend-header">
        <span class="legend-kicker">Contexto histórico</span>
        <h2 id="name"></h2>
        <div class="legend-meta">
          <span id="period"></span>
          <span id="region"></span>
        </div>
      </div>

      <div class="legend-content-vertical">
        ${createBlocks()}
      </div>
    </aside>
  `
}

function createIndependencePanel(){
  return`
    <aside id="independence-info" class="independence-info" style="pointer-events:auto">
      <div class="independence-room-header">
        <div class="independence-room-number">ARCHIVO 1810—1821</div>
        <span class="independence-kicker">La Independencia</span>
        <h2 id="name"></h2>

        <div class="independence-meta">
          <span id="period"></span>
          <span id="region"></span>
        </div>
      </div>

      <div class="independence-exhibition">
        <article class="museum-plinth museum-plinth-1">
          <div class="plinth-icon government-icon"><span></span></div>
          <div class="plinth-content">
            <span class="lbl">Gobierno</span>
            <p id="government"></p>
          </div>
          <span class="plinth-number">01</span>
        </article>

        <article class="museum-plinth museum-plinth-2">
          <div class="plinth-icon power-icon"><span></span></div>
          <div class="plinth-content">
            <span class="lbl">Designación del poder</span>
            <p id="designation"></p>
          </div>
          <span class="plinth-number">02</span>
        </article>

        <article class="museum-plinth museum-plinth-3">
          <div class="plinth-icon change-icon"><span></span></div>
          <div class="plinth-content">
            <span class="lbl">Cambios significativos</span>
            <p id="change"></p>
          </div>
          <span class="plinth-number">03</span>
        </article>

        <article class="museum-plinth museum-plinth-4">
          <div class="plinth-icon reform-icon"><span></span></div>
          <div class="plinth-content">
            <span class="lbl">Reformas y poder</span>
            <p id="power"></p>
          </div>
          <span class="plinth-number">04</span>
        </article>
      </div>

      <div class="museum-floor-mark">
        <span></span>
        RECORRIDO DOCUMENTAL
      </div>
    </aside>
  `
}

function createRevolutionPanel(){
  return`
    <section id="revolution-info" class="revolution-info" style="pointer-events:auto">
      <div class="revolution-info-main">
        <div class="revolution-heading">
          <span class="revolution-kicker">La Revolución</span>
          <h2 id="name"></h2>

          <div class="revolution-meta">
            <span id="period"></span>
            <span id="region"></span>
          </div>
        </div>

        <div class="revolution-data-grid">
          <article class="revolution-data revolution-government">
            <div class="revolution-icon icon-government"></div>
            <div>
              <span class="lbl">Gobierno</span>
              <p id="government"></p>
            </div>
          </article>

          <article class="revolution-data revolution-power">
            <div class="revolution-icon icon-power"></div>
            <div>
              <span class="lbl">Designación del poder</span>
              <p id="designation"></p>
            </div>
          </article>

          <article class="revolution-data revolution-change">
            <div class="revolution-icon icon-change"></div>
            <div>
              <span class="lbl">Cambios significativos</span>
              <p id="change"></p>
            </div>
          </article>

          <article class="revolution-data revolution-reform">
            <div class="revolution-icon icon-reform"></div>
            <div>
              <span class="lbl">Reformas y poder</span>
              <p id="power"></p>
            </div>
          </article>
        </div>
      </div>
    </section>
  `
}

function createPostRevolutionPanel(){
  return`
    <section id="postrevolution-info" class="postrevolution-kiosk" style="pointer-events:auto">
      <span class="postrevolution-kicker">México posrevolucionario</span>
      <h2 id="name"></h2>

      <div class="postrevolution-meta">
        <span id="period"></span>
        <span>·</span>
        <span id="region"></span>
      </div>

      <div class="postrevolution-tabs">
        <button class="post-tab active" data-post-tab="government" type="button">Gobierno</button>
        <button class="post-tab" data-post-tab="power" type="button">Poder</button>
        <button class="post-tab" data-post-tab="change" type="button">Cambios</button>
        <button class="post-tab" data-post-tab="reform" type="button">Reformas</button>
      </div>

      <div class="post-panel post-panel-government active" data-post-panel="government">
        <div class="post-icon"></div>
        <div>
          <span class="lbl">Gobierno</span>
          <p id="government"></p>
        </div>
      </div>

      <div class="post-panel post-panel-power" data-post-panel="power">
        <div class="post-icon"></div>
        <div>
          <span class="lbl">Designación del poder</span>
          <p id="designation"></p>
        </div>
      </div>

      <div class="post-panel post-panel-change" data-post-panel="change">
        <div class="post-icon"></div>
        <div>
          <span class="lbl">Cambios significativos</span>
          <p id="change"></p>
        </div>
      </div>

      <div class="post-panel post-panel-reform" data-post-panel="reform">
        <div class="post-icon"></div>
        <div>
          <span class="lbl">Reformas y poder</span>
          <p id="power"></p>
        </div>
      </div>
    </section>
  `
}

function createBlocks(className='legend-col'){
  return`
    <div class="${className}">
      <span class="lbl">Gobierno</span>
      <p id="government"></p>
    </div>

    <div class="${className}">
      <span class="lbl">Designación del poder</span>
      <p id="designation"></p>
    </div>

    <div class="${className}">
      <span class="lbl">Cambios significativos</span>
      <p id="change"></p>
    </div>

    <div class="${className}">
      <span class="lbl">Reformas y poder</span>
      <p id="power"></p>
    </div>
  `
}