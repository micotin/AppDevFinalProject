<template>
  <div class="user-home">
    <!-- Hero Section -->
    <section class="hero-section text-center text-white py-5">
      <div class="container">
        <h1 class="display-3 fw-bold mb-4 animated fadeIn">Welcome to SAM1 Flower Shop</h1>
        <p class="lead mb-4 animated fadeIn delay-1">Bringing digital beauty to your life</p>
        <router-link to="/shop" class="btn btn-lg btn-outline-light animated fadeIn delay-2">
          <i class="bi bi-cart-plus me-2"></i>Shop Now
        </router-link>
      </div>
    </section>

    <!-- Featured Arrangements Section -->
    <section class="featured-arrangements py-5">
      <div class="container">
        <h2 class="text-center mb-5 animated fadeIn">
          <i class="bi bi-flower1 me-2"></i>Featured Arrangements
        </h2>
        <div class="row g-4">
          <div
            v-for="product in featuredProducts"
            :key="product.id"
            class="col-md-4 d-flex align-items-stretch animated fadeInUp delay-1"
          >
            <div class="card h-100 border-0 shadow-lg hover-card">
              <div class="card-img-wrapper position-relative">
                <img :src="product.imageUrl" :alt="product.name" class="card-img-top rounded-top" />
                <div class="card-img-overlay d-flex flex-column justify-content-end p-3">
                  <span class="badge bg-primary mb-2">{{ product.category }}</span>
                  <h5 class="card-title text-white mb-0">{{ product.name }}</h5>
                </div>
              </div>
              <div class="card-body d-flex flex-column">
                <p class="card-text text-muted">{{ product.description }}</p>
                <div class="d-flex justify-content-between align-items-center mt-3">
                  <h6 class="text-primary">₱{{ product.price.toFixed(2) }}</h6>
                  <button class="btn btn-outline-primary">
                    <i class="bi bi-eye me-2"></i>View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="services-section py-5 bg-light">
      <div class="container">
        <h2 class="text-center mb-5 animated fadeIn">Our Tech-Driven Services</h2>
        <div class="row g-4 text-center">
          <div class="col-md-4 animated fadeInLeft">
            <div class="service-card p-4 bg-white rounded shadow-lg hover-card">
              <i class="bi bi-palette display-4 text-primary mb-3"></i>
              <h5>AI-Powered Custom Arrangements</h5>
              <p class="text-muted">Create your perfect bouquet using our advanced AI algorithm</p>
            </div>
          </div>
          <div class="col-md-4 animated fadeInUp">
            <div class="service-card p-4 bg-white rounded shadow-lg hover-card">
              <i class="bi bi-truck display-4 text-primary mb-3"></i>
              <h5>Drone Delivery</h5>
              <p class="text-muted">Ultra-fast delivery to your doorstep via our drone fleet</p>
            </div>
          </div>
          <div class="col-md-4 animated fadeInRight">
            <div class="service-card p-4 bg-white rounded shadow-lg hover-card">
              <i class="bi bi-camera display-4 text-primary mb-3"></i>
              <h5>AR Event Preview</h5>
              <p class="text-muted">Visualize your event's floral design with augmented reality</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Navigation Menu -->
    <nav class="user-nav text-center py-5">
      <div class="container">
        <h2 class="mb-4 animated fadeIn">Explore Our Digital Garden</h2>
        <div class="row g-3 justify-content-center">
          <div class="col-md-3 col-sm-6 animated fadeInUp delay-1">
            <router-link to="/shop" class="btn btn-primary w-100 hover-button">
              <i class="bi bi-shop me-2"></i>Shop All
            </router-link>
          </div>
          <div class="col-md-3 col-sm-6 animated fadeInUp delay-2">
            <router-link to="/about" class="btn btn-primary w-100 hover-button">
              <i class="bi bi-info-circle me-2"></i>About Us
            </router-link>
          </div>
          <div class="col-md-3 col-sm-6 animated fadeInUp delay-3">
            <router-link to="/contact" class="btn btn-primary w-100 hover-button">
              <i class="bi bi-envelope me-2"></i>Contact Us
            </router-link>
          </div>
          <div class="col-md-3 col-sm-6 animated fadeInUp delay-4">
            <router-link to="/faq" class="btn btn-primary w-100 hover-button">
              <i class="bi bi-question-circle me-2"></i>FAQ
            </router-link>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

export default {
  name: 'UserHome',
  setup() {
    const featuredProducts = ref([]);

    const fetchFeaturedProducts = async () => {
      const productsRef = collection(db, 'products');
      const featuredQuery = query(productsRef, where('featured', '==', true), limit(3));
      const querySnapshot = await getDocs(featuredQuery);
      featuredProducts.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    onMounted(fetchFeaturedProducts);

    return {
      featuredProducts,
    };
  },
};
</script>

<style scoped>
.user-home {
  font-family: 'Poppins', sans-serif;
}

.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('/images/background.jpg') center center / cover no-repeat;
  height: 70vh; /* This sets the height */
  padding: 0; /* Remove padding to use the full height */
  position: relative;
  width: 100vw; /* Make sure the section spans the full viewport width */
  left: 50%; /* Shift to the right by half of the viewport */
  right: 50%; /* Shift to the left by half of the viewport */
  margin-left: -50vw; /* Pull back by half of the viewport width */
  margin-right: -50vw; /* Pull back by half of the viewport width */
}

.featured-arrangements h2,
.services-section h2,
.user-nav h2 {
  color: #4a0e4e;
  font-weight: 600;
}

.hover-card {
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
}

.hover-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.card-img-wrapper {
  overflow: hidden;
  border-radius: 0.5rem 0.5rem 0 0;
}

.card-img-top {
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s;
}

.card-img-overlay {
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
}

.hover-card:hover .card-img-overlay {
  opacity: 1;
}

.service-card:hover,
.hover-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }
</style>
