<template>
    <div class="user-review-container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Review Submission Form -->
          <div class="card shadow-sm mb-5">
            <div class="card-header bg-gradient-primary text-white">
              <h2 class="h4 mb-0">Share Your Experience</h2>
            </div>
            <div class="card-body">
              <form @submit.prevent="submitReview">
                <div class="mb-3">
                  <label for="category" class="form-label">Category</label>
                  <select class="form-select" id="category" v-model="category" required :disabled="isEditing">
                    <option value="" disabled>Select a category</option>
                    <option value="product">Product</option>
                    <option value="service">Service</option>
                    <option value="delivery">Delivery</option>
                    <option value="overall">Overall Experience</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="rating" class="form-label">Rating</label>
                  <div class="star-rating">
                    <i v-for="star in 5" :key="star" 
                       :class="['bi', star <= rating ? 'bi-star-fill' : 'bi-star', 'star-icon']"
                       @click="setRating(star)"
                       @mouseover="hoverRating = star"
                       @mouseleave="hoverRating = rating">
                    </i>
                  </div>
                </div>
                <div class="mb-3">
                  <label for="reviewText" class="form-label">Your Review</label>
                  <textarea
                    class="form-control"
                    id="reviewText"
                    v-model="reviewText"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <button type="submit" class="btn btn-gradient-primary" :disabled="!canSubmitReview">
                  {{ isEditing ? 'Update Review' : 'Submit Review' }}
                </button>
                <button v-if="!isEditing && userReviews[category]" @click="editReview(category)" type="button" class="btn btn-outline-primary ml-2">
                  Edit Your Review
                </button>
                <p v-if="!canSubmitReview" class="text-danger mt-2">
                  Please fill in all fields to submit a review.
                </p>
              </form>
            </div>
          </div>
  
          <!-- Display Other Users' Reviews -->
          <div class="card shadow-sm">
            <div class="card-header bg-gradient-secondary text-white">
              <h2 class="h4 mb-0">Customer Reviews</h2>
            </div>
            <div class="card-body">
              <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div v-else-if="reviews.length === 0" class="text-center py-5">
                <p class="text-muted mb-0">No reviews yet. Be the first to share your experience!</p>
              </div>
              <div v-else class="review-list">
                <div v-for="review in reviews" :key="review.id" class="review-item card mb-3 border-0 shadow-sm">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h5 class="card-title mb-0 text-primary">{{ review.firstName }} {{ review.lastName }}</h5>
                      <span class="badge bg-light text-primary">{{ review.category }}</span>
                    </div>
                    <div class="mb-2">
                      <i v-for="star in 5" :key="star" 
                         :class="['bi', star <= review.rating ? 'bi-star-fill' : 'bi-star', 'text-warning']">
                      </i>
                    </div>
                    <p class="card-text text-muted">{{ review.reviewText }}</p>
                    <small class="text-muted">{{ formatDate(review.createdAt) }}</small>
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
  import { getAuth } from 'firebase/auth';
  import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, serverTimestamp, query, orderBy, getDocs, where } from 'firebase/firestore';
  
  export default {
    name: 'UserReview',
    setup() {
      const auth = getAuth();
      const db = getFirestore();
      const category = ref('');
      const rating = ref(0);
      const hoverRating = ref(0);
      const reviewText = ref('');
      const reviews = ref([]);
      const loading = ref(true);
      const lastReviewDate = ref(null);
      const userReviews = ref({});
      const isEditing = ref(false);
      const editingReviewId = ref(null);
  
      const canSubmitReview = computed(() => {
        return category.value && rating.value > 0 && reviewText.value.trim() !== '';
      });
  
      const fetchUserDetails = async () => {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            lastReviewDate.value = userData.lastReviewDate?.toDate();
          }
          
          // Fetch user's reviews
          const userReviewsQuery = query(collection(db, 'reviews'), where('userId', '==', user.uid));
          const userReviewsSnapshot = await getDocs(userReviewsQuery);
          userReviewsSnapshot.forEach((doc) => {
            const reviewData = doc.data();
            userReviews.value[reviewData.category] = { id: doc.id, ...reviewData };
          });
        }
      };
  
      const fetchReviews = async () => {
        const reviewsCollection = collection(db, 'reviews');
        const q = query(reviewsCollection, orderBy('createdAt', 'desc'));
  
        try {
          const querySnapshot = await getDocs(q);
          reviews.value = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          }));
        } catch (error) {
          console.error('Error fetching reviews:', error);
        } finally {
          loading.value = false;
        }
      };
  
      const setRating = (value) => {
        rating.value = value;
      };
  
      const submitReview = async () => {
        const user = auth.currentUser;
        if (user) {
          try {
            const reviewData = {
              userId: user.uid,
              firstName: user.displayName.split(' ')[0],
              lastName: user.displayName.split(' ')[1] || '',
              category: category.value,
              rating: rating.value,
              reviewText: reviewText.value,
              updatedAt: serverTimestamp(),
            };
  
            if (isEditing.value && editingReviewId.value) {
              // Update existing review
              await updateDoc(doc(db, 'reviews', editingReviewId.value), reviewData);
            } else {
              // Add new review
              reviewData.createdAt = serverTimestamp();
              const docRef = await addDoc(collection(db, 'reviews'), reviewData);
              userReviews.value[category.value] = { id: docRef.id, ...reviewData };
            }
  
            // Reset form after submission
            category.value = '';
            rating.value = 0;
            reviewText.value = '';
            isEditing.value = false;
            editingReviewId.value = null;
  
            alert(isEditing.value ? 'Your review has been updated!' : 'Thank you for your review!');
            fetchReviews(); // Refresh the reviews list
          } catch (error) {
            console.error('Error submitting review:', error);
            alert('There was an error submitting your review. Please try again.');
          }
        }
      };
  
      const editReview = (reviewCategory) => {
        const review = userReviews.value[reviewCategory];
        if (review) {
          category.value = review.category;
          rating.value = review.rating;
          reviewText.value = review.reviewText;
          isEditing.value = true;
          editingReviewId.value = review.id;
        }
      };
  
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };
  
      onMounted(() => {
        fetchUserDetails();
        fetchReviews();
      });
  
      return {
        category,
        rating,
        hoverRating,
        reviewText,
        reviews,
        loading,
        canSubmitReview,
        setRating,
        submitReview,
        formatDate,
        userReviews,
        isEditing,
        editingReviewId,
        editReview
      };
    },
  };
  </script>
  
  <style scoped>
  .user-review-container {
    font-family: 'Poppins', sans-serif;
    padding: 2rem 0;
  }
  
  .card {
    border-radius: 15px;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .card:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  .card-header {
    padding: 1.25rem 1.5rem;
  }
  
  .bg-gradient-primary {
    background: linear-gradient(45deg, #8e44ad, #9b59b6);
  }
  
  .bg-gradient-secondary {
    background: linear-gradient(45deg, #34495e, #2c3e50);
  }
  
  .form-label {
    font-weight: 500;
    color: #4a4a4a;
  }
  
  .form-control, .form-select {
    border-radius: 8px;
    border: 1px solid #ced4da;
    padding: 0.75rem;
    transition: all 0.3s ease;
  }
  
  .form-control:focus, .form-select:focus {
    border-color: #8e44ad;
    box-shadow: 0 0 0 0.2rem rgba(142, 68, 173, 0.25);
  }
  
  .star-rating {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  
  .star-icon {
    font-size: 1.5rem;
    color: #ffc107;
    cursor: pointer;
    transition: color 0.2s ease;
    margin-right: 0.25rem;
  }
  
  .star-icon:hover {
    color: #ffac07;
  }
  
  .btn-gradient-primary {
    background: linear-gradient(45deg, #8e44ad, #9b59b6);
    border: none;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  
  .btn-gradient-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(142, 68, 173, 0.3);
  }
  
  .btn-gradient-primary:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
  
  .review-item {
    border-radius: 10px;
    transition: all 0.3s ease;
  }
  
  .review-item:hover {
    transform: translateY(-3px);
  }
  
  .badge {
    font-weight: 500;
    padding: 0.5em 0.75em;
    border-radius: 20px;
  }
  
  .spinner-border {
    width: 3rem;
    height: 3rem;
  }
  
  @media (max-width: 768px) {
    .user-review-container {
      padding: 1rem 0;
    }
  
    .card-header {
      padding: 1rem;
    }
  
    .form-control, .form-select {
      padding: 0.5rem;
    }
  
    .btn-gradient-primary {
      padding: 0.5rem 1rem;
    }
  }
  </style>
  
  