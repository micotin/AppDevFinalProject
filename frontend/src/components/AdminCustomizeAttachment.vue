<template>
  <div class="admin-customize-attachment">
    <h2 class="mb-4"><i class="bi bi-flower1 me-2"></i>Manage Flower Types and Attachments</h2>
    
    <!-- Add New Item Form -->
    <div class="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
      <div class="card-body">
        <h3 class="card-title mb-4">Add New Item</h3>
        <form @submit.prevent="addItem">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="itemName" class="form-label">Name</label>
              <input v-model="newItem.name" type="text" id="itemName" required class="form-control">
            </div>
            <div class="col-md-6">
              <label for="itemType" class="form-label">Type</label>
              <select v-model="newItem.type" id="itemType" required class="form-select">
                <option value="flower">Flower</option>
                <option value="attachment">Attachment</option>
              </select>
            </div>
            <div class="col-md-6" v-if="newItem.type === 'attachment'">
              <label for="itemCategory" class="form-label">Category</label>
              <select v-model="newItem.category" id="itemCategory" required class="form-select">
                <option value="ribbon">Ribbon</option>
                <option value="wrapper">Wrapper</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="col-md-6">
              <label for="itemImage" class="form-label">Image</label>
              <input type="file" id="itemImage" @change="handleFileUpload" accept="image/*" required class="form-control">
            </div>
            <div class="col-12">
              <button type="submit" class="btn btn-primary w-100">Add Item</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Items List -->
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card border-0 shadow-lg rounded-4 overflow-hidden h-100">
          <div class="card-body">
            <h3 class="card-title mb-4">Flower Types</h3>
            <div v-if="loading.flowers" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="flowers.length === 0" class="text-center py-4 text-muted">
              No flower types available. Add some to get started!
            </div>
            <transition-group name="list" tag="div" class="flower-types-list">
              <div v-for="flower in flowers" :key="flower.id" class="item-card mb-3 p-3 border rounded d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <img :src="flower.image" :alt="flower.name" class="item-thumbnail me-3">
                  <span>{{ flower.name }}</span>
                </div>
                <div>
                  <button @click="editItem(flower, 'flower')" class="btn btn-sm btn-outline-primary me-2">Edit</button>
                  <button @click="confirmRemove(flower, 'flower')" class="btn btn-sm btn-outline-danger">Remove</button>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </div>
      <div class="col-md-6 mb-4">
        <div class="card border-0 shadow-lg rounded-4 overflow-hidden h-100">
          <div class="card-body">
            <h3 class="card-title mb-4">Attachments</h3>
            <div v-if="loading.attachments" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="attachments.length === 0" class="text-center py-4 text-muted">
              No attachments available. Add some to get started!
            </div>
            <transition-group name="list" tag="div" class="attachments-list">
              <div v-for="attachment in attachments" :key="attachment.id" class="item-card mb-3 p-3 border rounded d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <img :src="attachment.image" :alt="attachment.name" class="item-thumbnail me-3">
                  <span>{{ attachment.name }} ({{ attachment.category }})</span>
                </div>
                <div>
                  <button @click="editItem(attachment, 'attachment')" class="btn btn-sm btn-outline-primary me-2">Edit</button>
                  <button @click="confirmRemove(attachment, 'attachment')" class="btn btn-sm btn-outline-danger">Remove</button>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </div>
    </div>

    <!-- Add a button to open the Bouquet Customizer -->
    <button @click="openBouquetCustomizer" class="btn btn-primary mt-3">
      Open Bouquet Customizer
    </button>

    <!-- Edit Modal -->
    <div v-if="editing" class="modal fade show" tabindex="-1" style="display: block;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editing.type === 'flower' ? 'Edit Flower Type' : 'Edit Attachment' }}</h5>
            <button type="button" class="btn-close" @click="cancelEdit"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateItem">
              <div class="mb-3">
                <label :for="editing.type + 'Name'" class="form-label">Name</label>
                <input v-model="editing.item.name" type="text" :id="editing.type + 'Name'" required class="form-control">
              </div>
              <div v-if="editing.type === 'attachment'" class="mb-3">
                <label for="editAttachmentCategory" class="form-label">Category</label>
                <select v-model="editing.item.category" id="editAttachmentCategory" required class="form-select">
                  <option value="ribbon">Ribbon</option>
                  <option value="wrapper">Wrapper</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="mb-3">
                <label :for="editing.type + 'Image'" class="form-label">Image</label>
                <input type="file" :id="editing.type + 'Image'" @change="handleFileUpload" accept="image/*" class="form-control">
              </div>
              <div class="text-end">
                <button type="button" @click="cancelEdit" class="btn btn-secondary me-2">Cancel</button>
                <button type="submit" class="btn btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal fade show" tabindex="-1" style="display: block;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Removal</h5>
            <button type="button" class="btn-close" @click="cancelRemove"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to remove this item? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cancelRemove">Cancel</button>
            <button type="button" class="btn btn-danger" @click="removeConfirmed">Remove</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div id="liveToast" class="toast" :class="{ 'show': showToast }" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header" :class="toastClass">
          <strong class="me-auto">{{ toastTitle }}</strong>
          <button type="button" class="btn-close" @click="hideToast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ toastMessage }}
        </div>
      </div>
    </div>

    <!-- Bouquet Customizer Modal -->
    <div v-if="showBouquetCustomizer" class="modal fade show" tabindex="-1" style="display: block;">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Bouquet Customizer</h5>
            <button type="button" class="btn-close" @click="closeBouquetCustomizer"></button>
          </div>
          <div class="modal-body">
            <UserCustomize :availableItems="availableItems" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useFirestore } from 'vuefire'
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import UserCustomize from './UserCustomize.vue'

export default {
  name: 'AdminCustomizeAttachment',
  components: {
    UserCustomize
  },
  setup() {
    const db = useFirestore()
    const storage = getStorage()
    const flowers = ref([])
    const attachments = ref([])
    const newItem = ref({ name: '', type: 'flower', category: 'ribbon', image: null })
    const editing = ref(null)
    const showConfirmModal = ref(false)
    const itemToRemove = ref(null)
    const loading = ref({ flowers: true, attachments: true })
    const showToast = ref(false)
    const toastMessage = ref('')
    const toastTitle = ref('')
    const toastClass = ref('')
    const showBouquetCustomizer = ref(false)

    onMounted(() => {
      const unsubscribeFlowers = onSnapshot(collection(db, 'flowerTypes'), (snapshot) => {
        flowers.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        loading.value.flowers = false
      }, (error) => {
        console.error("Error fetching flower types:", error)
        loading.value.flowers = false
      })

      const unsubscribeAttachments = onSnapshot(collection(db, 'attachments'), (snapshot) => {
        attachments.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        loading.value.attachments = false
      }, (error) => {
        console.error("Error fetching attachments:", error)
        loading.value.attachments = false
      })

      return () => {
        unsubscribeFlowers()
        unsubscribeAttachments()
      }
    })

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        if (editing.value) {
          editing.value.item.newImage = file
        } else {
          newItem.value.image = file
        }
      }
    }

    const uploadImage = async (file) => {
      const fileRef = storageRef(storage, `images/${Date.now()}_${file.name}`)
      await uploadBytes(fileRef, file)
      return await getDownloadURL(fileRef)
    }

    const addItem = async () => {
      try {
        if (!newItem.value.image) {
          throw new Error('Please select an image')
        }

        const imageUrl = await uploadImage(newItem.value.image)
        const itemData = {
          name: newItem.value.name,
          image: imageUrl,
        }

        if (newItem.value.type === 'attachment') {
          itemData.category = newItem.value.category
          await addDoc(collection(db, 'attachments'), itemData)
        } else {
          await addDoc(collection(db, 'flowerTypes'), itemData)
        }

        newItem.value = { name: '', type: 'flower', category: 'ribbon', image: null }
        showToastNotification('Success', `${newItem.value.type} added successfully`, 'bg-success text-white')
      } catch (error) {
        console.error('Error adding item:', error)
        showToastNotification('Error', error.message || 'Failed to add item', 'bg-danger text-white')
      }
    }

    const confirmRemove = (item, type) => {
      itemToRemove.value = { item, type }
      showConfirmModal.value = true
    }

    const removeConfirmed = async () => {
      if (!itemToRemove.value) return

      try {
        const { type, item } = itemToRemove.value
        const collectionName = type === 'flower' ? 'flowerTypes' : 'attachments'
        await deleteDoc(doc(db, collectionName, item.id))
        showConfirmModal.value = false
        itemToRemove.value = null
        showToastNotification('Success', `${type} removed successfully`, 'bg-success text-white')
      } catch (error) {
        console.error('Error removing item:', error)
        showToastNotification('Error', 'Failed to remove item', 'bg-danger text-white')
      }
    }

    const cancelRemove = () => {
      showConfirmModal.value = false
      itemToRemove.value = null
    }

    const editItem = (item, type) => {
      editing.value = { type, item: { ...item } }
    }

    const updateItem = async () => {
      try {
        const { type, item } = editing.value
        const { id, ...updateData } = item
        
        if (item.newImage) {
          updateData.image = await uploadImage(item.newImage)
        }

        const collectionName = type === 'flower' ? 'flowerTypes' : 'attachments'
        await updateDoc(doc(db, collectionName, id), updateData)
        editing.value = null
        showToastNotification('Success', `${type} updated successfully`, 'bg-success text-white')
      } catch (error) {
        console.error('Error updating item:', error)
        showToastNotification('Error', 'Failed to update item', 'bg-danger text-white')
      }
    }

    const cancelEdit = () => {
      editing.value = null
    }

    const showToastNotification = (title, message, className) => {
      toastTitle.value = title
      toastMessage.value = message
      toastClass.value = className
      showToast.value = true
      setTimeout(() => {
        hideToast()
      }, 3000)
    }

    const hideToast = () => {
      showToast.value = false
    }

    const openBouquetCustomizer = () => {
      showBouquetCustomizer.value = true
    }

    const closeBouquetCustomizer = () => {
      showBouquetCustomizer.value = false
    }

    const availableItems = computed(() => {
      return [
        ...flowers.value.map(flower => ({
          ...flower,
          type: 'flower'
        })),
        ...attachments.value.map(attachment => ({
          ...attachment,
          type: 'attachment'
        }))
      ]
    })

    return {
      flowers,
      attachments,
      newItem,
      editing,
      showConfirmModal,
      loading,
      showToast,
      toastMessage,
      toastTitle,
      toastClass,
      addItem,
      handleFileUpload,
      confirmRemove,
      removeConfirmed,
      cancelRemove,
      editItem,
      updateItem,
      cancelEdit,
      hideToast,
      showBouquetCustomizer,
      openBouquetCustomizer,
      closeBouquetCustomizer,
      availableItems
    }
  }
}
</script>

<style scoped>
.admin-customize-attachment {
  font-family: 'Poppins', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 2rem;
}

.card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.item-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.modal-content {
  background: #ffffff;
  border: 1px solid #e0e0e0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.toast {
  transition: opacity 0.3s ease-in-out;
}

.toast.show {
  opacity: 1;
}

.item-card {
  transition: all 0.3s ease;
  background: #ffffff;
  border-color: #e0e0e0 !important;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: #4a90e2;
  border: none;
}

.btn-primary:hover {
  background: #3a7bd5;
}

.btn-outline-primary {
  color: #4a90e2;
  border-color: #4a90e2;
}

.btn-outline-primary:hover {
  background: #4a90e2;
  color: #ffffff;
}

.btn-outline-danger {
  color: #e74c3c;
  border-color: #e74c3c;
}

.btn-outline-danger:hover {
  background: #e74c3c;
  color: #ffffff;
}

.form-control, .form-select {
  background: #ffffff;
  border: 1px solid #ced4da;
  color: #495057;
}

.form-control:focus, .form-select:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 0.25rem rgba(74, 144, 226, 0.25);
}

.modal-xl .modal-dialog {
  max-width: 90%;
}
</style>