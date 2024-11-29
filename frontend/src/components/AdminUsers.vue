<template>
  <div class="admin-users">
    <h2 class="mb-4 text-white">
      <i class="bi bi-people-fill me-2"></i>Manage Users
    </h2>

    <div class="card shadow-sm">
      <div class="card-body">
        <ul class="nav nav-pills mb-4">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'verified' }" @click.prevent="activeTab = 'verified'" href="#">Verified Users</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'non-verified' }" @click.prevent="activeTab = 'non-verified'" href="#">Non-Verified Users</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'admins' }" @click.prevent="activeTab = 'admins'" href="#">Admins</a>
          </li>
        </ul>

        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedUsers" :key="user.uid">
                <td>{{ user.firstName }} {{ user.lastName }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="getStatusBadgeClass(user)">
                    {{ getStatusText(user) }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-light me-2" @click="viewUserDetails(user)">
                    <i class="bi bi-eye"></i> View
                  </button>
                  <button 
                    v-if="user.verified && user.role !== 'admin'" 
                    class="btn btn-sm btn-outline-success" 
                    @click="promoteToAdmin(user)"
                  >
                    <i class="bi bi-arrow-up-circle"></i> Promote to Admin
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <nav aria-label="User list pagination" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                <i class="bi bi-chevron-left"></i>
              </a>
            </li>
            <li v-for="page in displayedPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                <i class="bi bi-chevron-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- User Details Modal -->
    <div class="modal fade" :class="{ show: isUserDetailsModalVisible }" tabindex="-1" role="dialog" :style="{ display: isUserDetailsModalVisible ? 'block' : 'none' }">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-info-circle-fill me-2"></i>User Details</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeUserDetailsModal"></button>
          </div>
          <div class="modal-body">
            <p><strong>ID:</strong> {{ currentUser?.uid }}</p>
            <p><strong>First Name:</strong> {{ currentUser?.firstName }}</p>
            <p><strong>Last Name:</strong> {{ currentUser?.lastName }}</p>
            <p><strong>Email:</strong> {{ currentUser?.email }}</p>
            <p><strong>Status:</strong> <span :class="getStatusBadgeClass(currentUser)">
              {{ getStatusText(currentUser) }}
            </span></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeUserDetailsModal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal fade" :class="{ show: isConfirmationModalVisible }" tabindex="-1" role="dialog" :style="{ display: isConfirmationModalVisible ? 'block' : 'none' }">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-exclamation-triangle-fill me-2"></i>Confirm Promotion</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeConfirmationModal"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to promote {{ userToPromote?.firstName }} {{ userToPromote?.lastName }} to admin?</p>
            <p class="text-muted">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeConfirmationModal">Cancel</button>
            <button type="button" class="btn btn-warning" @click="confirmPromotion">Confirm Promotion</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default {
  name: 'AdminUsers',
  setup() {
    const db = getFirestore();
    const users = ref([]);
    const activeTab = ref('verified');
    const currentPage = ref(1);
    const usersPerPage = 10;

    const isUserDetailsModalVisible = ref(false);
    const isConfirmationModalVisible = ref(false);
    const currentUser = ref(null);
    const userToPromote = ref(null);

    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      users.value = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    };

    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        if (activeTab.value === 'verified') return user.verified && user.role !== 'admin';
        if (activeTab.value === 'non-verified') return !user.verified && user.role !== 'admin';
        if (activeTab.value === 'admins') return user.role === 'admin';
        return false;
      });
    });

    const paginatedUsers = computed(() => {
      const startIndex = (currentPage.value - 1) * usersPerPage;
      return filteredUsers.value.slice(startIndex, startIndex + usersPerPage);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredUsers.value.length / usersPerPage);
    });

    const displayedPages = computed(() => {
      const range = 2;
      let start = Math.max(1, currentPage.value - range);
      let end = Math.min(totalPages.value, currentPage.value + range);

      if (start === 1) {
        end = Math.min(5, totalPages.value);
      }
      if (end === totalPages.value) {
        start = Math.max(1, totalPages.value - 4);
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    });

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    const viewUserDetails = (user) => {
      currentUser.value = { ...user };
      isUserDetailsModalVisible.value = true;
    };

    const closeUserDetailsModal = () => {
      isUserDetailsModalVisible.value = false;
    };

    const getStatusBadgeClass = (user) => {
      if (!user) return '';
      if (user.role === 'admin') return 'badge bg-danger';
      return user.verified ? 'badge bg-success' : 'badge bg-warning';
    };

    const getStatusText = (user) => {
      if (!user) return '';
      if (user.role === 'admin') return 'Admin';
      return user.verified ? 'Verified' : 'Non-Verified';
    };

    const promoteToAdmin = (user) => {
      userToPromote.value = { ...user };
      isConfirmationModalVisible.value = true;
    };

    const closeConfirmationModal = () => {
      isConfirmationModalVisible.value = false;
      userToPromote.value = null;
    };

    const confirmPromotion = async () => {
      if (userToPromote.value) {
        try {
          const userRef = doc(db, 'users', userToPromote.value.uid);
          await updateDoc(userRef, { role: 'admin' });
          
          // Update local state
          const index = users.value.findIndex(u => u.uid === userToPromote.value.uid);
          if (index !== -1) {
            users.value[index].role = 'admin';
          }

          closeConfirmationModal();
          // You might want to show a success message here
        } catch (error) {
          console.error('Error promoting user:', error);
          // You might want to show an error message here
        }
      }
    };

    onMounted(fetchUsers);

    return {
      activeTab,
      paginatedUsers,
      currentPage,
      totalPages,
      displayedPages,
      isUserDetailsModalVisible,
      isConfirmationModalVisible,
      currentUser,
      userToPromote,
      changePage,
      viewUserDetails,
      closeUserDetailsModal,
      getStatusBadgeClass,
      getStatusText,
      promoteToAdmin,
      closeConfirmationModal,
      confirmPromotion
    };
  }
};
</script>

<style scoped>
.admin-users {
  font-family: 'Poppins', sans-serif;
  color: #ffffff;
}

.card {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.nav-pills .nav-link {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  margin-right: 0.5rem;
  transition: all 0.3s ease;
}

.nav-pills .nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.nav-pills .nav-link:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.15);
}

.table {
  color: #ffffff;
}

.table th {
  font-weight: 600;
  border-color: rgba(255, 255, 255, 0.1);
}

.table td {
  border-color: rgba(255, 255, 255, 0.1);
}

.btn-sm {
  border-radius: 0.25rem;
}

.modal-content {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
}

.pagination .page-link {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-radius: 0.25rem;
  margin: 0 0.125rem;
}

.pagination .page-item.active .page-link {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.2);
}

.pagination .page-item.disabled .page-link {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
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