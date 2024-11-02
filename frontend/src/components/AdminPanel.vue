<template>
    <div class="admin-panel-wrapper d-flex">
      <!-- Sidebar -->
      <nav id="sidebar" class="sidebar shadow-lg">
        <div class="sidebar-sticky">
          <div class="sidebar-header p-3">
            <div class="logo-placeholder mb-3">
              <i class="bi bi-flower3 fs-1 text-white"></i>
            </div>
            <h5 class="text-center text-white mb-0">Sam1 Flower Shop</h5>
          </div>
          <ul class="nav flex-column">
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/dashboard" active-class="active">
                <i class="bi bi-house-door me-2"></i> Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/products" active-class="active">
                <i class="bi bi-flower1 me-2"></i> Products
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/users" active-class="active">
                <i class="bi bi-person-lines-fill me-2"></i> Users
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/orders" active-class="active">
                <i class="bi bi-cart me-2"></i> Orders
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/customers" active-class="active">
                <i class="bi bi-people me-2"></i> Customers
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/reports" active-class="active">
                <i class="bi bi-bar-chart me-2"></i> Reports
              </router-link>
            </li>
          </ul>
        </div>
      </nav>
  
      <!-- Main content -->
      <main class="main-content shadow-lg">
        <header class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <div>
            <h1 class="h2">Sam1's Admin Panel</h1>
            <p class="text-muted">{{ formattedDateTime }}</p>
          </div>
          <div class="btn-toolbar mb-2 mb-md-0">
            <div class="d-flex align-items-center gap-2">
              <button type="button" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-cloud-arrow-up me-1"></i> Export
              </button>
              <button type="button" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-gear me-1"></i> Settings
              </button>
              <button @click="logout" type="button" class="btn btn-sm btn-outline-danger">
                <i class="bi bi-box-arrow-right me-1"></i> Logout
              </button>
            </div>
          </div>
        </header>
  
        <!-- Dynamic Content based on Route -->
        <router-view></router-view>

      </main>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AdminPanel',
    data() {
      return {
        currentDateTime: new Date(),
      };
    },
    computed: {
      adminName() {
        return "Admin Name"; // Replace with dynamic data, e.g., this.$store.state.adminName
      },
      formattedDateTime() {
        return new Intl.DateTimeFormat('en-PH', {
          dateStyle: 'full',
          timeStyle: 'medium',
          timeZone: 'Asia/Manila',
        }).format(this.currentDateTime);
      },
    },
    mounted() {
      setInterval(() => {
        this.currentDateTime = new Date();
      }, 1000);
    },
    methods: {
      logout() {
        localStorage.removeItem('token');
        this.$router.push('/login');
      },
    },
  };
  </script>
  
  <style scoped>
  .admin-panel-wrapper {
    min-height: 100vh;
    background-color: white;
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
    background: linear-gradient(135deg, #5e548e, #231942);
    overflow-y: auto;
    transition: all 0.3s;
    border-radius: 15px;
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
    background-color: #e1ddf7;
    border-radius: 15px;
    overflow-y: auto;
    padding: 20px;
  }
  
  @media (max-width: 991.98px) {
    .admin-panel-wrapper {
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
  }
  
  /* Custom scrollbar for webkit browsers */
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