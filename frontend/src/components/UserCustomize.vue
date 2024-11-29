<template>
  <div class="user-customize bg-light" @keydown="handleKeydown" tabindex="0">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">
          <i class="bi bi-flower1 me-2"></i>
          Flower Customizer
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
              <h5 class="card-title mb-3">Available Items</h5>
              <div class="input-group mb-3">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input type="text" class="form-control" v-model="searchQuery" placeholder="Search items...">
              </div>
              <div v-if="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div v-else class="row g-2">
                <div v-for="item in filteredItems" :key="item.id" class="col-6">
                  <div class="item-option p-2 border rounded text-center" @click="addItem(item)" :title="item.name">
                    <img :src="item.image" :alt="item.name" class="img-fluid mb-2 rounded">
                    <small class="d-block text-muted">{{ item.name }}</small>
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
                  class="flower-item"
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

          <!-- Canva-like Layer Panel -->
          <div class="card mt-3">
            <div class="card-body">
              <h5 class="card-title mb-3">Layers</h5>
              <div class="layer-list">
                <draggable 
                  v-model="items" 
                  item-key="id"
                  handle=".layer-drag-handle"
                  @end="onLayerReorder"
                  class="list-group"
                >
                  <template #item="{ element, index }">
                    <div 
                      class="list-group-item layer-item d-flex align-items-center"
                      :class="{ 'active': selectedItemIndex === index }"
                      @click="selectItem(index)"
                    >
                      <i class="bi bi-grip-vertical me-2 layer-drag-handle" title="Drag to reorder"></i>
                      <img :src="element.image" :alt="element.name" class="layer-thumbnail me-2" width="30" height="30">
                      <span class="layer-name flex-grow-1">{{ element.name }}</span>
                      <div class="layer-actions">
                        <button @click.stop="toggleItemVisibility(index)" class="btn btn-sm btn-link p-0 me-2">
                          <i :class="element.visible ? 'bi bi-eye' : 'bi bi-eye-slash'" :title="element.visible ? 'Hide' : 'Show'"></i>
                        </button>
                        <button @click.stop="removeItem(index)" class="btn btn-sm btn-link p-0 text-danger">
                          <i class="bi bi-trash" title="Remove"></i>
                        </button>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
              <div v-if="items.length === 0" class="text-center text-muted py-3">
                No items added yet. Start by adding items from above.
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
import { useFirestore } from 'vuefire'
import { collection, onSnapshot } from 'firebase/firestore'
import draggable from 'vuedraggable'

const db = useFirestore()
const availableItems = ref([])
const loading = ref(true)
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

const filteredItems = computed(() => {
  if (!searchQuery.value) return availableItems.value
  return availableItems.value.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(() => {
  const unsubscribeFlowers = onSnapshot(collection(db, 'flowerTypes'), (snapshot) => {
    const flowers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'flower' }))
    updateAvailableItems(flowers, 'flower')
  })

  const unsubscribeAttachments = onSnapshot(collection(db, 'attachments'), (snapshot) => {
    const attachments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'attachment' }))
    updateAvailableItems(attachments, 'attachment')
  })

  return () => {
    unsubscribeFlowers()
    unsubscribeAttachments()
  }
})

const updateAvailableItems = (newItems, type) => {
  availableItems.value = availableItems.value.filter(item => item.type !== type)
  availableItems.value.push(...newItems)
  loading.value = false
}

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
  if (event && index !== -1) {
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
  item.x = Math.max(0, Math.min(x, canvasArea.value.clientWidth - item.width))
  item.y = Math.max(0, Math.min(y, canvasArea.value.clientHeight - item.height))
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

const getItemStyle = (item) => {
  return {
    transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg) scale(${item.flipped ? -item.scale : item.scale}, ${item.scale})`,
    width: `${item.width}px`,
    height: `${item.height}px`,
    zIndex: items.value.indexOf(item),
    display: item.visible ? 'block' : 'none'
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

const changeItemSize = (index, factor) => {
  const item = items.value[index]
  item.width *= factor
  item.height *= factor
  item.scale *= factor
  addToHistory()
}

const removeItem = (index) => {
  items.value.splice(index, 1)
  selectedItemIndex.value = -1
  addToHistory()
}

const startResize = (event, index) => {
  event.stopPropagation()
  isResizing.value = true
  selectedItemIndex.value = index
  const rect = canvasArea.value.getBoundingClientRect()
  const clientX = event.clientX || (event.touches && event.touches[0].clientX)
  const clientY = event.clientY || (event.touches && event.touches[0].clientY)
  startX.value = clientX - rect.left
  startY.value = clientY - rect.top
}

const onResize = (event) => {
  if (!isResizing.value || selectedItemIndex.value === -1) return
  const rect = canvasArea.value.getBoundingClientRect()
  const clientX = event.clientX || (event.touches && event.touches[0].clientX)
  const clientY = event.clientY || (event.touches && event.touches[0].clientY)
  const deltaX = (clientX - rect.left) - startX.value
  const deltaY = (clientY - rect.top) - startY.value
  const item = items.value[selectedItemIndex.value]
  const aspectRatio = item.width / item.height
  const newWidth = Math.max(20, item.width + deltaX)
  const newHeight = newWidth / aspectRatio
  item.width = newWidth
  item.height = newHeight
  item.scale = newWidth / 100
  startX.value = clientX - rect.left
  startY.value = clientY - rect.top
}

const stopResize = () => {
  if (isResizing.value) {
    isResizing.value = false
    addToHistory()
  }
}

const addToHistory = () => {
  historyIndex.value++
  history.value = history.value.slice(0, historyIndex.value)
  history.value.push(JSON.parse(JSON.stringify(items.value)))
}

const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    items.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
  }
}

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    items.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
  }
}

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const exportImage = () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = canvasArea.value.clientWidth
  canvas.height = canvasArea.value.clientHeight

  // Draw background
  ctx.fillStyle = canvasBackgroundColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw items
  items.value.forEach(item => {
    if (!item.visible) return
    const img = new Image()
    img.src = item.image
    img.onload = () => {
      ctx.save()
      ctx.translate(item.x + item.width / 2, item.y + item.height / 2)
      ctx.rotate(item.rotation * Math.PI / 180)
      ctx.scale(item.flipped ? -item.scale : item.scale, item.scale)
      ctx.drawImage(img, -item.width / 2, -item.height / 2, item.width, item.height)
      ctx.restore()
    }
  })

  // Download image
  setTimeout(() => {
    const link = document.createElement('a')
    link.download = 'flower_arrangement.png'
    link.href = canvas.toDataURL()
    link.click()
  }, 500) // Wait for images to load
}

const toggleItemVisibility = (index) => {
  items.value[index].visible = !items.value[index].visible
  addToHistory()
}

const onLayerReorder = () => {
  addToHistory()
}

const updateCanvasColor = () => {
  addToHistory()
}

const updateCanvasSize = () => {
  addToHistory()
}

const handleKeydown = (event) => {
  if (event.key === 'Delete' && selectedItemIndex.value !== -1) {
    removeItem(selectedItemIndex.value)
  }
}

onMounted(() => {
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
  window.addEventListener('touchmove', onDrag)
  window.addEventListener('touchend', stopDrag)
  window.addEventListener('touchmove', onResize)
  window.addEventListener('touchend', stopResize)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
  window.removeEventListener('touchmove', onResize)
  window.removeEventListener('touchend', stopResize)
})

watch(items, () => {
  selectedItemIndex.value = -1
})
</script>

<style scoped>
.user-customize {
  min-height: 100vh;
}

.canvas-container {
  overflow: hidden;
}

.canvas-area {
  position: relative;
  margin: 0 auto;
}

.show-grid {
  background-image: linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.flower-item {
  position: absolute;
  cursor: move;
  user-select: none;
}

.flower-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.flower-item.selected {
  outline: 2px solid #007bff;
}

.item-controls {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 5px;
  padding: 5px;
  display: flex;
  gap: 5px;
}

.resize-handle {
  position: absolute;
  bottom: -10px;
  right: -10px;
  width: 20px;
  height: 20px;
  background-color: #007bff;
  border-radius: 50%;
  cursor: se-resize;
}

.item-option {
  cursor: pointer;
  transition: all 0.3s ease;
}

.item-option:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.layer-list {
  max-height: 300px;
  overflow-y: auto;
}

.layer-item {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.layer-item:hover {
  background-color: #f8f9fa;
}

.layer-item.active {
  background-color: #e9ecef;
}

.layer-drag-handle {
  cursor: move;
}

.layer-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-thumbnail {
  object-fit: cover;
  border-radius: 4px;
}

.layer-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.layer-item:hover .layer-actions {
  opacity: 1;
}

.canvas-item-enter-active,
.canvas-item-leave-active {
  transition: all 0.5s ease;
}

.canvas-item-enter-from,
.canvas-item-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>