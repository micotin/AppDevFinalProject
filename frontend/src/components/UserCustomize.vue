<template>
  <div class="bouquet-customizer">
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Bouquet Customizer</a>
        <div class="d-flex">
          <button class="btn btn-outline-primary me-2" @click="undo" :disabled="!canUndo">
            <Undo2Icon class="icon" />
          </button>
          <button class="btn btn-outline-primary me-2" @click="redo" :disabled="!canRedo">
            <Redo2Icon class="icon" />
          </button>
          <button class="btn btn-primary me-2" @click="saveCustomization">
            <SaveIcon class="icon" /> Save
          </button>
          <button class="btn btn-info" @click="showHelpModal">
            <HelpCircleIcon class="icon" /> Help
          </button>
        </div>
      </div>
    </nav>

    <div class="d-flex">
      <!-- Side Panel -->
      <div class="side-panel bg-light border-end">
        <div class="p-3">
          <h5 class="mb-3">Elements</h5>
          <div class="input-group mb-3">
            <span class="input-group-text"><SearchIcon class="icon" /></span>
            <input type="text" class="form-control" v-model="searchQuery" placeholder="Search items...">
          </div>
          <ul class="nav nav-tabs" id="elementTabs" role="tablist">
            <li class="nav-item" role="presentation" v-for="(category, index) in categories" :key="category.name">
              <button 
                class="nav-link" 
                :class="{ active: index === 0 }" 
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
                  <div class="item-option" @click="addItem(item)" :title="item.name">
                    <img :src="item.image" :alt="item.name" class="img-fluid mb-1">
                    <p class="item-name">{{ item.name }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Canvas Area -->
      <div class="main-area">
        <div class="canvas-controls bg-light border-bottom p-2">
          <div class="d-flex align-items-center">
            <div class="me-3">
              <label for="canvasColor" class="form-label mb-0 me-2">Canvas Color:</label>
              <input type="color" id="canvasColor" v-model="canvasBackgroundColor" @change="changeCanvasColor" class="form-control form-control-color">
            </div>
            <div class="me-3">
              <label class="form-label mb-0 me-2">Canvas Size:</label>
              <div class="input-group">
                <select v-model="selectedCanvasSize" class="form-select" @change="updateCanvasSize">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="custom">Custom</option>
                </select>
                <template v-if="selectedCanvasSize === 'custom'">
                  <input type="number" v-model.number="customCanvasWidth" class="form-control" min="100" max="2000" @change="updateCanvasSize">
                  <span class="input-group-text">x</span>
                  <input type="number" v-model.number="customCanvasHeight" class="form-control" min="100" max="2000" @change="updateCanvasSize">
                </template>
              </div>
            </div>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="gridToggle" v-model="showGrid">
              <label class="form-check-label" for="gridToggle">Show Grid</label>
            </div>
          </div>
        </div>
        <div class="canvas-container">
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
            @wheel.prevent="handleZoom"
            @click.self="clearSelection"
            :class="{ 'show-grid': showGrid }"
            :style="canvasStyle"
          >
            <TransitionGroup name="canvas-item">
              <div 
                v-for="(item, index) in items" 
                :key="item.id" 
                :style="getItemStyle(item)"
                :class="{ 'selected': selectedItemIndex === index }"
                @mousedown.stop="selectItem(index, $event)"
                @touchstart.stop="selectItem(index, $event)"
                class="bouquet-item"
              >
                <img :src="item.image" :alt="item.name" draggable="false" @load="onImageLoad(index)">
                <div v-if="selectedItemIndex === index" class="item-controls">
                  <button @click.stop="rotateItem(index, -45)" class="btn btn-sm btn-light" title="Rotate Left">
                    <RotateCcwIcon class="icon" />
                  </button>
                  <button @click.stop="rotateItem(index, 45)" class="btn btn-sm btn-light" title="Rotate Right">
                    <RotateCwIcon class="icon" />
                  </button>
                  <button @click.stop="flipItem(index)" class="btn btn-sm btn-light" title="Flip Horizontally">
                    <FlipHorizontalIcon class="icon" />
                  </button>
                  <button @click.stop="removeItem(index)" class="btn btn-sm btn-danger" title="Remove Item">
                    <Trash2Icon class="icon" />
                  </button>
                </div>
                <div v-if="selectedItemIndex === index" class="resize-handle" @mousedown.stop="startResize($event, index)" @touchstart.stop="startResize($event, index)"></div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>

    <!-- Help Modal -->
    <div class="modal fade" id="helpModal" tabindex="-1" aria-labelledby="helpModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="helpModalLabel">Bouquet Customizer Help</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <h6>Mouse Controls:</h6>
            <ul>
              <li>Click and drag items to move them</li>
              <li>Use the resize handle (bottom-right corner) to resize items</li>
              <li>Scroll wheel on a selected item to zoom in/out</li>
            </ul>
            <h6>Touch Controls:</h6>
            <ul>
              <li>Tap to select an item</li>
              <li>Drag to move items</li>
              <li>Pinch to zoom in/out</li>
            </ul>
            <h6>Keyboard Shortcuts:</h6>
            <ul>
              <li><kbd>Ctrl</kbd> + <kbd>Z</kbd> Undo</li>
              <li><kbd>Ctrl</kbd> + <kbd>Y</kbd> Redo</li>
              <li><kbd>Delete</kbd> Remove selected item</li>
              <li><kbd>R</kbd> Rotate selected item 45° clockwise</li>
              <li><kbd>F</kbd> Flip selected item</li>
              <li><kbd>+</kbd> Increase selected item size</li>
              <li><kbd>-</kbd> Decrease selected item size</li>
              <li>Arrow keys to move selected item</li>
            </ul>
            <h6>Tips:</h6>
            <ul>
              <li>Use the search bar to quickly find items</li>
              <li>Your work is automatically saved and will persist when you reload the page</li>
              <li>Toggle the grid for precise item placement</li>
              <li>Experiment with different combinations for unique bouquets!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import debounce from 'lodash/debounce'
import { Undo2Icon, Redo2Icon, SaveIcon, SearchIcon, RotateCcwIcon, RotateCwIcon, FlipHorizontalIcon, Trash2Icon, HelpCircleIcon } from 'lucide-vue-next'

const router = useRouter()
const items = ref([])
const selectedItemIndex = ref(-1)
const isDragging = ref(false)
const isResizing = ref(false)
const startX = ref(0)
const startY = ref(0)
const canvasArea = ref(null)
const history = ref([])
const historyIndex = ref(-1)
const searchQuery = ref('')
const helpModal = ref(null)
const canvasBackgroundColor = ref('#ffffff')
const showGrid = ref(false)
const isSaving = ref(false)

// Canvas size variables
const selectedCanvasSize = ref('medium')
const customCanvasWidth = ref(600)
const customCanvasHeight = ref(450)
const canvasSizeUnit = ref('px')

const canvasStyle = computed(() => {
  let width, height
  if (selectedCanvasSize.value === 'custom') {
    width = customCanvasWidth.value
    height = customCanvasHeight.value
  } else {
    const sizes = {
      small: { width: 400, height: 300 },
      medium: { width: 600, height: 450 },
      large: { width: 800, height: 600 },
    }
    width = sizes[selectedCanvasSize.value].width
    height = sizes[selectedCanvasSize.value].height
  }

  return {
    width: `${width}${canvasSizeUnit.value}`,
    height: `${height}${canvasSizeUnit.value}`,
    backgroundColor: canvasBackgroundColor.value,
  }
})

const updateCanvasSize = () => {
  // Adjust item positions based on new canvas size
  const oldWidth = canvasArea.value.clientWidth
  const oldHeight = canvasArea.value.clientHeight
  const newWidth = customCanvasWidth.value
  const newHeight = customCanvasHeight.value

  items.value.forEach(item => {
    item.x = (item.x / oldWidth) * newWidth
    item.y = (item.y / oldHeight) * newHeight
  })

  addToHistory()
}

const saveCustomization = debounce(() => {
  isSaving.value = true
  localStorage.setItem('bouquetCustomizerState', JSON.stringify({
    items: items.value,
    canvasColor: canvasBackgroundColor.value,
    showGrid: showGrid.value,
    canvasSize: {
      selected: selectedCanvasSize.value,
      custom: {
        width: customCanvasWidth.value,
        height: customCanvasHeight.value,
        unit: canvasSizeUnit.value,
      },
    },
  }))
  setTimeout(() => {
    isSaving.value = false
  }, 1000)
}, 500)

const loadSavedState = () => {
  try {
    const savedState = localStorage.getItem('bouquetCustomizerState')
    if (savedState) {
      const parsedState = JSON.parse(savedState)
      items.value = parsedState.items || []
      canvasBackgroundColor.value = parsedState.canvasColor || '#ffffff'
      showGrid.value = parsedState.showGrid || false
      if (parsedState.canvasSize) {
        selectedCanvasSize.value = parsedState.canvasSize.selected || 'medium'
        if (parsedState.canvasSize.custom) {
          customCanvasWidth.value = parsedState.canvasSize.custom.width || 600
          customCanvasHeight.value = parsedState.canvasSize.custom.height || 450
          canvasSizeUnit.value = parsedState.canvasSize.custom.unit || 'px'
        }
      }
      addToHistory()
    }
  } catch (error) {
    console.error('Error loading saved state:', error)
  }
}

const categories = [
  {
    name: 'Flowers',
    items: [
      { id: 1, name: 'Rose', image: '/placeholder.svg?height=100&width=100' },
      { id: 2, name: 'Tulip', image: '/placeholder.svg?height=100&width=100' },
      { id: 3, name: 'Lily', image: '/placeholder.svg?height=100&width=100' },
      { id: 4, name: 'Sunflower', image: '/placeholder.svg?height=100&width=100' },
    ]
  },
  {
    name: 'Greenery',
    items: [
      { id: 5, name: 'Fern', image: '/placeholder.svg?height=100&width=100' },
      { id: 6, name: 'Eucalyptus', image: '/placeholder.svg?height=100&width=100' },
      { id: 7, name: 'Baby\'s Breath', image:  '/placeholder.svg?height=100&width=100' },
    ]
  },
  {
    name: 'Accessories',
    items: [
      { id: 8, name: 'Ribbon', image: '/placeholder.svg?height=100&width=100' },
      { id: 9, name: 'Vase', image: '/placeholder.svg?height=100&width=100' },
      { id: 10, name: 'Card', image: '/placeholder.svg?height=100&width=100' },
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
    height: 100
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
  startX.value = clientX - rect.left - items.value[selectedItemIndex.value].x
  startY.value = clientY - rect.top - items.value[selectedItemIndex.value].y
}

const onDrag = (event) => {
  if (!isDragging.value || selectedItemIndex.value === -1) return
  const rect = canvasArea.value.getBoundingClientRect()
  const clientX = event.clientX || (event.touches && event.touches[0].clientX)
  const clientY = event.clientY || (event.touches && event.touches[0].clientY)
  if (clientX === undefined || clientY === undefined) return
  const x = clientX - rect.left - startX.value
  const y = clientY - rect.top - startY.value
  items.value[selectedItemIndex.value].x = Math.max(0, Math.min(x, rect.width - items.value[selectedItemIndex.value].width))
  items.value[selectedItemIndex.value].y = Math.max(0, Math.min(y, rect.height - items.value[selectedItemIndex.value].height))
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

const handleZoom = (event) => {
  if (selectedItemIndex.value === -1) return
  const item = items.value[selectedItemIndex.value]
  const delta = event.deltaY > 0 ? 0.95 : 1.05
  const newScale = item.scale * delta
  if (newScale >= 0.5 && newScale <= 2) {
    item.scale = newScale
    item.width *= delta
    item.height *= delta
    addToHistory()
  }
}

const getItemStyle = (item) => {
  return {
    left: `${item.x}px`,
    top: `${item.y}px`,
    width: `${item.width}px`,
    height: `${item.height}px`,
    transform: `rotate(${item.rotation}deg) ${item.flipped ? 'scaleX(-1)' : ''}`,
    position: 'absolute',
    cursor: 'move',
  }
}

const addToHistory = () => {
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(JSON.parse(JSON.stringify(items.value)))
  historyIndex.value = history.value.length - 1
  saveCustomization()
}

const undo = () => {
  if (canUndo.value) {
    historyIndex.value--
    items.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    saveCustomization()
  }
}

const redo = () => {
  if (canRedo.value) {
    historyIndex.value++
    items.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    saveCustomization()
  }
}

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const changeCanvasColor = () => {
  addToHistory()
}

const onImageLoad = (index) => {
  console.log(`Image loaded for item at index ${index}`)
}

const handleKeydown = (event) => {
  if (event.target.tagName === 'INPUT') return

  if (event.ctrlKey && event.key === 'z') {
    event.preventDefault()
    undo()
  } else if (event.ctrlKey && event.key === 'y') {
    event.preventDefault()
    redo()
  } else if (event.key === 'Delete' && selectedItemIndex.value !== -1) {
    removeItem(selectedItemIndex.value)
  } else if (event.key === 'r' && selectedItemIndex.value !== -1) {
    rotateItem(selectedItemIndex.value, 45)
  } else if (event.key === 'f' && selectedItemIndex.value !== -1) {
    flipItem(selectedItemIndex.value)
  } else if (event.key === '+' && selectedItemIndex.value !== -1) {
    const item = items.value[selectedItemIndex.value]
    const newScale = Math.min(2, item.scale * 1.1)
    item.scale = newScale
    item.width *= 1.1
    item.height *= 1.1
    addToHistory()
  } else if (event.key === '-' && selectedItemIndex.value !== -1) {
    const item = items.value[selectedItemIndex.value]
    const newScale = Math.max(0.5, item.scale * 0.9)
    item.scale = newScale
    item.width *= 0.9
    item.height *= 0.9
    addToHistory()
  } else if (selectedItemIndex.value !== -1) {
    const item = items.value[selectedItemIndex.value]
    const step = 5
    switch (event.key) {
      case 'ArrowLeft':
        item.x -= step
        break
      case 'ArrowRight':
        item.x += step
        break
      case 'ArrowUp':
        item.y -= step
        break
      case 'ArrowDown':
        item.y += step
        break
      default:
        return
    }
    addToHistory()
  }
}

const showHelpModal = () => {
  helpModal.value.show()
}

onMounted(() => {
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchend', stopDrag)
  document.addEventListener('mousemove', onResize)
  document.addEventListener('touchmove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchend', stopResize)
  document.addEventListener('keydown', handleKeydown)
  loadSavedState()

  // Initialize Bootstrap modal
  helpModal.value = new Modal(document.getElementById('helpModal'))

  // Show help modal on first visit
  if (!localStorage.getItem('hasVisitedBefore')) {
    showHelpModal()
    localStorage.setItem('hasVisitedBefore', 'true')
  }
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
  document.removeEventListener('keydown', handleKeydown)
})

// Watch for changes and trigger auto-save
watch([items, canvasBackgroundColor, showGrid, selectedCanvasSize, customCanvasWidth, customCanvasHeight, canvasSizeUnit], () => {
  saveCustomization()
}, { deep: true })
</script>

<style scoped>
.bouquet-customizer {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.side-panel {
  width: 300px;
  height: calc(100vh - 56px);
  overflow-y: auto;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
}

.canvas-container {
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
}

.canvas-area {
  border: 2px solid #6c757d;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  touch-action: none;
}

.canvas-area.show-grid {
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.bouquet-item {
  position: absolute;
  cursor: move;
  user-select: none;
  transition: transform 0.3s ease;
  touch-action: none;
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
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  padding: 10px;
  border-radius: 8px;
}

.item-option:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.item-name {
  font-size: 0.8rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.icon {
  width: 16px;
  height: 16px;
}

.btn-info {
  background-color: #17a2b8;
  border-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
  border-color: #117a8b;
}

.modal-body h6 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.modal-body ul {
  padding-left: 1.5rem;
}

.modal-body kbd {
  background-color: #f8f9fa;
  border: 1px solid #d3d3d3;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(0,0,0,0.2);
  color: #333;
  display: inline-block;
  font-size: 0.85em;
  font-weight: 700;
  line-height: 1;
  padding: 2px 4px;
  white-space: nowrap;
}

@media (max-width: 992px) {
  .side-panel {
    width: 100%;
    height: auto;
    max-height: 300px;
  }

  .main-area {
    height: auto;
  }

  .canvas-container {
    height: calc(100vh - 356px);
  }
}
</style>