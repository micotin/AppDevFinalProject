<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container h-100">
        <div class="row h-100 align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-4">Welcome to Sam1 Flower Shop</h1>
            <p class="lead mb-5">From Petals to Pixels, we bring the beauty of flowers to your doorstep.</p>
            <div class="d-flex gap-3">
              <router-link to="/login" class="btn btn-primary btn-lg">Login</router-link>
              <router-link to="/signup" class="btn btn-outline-primary btn-lg">Sign Up</router-link>
            </div>
          </div>
          <div class="col-lg-6 d-none d-lg-block">
            <div class="flower-gallery">
              <div class="flower-image flower-1"></div>
              <div class="flower-image flower-2"></div>
              <div class="flower-image flower-3"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="why-choose-us py-5">
      <div class="container">
        <h2 class="text-center mb-5">Why Choose Us</h2>
        <div class="row">
          <div class="col-md-4 mb-4" v-for="(reason, index) in reasons" :key="index">
            <transition appear
                        @before-enter="beforeEnter"
                        @enter="enter"
                        :css="false">
              <div class="card h-100">
                <div class="card-body text-center">
                  <i :class="reason.icon" class="fas fa-3x mb-3" :style="{ color: reason.color }"></i>
                  <h5 class="card-title">{{ reason.title }}</h5>
                  <p class="card-text">{{ reason.description }}</p>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </section>

    <!-- About Us Section -->
    <section class="about-us py-5 bg-light">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-4 mb-lg-0">
            <transition appear name="fade-slide">
              <img src="https://images.unsplash.com/photo-1534710961216-75c88202f43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" alt="Sam1 Flower Shop" class="img-fluid rounded">
            </transition>
          </div>
          <div class="col-lg-6">
            <transition appear name="fade-slide" mode="out-in">
              <div>
                <h2 class="mb-4">About Sam1 Flower Shop</h2>
                <p>At Sam1 Flower Shop, we're passionate about bringing the beauty and joy of flowers into your life. With over 20 years of experience, we've been creating stunning floral arrangements for all occasions.</p>
                <p>Our team of expert florists carefully selects the freshest blooms to ensure that every bouquet is perfect. We believe in the power of flowers to brighten someone's day and create lasting memories.</p>
                <a href="#" class="btn btn-outline-primary">Learn More</a>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-light py-4">
      <div class="container">
        <div class="row">
          <div class="col-md-4 mb-3 mb-md-0">
            <h5>Contact Us</h5>
            <p>123 Flower Street, Bloomville, FL 12345</p>
            <p>Email: info@sam1flowershop.com</p>
            <p>Phone: (123) 456-7890</p>
          </div>
          <div class="col-md-4 mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul class="list-unstyled">
              <li><a href="#" class="text-light">Home</a></li>
              <li><a href="#" class="text-light">Shop</a></li>
              <li><a href="#" class="text-light">About Us</a></li>
              <li><a href="#" class="text-light">Contact</a></li>
            </ul>
          </div>
          <div class="col-md-4">
            <h5>Newsletter</h5>
            <p>Subscribe to our newsletter for updates and special offers!</p>
            <form @submit.prevent="subscribeNewsletter">
              <div class="input-group mb-3">
                <input v-model="email" type="email" class="form-control" placeholder="Your email" aria-label="Your email" aria-describedby="button-addon2" required>
                <button class="btn btn-primary" type="submit" id="button-addon2">Subscribe</button>
              </div>
            </form>
          </div>
        </div>
        <hr class="my-4">
        <p class="text-center mb-0">&copy; 2023 Sam1 Flower Shop. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { gsap } from 'gsap';

export default {
  name: 'LandingPage',
  data() {
    return {
      email: '',
      reasons: [
        {
          icon: 'fa-flower',
          color: '#e74c3c',
          title: "Fresh Flowers Daily",
          description: "We source our flowers directly from local growers to ensure the freshest blooms."
        },
        {
          icon: 'fa-truck',
          color: '#3498db',
          title: "Fast & Free Delivery",
          description: "Enjoy free same-day delivery on all orders placed before 2 PM."
        },
        {
          icon: 'fa-heart',
          color: '#2ecc71',
          title: "100% Satisfaction Guarantee",
          description: "Not happy? We'll make it right or refund your purchase, no questions asked."
        }
      ]
    }
  },
  methods: {
    beforeEnter(el) {
      el.style.opacity = 0;
      el.style.transform = 'translateY(50px)';
    },
    enter(el, done) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        onComplete: done,
        delay: el.dataset.index * 0.2
      });
    },
    subscribeNewsletter() {
      // Here you would typically send the email to your backend
      alert(`Thank you for subscribing with: ${this.email}`);
      this.email = '';
    }
  }
};
</script>

<style scoped>
.landing-page {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.hero-section {
  min-height: 100vh;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

h1 {
  color: #2c3e50;
  font-size: 3.5rem;
}

.lead {
  color: #34495e;
  font-size: 1.25rem;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  border-radius: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #e74c3c;
  border-color: #e74c3c;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: #c0392b;
  border-color: #c0392b;
}

.btn-outline-primary {
  color: #e74c3c;
  border-color: #e74c3c;
}

.btn-outline-primary:hover, .btn-outline-primary:focus {
  background-color: #e74c3c;
  color: #fff;
}

.flower-gallery {
  position: relative;
  height: 500px;
}

.flower-image {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: float 6s ease-in-out infinite;
}

.flower-image:hover {
  transform: scale(1.05);
}

.flower-1 {
  top: 0;
  left: 0;
  background-image: url('https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80');
  animation-delay: 0s;
}

.flower-2 {
  top: 150px;
  right: 0;
  background-image: url('https://images.unsplash.com/photo-1508610048659-a06b669e3321?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=735&q=80');
  animation-delay: 2s;
}

.flower-3 {
  bottom: 0;
  left: 100px;
  background-image: url('https://images.unsplash.com/photo-1533616688419-b7a585564566?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80');
  animation-delay: 4s;
}

@keyframes float {
  0% {
    transform: translatey(0px);
  }
  50% {
    transform: translatey(-20px);
  }
  100% {
    transform: translatey(0px);
  }
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@media (max-width: 991.98px) {
  .hero-section {
    text-align: center;
  }

  h1 {
    font-size: 2.5rem;
  }

  .lead {
    font-size: 1.1rem;
  }
}
</style>