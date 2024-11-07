<template>
  <div class="admin-users container-fluid py-4">
    <h2 class="mb-4 text-primary">
      <i class="bi bi-people-fill me-2"></i>Manage Users
    </h2>

    <div class="card shadow">
      <div class="card-body">
        <ul class="nav nav-pills mb-3">
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
            <thead class="table-light">
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
                  <button class="btn btn-sm btn-outline-primary me-2" @click="viewUserDetails(user)">
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
          <div class="modal-header bg-primary text-white">
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
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title"><i class="bi bi-exclamation-triangle-fill me-2"></i>Confirm Promotion</h5>
            <button type="button" class="btn-close" @click="closeConfirmationModal"></button>
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
  background-color: #f8f9fa;
}

.card {
  border-radius: 0.5rem;
}

.nav-pills .nav-link {
  color: #495057;
  border-radius: 0.25rem;
  margin-right: 0.5rem;
  transition: all 0.3s ease;
}

.nav-pills .nav-link.active {
  background-color: #0d6efd;
  color: white;
}

.nav-pills .nav-link:hover:not(.active) {
  background-color: #e9ecef;
}

.table th {
  font-weight: 600;
}

.btn-sm {
  border-radius: 0.25rem;
}

.modal-content {
  border-radius: 0.5rem;
}

.modal-header {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
}

.pagination .page-link {
  color: #0d6efd;
  border-radius: 0.25rem;
  margin: 0 0.125rem;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.pagination .page-item.disabled .page-link {
  color: #6c757d;
}
</style>