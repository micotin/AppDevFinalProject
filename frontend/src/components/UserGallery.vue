<template>
    <div class="gallery-container">
      <div class="container mb-4">
        <div class="occasion-bubbles mb-4 pb-2 overflow-auto">
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
        <div class="row">
          <div class="col-md-6 mb-3 mb-md-0">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Search arrangements..."
              @input="debounceFilter"
            />
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
    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed } from 'vue';
  import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
  
  export default {
    name: 'UserGallery',
    setup() {
      const db = getFirestore();
      const arrangements = ref([]);
      const loading = ref(true);
      const lastVisible = ref(null);
      const noMoreArrangements = ref(false);
      const searchQuery = ref('');
      const selectedOccasion = ref('');
      const occasions = ref([]);
      let filterTimeout;
  
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
  
          const allOccasions = new Set(arrangements.value.map(arr => arr.occasion));
          occasions.value = Array.from(allOccasions);
  
        } catch (error) {
          console.error('Error fetching arrangements:', error);
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
  
      onMounted(() => {
        fetchArrangements();
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
        getOccasionColor
      };
    }
  };
  </script>
  
  <style scoped>
  .gallery-container {
    padding: 1rem;
    background-color: #ffffff;
    min-height: 100vh;
  }
  
  .occasion-bubbles {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 10px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
  }
  
  .occasion-bubbles::-webkit-scrollbar { /* WebKit */
    width: 0;
    height: 0;
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
    border-top: 3px solid #6a3093;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .load-more {
    text-align: center;
    padding: 2rem 0;
  }
  
  .load-more-btn {
    background: linear-gradient(45deg, #6a3093, #a044ff);
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 25px;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  
  .load-more-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 48, 147, 0.2);
  }
  
  .load-more-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>