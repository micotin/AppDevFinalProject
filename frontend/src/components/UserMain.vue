<template>
  <div class="user-main d-flex flex-column min-vh-100">
    <!-- Header -->
    <header class="header">
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container">
          <!-- Brand -->
          <router-link class="navbar-brand" to="/">
            <i class="bi bi-flower1 me-2"></i>
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
                <router-link class="nav-link" to="/user/home" active-class="active">
                  <i class="bi bi-house-door me-1"></i> Home
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/user/gallery" active-class="active">
                  <i class="bi bi-images me-1"></i> Gallery
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/user/customize" active-class="active">
                  <i class="bi bi-palette me-1"></i> Customize Bouquet
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/user/shop" active-class="active">
                  <i class="bi bi-shop me-1"></i> Shop
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/user/contact" active-class="active">
                  <i class="bi bi-envelope me-1"></i> Contact Us
                </router-link>
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
                <img 
                  :src="userProfileImage || defaultImage" 
                  :alt="userName"
                  class="avatar-image-small"
                  @error="handleImageError"
                />
              </a>
              <div class="dropdown-menu dropdown-menu-end profile-dropdown" :class="{ show: isDropdownOpen }">
                <div class="profile-header">
                  {{ userName }}
                </div>
                <div class="profile-content">
                  <div class="avatar-container">
                    <div class="avatar-wrapper">
                      <img 
                        :src="userProfileImage || defaultImage" 
                        :alt="userName"
                        class="avatar-image"
                        @error="handleImageError"
                      />
                    </div>
                  </div>
                  <div class="email-container">
                    {{ userEmail }}
                  </div>
                  <div class="action-buttons">
                    <button class="action-btn" title="Cart" @click="goToCartFav">
                      <i class="bi bi-cart"></i>
                    </button>
                    <button class="action-btn" title="Orders" @click="goToOrders">
                      <i class="bi bi-bag"></i>
                    </button>
                    <button class="action-btn" title="Account Settings" @click="goToAccount">
                      <i class="bi bi-gear"></i>
                    </button>
                  </div>
                  <div class="user-info">
                    <div class="info-item">
                      <i class="bi bi-person-check"></i>
                      <span>Member since {{ memberSince }}</span>
                    </div>
                    <div class="info-item">
                      <i class="bi bi-clock-history"></i>
                      <span>Last login {{ lastLogin }}</span>
                    </div>
                  </div>
                  <button @click="logout" class="logout-btn">
                    <i class="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
  
            <!-- Login Button for Non-Authenticated Users -->
            <div v-else>
              <router-link to="/login" class="btn login-btn">
                <i class="bi bi-person me-1"></i> Login
              </router-link>
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
import { ref, onMounted, onUnmounted } from 'vue';
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

    const handleImageError = (e) => {
      e.target.src = defaultImage;
    };

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    const closeDropdown = () => {
      isDropdownOpen.value = false;
    };

    const editProfile = () => {
      router.push('/user/account');
      closeDropdown();
    };

    const goToAccount = () => {
      router.push('/user/account');
      closeDropdown();
    };

    const goToCartFav = () => {
      router.push('/user/cart-fav');
      closeDropdown();
    };

    const goToOrders = () => {
      router.push('/user/order');
      closeDropdown();
    };

    const fetchUserProfile = async (user) => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          userName.value = `${userData.firstName} ${userData.lastName}`;
          userEmail.value = userData.email;
          userProfileImage.value = userData.profileImage || defaultImage;
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
      handleImageError,
      toggleDropdown,
      closeDropdown,
      editProfile,
      goToAccount,
      goToCartFav,
      goToOrders,
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

.avatar-image-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #8e44ad;
  transition: transform 0.3s ease;
}

.avatar-image-small:hover {
  transform: scale(1.1);
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
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  right: 0;
  left: auto;
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

.profile-header {
  background-color: #8e44ad;
  color: white;
  padding: 1.25rem;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}

.profile-content {
  padding: 1.5rem;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(45deg, #8e44ad, #9b59b6);
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
}

.email-container {
  text-align: center;
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.action-btn {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(45deg, #8e44ad, #9b59b6);
  border: none;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.25rem;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(142, 68, 173, 0.3);
}

.user-info {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item i {
  color: #8e44ad;
  font-size: 1.1rem;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(45deg, #8e44ad, #9b59b6);
  color: white;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(142, 68, 173, 0.3);
}

.login-btn {
  background: linear-gradient(45deg, #8e44ad, #9b59b6);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(142, 68, 173, 0.3);
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
    position: fixed;
    top: 70px;
    right: 20px;
    left: auto;
    width: 320px;
    margin: 0;
  }
}
</style>