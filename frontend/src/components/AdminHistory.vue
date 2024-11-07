<template>
    <div class="admin-history bg-light min-h-screen py-5">
      <div class="container">
        <h1 class="display-4 text-center mb-5">Admin Action History</h1>
  
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <div class="input-group">
                  <span class="input-group-text bg-white">
                    <i class="bi bi-search"></i>
                  </span>
                  <input 
                    v-model="searchQuery" 
                    type="text" 
                    class="form-control"
                    placeholder="Search by admin, product, or order..."
                  >
                </div>
              </div>
              <div class="col-md-3">
                <select v-model="actionFilter" class="form-select">
                  <option value="">All Actions</option>
                  <option v-for="action in uniqueActions" :key="action" :value="action">
                    {{ action }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <select v-model="sortBy" class="form-select">
                  <option value="timestamp">Sort by Date</option>
                  <option value="adminEmail">Sort by Admin</option>
                  <option value="action">Sort by Action</option>
                  <option value="productName">Sort by Product</option>
                  <option value="orderId">Sort by Order ID</option>
                </select>
              </div>
              <div class="col-md-2">
                <button @click="toggleSortOrder" class="btn btn-outline-primary w-100">
                  <i class="bi" :class="sortOrder === 'asc' ? 'bi-sort-up' : 'bi-sort-down'"></i>
                  {{ sortOrder === 'asc' ? 'Ascending' : 'Descending' }}
                </button>
              </div>
            </div>
  
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
  
            <div v-else-if="filteredHistory.length === 0" class="text-center py-5">
              <i class="bi bi-inbox display-1 text-muted"></i>
              <p class="lead mt-3 text-muted">No history records found.</p>
            </div>
  
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in paginatedHistory" :key="record.id">
                    <td>{{ formatDate(record.timestamp) }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <img :src="getAdminAvatar(record.adminEmail)" class="rounded-circle me-2" width="32" height="32" :alt="record.adminEmail">
                        {{ record.adminEmail }}
                      </div>
                    </td>
                    <td>
                      <span :class="['badge', getActionClass(record.action)]">
                        {{ record.action }}
                      </span>
                    </td>
                    <td>
                      <span v-if="record.productName">Product: {{ record.productName }}</span>
                      <span v-if="record.orderId">Order ID: {{ record.orderId }}</span>
                      <span v-if="record.oldStatus && record.newStatus">
                        Status changed from {{ record.oldStatus }} to {{ record.newStatus }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
  
            <nav v-if="totalPages > 1" aria-label="History pagination" class="mt-4">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button @click="currentPage--" class="page-link" :disabled="currentPage === 1">
                    <i class="bi bi-chevron-left"></i>
                  </button>
                </li>
                <li v-for="page in displayedPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                  <button v-if="typeof page === 'number'" @click="currentPage = page" class="page-link">
                    {{ page }}
                  </button>
                  <span v-else class="page-link">{{ page }}</span>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button @click="currentPage++" class="page-link" :disabled="currentPage === totalPages">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore'
  import { db } from '../firebaseConfig'
  
  export default {
    name: 'AdminHistory',
    setup() {
      const history = ref([])
      const loading = ref(true)
      const searchQuery = ref('')
      const actionFilter = ref('')
      const sortBy = ref('timestamp')
      const sortOrder = ref('desc')
      const currentPage = ref(1)
      const itemsPerPage = 10
  
      const fetchHistory = async () => {
        try {
          loading.value = true
          const historyRef = collection(db, 'adminHistory')
          const q = query(historyRef, orderBy('timestamp', 'desc'))
          const querySnapshot = await getDocs(q)
          history.value = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
          }))
        } catch (error) {
          console.error('Error fetching admin history:', error)
        } finally {
          loading.value = false
        }
      }
  
      const formatDate = (date) => {
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
  
      const getActionClass = (action) => {
        const classes = {
          'Added product': 'bg-success',
          'Updated product': 'bg-primary',
          'Deleted product': 'bg-danger',
          'Featured product': 'bg-warning text-dark',
          'Unfeatured product': 'bg-secondary',
          'Updated order status': 'bg-info'
        }
        return classes[action] || 'bg-info'
      }
  
      const getAdminAvatar = (email) => {
        // This is a placeholder function. In a real application, you might want to use
        // actual admin avatars or generate initials-based avatars.
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random`
      }
  
      const uniqueActions = computed(() => {
        return [...new Set(history.value.map(record => record.action))]
      })
  
      const filteredHistory = computed(() => {
        let filtered = history.value
  
        if (searchQuery.value) {
          const query = searchQuery.value.toLowerCase()
          filtered = filtered.filter(record => 
            record.adminEmail.toLowerCase().includes(query) ||
            (record.productName && record.productName.toLowerCase().includes(query)) ||
            (record.orderId && record.orderId.toLowerCase().includes(query))
          )
        }
  
        if (actionFilter.value) {
          filtered = filtered.filter(record => record.action === actionFilter.value)
        }
  
        filtered.sort((a, b) => {
          let comparison = 0
          if (a[sortBy.value] < b[sortBy.value]) comparison = -1
          if (a[sortBy.value] > b[sortBy.value]) comparison = 1
          return sortOrder.value === 'asc' ? comparison : -comparison
        })
  
        return filtered
      })
  
      const totalPages = computed(() => Math.ceil(filteredHistory.value.length / itemsPerPage))
  
      const paginatedHistory = computed(() => {
        const startIndex = (currentPage.value - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredHistory.value.slice(startIndex, endIndex)
      })
  
      const displayedPages = computed(() => {
        const delta = 2
        const range = []
        for (let i = Math.max(2, currentPage.value - delta); i <= Math.min(totalPages.value - 1, currentPage.value + delta); i++) {
          range.push(i)
        }
  
        if (currentPage.value - delta > 2) {
          range.unshift("...")
        }
        if (currentPage.value + delta < totalPages.value - 1) {
          range.push("...")
        }
  
        range.unshift(1)
        if (totalPages.value !== 1) {
          range.push(totalPages.value)
        }
  
        return range
      })
  
      const toggleSortOrder = () => {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      }
  
      onMounted(() => {
        fetchHistory()
      })
  
      return {
        history,
        loading,
        searchQuery,
        actionFilter,
        sortBy,
        sortOrder,
        currentPage,
        uniqueActions,
        filteredHistory,
        paginatedHistory,
        totalPages,
        displayedPages,
        formatDate,
        getActionClass,
        getAdminAvatar,
        toggleSortOrder
      }
    }
  }
  </script>
  
  <style scoped>
  .admin-history {
    font-family: 'Poppins', sans-serif;
  }
  
  .table th {
    font-weight: 600;
  }
  
  .badge {
    font-weight: 500;
    padding: 0.5em 0.75em;
  }
  
  .pagination {
    --bs-pagination-color: #6a3093;
    --bs-pagination-hover-color: #a044ff;
    --bs-pagination-focus-color: #a044ff;
    --bs-pagination-active-bg: #6a3093;
    --bs-pagination-active-border-color: #6a3093;
  }
  
  .btn-outline-primary {
    --bs-btn-color: #6a3093;
    --bs-btn-border-color: #6a3093;
    --bs-btn-hover-bg: #6a3093;
    --bs-btn-hover-border-color: #6a3093;
    --bs-btn-active-bg: #6a3093;
    --bs-btn-active-border-color: #6a3093;
  }
  
  .form-select:focus,
  .form-control:focus {
    border-color: #6a3093;
    box-shadow: 0 0 0 0.25rem rgba(106, 48, 147, 0.25);
  }
  
  .table-hover tbody tr:hover {
    background-color: rgba(106, 48, 147, 0.05);
  }
  </style>