<template>
  <div class="admin-gallery">
    <h2 class="mb-4 text-white">Gallery Management</h2>

    <div class="row mb-4 justify-content-center">
      <div class="col-md-6">
        <form @submit.prevent="addArrangement" class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-3 text-center text-white">Add New Arrangement</h5>
            <div class="mb-3">
              <label for="name" class="form-label text-white">Name</label>
              <input v-model="newArrangement.name" type="text" class="form-control" id="name" required aria-label="Arrangement Name">
            </div>
            <div class="mb-3">
              <label for="description" class="form-label text-white">Description</label>
              <textarea v-model="newArrangement.description" class="form-control" id="description" rows="3" required aria-label="Arrangement Description"></textarea>
            </div>
            <div class="mb-3">
              <label for="occasion" class="form-label text-white">Occasion</label>
              <button type="button" class="btn btn-outline-light w-100" @click="openOccasionModal">
                {{ newArrangement.occasion || 'Select an occasion' }}
              </button>
            </div>
            <div class="mb-3">
              <label for="image" class="form-label text-white">Image</label>
              <input @change="handleImageUpload" type="file" class="form-control" id="image" accept="image/*" required aria-label="Upload Image">
            </div>
            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Add Arrangement
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div v-for="arrangement in arrangements" :key="arrangement.id" class="col">
        <div class="card h-100 shadow-sm arrangement-card">
          <img :src="arrangement.imageUrl" class="card-img-top" :alt="arrangement.name">
          <div class="card-body">
            <h5 class="card-title text-white">{{ arrangement.name }}</h5>
            <p class="card-text text-white-50">{{ arrangement.description }}</p>
            <p class="card-text"><small class="text-muted">Occasion: {{ arrangement.occasion }}</small></p>
            <p class="card-text"><small class="text-muted">Created by: {{ arrangement.createdBy }}</small></p>
          </div>
          <div class="card-footer bg-transparent d-flex justify-content-between">
            <button @click="editArrangement(arrangement)" class="btn btn-sm btn-outline-light">Edit</button>
            <button @click="deleteArrangement(arrangement.id)" class="btn btn-sm btn-outline-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Arrangement Modal -->
    <div class="modal fade" id="editArrangementModal" tabindex="-1" aria-labelledby="editArrangementModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-white" id="editArrangementModalLabel">Edit Arrangement</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateArrangement">
              <div class="mb-3">
                <label for="editName" class="form-label text-white">Name</label>
                <input v-model="editingArrangement.name" type="text" class="form-control" id="editName" required>
              </div>
              <div class="mb-3">
                <label for="editDescription" class="form-label text-white">Description</label>
                <textarea v-model="editingArrangement.description" class="form-control" id="editDescription" rows="3" required></textarea>
              </div>
              <div class="mb-3">
                <label for="editOccasion" class="form-label text-white">Occasion</label>
                <button type="button" class="btn btn-outline-light w-100" @click="openOccasionModal('edit')">
                  {{ editingArrangement.occasion || 'Select an occasion' }}
                </button>
              </div>
              <div class="mb-3">
                <label for="editImage" class="form-label text-white">New Image (optional)</label>
                <input @change="handleEditImageUpload" type="file" class="form-control" id="editImage" accept="image/*">
              </div>
              <button type="submit" class="btn btn-primary w-100">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Update Arrangement
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Occasion Selection Modal -->
    <div class="modal fade" id="occasionModal" tabindex="-1" aria-labelledby="occasionModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-white" id="occasionModalLabel">Select an Occasion</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
              <div v-for="occasion in occasions" :key="occasion" class="col">
                <button 
                  @click="selectOccasion(occasion)" 
                  class="btn btn-outline-light w-100"
                  :class="{ 'active': isOccasionSelected(occasion) }"
                >
                  {{ occasion }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { Modal } from 'bootstrap';

export default {
  name: 'AdminGallery',
  setup() {
    const db = getFirestore();
    const storage = getStorage();
    const auth = getAuth();

    const arrangements = ref([]);
    const newArrangement = ref({
      name: '',
      description: '',
      occasion: '',
      imageFile: null
    });
    const editingArrangement = ref({});
    const occasions = [
      'Weddings', 'Birthdays', 'Anniversaries', 'Sympathy', 'Holidays',
      'Valentine\'s Day', 'Mother\'s Day', 'Father\'s Day', 'Graduation',
      'Baby Shower', 'Housewarming', 'Get Well', 'Congratulations',
      'Thank You', 'Christmas', 'Easter', 'Halloween', 'New Year\'s',
      'Retirement', 'Promotion'
    ];
    const loading = ref(false);
    const isEditing = ref(false);

    let editModal = null;
    let occasionModal = null;

    const fetchArrangements = async () => {
      const querySnapshot = await getDocs(collection(db, 'arrangements'));
      arrangements.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const handleImageUpload = (event) => {
      newArrangement.value.imageFile = event.target.files[0];
    };

    const handleEditImageUpload = (event) => {
      editingArrangement.value.newImageFile = event.target.files[0];
    };

    const addArrangement = async () => {
      loading.value = true;
      try {
        const imageRef = storageRef(storage, `arrangements/${Date.now()}_${newArrangement.value.imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, newArrangement.value.imageFile);
        const imageUrl = await getDownloadURL(snapshot.ref);

        await addDoc(collection(db, 'arrangements'), {
          name: newArrangement.value.name,
          description: newArrangement.value.description,
          occasion: newArrangement.value.occasion,
          imageUrl: imageUrl,
          createdAt: new Date(),
          createdBy: auth.currentUser.displayName || auth.currentUser.email || 'Anonymous'
        });

        newArrangement.value = { name: '', description: '', occasion: '', imageFile: null };
        fetchArrangements();
      } catch (error) {
        console.error('Error adding arrangement:', error);
      } finally {
        loading.value = false;
      }
    };

    const editArrangement = (arrangement) => {
      editingArrangement.value = { ...arrangement };
      isEditing.value = true;
      editModal.show();
    };

    const updateArrangement = async () => {
      loading.value = true;
      try {
        const arrangementRef = doc(db, 'arrangements', editingArrangement.value.id);
        const updateData = {
          name: editingArrangement.value.name,
          description: editingArrangement.value.description,
          occasion: editingArrangement.value.occasion
        };

        if (editingArrangement.value.newImageFile) {
          const imageRef = storageRef(storage, `arrangements/${Date.now()}_${editingArrangement.value.newImageFile.name}`);
          const snapshot = await uploadBytes(imageRef, editingArrangement.value.newImageFile);
          updateData.imageUrl = await getDownloadURL(snapshot.ref);
        }

        await updateDoc(arrangementRef, updateData);
        editModal.hide();
        fetchArrangements();
      } catch (error) {
        console.error('Error updating arrangement:', error);
      } finally {
        loading.value = false;
        isEditing.value = false;
      }
    };

    const deleteArrangement = async (id) => {
      if (confirm('Are you sure you want to delete this arrangement?')) {
        try {
          await deleteDoc(doc(db, 'arrangements', id));
          fetchArrangements();
        } catch (error) {
          console.error('Error deleting arrangement:', error);
        }
      }
    };

    const openOccasionModal = (mode = 'add') => {
      isEditing.value = mode === 'edit';
      occasionModal.show();
    };

    const selectOccasion = (occasion) => {
      if (isEditing.value) {
        editingArrangement.value.occasion = occasion;
      } else {
        newArrangement.value.occasion = occasion;
      }
      occasionModal.hide();
    };

    const isOccasionSelected = (occasion) => {
      return isEditing.value 
        ? editingArrangement.value.occasion === occasion
        : newArrangement.value.occasion === occasion;
    };

    onMounted(async () => {
      await fetchArrangements();
      editModal = new Modal(document.getElementById('editArrangementModal'));
      occasionModal = new Modal(document.getElementById('occasionModal'));
    });

    return {
      arrangements,
      newArrangement,
      editingArrangement,
      occasions,
      loading,
      addArrangement,
      editArrangement,
      updateArrangement,
      deleteArrangement,
      handleImageUpload,
      handleEditImageUpload,
      openOccasionModal,
      selectOccasion,
      isOccasionSelected
    };
  }
};
</script>

<style scoped>
.admin-gallery {
  font-family: 'Poppins', sans-serif;
  color: #ffffff;
}

.card {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}

.btn-primary {
  background: linear-gradient(135deg, #e5484d 0%, #a12c82 100%);
  border: none;
}

.btn-primary:hover, .btn-primary:focus {
  background: linear-gradient(135deg, #f05a5f 0%, #b13d93 100%);
}

.btn-outline-light:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.form-control, .form-select {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.form-control:focus, .form-select:focus {
  background: rgba(40, 40, 55, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.modal-content {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
}

.modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.text-muted {
  color: #b4b4bb !important;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>