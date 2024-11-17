<template>
  <div class="bouquet-customizer bg-light min-vh-100" @keydown="handleKeydown" tabindex="0">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">
          <i class="bi bi-flower1 me-2"></i>
          Bouquet Customizer Pro
        </a>
        <div class="d-flex align-items-center">
          <button class="btn btn-outline-light me-2" @click="undo" :disabled="!canUndo">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
          <button class="btn btn-outline-light me-2" @click="redo" :disabled="!canRedo">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
          <button class="btn btn-light" @click="exportImage">
            <i class="bi bi-download me-1"></i> Export
          </button>
        </div>
      </div>
    </nav>

    <div class="container-fluid mt-3">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-lg-3 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title mb-3">Canvas Settings</h5>
              <div class="mb-3">
                <label for="canvasSize" class="form-label">Canvas Size:</label>
                <select id="canvasSize" v-model="canvasSize" class="form-select" @change="updateCanvasSize">
                  <option value="small">Small (600x400)</option>
                  <option value="large">Large (900x600)</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="canvasColor" class="form-label">Background Color:</label>
                <input type="color" id="canvasColor" v-model="canvasBackgroundColor" @change="updateCanvasColor" class="form-control form-control-color w-100">
              </div>
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="gridToggle" v-model="showGrid">
                <label class="form-check-label" for="gridToggle">Show Grid</label>
              </div>
            </div>
          </div>

          <div class="card mt-3">
            <div class="card-body">
              <h5 class="card-title mb-3">Elements</h5>
              <div class="input-group mb-3">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input type="text" class="form-control" v-model="searchQuery" placeholder="Search items...">
              </div>
              <ul class="nav nav-tabs" id="elementTabs" role="tablist">
                <li class="nav-item" role="presentation" v-for="(category, index) in categories" :key="category.name">
                  <button 
                    class="nav-link" 
                    :class="{ 'active': index === 0 }" 
                    :id="`${category.name.toLowerCase()}-tab`" 
                    data-bs-toggle="tab" 
                    :data-bs-target="`#${category.name.toLowerCase()}`" 
                    type="button" 
                    role="tab" 
                    :aria-controls="category.name.toLowerCase()" 
                    :aria-selected="index === 0"
                  >
                    {{ category.name }}
                  </button>
                </li>
              </ul>
              <div class="tab-content mt-3" id="elementTabsContent">
                <div 
                  v-for="(category, index) in filteredCategories" 
                  :key="category.name"
                  class="tab-pane fade" 
                  :class="{ 'show active': index === 0 }"
                  :id="category.name.toLowerCase()" 
                  role="tabpanel" 
                  :aria-labelledby="`${category.name.toLowerCase()}-tab`"
                >
                  <div class="row g-2">
                    <div v-for="item in category.items" :key="item.id" class="col-6">
                      <div class="item-option p-2 border rounded text-center" @click="addItem(item)" :title="item.name">
                        <img :src="item.image" :alt="item.name" class="img-fluid mb-2 rounded">
                        <small class="d-block text-muted">{{ item.name }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Canvas Area -->
        <div class="col-lg-9">
          <div class="canvas-container bg-white border rounded p-3 position-relative" ref="canvasContainer">
            <div 
              class="canvas-area" 
              ref="canvasArea" 
              @mousedown="startDrag" 
              @mousemove="onDrag" 
              @mouseup="stopDrag"
              @mouseleave="stopDrag"
              @touchstart="startDrag"
              @touchmove="onDrag"
              @touchend="stopDrag"
              @click.self="clearSelection"
              :class="{ 'show-grid': showGrid }"
              :style="canvasStyle"
            >
              <transition-group name="canvas-item">
                <div 
                  v-for="(item, index) in items" 
                  :key="item.id" 
                  :style="getItemStyle(item)"
                  :class="{ 'selected': selectedItemIndex === index }"
                  @mousedown.stop="selectItem(index, $event)"
                  @touchstart.stop="selectItem(index, $event)"
                  class="bouquet-item"
                >
                  <img :src="item.image" :alt="item.name" draggable="false">
                  <div v-if="selectedItemIndex === index" class="item-controls">
                    <button @click.stop="rotateItem(index, -45)" class="btn btn-sm btn-light" title="Rotate Left">
                      <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                    <button @click.stop="rotateItem(index, 45)" class="btn btn-sm btn-light" title="Rotate Right">
                      <i class="bi bi-arrow-clockwise"></i>
                    </button>
                    <button @click.stop="flipItem(index)" class="btn btn-sm btn-light" title="Flip Horizontally">
                      <i class="bi bi-arrow-left-right"></i>
                    </button>
                    <button @click.stop="changeItemSize(index, 1.1)" class="btn btn-sm btn-light" title="Increase Size">
                      <i class="bi bi-zoom-in"></i>
                    </button>
                    <button @click.stop="changeItemSize(index, 0.9)" class="btn btn-sm btn-light" title="Decrease Size">
                      <i class="bi bi-zoom-out"></i>
                    </button>
                    <button @click.stop="removeItem(index)" class="btn btn-sm btn-danger" title="Remove Item">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                  <div v-if="selectedItemIndex === index" class="resize-handle" @mousedown.stop="startResize($event, index)" @touchstart.stop="startResize($event, index)"></div>
                </div>
              </transition-group>
            </div>
          </div>

          <!-- Layer Panel -->
          <div class="card mt-3">
            <div class="card-body">
              <h5 class="card-title mb-3">Layers</h5>
              <div class="layer-list">
                <div 
                  v-for="(item, index) in items" 
                  :key="item.id" 
                  class="layer-item d-flex align-items-center mb-2 p-2 border rounded"
                  draggable="true"
                  @dragstart="startLayerDrag(index, $event)"
                  @dragover.prevent
                  @dragenter.prevent
                  @drop="onLayerDrop(index, $event)"
                >
                  <i class="bi bi-grip-vertical me-2 text-muted"></i>
                  <img :src="item.image" :alt="item.name" class="layer-thumbnail me-2" width="30" height="30">
                  <span class="flex-grow-1">{{ item.name }}</span>
                  <button @click="toggleItemVisibility(index)" class="btn btn-sm btn-light me-1">
                    <i :class="item.visible ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
                  </button>
                  <button @click="bringToFront(index)" class="btn btn-sm btn-light me-1" title="Bring to Front">
                    <i class="bi bi-front"></i>
                  </button>
                  <button @click="sendToBack(index)" class="btn btn-sm btn-light me-1" title="Send to Back">
                    <i class="bi bi-back"></i>
                  </button>
                  <button @click="removeItem(index)" class="btn btn-sm btn-danger">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const items = ref([])
const selectedItemIndex = ref(-1)
const isDragging = ref(false)
const isResizing = ref(false)
const startX = ref(0)
const startY = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)
const canvasArea = ref(null)
const canvasContainer = ref(null)
const history = ref([])
const historyIndex = ref(-1)
const searchQuery = ref('')
const canvasBackgroundColor = ref('#ffffff')
const showGrid = ref(false)
const canvasSize = ref('small')

const canvasStyle = computed(() => ({
  backgroundColor: canvasBackgroundColor.value,
  width: canvasSize.value === 'small' ? '600px' : '900px',
  height: canvasSize.value === 'small' ? '400px' : '600px',
}))

const categories = [
  {
    name: 'Flowers',
    items: [
      { id: 1, name: 'Rose', image: '/src/assets/images/flowers/rose.png' },
      { id: 2, name: 'Tulip', image: '/src/assets/images/flowers/lily.png' },
      { id: 3, name: 'Lily', image: '/flower-bouquet.jpg' },
      { id: 4, name: 'Sunflower', image: '/flower-bouquet.jpg' },
    ]
  },
  {
    name: 'Greenery',
    items: [
      { id: 5, name: 'Fern', image: '/flower-bouquet.jpg' },
      { id: 6, name: 'Eucalyptus', image: '/flower-bouquet.jpg' },
      { id: 7, name: 'Baby\'s Breath', image: '/flower-bouquet.jpg' },
    ]
  },
  {
    name: 'Accessories',
    items: [
      { id: 8, name: 'Ribbon', image: '/src/assets/images/flowers/whiteribbon.png' },
      { id: 9, name: 'Wrapper', image: '/src/assets/images/flowers/wrapper (1).png' },
      { id: 10, name: 'Card', image: '/flower-bouquet.jpg' },
    ]
  }
]

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories
  return categories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })).filter(category => category.items.length > 0)
})

const addItem = (item) => {
  const newItem = {
    ...item,
    x: Math.random() * (canvasArea.value.clientWidth - 100),
    y: Math.random() * (canvasArea.value.clientHeight - 100),
    rotation: 0,
    scale: 1,
    flipped: false,
    width: 100,
    height: 100,
    visible: true
  }
  items.value.push(newItem)
  addToHistory()
}

const selectItem = (index, event) => {
  selectedItemIndex.value = index
  if (index !== -1) {
    startDrag(event)
  }
}

const startDrag = (event) => {
  if (selectedItemIndex.value === -1) return
  isDragging.value = true
  const rect = canvasArea.value.getBoundingClientRect()
  const clientX = event.clientX || (event.touches && event.touches[0].clientX)
  const clientY = event.clientY || (event.touches && event.touches[0].clientY)
  startX.value = clientX - rect.left
  startY.value = clientY - rect.top
  const item = items.value[selectedItemIndex.value]
  offsetX.value = item.x - (clientX - rect.left)
  offsetY.value = item.y - (clientY - rect.top)
}

const onDrag = (event) => {
  if (!isDragging.value || selectedItemIndex.value === -1) return
  const rect = canvasArea.value.getBoundingClientRect()
  const clientX = event.clientX || (event.touches && event.touches[0].clientX)
  const clientY = event.clientY || (event.touches && event.touches[0].clientY)
  if (clientX === undefined || clientY === undefined) return

  const item = items.value[selectedItemIndex.value]
  const x = clientX - rect.left + offsetX.value
  const y = clientY - rect.top + offsetY.value

  item.x = Math.max(0, Math.min(x, rect.width - item.width))
  item.y = Math.max(0, Math.min(y, rect.height - item.height))
}

const stopDrag = () => {
  if (isDragging.value) {
    isDragging.value = false
    addToHistory()
  }
}

const clearSelection = () => {
  selectedItemIndex.value = -1
}

const startResize = (event, index) => {
  isResizing.value = true
  selectedItemIndex.value = index
  const clientX = event.clientX || (event.touches && event.touches[0].clientX)
  const clientY = event.clientY || (event.touches && event.touches[0].clientY)
  startX.value = clientX
  startY.value = clientY
}

const onResize = (event) => {
  if (!isResizing.value || selectedItemIndex.value === -1) return
  const clientX = event.clientX || (event.touches && event.touches[0].clientX)
  const clientY = event.clientY || (event.touches && event.touches[0].clientY)
  if (clientX === undefined || clientY === undefined) return
  const dx = clientX - startX.value
  const dy = clientY - startY.value
  const item = items.value[selectedItemIndex.value]
  const aspectRatio = item.width / item.height
  const newWidth = Math.max(20, item.width + dx)
  const newHeight = newWidth / aspectRatio
  item.width = newWidth
  item.height = newHeight
  item.scale = newWidth / 100
  startX.value = clientX
  startY.value = clientY
}

const stopResize = () => {
  if (isResizing.value) {
    isResizing.value = false
    addToHistory()
  }
}

const rotateItem = (index, angle) => {
  items.value[index].rotation += angle
  addToHistory()
}

const flipItem = (index) => {
  items.value[index].flipped = !items.value[index].flipped
  addToHistory()
}

const removeItem = (index) => {
  items.value.splice(index, 1)
  selectedItemIndex.value = -1
  addToHistory()
}

const getItemStyle = (item) => {
  const transform = [
    `translate(${item.x}px, ${item.y}px)`,
    `rotate(${item.rotation}deg)`,
    `scale(${item.scale})`,
    item.flipped ? 'scaleX(-1)' : ''
  ].filter(Boolean).join(' ')

  return {
    width: `${item.width}px`,
    height: `${item.height}px`,
    transform,
    position: 'absolute',
    cursor: 'move',
    transformOrigin: 'center center',
    display: item.visible ? 'block' : 'none',
  }
}

const changeItemSize = (index, factor) => {
  const item = items.value[index]
  const canvasWidth = canvasArea.value.clientWidth
  const canvasHeight = canvasArea.value.clientHeight

  // Store original center position
  const originalCenterX = item.x + (item.width / 2)
  const originalCenterY = item.y + (item.height / 2)

  // Calculate new dimensions while maintaining aspect ratio
  const newWidth = Math.min(Math.max(20, item.width * factor), canvasWidth)
  const aspectRatio = item.height / item.width
  const newHeight = newWidth * aspectRatio

  // Don't proceed if new size would exceed canvas bounds
  if (newHeight > canvasHeight) return

  // Update size
  const widthDiff = newWidth - item.width
  const heightDiff = newHeight - item.height

  // Calculate new position to maintain center point
  const newX = originalCenterX - (newWidth / 2)
  const newY = originalCenterY - (newHeight / 2)

  // Apply changes only if the new position would be within canvas bounds
  if (newX >= 0 && newX + newWidth <= canvasWidth && 
      newY >= 0 && newY + newHeight <= canvasHeight) {
    item.width = newWidth
    item.height = newHeight
    item.x = newX
    item.y = newY
    item.scale = newWidth / 100 // Update scale based on new width
    addToHistory()
  }
}

const addToHistory = () => {
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(JSON.parse(JSON.stringify(items.value)))
  historyIndex.value = history.value.length - 1
  saveToLocalStorage()
}

const undo = () => {
  if (canUndo.value) {
    historyIndex.value--
    items.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    saveToLocalStorage()
  }
}

const redo = () => {
  if (canRedo.value) {
    historyIndex.value++
    items.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    saveToLocalStorage()
  }
}

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const updateCanvasColor = () => {
  addToHistory()
}

const updateCanvasSize = () => {
  const oldWidth = canvasArea.value.clientWidth
  const oldHeight = canvasArea.value.clientHeight
  const newWidth = canvasSize.value === 'small' ? 600 : 900
  const newHeight = canvasSize.value === 'small' ? 400 : 600

  items.value.forEach(item => {
    item.x = (item.x / oldWidth) * newWidth
    item.y = (item.y / oldHeight) * newHeight
  })

  addToHistory()
}

const toggleItemVisibility = (index) => {
  items.value[index].visible = !items.value[index].visible
  addToHistory()
}

const exportImage = async () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = canvasArea.value.clientWidth
  canvas.height = canvasArea.value.clientHeight

  ctx.fillStyle = canvasBackgroundColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const item of items.value) {
    if (!item.visible) continue
    const img = new Image()
    img.src = item.image
    await new Promise(resolve => {
      img.onload = () => {
        ctx.save()
        ctx.translate(item.x + item.width / 2, item.y + item.height / 2)
        ctx.rotate((item.rotation * Math.PI) / 180)
        ctx.scale(item.flipped ? -1 : 1, 1)
        ctx.drawImage(img, -item.width / 2, -item.height / 2, item.width, item.height)
        ctx.restore()
        resolve()
      }
    })
  }

  const link = document.createElement('a')
  link.download = 'bouquet-customizer-export.png'
  link.href = canvas.toDataURL()
  link.click()
}

const startLayerDrag = (index, event) => {
  event.dataTransfer.setData('text/plain', index)
}

const onLayerDrop = (targetIndex, event) => {
  const sourceIndex = parseInt(event.dataTransfer.getData('text/plain'))
  if (sourceIndex !== targetIndex) {
    const [movedItem] = items.value.splice(sourceIndex, 1)
    items.value.splice(targetIndex, 0, movedItem)
    addToHistory()
  }
}

const saveToLocalStorage = () => {
  localStorage.setItem('bouquetCustomizerState', JSON.stringify({
    items: items.value,
    canvasBackgroundColor: canvasBackgroundColor.value,
    showGrid: showGrid.value,
    canvasSize: canvasSize.value
  }))
}

const loadFromLocalStorage = () => {
  const savedState = localStorage.getItem('bouquetCustomizerState')
  if (savedState) {
    const parsedState = JSON.parse(savedState)
    items.value = parsedState.items
    canvasBackgroundColor.value = parsedState.canvasBackgroundColor
    showGrid.value = parsedState.showGrid
    canvasSize.value = parsedState.canvasSize
    history.value = [items.value]
    historyIndex.value = 0
  }
}

const bringToFront = (index) => {
  const item = items.value.splice(index, 1)[0]
  items.value.push(item)
  addToHistory()
}

const sendToBack = (index) => {
  const item = items.value.splice(index, 1)[0]
  items.value.unshift(item)
  addToHistory()
}

const handleKeydown = (event) => {
  if (selectedItemIndex.value === -1) return

  switch (event.key) {
    case 'ArrowUp':
      items.value[selectedItemIndex.value].y -= 1
      break
    case 'ArrowDown':
      items.value[selectedItemIndex.value].y += 1
      break
    case 'ArrowLeft':
      items.value[selectedItemIndex.value].x -= 1
      break
    case 'ArrowRight':
      items.value[selectedItemIndex.value].x += 1
      break
    case '+':
      changeItemSize(selectedItemIndex.value, 1.1)
      break
    case '-':
      changeItemSize(selectedItemIndex.value, 0.9)
      break
    case 'r':
      rotateItem(selectedItemIndex.value, 45)
      break
    case 'f':
      flipItem(selectedItemIndex.value)
      break
    case 'Delete':
      removeItem(selectedItemIndex.value)
      break
  }

  addToHistory()
}

onMounted(() => {
  loadFromLocalStorage()
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchend', stopDrag)
  document.addEventListener('mousemove', onResize)
  document.addEventListener('touchmove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchend', stopResize)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('touchmove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchend', stopResize)
})

watch([items, canvasBackgroundColor, showGrid, canvasSize], () => {
  saveToLocalStorage()
}, { deep: true })
</script>

<style scoped>
.canvas-area {
  border: 2px solid #007bff;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 123, 255, 0.2);
  transition: all 0.3s ease;
}

.canvas-area.show-grid {
  background-image: 
    linear-gradient(to right, rgba(0, 123, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 123, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.bouquet-item {
  position: absolute;
  cursor: move;
  user-select: none;
  transform-origin: center center !important;
  transition: transform 0.3s ease, width 0.3s ease, height 0.3s ease;
}

.bouquet-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  transition: filter 0.3s ease;
}

.bouquet-item.selected {
  outline: 2px solid #007bff;
  z-index: 10;
  box-shadow: 0 0 15px rgba(0, 123, 255, 0.5);
}

.bouquet-item.selected img {
  filter: drop-shadow(0 0 5px rgba(0, 123, 255, 0.5));
}

.item-controls {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.resize-handle {
  position: absolute;
  right: -5px;
  bottom: -5px;
  width: 10px;
  height: 10px;
  background-color: #007bff;
  border-radius: 50%;
  cursor: se-resize;
}

.item-option {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.item-option:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.canvas-item-move {
  transition: all 0.3s ease;
}

.canvas-item-enter-active,
.canvas-item-leave-active {
  transition: all 0.3s ease;
}

.canvas-item-enter-from,
.canvas-item-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.layer-item {
  cursor: move;
}

.layer-thumbnail {
  object-fit: cover;
}
</style>