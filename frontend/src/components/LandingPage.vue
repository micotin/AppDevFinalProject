<template>
  <div class="landing-page">
    <img class="shop-logo" src="/images/logo.png" alt="Logo" />

    <nav class="navbar navbar-expand-lg navbar-light navbar-custom fixed-top">
  <div class="container">
    <a class="navbar-brand" href="#">
      Sam1 Flower Shop
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <router-link class="nav-link" to="/">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/shop">Shop</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/about">About Us</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/contact">Contact</router-link>
        </li>
      </ul>
    </div>
  </div>
</nav>




    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container h-100">
        <div class="row h-100 align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-4">Welcome to Sam1 Flower Shop</h1>
            <p class="lead mb-5">Whatever the occasions, our flowers will make it special.</p>
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
<section class="why-choose-us py-5 bg-light about-us-custom">
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
<section class="about-us py-5">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-lg-6">
        <transition appear name="fade-slide" mode="out-in">
          <div>
            <h2 class="mb-4">About Sam1 Flower Shop</h2>
            <p>SAM1 Flowershop is an online flowershop with the physical shop located at Lumangbayan, Calapan City that offers flowers, gifts, surprise presents, flower arrangements in any occasions at the most affordable prices.</p>
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
  <p>
    <i class="fas fa-map-marker-alt"></i> <!-- Location icon -->
    Gov. Ignacio St., Lumangbayan 5200 Calapan, Philippines
  </p>
  <p>
    <i class="fas fa-envelope"></i> <!-- Email icon -->
    shaanee1823@gmail.com
  </p>
  <p>
    <i class="fas fa-phone"></i> <!-- Phone icon -->
    +63 975 181 7161
  </p>
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
        <p class="text-center mb-0">&copy; 2024 Sam1 Flower Shop. All rights reserved.</p>
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
          icon: 'fas fa-seedling',
          color: '#e74c3c',
          title: 'Fresh Flowers Daily',
          description: 'We source our flowers directly from local growers to ensure the freshest blooms.',
        },
        {
          icon: 'fa-truck',
          color: '#3498db',
          title: "Fast & Free Delivery",
          description: "Enjoy free same-day delivery on all orders placed before 2 PM."
        },
        {
          icon: 'fas fa-star',
          color: '#FFD700',
          title: '100% Recommended (7 Reviews)',
          description: 'We value your feedback and strive for excellence in our services.',
        }
      ],
      isHidden: true, // To control visibility
    };
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
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
    handleScroll() {
      const heroSection = this.$el.querySelector('#hero-section');
      const whyChooseUsSection = this.$el.querySelector('#why-choose-us');
      const scrollPosition = window.scrollY;

      // Check the scroll position to toggle visibility
      if (scrollPosition > heroSection.clientHeight) {
        if (this.isHidden) {
          gsap.to(whyChooseUsSection, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            onComplete: () => {
              this.isHidden = false; // Update the state
            }
          });
        }
      } else {
        if (!this.isHidden) {
          gsap.to(whyChooseUsSection, {
            opacity: 0,
            y: 50,
            duration: 0.5,
            onComplete: () => {
              this.isHidden = true; // Update the state
            }
          });
        }
      }
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
  background: url('/images/background.jpg') no-repeat center center fixed;
  background-size: cover;
}

.hero-section {
  min-height: 70vh;
  padding-top: 5rem;
  padding-bottom: 1rem;
  background: rgba(0, 0, 0, 0.1); 
}

.about-us {
  background-color: white; /* Ensure the background is white */
}

h1 {
  color: #ffffff;
  font-size: 3.5rem;
}

.lead {
  color: #ffffff;
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
  background-color: #ee2813;
  border-color: #ee2813;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: #c0392b;
  border-color: #c0392b;
}

.btn-outline-primary {
  color: #ffffff;
  border-color: #ffffff;
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
  top: 10%; /* Adjusted top position to bring it slightly lower */
  left: 10%; /* Adjusted left position to move it closer to the center */
  background-image: url('/images/image_3.jpg');
  animation-delay: 0s;
  width: 250px; /* Optional: Adjust width for aesthetics */
  height: 250px; /* Optional: Adjust height for aesthetics */
}


.flower-2 {
  top: 10%; /* Keep it aligned with flower-1 */
  right: 10%; /* Adjusted right position */
  background-image: url('/images/image_1.jpg');
  animation-delay: 1s;
  width: 250px; /* Optional */
  height: 250px; /* Optional */
}

.flower-3 {
  bottom: 10%; /* Move it closer to the center */
  left: 40%; /* Adjust left to keep it balanced */
  transform: translateX(-50%);
  background-image: url('/images/image_2.jpg');
  animation-delay: 2s;
  width: 250px; /* Optional */
  height: 250px; /* Optional */
}

@keyframes float {
  0%, 100% {
    transform: translatey(0px);
  }
  50% {
    transform: translatey(-15px);
  }
}

.shop-logo {
  position: absolute; /* Position it absolutely within the flower-gallery */
  top: 50%; /* Center it vertically */
  left: 50%; /* Center it horizontally */
  transform: translate(-50%, -50%); /* Centering adjustment */
  z-index: 0; /* Ensure it is behind other elements */
  width: 370px; /* Set the desired width */
  height: auto; /* Maintain aspect ratio */
  opacity: 0.9; /* Optional: make it slightly transparent to blend into the background */
}

.nav-link {
  color: #000; /* Change the link color to black */
  font-size: 1.1rem; /* Increase the font size (adjust as needed) */
}

.nav-link:hover {
  color: #fff; /* Change color to white on hover */
}


.nav-item:hover .nav-link {
  background-color: rgba(255, 255, 255, 0.1); /* Light background on hover */
}

.navbar-custom {
  background-color: rgba(255, 255, 255, 0.3); /* Semi-transparent white */
  /* Or you can use a light gray color, e.g., #f8f9fa */
}

.about-us p {
  text-align: justify; /* Justifies the text in the paragraph */
  color: #e0e0e0;
}

/* Styles for the About Us Section */
.about-us {
  background-color: rgba(0, 0, 0, 0.5); /* Dark background with 70% opacity */
  color: white; /* White text for better contrast */
  padding: 50px 0; /* Add some padding for visual appeal */
  border-radius: 8px; /* Optional: add rounded corners */
}

/* Optional: Adjust the text color for specific elements */
.about-us h2 {
  color: #ec4532; /* Gold color for the title */
}


#why-choose-us {
  opacity: 0; /* Initially hidden */
  transform: translateY(50px); /* Position it down for animation */
  transition: opacity 0.5s ease-in-out; /* Smooth transition */
}


/* Rest of your styles */
</style>
