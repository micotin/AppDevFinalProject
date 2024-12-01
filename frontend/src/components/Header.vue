<template>
    <header class="header">
      <nav class="navbar navbar-expand-lg">
        <div class="container">
          <!-- Brand -->
          <router-link class="navbar-brand" to="">
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
                <router-link class="nav-link" to="/" active-class="active">
                  <i class="bi bi-house-door me-1"></i> Home
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/products" active-class="active">
                  <i class="bi bi-shop me-1"></i> Shop
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/about" active-class="active">
                  <i class="bi bi-info-circle me-1"></i> About
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
                    <button class="action-btn" title="Cart"><i class="bi bi-cart"></i></button>
                    <button class="action-btn" title="Orders"><i class="bi bi-bag"></i></button>
                    <button class="action-btn" title="Customize"><i class="bi bi-gear"></i></button>
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
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { getAuth, onAuthStateChanged } from 'firebase/auth';
  import { doc, getDoc } from 'firebase/firestore';
  import { db } from '../firebaseConfig';
  
  export default {
    name: 'Header',
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
      let userListener = null;
  
      const handleImageError = (e) => {
        e.target.src = defaultImage;
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
  
      const toggleDropdown = () => {
        isDropdownOpen.value = !isDropdownOpen.value;
      };
  
      const closeDropdown = () => {
        isDropdownOpen.value = false;
      };
  
      const editProfile = () => {
        router.push('/account');
        closeDropdown();
      };
  
      onMounted(() => {
        const auth = getAuth();
        userListener = onAuthStateChanged(auth, (user) => {
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
  
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
          const dropdown = document.querySelector('.profile-dropdown');
          const toggle = document.querySelector('.profile-toggle');
          if (dropdown && toggle && !dropdown.contains(e.target) && !toggle.contains(e.target)) {
            closeDropdown();
          }
        });
      });
  
      onUnmounted(() => {
        if (userListener) userListener();
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
      };
    },
  };
  </script>
  
  <style scoped>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }
  
  .navbar {
    padding: 0.5rem 0;
  }
  
  .navbar-brand {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    transition: color 0.3s ease;
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
    padding: 0.5rem 1rem;
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
  
  .profile-toggle {
    padding: 0.25rem 1rem;
    cursor: pointer;
  }
  
  .profile-name {
    font-weight: 500;
    color: #4a4a4a;
  }
  
  .profile-dropdown {
    width: 300px;
    padding: 0;
    border: none;
    border-radius: 12px;
    overflow: hidden;
    background-color: #fff;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
  
  .dropdown-header {
    background: linear-gradient(45deg, #6a3093, #a044ff);
    color: white;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .edit-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    transition: transform 0.3s ease;
  }
  
  .edit-button:hover {
    transform: scale(1.1);
  }
  
  .profile-content {
    padding: 16px;
    color: #333;
  }
  
  .avatar-container {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }
  
  .avatar-image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #6a3093;
    transition: all 0.3s ease;
  }
  
  .email-container {
    text-align: center;
    margin-bottom: 16px;
  }
  
  .email {
    font-size: 0.9rem;
    color: #666;
  }
  
  .action-buttons {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }
  
  .action-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(45deg, #6a3093, #a044ff);
    border: none;
    color: white;
    margin: 0 8px;
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
    border-top: 1px solid #eee;
    padding-top: 16px;
  }
  
  .option {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 0.9rem;
    color: #666;
  }
  
  .option i {
    margin-right: 8px;
    color: #6a3093;
  }
  
  .login-btn {
    background: linear-gradient(45deg, #6a3093, #a044ff);
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: 50px;
    font-weight: 500;
    color: white;
    transition: all 0.3s ease;
  }
  
  .login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(106, 48, 147, 0.3);
  }
  
  @media (max-width: 991.98px) {
    .navbar-collapse {
      background-color: white;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-top: 0.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .profile-toggle {
      display: inline-flex;
      margin-top: 1rem;
    }
  }
  </style>