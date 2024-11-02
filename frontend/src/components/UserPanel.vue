<template>
    <div class="user-panel-wrapper d-flex">
      <!-- Sidebar -->
      <nav id="sidebar" class="sidebar shadow-lg" :class="{ 'collapsed': sidebarCollapsed }">
        <button @click="toggleSidebar" class="btn btn-link text-white position-absolute top-0 end-0 mt-2 me-2">
          <i class="bi" :class="sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
        </button>
        <div class="sidebar-sticky">
          <div class="sidebar-header p-3">
            <div class="logo-placeholder mb-3">
              <i class="bi bi-flower3 fs-1 text-white"></i>
            </div>
            <h5 class="text-center text-white mb-0" :class="{ 'd-none': sidebarCollapsed }">Sam1 Flower Shop</h5>
          </div>
          <ul class="nav flex-column">
            <li class="nav-item">
              <router-link class="nav-link" to="/user/home" active-class="active">
                <i class="bi bi-house-door me-2"></i> <span :class="{ 'd-none': sidebarCollapsed }">Home</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/user/products" active-class="active">
                <i class="bi bi-flower1 me-2"></i> <span :class="{ 'd-none': sidebarCollapsed }">Browse Products</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/user/cart" active-class="active">
                <i class="bi bi-cart me-2"></i> <span :class="{ 'd-none': sidebarCollapsed }">My Cart</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/user/orders" active-class="active">
                <i class="bi bi-receipt me-2"></i> <span :class="{ 'd-none': sidebarCollapsed }">My Orders</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/user-panel/account" active-class="active">
                <i class="bi bi-person me-2"></i> <span :class="{ 'd-none': sidebarCollapsed }">Account</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/user-panel/customize" active-class="active">
                <i class="bi bi-palette me-2"></i> <span :class="{ 'd-none': sidebarCollapsed }">Customize</span>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>
  
      <!-- Main content -->
      <main class="main-content shadow-lg" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <header class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <div>
            <h1 class="h2">Welcome, {{ userName }}</h1>
            <p class="text-muted">{{ formattedDateTime }}</p>
          </div>
          <div class="btn-toolbar mb-2 mb-md-0">
            <button @click="showLogoutModal" type="button" class="btn btn-sm btn-outline-danger">
              <i class="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </header>
  
        <!-- Dynamic Content based on Route -->
        <router-view></router-view>
  
        <!-- Footer -->
        <footer class="footer mt-auto py-3 bg-light">
          <div class="container text-center">
            <span class="text-muted">© 2023 Sam1 Flower Shop. All rights reserved.</span>
          </div>
        </footer>
      </main>
  
      <!-- Logout Confirmation Modal -->
      <div class="modal fade" id="logoutModal" tabindex="-1" aria-labelledby="logoutModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="logoutModalLabel">Confirm Logout</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              Are you sure you want to log out?
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-danger" @click="logout">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { getAuth, signOut } from "firebase/auth";
  import { db } from '../firebaseConfig';
  import { doc, getDoc } from "firebase/firestore";
  import { Modal } from 'bootstrap';
  
  export default {
    name: 'UserPanel',
    setup() {
      const router = useRouter();
      const currentDateTime = ref(new Date());
      const userName = ref('Guest');
      const sidebarCollapsed = ref(false);
      let logoutModal = null;
  
      const formattedDateTime = computed(() => {
        return new Intl.DateTimeFormat('en-PH', {
          dateStyle: 'full',
          timeStyle: 'medium',
          timeZone: 'Asia/Manila',
        }).format(currentDateTime.value);
      });
  
      const fetchUserData = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const userDoc = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            userName.value = userSnapshot.data().firstName || 'Guest';
          } else {
            console.log("No such document!");
            userName.value = 'Guest';
          }
        } else {
          console.log("No user is signed in.");
          userName.value = 'Guest';
        }
      };
  
      const showLogoutModal = () => {
        logoutModal.show();
      };
  
      const logout = async () => {
        try {
          const auth = getAuth();
          await signOut(auth);
          logoutModal.hide();
          router.push('/login');
        } catch (error) {
          console.error("Error signing out: ", error);
        }
      };
  
      const toggleSidebar = () => {
        sidebarCollapsed.value = !sidebarCollapsed.value;
      };
  
      onMounted(() => {
        fetchUserData();
        setInterval(() => {
          currentDateTime.value = new Date();
        }, 1000);
  
        // Initialize the logout modal
        logoutModal = new Modal(document.getElementById('logoutModal'));
      });
  
      return {
        userName,
        formattedDateTime,
        showLogoutModal,
        logout,
        sidebarCollapsed,
        toggleSidebar
      };
    }
  };
  </script>
  
  <style scoped>
  .user-panel-wrapper {
    min-height: 100vh;
    background-color: #f0f2f5;
    padding: 20px;
    overflow: hidden;
  }
  
  .sidebar {
    position: fixed;
    top: 20px;
    bottom: 20px;
    left: 20px;
    z-index: 100;
    width: 280px;
    background: linear-gradient(135deg, #6a3093, #a044ff);
    overflow-y: auto;
    transition: all 0.3s;
    border-radius: 15px;
  }
  
  .sidebar.collapsed {
    width: 60px;
  }
  
  .sidebar.collapsed .sidebar-sticky > *:not(.logo-placeholder) {
    display: none;
  }
  
  .logo-placeholder {
    width: 80px;
    height: 80px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }
  
  .sidebar .nav-link {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;
    transition: all 0.3s;
  }
  
  .sidebar .nav-link:hover,
  .sidebar .nav-link.active {
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .main-content {
    flex-grow: 1;
    margin-left: 300px;
    min-height: calc(100vh - 40px);
    background-color: #ffffff;
    border-radius: 15px;
    overflow-y: auto;
    padding: 20px;
    transition: all 0.3s;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 80px;
  }
  
  .footer {
    position: relative;
    bottom: 0;
    width: 100%;
    height: 60px;
    line-height: 60px;
    background-color: #f5f5f5;
    border-radius: 0 0 15px 15px;
  }
  
  @media (max-width: 991.98px) {
    .user-panel-wrapper {
      padding: 10px;
    }
  
    .sidebar {
      width: 100%;
      height: auto;
      position: relative;
      top: 0;
      left: 0;
      margin-bottom: 20px;
    }
    
    .main-content {
      margin-left: 0;
      min-height: calc(100vh - 20px);
    }
  
    .main-content.sidebar-collapsed {
      margin-left: 0;
    }
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
  </style>