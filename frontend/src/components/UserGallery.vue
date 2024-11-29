<template>
  <div class="user-gallery">
    <!-- Notification component -->
    <div v-if="notification.show" :class="['notification', `notification-${notification.type}`]">
      {{ notification.message }}
    </div>

    <div class="container-fluid mb-4">
      <h2 class="text-center mb-4">Flower Arrangements Gallery</h2>
      <div class="row g-3">
        <div class="col-md-8">
          <div class="input-group">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Search arrangements..."
              @input="debounceFilter"
            />
            <button @click="clearSearch" class="btn btn-outline-secondary" type="button">
              Clear
            </button>
          </div>
        </div>
        <div class="col-md-4">
          <button @click="openUploadModal" class="btn btn-primary w-100">
            Upload Arrangement
          </button>
        </div>
      </div>
      <div class="mt-3">
        <h5 class="mb-2">Filter by Occasion:</h5>
        <div class="occasion-bubbles">
          <button
            v-for="occasion in occasions"
            :key="occasion"
            @click="selectOccasion(occasion)"
            class="btn btn-sm me-2 mb-2 occasion-bubble"
            :class="{ active: selectedOccasion === occasion }"
            :style="{ backgroundColor: getOccasionColor(occasion) }"
          >
            {{ occasion }}
          </button>
        </div>
      </div>
    </div>

    <div class="masonry-grid">
      <router-link 
        v-for="arrangement in filteredArrangements" 
        :key="arrangement.id"
        :to="{ name: 'UserViewGallery', params: { id: arrangement.id }}"
        class="masonry-item"
      >
        <div class="image-wrapper">
          <img 
            :src="arrangement.imageUrl" 
            :alt="arrangement.name"
            class="gallery-image"
            loading="lazy"
          />
          <div class="creator-info">
            <span class="creator-name">{{ arrangement.createdBy }}</span>
            <span class="occasion-tag" :style="{ backgroundColor: getOccasionColor(arrangement.occasion) }">
              {{ arrangement.occasion }}
            </span>
          </div>
        </div>
      </router-link>
    </div>

    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
    </div>

    <div v-if="!loading && filteredArrangements.length > 0" class="load-more">
      <button 
        @click="loadMore" 
        class="btn btn-primary load-more-btn"
        :disabled="noMoreArrangements"
      >
        {{ noMoreArrangements ? 'No More Images' : 'Load More' }}
      </button>
    </div>

    <div v-if="!loading && filteredArrangements.length === 0" class="text-center mt-5">
      <p class="h4">No arrangements found.</p>
    </div>

    <!-- Upload Modal -->
    <div class="modal fade" id="uploadModal" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="uploadModalLabel">Upload New Arrangement</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="uploadArrangement">
              <div class="mb-3">
                <label for="arrangementName" class="form-label">Arrangement Name</label>
                <input v-model="newArrangement.name" type="text" class="form-control" id="arrangementName" required>
              </div>
              <div class="mb-3">
                <label for="arrangementDescription" class="form-label">Description</label>
                <textarea v-model="newArrangement.description" class="form-control" id="arrangementDescription" rows="3" required></textarea>
              </div>
              <div class="mb-3">
                <label for="arrangementOccasion" class="form-label">Occasion</label>
                <select v-model="newArrangement.occasion" class="form-select" id="arrangementOccasion" required>
                  <option v-for="occasion in occasions" :key="occasion" :value="occasion">
                    {{ occasion }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label for="arrangementImage" class="form-label">Image</label>
                <input @change="handleFileUpload" type="file" class="form-control" id="arrangementImage" accept="image/*" required>
              </div>
              <button type="submit" class="btn btn-primary" :disabled="uploading">
                {{ uploading ? 'Uploading...' : 'Upload' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Modal } from 'bootstrap';

export default {
  name: 'UserGallery',
  setup() {
    const db = getFirestore();
    const storage = getStorage();
    const arrangements = ref([]);
    const loading = ref(true);
    const lastVisible = ref(null);
    const noMoreArrangements = ref(false);
    const searchQuery = ref('');
    const selectedOccasion = ref('');
    const occasions = ref([
      'Weddings', 'Birthdays', 'Anniversaries', 'Sympathy', 'Holidays',
      'Valentine\'s Day', 'Mother\'s Day', 'Father\'s Day', 'Graduation',
      'Baby Shower', 'Housewarming', 'Get Well', 'Congratulations',
      'Thank You', 'Christmas', 'Easter', 'Halloween', 'New Year\'s',
      'Retirement', 'Promotion'
    ]);
    const uploading = ref(false);
    const newArrangement = ref({
      name: '',
      description: '',
      occasion: '',
      imageFile: null
    });
    const notification = ref({
      show: false,
      message: '',
      type: 'success'
    });
    let filterTimeout;
    let uploadModal;

    const occasionColors = {
      'Weddings': '#FF9999',
      'Birthdays': '#99FF99',
      'Anniversaries': '#9999FF',
      'Sympathy': '#FFFF99',
      'Holidays': '#FF99FF',
      'Valentine\'s Day': '#FF6666',
      'Mother\'s Day': '#66FF66',
      'Father\'s Day': '#6666FF',
      'Graduation': '#FFCC66',
      'Baby Shower': '#66FFFF',
      'Housewarming': '#CC99FF',
      'Get Well': '#99CCFF',
      'Congratulations': '#FFCC99',
      'Thank You': '#99FFCC',
      'Christmas': '#FF3333',
      'Easter': '#CCFF66',
      'Halloween': '#FF9933',
      'New Year\'s': '#33CCFF',
      'Retirement': '#CC6699',
      'Promotion': '#99CC33'
    };

    const fetchArrangements = async () => {
      loading.value = true;
      try {
        let q = query(
          collection(db, 'arrangements'),
          orderBy('createdAt', 'desc'),
          ...(lastVisible.value ? [startAfter(lastVisible.value)] : []),
          limit(12)
        );

        const querySnapshot = await getDocs(q);
        const newArrangements = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        arrangements.value = lastVisible.value 
          ? [...arrangements.value, ...newArrangements]
          : newArrangements;
          
        lastVisible.value = querySnapshot.docs[querySnapshot.docs.length - 1];
        noMoreArrangements.value = querySnapshot.empty;

      } catch (error) {
        console.error('Error fetching arrangements:', error);
        showNotification('Error fetching arrangements. Please try again.', 'error');
      } finally {
        loading.value = false;
      }
    };

    const debounceFilter = () => {
      clearTimeout(filterTimeout);
      filterTimeout = setTimeout(() => filterArrangements(), 300);
    };

    const filterArrangements = () => {
      // This function is now handled by the computed property
    };

    const filteredArrangements = computed(() => {
      return arrangements.value.filter(arr => {
        const matchesSearch = arr.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                              arr.createdBy.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesOccasion = !selectedOccasion.value || arr.occasion === selectedOccasion.value;
        return matchesSearch && matchesOccasion;
      });
    });

    const loadMore = () => {
      if (!noMoreArrangements.value) {
        fetchArrangements();
      }
    };

    const selectOccasion = (occasion) => {
      selectedOccasion.value = selectedOccasion.value === occasion ? '' : occasion;
    };

    const getOccasionColor = (occasion) => {
      return occasionColors[occasion] || '#CCCCCC'; // Default color if not found
    };

    const openUploadModal = () => {
      uploadModal.show();
    };

    const handleFileUpload = (event) => {
      newArrangement.value.imageFile = event.target.files[0];
    };

    const uploadArrangement = async () => {
      if (!newArrangement.value.imageFile) return;

      uploading.value = true;
      try {
        const imageRef = storageRef(storage, `arrangements/${Date.now()}_${newArrangement.value.imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, newArrangement.value.imageFile);
        const imageUrl = await getDownloadURL(snapshot.ref);

        await addDoc(collection(db, 'arrangements'), {
          name: newArrangement.value.name,
          description: newArrangement.value.description,
          occasion: newArrangement.value.occasion,
          imageUrl: imageUrl,
          createdAt: serverTimestamp(),
          createdBy: 'Current User', // Replace with actual user info when available
          views: 0,
          category: newArrangement.value.occasion,
          status: 'pending' // Set initial status to pending
        });

        newArrangement.value = { name: '', description: '', occasion: '', imageFile: null };
        uploadModal.hide();
        showNotification('Arrangement uploaded successfully! It will be visible after admin approval.', 'success');
        fetchArrangements();
      } catch (error) {
        console.error('Error uploading arrangement:', error);
        showNotification('Failed to upload arrangement. Please try again.', 'error');
      } finally {
        uploading.value = false;
      }
    };

    const clearSearch = () => {
      searchQuery.value = '';
      selectedOccasion.value = '';
    };

    const showNotification = (message, type = 'success') => {
      notification.value = {
        show: true,
        message,
        type
      };
      setTimeout(() => {
        notification.value.show = false;
      }, 5000); // Hide notification after 5 seconds
    };

    onMounted(() => {
      fetchArrangements();
      uploadModal = new Modal(document.getElementById('uploadModal'));
    });

    return {
      filteredArrangements,
      loading,
      noMoreArrangements,
      loadMore,
      searchQuery,
      selectedOccasion,
      occasions,
      debounceFilter,
      selectOccasion,
      getOccasionColor,
      openUploadModal,
      newArrangement,
      handleFileUpload,
      uploadArrangement,
      uploading,
      clearSearch,
      notification
    };
  }
};
</script>

<style scoped>
.user-gallery {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.occasion-bubbles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.occasion-bubble {
  border-radius: 20px;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.occasion-bubble:hover, .occasion-bubble.active {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.masonry-grid {
  columns: 1;
  column-gap: 1rem;
}

@media (min-width: 640px) { .masonry-grid { columns: 2; } }
@media (min-width: 768px) { .masonry-grid { columns: 3; } }
@media (min-width: 1024px) { .masonry-grid { columns: 4; } }
@media (min-width: 1280px) { .masonry-grid { columns: 5; } }

.masonry-item {
  break-inside: avoid;
  margin-bottom: 1rem;
  display: block;
  text-decoration: none;
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background-color: #f8f8f8;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

.image-wrapper:hover {
  transform: translateY(-5px);
}

.image-wrapper:hover .creator-info {
  opacity: 1;
}

.gallery-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.image-wrapper:hover .gallery-image {
  transform: scale(1.05);
}

.creator-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.creator-name {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.occasion-tag {
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.load-more {
  text-align: center;
  padding: 2rem 0;
}

.load-more-btn {
  background: linear-gradient(45deg, #4a90e2, #63b3ed);
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.load-more-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Styles for the upload modal */
.modal-content {
  background-color: #f8f9fa;
  border-radius: 12px;
}

.modal-header {
  border-bottom: 1px solid #dee2e6;
}

.modal-title {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.form-label {
  color: #333;
}

.form-control, .form-select {
  border-radius: 8px;
}

.btn-primary {
  background: linear-gradient(45deg, #4a90e2, #63b3ed);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* New styles for improved layout */
.input-group {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.input-group .form-control {
  border: none;
  padding: 0.75rem 1rem;
}

.input-group .btn {
  padding: 0.75rem 1rem;
  background-color: #f1f3f5;
  color: #495057;
  border: none;
  transition: all 0.3s ease;
}

.input-group .btn:hover {
  background-color: #e9ecef;
}

h5 {
  color: #333;
  font-weight: 600;
}

.occasion-bubbles {
  margin-top: 0.5rem;
}

.occasion-bubble {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
}

.btn-outline-secondary:hover {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}

/* Notification styles */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  color: #fff;
  font-weight: bold;
  z-index: 1000;
  animation: slideIn 0.5s ease-out;
}

.notification-success {
  background-color: #28a745;
}

.notification-error {
  background-color: #dc3545;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>