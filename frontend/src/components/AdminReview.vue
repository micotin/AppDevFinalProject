<template>
  <div class="admin-review-container">
    <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
      <div class="card-header border-bottom d-flex justify-content-between align-items-center py-3">
        <h2 class="h5 mb-0 text-white"><i class="bi bi-star-fill me-2"></i>Customer Reviews</h2>
        <div class="d-flex gap-2">
          <select v-model="filterCategory" class="form-select form-select-sm">
            <option value="">All Categories</option>
            <option value="product">Product</option>
            <option value="service">Service</option>
            <option value="delivery">Delivery</option>
            <option value="overall">Overall Experience</option>
          </select>
          <select v-model="sortOption" class="form-select form-select-sm">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
          <select v-model="visibilityFilter" class="form-select form-select-sm">
            <option value="all">All Reviews</option>
            <option value="visible">Visible Only</option>
            <option value="hidden">Hidden Only</option>
          </select>
        </div>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="filteredReviews.length === 0" class="text-center py-5">
          <p class="text-muted mb-0">No reviews found.</p>
        </div>
        <div v-else class="review-list">
          <div v-for="review in filteredReviews" :key="review.id" class="review-item card mb-3 border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title mb-0 text-white">{{ review.firstName }} {{ review.lastName }}</h5>
                <div>
                  <span class="badge bg-primary me-2">{{ review.category }}</span>
                  <span v-if="review.hidden" class="badge bg-warning text-dark">Hidden</span>
                </div>
              </div>
              <div class="mb-2">
                <i v-for="star in 5" :key="star" 
                   :class="['bi', star <= review.rating ? 'bi-star-fill' : 'bi-star', 'text-warning']">
                </i>
              </div>
              <p class="card-text text-white-50">{{ review.reviewText }}</p>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-white-50">{{ formatDate(review.createdAt) }}</small>
                <div>
                  <button @click="toggleReviewVisibility(review)" class="btn btn-sm btn-outline-light me-2">
                    {{ review.hidden ? 'Show' : 'Hide' }}
                  </button>
                  <button @click="deleteReview(review)" class="btn btn-sm btn-outline-danger me-2">
                    Delete
                  </button>
                  <button @click="toggleFeaturedReview(review)" class="btn btn-sm" :class="review.featured ? 'btn-warning' : 'btn-outline-warning'">
                    {{ review.featured ? 'Unfeature' : 'Feature' }}
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

<script>
import { ref, computed, onMounted } from 'vue';
import { getFirestore, collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default {
  name: 'AdminReview',
  setup() {
    const db = getFirestore();
    const reviews = ref([]);
    const loading = ref(true);
    const filterCategory = ref('');
    const sortOption = ref('newest');
    const visibilityFilter = ref('all');

    const fetchReviews = async () => {
      const reviewsCollection = collection(db, 'reviews');
      const q = query(reviewsCollection, orderBy('createdAt', 'desc'));

      try {
        const querySnapshot = await getDocs(q);
        reviews.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          hidden: doc.data().hidden || false,
          featured: doc.data().featured || false
        }));
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        loading.value = false;
      }
    };

    const filteredReviews = computed(() => {
      let result = reviews.value;

      if (filterCategory.value) {
        result = result.filter(review => review.category === filterCategory.value);
      }

      if (visibilityFilter.value !== 'all') {
        result = result.filter(review => 
          (visibilityFilter.value === 'visible' && !review.hidden) || 
          (visibilityFilter.value === 'hidden' && review.hidden)
        );
      }

      switch (sortOption.value) {
        case 'oldest':
          result.sort((a, b) => a.createdAt - b.createdAt);
          break;
        case 'highest':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'lowest':
          result.sort((a, b) => a.rating - b.rating);
          break;
        default:
          result.sort((a, b) => b.createdAt - a.createdAt);
      }

      return result;
    });

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const toggleReviewVisibility = async (review) => {
      try {
        const reviewRef = doc(db, 'reviews', review.id);
        await updateDoc(reviewRef, {
          hidden: !review.hidden
        });
        review.hidden = !review.hidden;
      } catch (error) {
        console.error('Error updating review visibility:', error);
      }
    };

    const deleteReview = async (review) => {
      if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
        try {
          await deleteDoc(doc(db, 'reviews', review.id));
          reviews.value = reviews.value.filter(r => r.id !== review.id);
        } catch (error) {
          console.error('Error deleting review:', error);
        }
      }
    };

    const toggleFeaturedReview = async (review) => {
      try {
        const reviewRef = doc(db, 'reviews', review.id);
        await updateDoc(reviewRef, {
          featured: !review.featured
        });
        review.featured = !review.featured;

        // If this review is now featured, unfeature all others
        if (review.featured) {
          for (let otherReview of reviews.value) {
            if (otherReview.id !== review.id && otherReview.featured) {
              const otherReviewRef = doc(db, 'reviews', otherReview.id);
              await updateDoc(otherReviewRef, {
                featured: false
              });
              otherReview.featured = false;
            }
          }
        }
      } catch (error) {
        console.error('Error updating featured review:', error);
      }
    };

    onMounted(fetchReviews);

    return {
      reviews,
      loading,
      filterCategory,
      sortOption,
      visibilityFilter,
      filteredReviews,
      formatDate,
      toggleReviewVisibility,
      deleteReview,
      toggleFeaturedReview
    };
  }
};
</script>

<style scoped>
.admin-review-container {
  font-family: 'Poppins', sans-serif;
  color: #ffffff;
  background: linear-gradient(135deg, #2a1b3d 0%, #1a1b3d 100%);
  min-height: 100vh;
  padding: 2rem;
}

.card {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: rgba(35, 35, 50, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.form-select:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: #e5484d;
  box-shadow: 0 0 0 0.25rem rgba(229, 72, 77, 0.25);
  color: #ffffff;
}

.review-item {
  background: rgba(35, 35, 50, 0.7);
  transition: all 0.3s ease;
}

.review-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.badge {
  font-weight: 500;
  padding: 0.5em 0.75em;
  border-radius: 20px;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  color: #e5484d;
}

.btn-primary {
  background: linear-gradient(135deg, #e5484d 0%, #a12c82 100%);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #f05a5f 0%, #b13d93 100%);
}

.btn-outline-light:hover {
  color: #1a1b3d;
}

.btn-outline-danger {
  color: #ff4d6d;
  border-color: #ff4d6d;
}

.btn-outline-danger:hover {
  background: #ff4d6d;
  color: #ffffff;
}

.btn-warning, .btn-outline-warning:hover {
  color: #1a1b3d;
}
</style>