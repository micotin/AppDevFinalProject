<template>
  <div class="admin-panel-wrapper">
    <div class="admin-panel-content">
      <!-- Sidebar -->
      <nav id="sidebar" class="sidebar">
        <div class="sidebar-header">
          <div class="logo-container">
            <i class="bi bi-flower3"></i>
          </div>
          <h1 class="shop-name">Sam1 Flower Shop</h1>
        </div>
        
        <ul class="nav-menu">
          <li v-for="item in navItems" :key="item.path" class="nav-item">
            <router-link :to="item.path" class="nav-link" :class="{ active: $route.path === item.path }">
              <i :class="item.icon"></i>
              <span>{{ item.name }}</span>
            </router-link>
          </li>
          <li class="nav-item">
            <a href="#" @click.prevent="toggleContactUs" class="nav-link" :class="{ active: showContactUs }">
              <i class="bi bi-envelope"></i>
              <span>Inquiries</span>
            </a>
          </li>
          <li class="nav-item">
            <router-link to="/admin/customize-attachment" class="nav-link">
              <i class="bi bi-paperclip"></i>
              <span>Customize Attachment</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/reviews" class="nav-link">
              <i class="bi bi-star"></i>
              <span>Reviews</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Main Content -->
      <main class="main-content">
        <header class="main-header">
          <div class="header-content">
            <h1>Sam1's Admin Panel</h1>
            <p class="timestamp">{{ formattedDateTime }}</p>
          </div>
          <div class="header-actions">
            <button @click="openAdminModal" class="btn btn-profile">
              <i class="bi bi-person-circle"></i>
              Profile
            </button>
            <button @click="logout" class="btn btn-logout">
              <i class="bi bi-box-arrow-right"></i>
              Logout
            </button>
          </div>
        </header>

        <div class="content-wrapper">
          <Suspense>
            <template #default>
              <router-view v-if="!showContactUs"></router-view>
            </template>
            <template #fallback>
              <div class="loading-indicator">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </template>
          </Suspense>
          
          <div v-if="showContactUs" class="admin-contact-us">
            <h2 class="mb-4">Inquiry Management</h2>
            <div class="filter-buttons mb-4">
              <button 
                v-for="status in ['all', 'new', 'in-progress', 'resolved']" 
                :key="status"
                @click="filterStatus = status"
                :class="['btn', filterStatus === status ? 'btn-primary' : 'btn-outline-primary']"
              >
                {{ status.charAt(0).toUpperCase() + status.slice(1) }}
              </button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="isLoading">
                    <tr v-for="i in 5" :key="i">
                      <td v-for="j in 7" :key="j">
                        <div class="skeleton-loader"></div>
                      </td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr v-for="inquiry in filteredInquiries" :key="inquiry.id">
                      <td>{{ formatDate(inquiry.createdAt) }}</td>
                      <td>{{ inquiry.name }}</td>
                      <td>{{ inquiry.email }}</td>
                      <td>{{ inquiry.inquiryType }}</td>
                      <td>{{ truncateMessage(inquiry.message) }}</td>
                      <td>
                        <span :class="['badge', getStatusBadgeClass(inquiry.status)]">
                          {{ inquiry.status }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-info me-2" @click="viewInquiry(inquiry)">View</button>
                        <button class="btn btn-sm btn-primary" @click="updateStatus(inquiry)">Update Status</button>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modals -->
    <!-- Admin Details Modal -->
    <div class="modal fade" id="adminModal" tabindex="-1" aria-labelledby="adminModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="adminModalLabel">Admin Profile</h5>
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

    <!-- View Inquiry Modal -->
    <div class="modal fade" id="viewInquiryModal" tabindex="-1" aria-labelledby="viewInquiryModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="viewInquiryModalLabel">View Inquiry</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedInquiry">
            <p><strong>Name:</strong> {{ selectedInquiry.name }}</p>
            <p><strong>Email:</strong> {{ selectedInquiry.email }}</p>
            <p><strong>Type:</strong> {{ selectedInquiry.inquiryType }}</p>
            <p><strong>Message:</strong> {{ selectedInquiry.message }}</p>
            <p><strong>Status:</strong> {{ selectedInquiry.status }}</p>
            <p><strong>Date:</strong> {{ formatDate(selectedInquiry.createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Status Modal -->
    <div class="modal fade" id="updateStatusModal" tabindex="-1" aria-labelledby="updateStatusModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="updateStatusModalLabel">Update Inquiry Status</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitStatusUpdate">
              <div class="mb-3">
                <label for="statusSelect" class="form-label">New Status</label>
                <select class="form-select" id="statusSelect" v-model="newStatus">
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary">Update Status</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Modal } from 'bootstrap';
import debounce from 'lodash/debounce';

// Lazy load route components
const Dashboard = defineAsyncComponent(() => import('./AdminDashboard.vue'));
const Products = defineAsyncComponent(() => import('./AdminProducts.vue'));
const Gallery = defineAsyncComponent(() => import('./AdminGallery.vue'));
const Users = defineAsyncComponent(() => import('./AdminUsers.vue'));
const Orders = defineAsyncComponent(() => import('./AdminOrders.vue'));
const History = defineAsyncComponent(() => import('./AdminHistory.vue'));

export default {
  name: 'AdminPanel',
  components: {
    Dashboard,
    Products,
    Gallery,
    Users,
    Orders,
    History,
  },
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

    // Contact Us Management
    const inquiries = ref([]);
    const selectedInquiry = ref(null);
    const newStatus = ref('');
    const filterStatus = ref('all');
    const showContactUs = ref(false);
    const isLoading = ref(false);

    const navItems = [
      { name: 'Overview', path: '/admin/dashboard', icon: 'bi bi-speedometer2' },
      { name: 'Inventory', path: '/admin/products', icon: 'bi bi-box-seam' },
      { name: 'Showcase', path: '/admin/gallery', icon: 'bi bi-images' },
      { name: 'Customer Base', path: '/admin/users', icon: 'bi bi-people' },
      { name: 'Transactions', path: '/admin/orders', icon: 'bi bi-cart3' },
      { name: 'Activity Log', path: '/admin/history', icon: 'bi bi-clock-history' },
    ];

    const formattedDateTime = computed(() => {
      return new Intl.DateTimeFormat('en-PH', {
        dateStyle: 'full',
        timeStyle: 'medium',
        timeZone: 'Asia/Manila',
      }).format(currentDateTime.value);
    });

    const filteredInquiries = computed(() => {
      if (filterStatus.value === 'all') {
        return inquiries.value;
      }
      return inquiries.value.filter(inquiry => inquiry.status === filterStatus.value);
    });

    const updateDateTime = debounce(() => {
      currentDateTime.value = new Date();
    }, 1000);

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

    // Contact Us Management Methods
    const fetchInquiries = async () => {
      isLoading.value = true;
      try {
        const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        inquiries.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      return new Date(timestamp.seconds * 1000).toLocaleString();
    };

    const truncateMessage = (message, length = 50) => {
      return message.length > length ? message.substring(0, length) + '...' : message;
    };

    const getStatusBadgeClass = (status) => {
      const classes = {
        new: 'bg-info',
        'in-progress': 'bg-warning',
        resolved: 'bg-success'
      };
      return classes[status] || 'bg-secondary';
    };

    const viewInquiry = (inquiry) => {
      selectedInquiry.value = inquiry;
      const modal = new Modal(document.getElementById('viewInquiryModal'));
      modal.show();
    };

    const updateStatus = (inquiry) => {
      selectedInquiry.value = inquiry;
      newStatus.value = inquiry.status;
      const modal = new Modal(document.getElementById('updateStatusModal'));
      modal.show();
    };

    const submitStatusUpdate = async () => {
      if (selectedInquiry.value && newStatus.value) {
        const inquiryRef = doc(db, 'inquiries', selectedInquiry.value.id);
        await updateDoc(inquiryRef, { status: newStatus.value });
        await fetchInquiries();
        const modal = Modal.getInstance(document.getElementById('updateStatusModal'));
        modal.hide();
      }
    };

    const toggleContactUs = () => {
      showContactUs.value = !showContactUs.value;
      if (showContactUs.value) {
        fetchInquiries();
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
      logout,
      inquiries,
      selectedInquiry,
      newStatus,
      filterStatus,
      filteredInquiries,
      showContactUs,
      isLoading,
      formatDate,
      truncateMessage,
      getStatusBadgeClass,
      viewInquiry,
      updateStatus,
      submitStatusUpdate,
      toggleContactUs,
      navItems
    };
  }
};
</script>

<style scoped>
.admin-panel-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #2d1b69 0%, #a12c82 100%);
  padding: 1rem;
}

.admin-panel-content {
  display: flex;
  gap: 1rem;
  height: calc(100vh - 2rem);
}

.sidebar {
  width: 280px;
  background: rgba(28, 28, 45, 0.95);
  border-radius: 1rem;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  background: rgba(40, 40, 55, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-container i {
  font-size: 2.5rem;
  color: white;
}

.shop-name {
  color: white;
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.nav-link i {
  font-size: 1.25rem;
  margin-right: 1rem;
  width: 1.5rem;
}

.nav-link span {
  font-size: 0.95rem;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

.main-content {
  flex: 1;
  background: rgba(28, 28, 45, 0.8);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  color: white;
  font-size: 1.75rem;
  margin: 0;
  font-weight: 500;
}

.timestamp {
  color: rgba(255, 255, 255, 0.6);
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-profile {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-profile:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-logout {
  background: rgba(220, 38, 38, 0.1);
  color: rgb(248, 113, 113);
}

.btn-logout:hover {
  background: rgba(220, 38, 38, 0.2);
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.admin-contact-us {
  color: white;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.table {
  color: white;
}

.table th {
  border-color: rgba(255, 255, 255, 0.1);
}

.table td {
  border-color: rgba(255, 255, 255, 0.05);
}

.modal-content {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
}

.modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.form-control, .form-select {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.form-control:focus, .form-select:focus {
  background: rgba(40, 40, 55, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.skeleton-loader {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 991.98px) {
  .admin-panel-wrapper {
    padding: 0.5rem;
  }

  .admin-panel-content {
    flex-direction: column;
    height: auto;
  }

  .sidebar {
    width: 100%;
    margin-bottom: 1rem;
  }

  .main-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>