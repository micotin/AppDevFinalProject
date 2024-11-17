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
          <li class="nav-item" v-for="item in navItems" :key="item.path">
            <router-link class="nav-link" :to="item.path" active-class="active">
              <i :class="item.icon + ' me-2'"></i> {{ item.name }}
            </router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="toggleContactUs" :class="{ active: showContactUs }">
              <i class="bi bi-envelope me-2"></i> Inquiries
            </a>
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
            <button @click="openAdminModal" class="btn btn-sm btn-outline-secondary me-2">
              <i class="bi bi-person-circle me-1"></i> Profile
            </button>
            <button @click="logout" type="button" class="btn btn-sm btn-outline-danger">
              <i class="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Dynamic Content based on Route -->
      <router-view v-if="!showContactUs"></router-view>

      <!-- Admin Contact Us Management -->
      <div v-if="showContactUs" class="admin-contact-us">
        <h1 class="mb-4">Inquiry Management</h1>
        <div class="row">
          <div class="col-md-12">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title mb-4">Inquiries</h5>
                <div class="mb-3">
                  <div class="btn-group" role="group" aria-label="Filter inquiries">
                    <button 
                      v-for="status in ['all', 'new', 'in-progress', 'resolved']" 
                      :key="status"
                      @click="filterStatus = status"
                      class="btn"
                      :class="filterStatus === status ? 'btn-primary' : 'btn-outline-primary'"
                    >
                      {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                    </button>
                  </div>
                </div>
                <div class="table-responsive">
                  <table class="table table-striped">
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
                      <tr v-for="inquiry in filteredInquiries" :key="inquiry.id">
                        <td>{{ formatDate(inquiry.createdAt) }}</td>
                        <td>{{ inquiry.name }}</td>
                        <td>{{ inquiry.email }}</td>
                        <td>{{ inquiry.inquiryType }}</td>
                        <td>{{ truncateMessage(inquiry.message) }}</td>
                        <td>
                          <span :class="getStatusBadgeClass(inquiry.status)">
                            {{ inquiry.status }}
                          </span>
                        </td>
                        <td>
                          <button class="btn btn-sm btn-primary me-2" @click="viewInquiry(inquiry)">View</button>
                          <button class="btn btn-sm btn-success" @click="updateStatus(inquiry)">Update Status</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, collection, query, orderBy, getDocs } from 'firebase/firestore';
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

    // Contact Us Management
    const inquiries = ref([]);
    const selectedInquiry = ref(null);
    const newStatus = ref('');
    const filterStatus = ref('all');
    const showContactUs = ref(false);

    const navItems = [
      { name: 'Overview', path: '/admin/dashboard', icon: 'bi bi-speedometer2' },
      { name: 'Inventory', path: '/admin/products', icon: 'bi bi-box-seam' },
      { name: 'Showcase', path: '/admin/gallery', icon: 'bi bi-images' },
      { name: 'Customer Base', path: '/admin/users', icon: 'bi bi-people' },
      { name: 'Transactions', path: '/admin/orders', icon: 'bi bi-cart3' },
      { name: 'Analytics', path: '/admin/reports', icon: 'bi bi-bar-chart' },
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

    // Contact Us Management Methods
    const fetchInquiries = async () => {
      const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      inquiries.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      return `badge ${classes[status] || 'bg-secondary'}`;
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

.admin-contact-us {
  font-family: 'Poppins', sans-serif;
}

.btn-primary {
  background-color: #6a3093;
  border-color: #6a3093;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: #a044ff;
  border-color: #a044ff;
}

.text-primary {
  color: #6a3093 !important;
}
</style>