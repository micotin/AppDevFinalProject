<template>
  <div class="user-main d-flex flex-column min-vh-100">
    <!-- Header -->
    <header class="header">
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
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
                <router-link class="nav-link" to="/gallery" active-class="active">
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
                <span class="profile-name">{{ userName }}</span>
              </a>
              <div class="dropdown-menu dropdown-menu-end profile-dropdown" :class="{ show: isDropdownOpen }">
                <div class="dropdown-header">
                  <span>{{ userName }}</span>
                  <button class="edit-button" @click="editProfile">
                    <i class="bi bi-pencil"></i>
                  </button>
                </div>
                <div class="profile-content">
                  <div class="avatar-container">
                    <img 
                      :src="userProfileImage || defaultImage" 
                      :alt="userName"
                      class="avatar-image"
                      @error="handleImageError"
                    />
                  </div>
                  <div class="email-container">
                    <div class="email">{{ userEmail }}</div>
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
                  <div class="additional-options">
                    <div class="option">
                      <i class="bi bi-person-check"></i>
                      Member since {{ memberSince }}
                    </div>
                    <div class="option">
                      <i class="bi bi-clock-history"></i>
                      Last login {{ lastLogin }}
                    </div>
                  </div>
                  <button @click="logout" class="logout-btn">Logout</button>
                </div>
              </div>
            </div>
  
            <!-- Login Button for Non-Authenticated Users -->
            <div v-else>
              <router-link to="/login" class="btn btn-primary login-btn">
                <i class="bi bi-person me-1"></i> Login
              </router-link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  
    <!-- Main Content Area for Child Routes -->
    <main class="main-content container flex-grow-1">
      <router-view />
    </main>
  
    <!-- Footer -->
    <footer class="footer mt-auto py-4 bg-light">
      <div class="container">
        <div class="row">
          <div class="col-md-4 mb-3 mb-md-0">
            <h5 class="text-uppercase mb-3">SAM1 Flower Shop</h5>
            <p class="mb-0">Bringing beauty and freshness to your doorstep since 2024.</p>
          </div>
          <div class="col-md-4 mb-3 mb-md-0">
            <h5 class="text-uppercase mb-3">Quick Links</h5>
            <ul class="list-unstyled">
              <li><router-link to="/about" class="text-decoration-none">About Us</router-link></li>
              <li><router-link to="/gallery" class="text-decoration-none">Gallery</router-link></li>
              <li><router-link to="/customize" class="text-decoration-none">Customize Bouquet</router-link></li>
              <li><router-link to="/contact" class="text-decoration-none">Contact Us</router-link></li>
            </ul>
          </div>
          <div class="col-md-4">
            <h5 class="text-uppercase mb-3">Connect With Us</h5>
            <ul class="list-inline mb-0">
              <li class="list-inline-item"><a href="#" class="text-decoration-none"><i class="bi bi-facebook"></i></a></li>
              <li class="list-inline-item"><a href="#" class="text-decoration-none"><i class="bi bi-instagram"></i></a></li>
              <li class="list-inline-item"><a href="#" class="text-decoration-none"><i class="bi bi-twitter"></i></a></li>
              <li class="list-inline-item"><a href="#" class="text-decoration-none"><i class="bi bi-pinterest"></i></a></li>
            </ul>
          </div>
        </div>
        <hr class="my-4">
        <div class="text-center">
          <span class="text-muted">&copy; 2024 SAM1 Flower Shop. All rights reserved.</span>
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
}

.header {
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(45deg, #6a3093, #a044ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-link {
  font-weight: 500;
  color: #4a4a4a;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(45deg, #6a3093, #a044ff);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

.profile-dropdown {
  width: 300px;
  padding: 0;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-top: 0.5rem;
}

.dropdown-header {
  background: linear-gradient(45deg, #6a3093, #a044ff);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

.profile-content {
  padding: 1rem;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.avatar-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #6a3093;
}

.email-container {
  text-align: center;
  margin-bottom: 1rem;
}

.email {
  font-size: 0.9rem;
  color: #666;
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #6a3093, #a044ff);
  border: none;
  color: white;
  margin: 0 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(106, 48, 147, 0.3);
}

.additional-options {
  margin-top:  1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.option {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.option i {
  margin-right: 0.5rem;
  color: #6a3093;
}

.logout-btn {
  width: 100%;
  margin-top: 1rem;
  background: linear-gradient(45deg, #6a3093, #a044ff);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  box-shadow: 0 4px 10px rgba(106, 48, 147, 0.3);
}

.footer {
  background-color: #f8f9fa;
}

.footer h5 {
  color: #6a3093;
}

.footer .list-inline-item a {
  color: #6a3093;
  font-size: 1.5rem;
  transition: color 0.3s ease;
}

.footer .list-inline-item a:hover {
  color: #a044ff;
}
</style>