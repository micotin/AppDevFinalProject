<template>
  <div class="admin-contact-management">
    <h2 class="mb-4 text-white"><i class="bi bi-envelope-fill me-2"></i>Contact Management</h2>
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-header bg-primary text-white py-3">
        <h5 class="card-title mb-0">Inquiries</h5>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="py-3">Date</th>
                <th class="py-3">Name</th>
                <th class="py-3">Email</th>
                <th class="py-3">Type</th>
                <th class="py-3">Message</th>
                <th class="py-3">Status</th>
                <th class="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inquiry in inquiries" :key="inquiry.id">
                <td class="py-3">{{ formatDate(inquiry.createdAt) }}</td>
                <td class="py-3">{{ inquiry.name }}</td>
                <td class="py-3">{{ inquiry.email }}</td>
                <td class="py-3">{{ inquiry.inquiryType }}</td>
                <td class="py-3">{{ truncateMessage(inquiry.message) }}</td>
                <td class="py-3">
                  <span :class="['badge', getStatusBadgeClass(inquiry.status)]">
                    {{ inquiry.status }}
                  </span>
                </td>
                <td class="py-3">
                  <button class="btn btn-sm btn-outline-primary me-2" @click="viewInquiry(inquiry)">
                    <i class="bi bi-eye-fill me-1"></i>View
                  </button>
                  <button class="btn btn-sm btn-outline-success" @click="updateStatus(inquiry)">
                    <i class="bi bi-arrow-clockwise me-1"></i>Update
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- View Inquiry Modal -->
    <div class="modal fade" id="viewInquiryModal" tabindex="-1" aria-labelledby="viewInquiryModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white">
          <div class="modal-header border-bottom border-secondary">
            <h5 class="modal-title" id="viewInquiryModalLabel">View Inquiry</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
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
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white">
          <div class="modal-header border-bottom border-secondary">
            <h5 class="modal-title" id="updateStatusModalLabel">Update Inquiry Status</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitStatusUpdate">
              <div class="mb-3">
                <label for="statusSelect" class="form-label">New Status</label>
                <select class="form-select bg-secondary text-white" id="statusSelect" v-model="newStatus">
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary w-100">Update Status</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Modal } from 'bootstrap';

export default {
  name: 'AdminContactManagement',
  setup() {
    const inquiries = ref([]);
    const selectedInquiry = ref(null);
    const newStatus = ref('');

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
        'in-progress': 'bg-warning text-dark',
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

    onMounted(() => {
      fetchInquiries();
    });

    return {
      inquiries,
      selectedInquiry,
      newStatus,
      formatDate,
      truncateMessage,
      getStatusBadgeClass,
      viewInquiry,
      updateStatus,
      submitStatusUpdate
    };
  }
};
</script>

<style scoped>
.admin-contact-management {
  font-family: 'Poppins', sans-serif;
}

.card {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header {
  background: rgba(40, 40, 55, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.table {
  color: #b4b4bb;
}

.table thead th {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.table tbody tr:hover {
  background-color: rgba(229, 72, 77, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #e5484d 0%, #a12c82 100%);
  border: none;
}

.btn-primary:hover, .btn-primary:focus {
  background: linear-gradient(135deg, #f05a5f 0%, #b13d93 100%);
}

.btn-outline-primary, .btn-outline-success {
  color: #ffffff;
  border-color: #ffffff;
}

.btn-outline-primary:hover, .btn-outline-success:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.modal-content {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-select {
  background-color: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.form-select:focus {
  background-color: rgba(40, 40, 55, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}
</style>