<template>
  <div class="user-main d-flex flex-column min-vh-100">
    <!-- Header -->
    <header class="header">
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container">
          <!-- Brand -->
          <router-link class="navbar-brand" to="/">
            <span class="brand-text">SAM1 Flower Shop</span>
          </router-link>
  
          <!-- Mobile Toggle -->
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
  
          <!-- Navigation Items -->
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav mx-auto">
              <li class="nav-item">
                <router-link class="nav-link" to="/user/home" active-class="active">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/user/gallery" active-class="active">Gallery</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/user/customize" active-class="active">Customize</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/user/shop" active-class="active">Shop</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/user/contact" active-class="active">Contact</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/user/reviews" active-class="active">Reviews</router-link>
              </li>
            </ul>
  
            <!-- Profile Section -->
            <div class="nav-item dropdown" v-if="isAuthenticated">
              <a
                class="nav-link dropdown-toggle profile-toggle"
                href="#"
                id="profileDropdown"
                role="button"
                @click="toggleDropdown"
                aria-expanded="false"
              >
                <div v-if="userProfileImage" class="avatar-small">
                  <img 
                    :src="userProfileImage" 
                    :alt="userName"
                    @error="handleImageError"
                  />
                </div>
                <div v-else class="avatar-small initials-avatar">
                  {{ userInitials }}
                </div>
              </a>
              <div class="dropdown-menu dropdown-menu-start profile-dropdown" :class="{ show: isDropdownOpen }">
                <div class="dropdown-header">
                  <h3>Welcome, {{ userName }}</h3>
                  <p>{{ userEmail }}</p>
                </div>
                
                <div class="dropdown-divider"></div>
                
                <router-link to="/user/cart-fav" class="dropdown-item" @click="closeDropdown">
                  <i class="bi bi-cart3"></i>
                  My Cart
                </router-link>
                
                <router-link to="/user/order" class="dropdown-item" @click="closeDropdown">
                  <i class="bi bi-bag"></i>
                  View Orders
                </router-link>
                
                <router-link to="/user/account" class="dropdown-item" @click="closeDropdown">
                  <i class="bi bi-gear"></i>
                  Manage Account
                </router-link>
                
                <div class="dropdown-divider"></div>
                
                <div class="dropdown-info">
                  <div class="info-item">
                    <i class="bi bi-calendar3"></i>
                    Member since {{ memberSince }}
                  </div>
                  <div class="info-item">
                    <i class="bi bi-clock"></i>
                    Last logged in: {{ lastLogin }}
                  </div>
                </div>
                
                <div class="dropdown-divider"></div>
                
                <button @click="logout" class="dropdown-item logout-item">
                  <i class="bi bi-box-arrow-right"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  
    <!-- Main Content Area -->
    <main class="main-content container flex-grow-1">
      <router-view />
    </main>
  
    <!-- Footer -->
    <footer class="footer mt-auto py-4">
      <div class="container">
        <div class="row">
          <div class="col-md-4 mb-3 mb-md-0">
            <h5 class="text-uppercase mb-3">SAM1 Flower Shop</h5>
            <p class="mb-0">Bringing beauty and freshness to your doorstep since 2024.</p>
          </div>
          <div class="col-md-4 mb-3 mb-md-0">
            <h5 class="text-uppercase mb-3">Quick Links</h5>
            <ul class="list-unstyled">
              <li><router-link to="/about" class="footer-link">About Us</router-link></li>
              <li><router-link to="/user/gallery" class="footer-link">Gallery</router-link></li>
              <li><router-link to="/user/customize" class="footer-link">Customize Bouquet</router-link></li>
              <li><router-link to="/user/contact" class="footer-link">Contact Us</router-link></li>
            </ul>
          </div>
          <div class="col-md-4">
            <h5 class="text-uppercase mb-3">Connect With Us</h5>
            <ul class="list-inline mb-0">
              <li class="list-inline-item"><a href="#" class="social-link"><i class="bi bi-facebook"></i></a></li>
              <li class="list-inline-item"><a href="#" class="social-link"><i class="bi bi-instagram"></i></a></li>
              <li class="list-inline-item"><a href="#" class="social-link"><i class="bi bi-twitter"></i></a></li>
              <li class="list-inline-item"><a href="#" class="social-link"><i class="bi bi-pinterest"></i></a></li>
            </ul>
          </div>
        </div>
        <hr class="my-4">
        <div class="text-center">
          <span class="copyright">&copy; 2024 SAM1 Flower Shop. All rights reserved.</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default {
  name: 'UserMain',
  setup() {
    const router = useRouter();
    const isAuthenticated = ref(false);
    const userName = ref('');
    const userEmail = ref('');
    const userProfileImage = ref('');
    const defaultImage = '/default-avatar.png';
    const isDropdownOpen = ref(false);
    const memberSince = ref('');
    const lastLogin = ref('');

    const userInitials = computed(() => {
      if (!userName.value) return '';
      const names = userName.value.split(' ');
      return names.map(name => name.charAt(0).toUpperCase()).join('');
    });

    const handleImageError = (e) => {
      e.target.src = defaultImage;
    };

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    const closeDropdown = () => {
      isDropdownOpen.value = false;
    };

    const fetchUserProfile = async (user) => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          userName.value = `${userData.firstName} ${userData.lastName}`;
          userEmail.value = userData.email;
          userProfileImage.value = userData.profileImage || '';
          memberSince.value = new Date(user.metadata.creationTime).toLocaleDateString();
          lastLogin.value = new Date(user.metadata.lastSignInTime).toLocaleString();
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const logout = async () => {
      try {
        const auth = getAuth();
        await signOut(auth);
        router.push('/login');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };

    let unsubscribe;

    onMounted(() => {
      const auth = getAuth();
      unsubscribe = onAuthStateChanged(auth, (user) => {
        isAuthenticated.value = !!user;
        if (user) {
          fetchUserProfile(user);
        } else {
          userName.value = '';
          userEmail.value = '';
          userProfileImage.value = '';
          memberSince.value = '';
          lastLogin.value = '';
        }
      });

      document.addEventListener('click', (e) => {
        const dropdown = document.querySelector('.profile-dropdown');
        const toggle = document.querySelector('.profile-toggle');
        if (dropdown && toggle && !dropdown.contains(e.target) && !toggle.contains(e.target)) {
          closeDropdown();
        }
      });
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
      document.removeEventListener('click', closeDropdown);
    });

    return {
      isAuthenticated,
      userName,
      userEmail,
      userProfileImage,
      defaultImage,
      isDropdownOpen,
      memberSince,
      lastLogin,
      userInitials,
      handleImageError,
      toggleDropdown,
      closeDropdown,
      logout,
    };
  },
};
</script>

<style scoped>
.user-main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
}

.navbar {
  padding: 0.75rem 0;
}

.main-content {
  padding-top: 5rem;
  flex: 1;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.brand-text {
  background: linear-gradient(45deg, #8e44ad, #9b59b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-link {
  font-weight: 500;
  color: #4a4a4a;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.nav-link:hover {
  color: #8e44ad;
}

.nav-link.active {
  color: #8e44ad;
  background-color: rgba(142, 68, 173, 0.1);
}

.profile-toggle {
  padding: 0;
  display: flex;
  align-items: center;
}

.avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #8e44ad;
}

.avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.initials-avatar {
  background: linear-gradient(45deg, #8e44ad, #9b59b6);
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.profile-dropdown {
  width: 320px;
  padding: 0;
  border: none;
  border-radius: 16px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-top: 0.75rem;
  animation: slideIn 0.3s ease;
  left: auto !important;
  right: 0 !important;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  background-color: #8e44ad;
  color: white;
  padding: 1.25rem;
}

.dropdown-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.dropdown-header p {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.8;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.dropdown-item i {
  font-size: 1.1rem;
  color: #8e44ad;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #8e44ad;
}

.dropdown-info {
  padding: 0.75rem 1rem;
  background: #f8f9fa;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item i {
  color: #8e44ad;
}

.logout-item {
  color: #dc3545;
}

.logout-item i {
  color: #dc3545;
}

.logout-item:hover {
  background-color: #fff5f5;
  color: #dc3545;
}

.dropdown-divider {
  margin: 0;
  border-top: 1px solid #eee;
}

.footer {
  background-color: white;
  border-top: 1px solid #eee;
  color: #666;
}

.footer h5 {
  color: #8e44ad;
  font-weight: 600;
}

.footer-link {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #8e44ad;
}

.social-link {
  color: #8e44ad;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.social-link:hover {
  color: #9b59b6;
  transform: translateY(-2px);
}

.copyright {
  color: #888;
  font-size: 0.9rem;
}

@media (max-width: 991.98px) {
  .profile-dropdown {
    position: absolute;
    top: 100%;
    left: 0 !important;
    right: auto !important;
    width: 320px;
    margin: 0;
  }
}
</style>