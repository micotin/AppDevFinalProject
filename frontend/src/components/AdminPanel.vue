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
          <li class="nav-item">
            <router-link class="nav-link" to="/admin/history" active-class="active">
              <i class="bi bi-clock-history me-2"></i> History
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
            <button type="button" class="btn btn-sm btn-outline-primary" @click="openAdminModal">
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

    <!-- Admin Details Modal -->
    <div class="modal fade" id="adminModal" tabindex="-1" aria-labelledby="adminModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="adminModalLabel">Admin Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-4">
              <img :src="adminProfileImage" alt="Admin Profile" class="rounded-circle mb-3" style="width: 100px; height: 100px; object-fit: cover;">
              <h4>{{ adminName }}</h4>
              <p class="text-muted">{{ adminEmail }}</p>
            </div>
            <div class="mb-3">
              <strong>Member Since:</strong> {{ memberSince }}
            </div>
            <div class="mb-3">
              <strong>Last Login:</strong> {{ lastLogin }}
            </div>
            <div class="mb-3">
              <strong>Role:</strong> Administrator
            </div>
            <button @click="resetPassword" class="btn btn-warning mt-3">Reset Password</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Modal } from 'bootstrap';

export default {
  name: 'AdminPanel',
  setup() {
    const router = useRouter();
    const auth = getAuth();
    const db = getFirestore();

    const currentDateTime = ref(new Date());
    const adminName = ref('');
    const adminEmail = ref('');
    const adminProfileImage = ref('https://via.placeholder.com/100');
    const memberSince = ref('');
    const lastLogin = ref('');
    let adminModal = null;

    const formattedDateTime = computed(() => {
      return new Intl.DateTimeFormat('en-PH', {
        dateStyle: 'full',
        timeStyle: 'medium',
        timeZone: 'Asia/Manila',
      }).format(currentDateTime.value);
    });

    const updateDateTime = () => {
      currentDateTime.value = new Date();
    };

    const fetchAdminDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          adminName.value = `${userData.firstName} ${userData.lastName}`;
          adminEmail.value = user.email;
          adminProfileImage.value = userData.profileImage || 'https://via.placeholder.com/100';
          memberSince.value = new Date(user.metadata.creationTime).toLocaleDateString();
          lastLogin.value = new Date(user.metadata.lastSignInTime).toLocaleString();
        }
      }
    };

    const updateLastLogin = async () => {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: serverTimestamp()
        });
      }
    };

    const openAdminModal = () => {
      if (adminModal) {
        adminModal.show();
      }
    };

    const resetPassword = async () => {
      try {
        await sendPasswordResetEmail(auth, adminEmail.value);
        alert('Password reset email sent. Please check your inbox.');
      } catch (error) {
        console.error('Error sending password reset email:', error);
        alert('Failed to send password reset email. Please try again.');
      }
    };

    const logout = async () => {
      try {
        await signOut(auth);
        router.push('/login');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };

    onMounted(() => {
      setInterval(updateDateTime, 1000);
      fetchAdminDetails();
      updateLastLogin();
      adminModal = new Modal(document.getElementById('adminModal'));
    });

    return {
      formattedDateTime,
      adminName,
      adminEmail,
      adminProfileImage,
      memberSince,
      lastLogin,
      openAdminModal,
      resetPassword,
      logout
    };
  }
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