<template>
  <div class="carousel-page">
    <div class="carousel-shell" ref="viewport"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
      @touchstart.prevent="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
      @wheel.passive="onWheel"
    >
      <div class="carousel-track" :style="trackStyle" ref="track">
        <div
          v-for="(card, i) in renderedCards"
          :key="`${card.id}-${i}`"
          class="card-wrap"
          :style="cardStyle(i)"
        >
          <article class="card" :class="{ active: isIndexActive(i) }" :aria-hidden="!isIndexActive(i)">
            <div class="card-media" :style="`background-image: url(${card.img})`"></div>
            <div class="card-body">
              <span class="card-body_span">Имя блогера:</span>
              <h3 class="name">{{ card.name }}</h3>
              <span class="card-body_span">Никнейм в соцсетях:</span>
              <p class="handle">@{{ card.name.toLowerCase().replace(/\s+/g, '') }}</p>
              <span class="card-body_span">Цитата:</span>
              <p class="quote">"{{ card.quote }}"</p>
              <div>
                <a v-for="s in card.socials" :key="s" href="#" class="social">{{ s }}</a>
              </div>
            </div>

          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { baseCards } from '../data/cards'
const CENTRAL_SCALE = 1.2

const viewport = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)

const cards = baseCards
const originalCount = cards.length
const renderedCards = computed(() => [...cards, ...cards, ...cards])

const cfg = {
  baseWidth: 370,
  gap: 0,
  tabletBreakpoint: 1024,
  mobileBreakpoint: 780,
}

const state = reactive({
  pos: 0,
  velocity: 0,
  isDragging: false,
  lastPointerX: 0,
  lastTime: performance.now(),
  width: 0,
  itemWidth: cfg.baseWidth,
  animTo: null as null | { start: number; target: number; startTime: number; dur: number }
})

const oneCopyWidth = computed(() => originalCount * (state.itemWidth + cfg.gap))

function getItemCenter(index: number) {
  return index * (state.itemWidth + cfg.gap) + state.itemWidth / 2
}

function initialCenterPos() {
  const centerIndex = originalCount
  const centerOffset = getItemCenter(centerIndex)
  const vpW = state.width || 0
  return centerOffset - vpW / 2 + state.itemWidth / 2
}

const trackStyle = computed(() => {
  return {
    transform: `translate3d(${-state.pos-7}px, 0, 0)`,
  }
})

function isIndexActive(index: number) {
  const vpCenter = state.pos + state.width / 2
  const itemCenter = getItemCenter(index)
  return Math.abs(itemCenter - vpCenter) < state.itemWidth * 0.6
}

function cardStyle(index: number) {
  const vpCenter = state.pos + state.width / 2
  const itemCenter = getItemCenter(index)
  const d = (itemCenter - vpCenter) / (state.itemWidth + cfg.gap)
  const absd = Math.abs(d)
  const scale = Math.max(0.6, CENTRAL_SCALE - 0.5 * absd)
  const rotate = Math.max(-32, Math.min(32, d * 14))
  const translateZ = -Math.min(380, absd * 220)
  const opacity = Math.max(0.25, 1 - absd * 0.28)
  const zIndex = Math.round(100 - absd * 10)

  return {
    width: `${state.itemWidth}px`,
    marginRight: `${cfg.gap}px`,
    transform: `translateZ(${translateZ}px) rotate(${rotate}deg)`,
    opacity: `${opacity}`,
    zIndex: `${zIndex}`,
    transformStyle: 'preserve-3d' as const,
    '--scale-factor': `${scale}`,
    transition: state.isDragging || state.animTo ? 'transform 0ms' : 'transform 420ms cubic-bezier(.2,.9,.2,1), filter 420ms, opacity 420ms',
  }
}
const MAX_CARD_WIDTH = 340
function recalc() {
  state.width = viewport.value?.clientWidth ?? 0

  let rawWidth: number

  if (state.width <= cfg.mobileBreakpoint) {
    rawWidth = Math.max(220, Math.round(state.width - 120))
  } else if (state.width <= cfg.tabletBreakpoint) {
    rawWidth = Math.max(280, Math.round(state.width * 0.6))
  } else {
    rawWidth = cfg.baseWidth
  }

  state.itemWidth = Math.min(MAX_CARD_WIDTH, rawWidth)
  
  // Устанавливаем CSS-переменную для ограничения ширины
  if (track.value) {
    track.value.style.setProperty('--card-width', `${state.itemWidth}px`)
  }
}

function normalizePos() {
  const one = oneCopyWidth.value
  if (one <= 0) return
  const posMod = ((state.pos % one) + one) % one
  state.pos = posMod + one
}

function nearestIndexToCenter() {
  const vpCenter = state.pos + state.width / 2
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < renderedCards.value.length; i++) {
    const d = Math.abs(getItemCenter(i) - vpCenter)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

function animateToPos(targetPos: number, duration = 480) {
  state.animTo = {
    start: state.pos,
    target: targetPos,
    startTime: performance.now(),
    dur: duration,
  }
  state.velocity = 0
}

function snapToIndex(idx: number, dur = 480) {
  const targetCenter = getItemCenter(idx)
  const desiredPos = targetCenter - state.width / 2
  animateToPos(desiredPos, dur)
}

let rafId = 0
const FRICTION = 0.95
const VEL_THRESHOLD = 0.15

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function rafLoop() {
  const now = performance.now()

  if (state.animTo) {
    const a = state.animTo
    const t = Math.min(1, (now - a.startTime) / a.dur)
    const e = easeOutCubic(t)
    state.pos = a.start + (a.target - a.start) * e
    if (t >= 1) state.animTo = null
  } else if (!state.isDragging) {
    if (Math.abs(state.velocity) > VEL_THRESHOLD) {
      state.pos += state.velocity
      state.velocity *= FRICTION
    } else {
      const nearest = nearestIndexToCenter()
      const center = getItemCenter(nearest)
      const desired = center - state.width / 2
      const diff = desired - state.pos
      if (Math.abs(diff) > 0.5) {
        // small easing towards desired
        state.pos += diff * 0.18
      }
    }
  }

  normalizePos()

  rafId = requestAnimationFrame(rafLoop)
}

let lastMoveTime = performance.now()
function onPointerDown(e: PointerEvent) {
  ;(e.target as Element).setPointerCapture?.(e.pointerId)
  state.isDragging = true
  state.lastPointerX = e.clientX
  state.animTo = null
  state.velocity = 0
  lastMoveTime = performance.now()
}

function onPointerMove(e: PointerEvent) {
  if (!state.isDragging) return
  const now = performance.now()
  const dx = e.clientX - state.lastPointerX
  const dt = Math.max(1, now - lastMoveTime)
  state.lastPointerX = e.clientX
  lastMoveTime = now

  state.pos -= dx
  state.velocity = (dx / dt) * 16 * 0.95
}

function onPointerUp() {
  if (!state.isDragging) return
  state.isDragging = false
  if (Math.abs(state.velocity) > 3.2) {
    const dir = state.velocity < 0 ? 1 : -1
    const current = nearestIndexToCenter()
    snapToIndex(current + dir)
  } else {
    const nearest = nearestIndexToCenter()
    snapToIndex(nearest)
  }
}

function onTouchStart(e: TouchEvent) {
  const touches = e.touches
  if (touches.length === 0) return
  const touch = touches.item(0)
  if (!touch) return
  
  onPointerDown({ 
    clientX: touch.clientX,
    pointerId: touch.identifier,
    target: e.target 
  } as PointerEvent)
}

function onTouchMove(e: TouchEvent) {
  const touches = e.touches
  if (touches.length === 0) return
  const touch = touches.item(0)
  if (!touch) return
  
  onPointerMove({ 
    clientX: touch.clientX
  } as PointerEvent)
}

function onTouchEnd(e: TouchEvent) {
  onPointerUp()
}

let wheelTimer: number | null = null
function onWheel(e: WheelEvent) {
  if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return
  e.preventDefault?.()
  state.pos += e.deltaX
  state.velocity = e.deltaX * 0.6
  if (wheelTimer) window.clearTimeout(wheelTimer)
  wheelTimer = window.setTimeout(() => {
    wheelTimer = null
    const nearest = nearestIndexToCenter()
    snapToIndex(nearest)
  }, 120)
}

onMounted(() => {
  recalc()
  requestAnimationFrame(() => {
    const first = track.value?.querySelector('.card-wrap') as HTMLElement | null
    if (first) {
      const measured = Math.round(first.getBoundingClientRect().width || 0)
      if (measured > 0) state.itemWidth = Math.min(MAX_CARD_WIDTH, measured)
    }
    state.pos = initialCenterPos()
    normalizePos()
  })

  window.addEventListener('resize', recalc)
  rafId = requestAnimationFrame(rafLoop)
})
</script>


<style lang="sass" scoped>
@import url('../assets/styles/_carousel.sass');
</style>
