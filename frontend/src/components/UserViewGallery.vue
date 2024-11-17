<template>
    <div class="gallery-view bg-white">
      <div class="container-fluid py-4">
        <!-- Back button -->
        <button @click="goBack" class="btn btn-outline-secondary mb-4">
          <i class="bi bi-arrow-left me-2"></i>Back to Gallery
        </button>
  
        <div class="row">
          <!-- Main Image Column -->
          <div class="col-12 col-lg-4 mb-4">
            <div class="card border-0 rounded-4 shadow-sm overflow-hidden sticky-sidebar">
              <div class="position-relative main-image-container">
                <img 
                  :src="selectedImage?.imageUrl" 
                  :alt="selectedImage?.name"
                  class="card-img-top main-image"
                  v-if="selectedImage"
                  loading="lazy"
                >
                <div class="image-overlay d-flex justify-content-end p-3">
                  <button class="btn btn-light btn-sm rounded-circle" @click="openFullScreenImage" aria-label="View larger image">
                    <i class="bi bi-arrows-fullscreen"></i>
                  </button>
                </div>
              </div>
              <div class="card-body p-4">
                <h3 class="fw-bold mb-2">{{ selectedImage?.name }}</h3>
                <p class="text-muted mb-3">{{ selectedImage?.description }}</p>
                
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <span class="badge bg-primary text-white rounded-pill px-3 py-2">
                    {{ selectedImage?.category }}
                  </span>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-eye-fill me-2"></i>
                    <span>{{ selectedImage?.views || 0 }} views</span>
                  </div>
                </div>
                
                <div class="d-flex align-items-center gap-3 mb-4">
                  <div v-if="selectedImage?.creatorAvatar" class="rounded-circle overflow-hidden" style="width: 48px; height: 48px;">
                    <img 
                      :src="selectedImage.creatorAvatar" 
                      class="w-100 h-100 object-fit-cover"
                      :alt="selectedImage.createdBy"
                    >
                  </div>
                  <div v-else class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white" style="width: 48px; height: 48px;">
                    {{ getInitials(selectedImage?.createdBy) }}
                  </div>
                  <div class="flex-grow-1">
                    <div class="fw-semibold">{{ selectedImage?.createdBy }}</div>
                    <div class="text-muted small">{{ formatDate(selectedImage?.createdAt) }}</div>
                  </div>
                </div>
  
                <div class="d-flex justify-content-end align-items-center">
                  <button class="btn btn-primary" @click="downloadImage">
                    <i class="bi bi-download me-2"></i> Download
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Category Images Column -->
          <div class="col-12 col-lg-8">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="fw-bold mb-0">More from {{ selectedImage?.category }}</h5>
            </div>
  
            <div class="pinterest-grid">
              <div 
                v-for="item in filteredCategoryImages" 
                :key="item.id"
                class="grid-item"
                @click="selectImage(item)"
                role="button"
                tabindex="0"
                @keydown.enter="selectImage(item)"
                :aria-label="`View image ${item.name}`"
              >
                <div class="card border-0 rounded-4 overflow-hidden shadow-sm h-100">
                  <div class="position-relative h-100">
                    <img 
                      :src="item.imageUrl" 
                      class="category-image"
                      :alt="item.name"
                      loading="lazy"
                      @load="onImageLoad"
                    >
                    <div class="image-overlay d-flex justify-content-between align-items-end p-2">
                    </div>
                    <div class="image-info">
                      <h6 class="mb-1 text-white">{{ item.name }}</h6>
                      <p class="small text-white-50 mb-0">{{ item.createdBy }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="loading" class="loading-spinner">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-if="!loading && hasMoreImages" class="text-center mt-4">
              <button @click="loadMoreImages" class="btn btn-outline-primary rounded-pill">
                Load More
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Full Screen Image View -->
      <div class="fullscreen-view" v-if="showFullScreenImage" @click="closeFullScreenImage">
        <div class="fullscreen-content" @click.stop>
          <img 
            :src="selectedImage?.imageUrl" 
            :alt="selectedImage?.name" 
            class="fullscreen-image"
          >
          <button class="close-button" @click="closeFullScreenImage" aria-label="Close full screen image">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, watch, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs, limit, startAfter } from 'firebase/firestore'
  import { getAuth } from 'firebase/auth'
  
  export default {
    name: 'UserViewGallery',
    setup() {
      const route = useRoute()
      const router = useRouter()
      const db = getFirestore()
      const auth = getAuth()
  
      const selectedImage = ref(null)
      const categoryImages = ref([])
      const loading = ref(false)
      const lastVisible = ref(null)
      const hasMoreImages = ref(true)
      const showFullScreenImage = ref(false)
  
      const filteredCategoryImages = computed(() => 
        categoryImages.value.filter(item => item.id !== selectedImage.value?.id)
      )
  
      const fetchInitialImage = async () => {
        try {
          const docRef = doc(db, 'arrangements', route.params.id)
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            selectedImage.value = { id: docSnap.id, ...docSnap.data() }
            await fetchCategoryImages()
            await incrementViewCount(docRef)
          }
        } catch (error) {
          console.error('Error fetching initial image:', error)
        }
      }
  
      const incrementViewCount = async (docRef) => {
        if (auth.currentUser) {
          const userId = auth.currentUser.uid
          const viewedKey = `viewed_${userId}`
          
          if (!selectedImage.value[viewedKey]) {
            try {
              await updateDoc(docRef, {
                views: (selectedImage.value.views || 0) + 1,
                [viewedKey]: true
              })
              selectedImage.value.views = (selectedImage.value.views || 0) + 1
              selectedImage.value[viewedKey] = true
            } catch (error) {
              console.error('Error updating view count:', error)
            }
          }
        }
      }
  
      const fetchCategoryImages = async () => {
        if (!selectedImage.value?.category) return
        
        try {
          loading.value = true
          
          const q = query(
            collection(db, 'arrangements'),
            where('category', '==', selectedImage.value.category),
            limit(12)
          )
  
          const querySnapshot = await getDocs(q)
          
          categoryImages.value = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.id !== selectedImage.value.id)
  
          hasMoreImages.value = querySnapshot.docs.length === 12
          
        } catch (error) {
          console.error('Error fetching category images:', error)
        } finally {
          loading.value = false
        }
      }
  
      const loadMoreImages = async () => {
        if (!selectedImage.value?.category || loading.value) return
  
        try {
          loading.value = true
  
          const q = query(
            collection(db, 'arrangements'),
            where('category', '==', selectedImage.value.category),
            limit(12)
          )
  
          const querySnapshot = await getDocs(q)
  
          const newImages = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.id !== selectedImage.value.id && !categoryImages.value.some(existing => existing.id === item.id))
  
          categoryImages.value.push(...newImages)
  
          hasMoreImages.value = querySnapshot.docs.length === 12
  
        } catch (error) {
          console.error('Error loading more images:', error)
        } finally {
          loading.value = false
        }
      }
  
      const selectImage = async (image) => {
        selectedImage.value = image
        router.push({ 
          name: 'UserViewGallery', 
          params: { id: image.id },
          replace: true
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
        
        const docRef = doc(db, 'arrangements', image.id)
        await incrementViewCount(docRef)
      }
  
      const onImageLoad = (event) => {
        event.target.classList.add('loaded')
      }
  
      const goBack = () => {
        router.push({ name: 'UserGallery' })
      }
  
      const openFullScreenImage = () => {
        showFullScreenImage.value = true
        document.body.style.overflow = 'hidden'
      }
  
      const closeFullScreenImage = () => {
        showFullScreenImage.value = false
        document.body.style.overflow = ''
      }
  
      const downloadImage = async () => {
        try {
          const response = await fetch(selectedImage.value.imageUrl, { mode: 'cors' });
          if (!response.ok) throw new Error('Network response was not ok');
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${selectedImage.value.name}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error downloading image:', error);
          alert('Failed to download the image. Please try again later.');
        }
      }
  
      const formatDate = (date) => {
        if (!date) return ''
        return new Date(date.seconds * 1000).toLocaleDateString()
      }
  
      const getInitials = (name) => {
        if (!name) return '??'
        return name
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      };
  
      watch(() => route.params.id, () => {
        fetchInitialImage()
      })
  
      onMounted(() => {
        fetchInitialImage()
      })
  
      return {
        selectedImage,
        categoryImages,
        loading,
        hasMoreImages,
        showFullScreenImage,
        selectImage,
        onImageLoad,
        goBack,
        openFullScreenImage,
        closeFullScreenImage,
        downloadImage,
        loadMoreImages,
        formatDate,
        getInitials,
        filteredCategoryImages
      }
    }
  }
  </script>
  
  <style scoped>
  .gallery-view {
    background-color: #ffffff;
  }
  
  .sticky-sidebar {
    position: sticky;
    top: 80px; /* Adjust this value to match your header height */
  }
  
  .main-image-container {
    position: relative;
    overflow: hidden;
  }
  
  .main-image {
    width: 100%;
    height: auto;
    object-fit: contain;
    transition: transform 0.3s ease;
  }
  
  .main-image-container:hover .main-image {
    transform: scale(1.05);
  }
  
  .image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent 50%, rgba(0, 0, 0, 0.3));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .main-image-container:hover .image-overlay {
    opacity: 1;
  }
  
  .image-overlay .btn {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .image-overlay .btn i {
    font-size: 1rem;
  }
  
  .pinterest-grid {
    columns: 3 250px;
    column-gap: 1rem;
    margin: 0 auto;
  }
  
  .grid-item {
    break-inside: avoid;
    margin-bottom: 1rem;
    position: relative;
    cursor: pointer;
  }
  
  .category-image {
    width: 100%;
    height: auto;
    display: block;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .category-image.loaded {
    opacity: 1;
  }
  
  .grid-item:hover .category-image {
    transform: scale(1.05);
  }
  
  .image-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .grid-item:hover .image-info {
    opacity: 1;
  }
  
  .loading-spinner {
    text-align: center;
    padding: 2rem 0;
  }
  
  .fullscreen-view {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
  }
  
  .fullscreen-content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .fullscreen-image {
    max-width: 95vw;
    max-height: 95vh;
    object-fit: contain;
  }
  
  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    z-index: 1060;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
  }
  
  .close-button:hover {
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    .pinterest-grid {
      columns: 2 180px;
    }
  }
  
  @media (max-width: 480px) {
    .pinterest-grid {
      columns: 1 100%;
    }
  }
  </style>