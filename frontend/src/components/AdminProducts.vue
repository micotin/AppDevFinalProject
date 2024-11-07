<template>
  <div class="admin-products">
    <h2 class="mb-4 text-primary"><i class="bi bi-flower3 me-2"></i>Product Management</h2>

    <div class="row g-4">
      <!-- Featured Products Section -->
      <div class="col-12 mb-4">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-header bg-primary text-white py-3">
            <h5 class="card-title mb-0"><i class="bi bi-star-fill me-2"></i>Featured Products</h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                  <tr>
                    <th class="py-3">Image</th>
                    <th class="py-3">Name</th>
                    <th class="py-3">Price</th>
                    <th class="py-3">Category</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in featuredProducts" :key="product.id">
                    <td class="py-3"><img :src="product.imageUrl" :alt="product.name" class="rounded-3" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td class="py-3">{{ product.name }}</td>
                    <td class="py-3">₱{{ product.price.toFixed(2) }}</td>
                    <td class="py-3"><span :class="['badge', getCategoryClass(product.category)]">{{ product.category }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Product List -->
      <div class="col-lg-8 mb-4">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-header bg-primary text-white py-3">
            <h5 class="card-title mb-0"><i class="bi bi-list-ul me-2"></i>Product List</h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                  <tr>
                    <th class="py-3">Image</th>
                    <th class="py-3">Name</th>
                    <th class="py-3">Price</th>
                    <th class="py-3">Category</th>
                    <th class="py-3">Featured</th>
                    <th class="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in products" :key="product.id">
                    <td class="py-3"><img :src="product.imageUrl" :alt="product.name" class="rounded-3" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td class="py-3">{{ product.name }}</td>
                    <td class="py-3">₱{{ product.price.toFixed(2) }}</td>
                    <td class="py-3"><span :class="['badge', getCategoryClass(product.category)]">{{ product.category }}</span></td>
                    <td class="py-3">
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" v-model="product.featured" @change="toggleFeatured(product)">
                      </div>
                    </td>
                    <td class="py-3">
                      <button class="btn btn-sm btn-outline-primary me-1" @click="editProduct(product)"><i class="bi bi-pencil"></i></button>
                      <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(product)"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Add / Edit Product Form -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-header bg-primary text-white py-3">
            <h5 class="card-title mb-0"><i class="bi" :class="editMode ? 'bi-pencil-square' : 'bi-plus-circle'"></i> {{ editMode ? 'Edit' : 'Add' }} Product</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="editMode ? updateProduct() : addProduct()">
              <div class="mb-3">
                <label for="name" class="form-label">Product Name</label>
                <input type="text" class="form-control" id="name" v-model="product.name" required>
              </div>
              <div class="mb-3">
                <label for="price" class="form-label">Price (₱)</label>
                <input type="number" class="form-control" id="price" v-model="product.price" step="0.01" required>
              </div>
              <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea class="form-control" id="description" v-model="product.description" rows="3" required></textarea>
              </div>
              <div class="mb-3">
                <label for="category" class="form-label">Event Category</label>
                <select class="form-select" id="category" v-model="product.category" required>
                  <option disabled value="">Select an event category</option>
                  <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="imageUrl" class="form-label">Image</label>
                <input type="file" class="form-control" id="imageUrl" @change="handleImageUpload" accept="image/*">
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-primary">{{ editMode ? 'Update' : 'Add' }} Product</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Modal -->
    <div class="modal fade" id="loadingModal" tabindex="-1" aria-labelledby="loadingModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center py-4">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <h5 id="loadingModalLabel">{{ loadingMessage }}</h5>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center py-4">
            <i class="bi bi-check-circle text-success display-1 mb-3"></i>
            <h5 id="successModalLabel">{{ successMessage }}</h5>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteModalLabel">Confirm Delete</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete this product?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="initiateDelete">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Countdown Modal -->
    <div class="modal fade" id="deleteCountdownModal" tabindex="-1" aria-labelledby="deleteCountdownModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center py-4">
            <h5 id="deleteCountdownModalLabel">Deleting product in</h5>
            <div class="countdown-circle my-3">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e9ecef" stroke-width="10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#dc3545" stroke-width="10"
                        stroke-dasharray="283" :stroke-dashoffset="deleteCountdownProgress" />
                <text x="50" y="50" text-anchor="middle" dy=".3em" font-size="24">{{ deleteCountdown }}</text>
              </svg>
            </div>
            <p>Click cancel to stop the deletion</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button type="button" class="btn btn-secondary" @click="cancelDelete">Cancel</button>
            <button type="button" class="btn btn-danger" @click="confirmDeleteNow">Delete Now</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { db, storage } from '../firebaseConfig';
import { Modal } from 'bootstrap';

export default {
  name: 'AdminProducts',
  setup() {
    const products = ref([]);
    const featuredProducts = ref([]);
    const product = ref({
      name: '',
      price: 0,
      description: '',
      imageUrl: '',
      category: '',
      featured: false
    });
    const categories = ref(['Wedding', 'Birthday', 'Anniversary', 'Corporate Event', 'Graduation', 'Baby Shower', 'Funeral', 'Others']);
    const editMode = ref(false);
    const currentProductId = ref(null);
    const selectedImage = ref(null);
    const loadingMessage = ref('');
    const successMessage = ref('');
    const productToDelete = ref(null);
    const deleteCountdown = ref(15);
    const deleteCountdownInterval = ref(null);

    const auth = getAuth();

    const loadingModal = ref(null);
    const successModal = ref(null);
    const deleteModal = ref(null);
    const deleteCountdownModal = ref(null);

    const deleteCountdownProgress = computed(() => {
      return 283 - (283 * deleteCountdown.value) / 15;
    });

    const getCategoryClass = (category) => {
      const classes = {
        'Wedding': 'bg-primary',
        'Birthday': 'bg-success',
        'Anniversary': 'bg-info',
        'Corporate Event': 'bg-secondary',
        'Graduation': 'bg-warning text-dark',
        'Baby Shower': 'bg-pink',
        'Funeral': 'bg-dark',
        'Others': 'bg-light text-dark'
      };
      return classes[category] || 'bg-info';
    };

    const showLoading = (message) => {
      loadingMessage.value = message;
      loadingModal.value.show();
    };

    const hideLoading = () => {
      loadingModal.value.hide();
    };

    const showSuccess = (message) => {
      successMessage.value = message;
      successModal.value.show();
    };

    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      products.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      featuredProducts.value = products.value.filter(product => product.featured);
    };

    const addProduct = async () => {
      if (selectedImage.value) {
        showLoading('Adding product...');
        try {
          const storageReference = storageRef(storage, 'productImages/' + selectedImage.value.name);
          await uploadBytes(storageReference, selectedImage.value);
          const imageUrl = await getDownloadURL(storageReference);

          const newProduct = await addDoc(collection(db, 'products'), {
            ...product.value,
            imageUrl,
            timestamp: serverTimestamp()
          });
          
          await addDoc(collection(db, 'adminHistory'), {
            adminEmail: auth.currentUser.email,
            action: 'Added product',
            productName: product.value.name,
            timestamp: serverTimestamp()
          });

          await fetchProducts();
          clearForm();
          hideLoading();
          showSuccess('Product added successfully!');
        } catch (error) {
          console.error('Error adding product:', error);
          hideLoading();
          // Show error message to user
        }
      }
    };

    const updateProduct = async () => {
      showLoading('Updating product...');
      try {
        let imageUrl = product.value.imageUrl;
        if (selectedImage.value) {
          const storageReference = storageRef(storage, 'productImages/' + selectedImage.value.name);
          await uploadBytes(storageReference, selectedImage.value);
          imageUrl = await getDownloadURL(storageReference);
        }

        await updateDoc(doc(db, 'products', currentProductId.value), {
          ...product.value,
          imageUrl,
          timestamp: serverTimestamp()
        });

        await addDoc(collection(db, 'adminHistory'), {
          adminEmail: auth.currentUser.email,
          action: 'Updated product',
          productName: product.value.name,
          timestamp: serverTimestamp()
        });

        await fetchProducts();
        clearForm();
        hideLoading();
        showSuccess('Product updated successfully!');
      } catch (error) {
        console.error('Error updating product:', error);
        hideLoading();
        // Show error message to user
      }
    };

    const confirmDelete = (product) => {
      productToDelete.value = product;
      deleteModal.value.show();
    };

    const initiateDelete = () => {
      deleteModal.value.hide();
      deleteCountdown.value = 15;
      deleteCountdownModal.value.show();
      deleteCountdownInterval.value = setInterval(() => {
        deleteCountdown.value--;
        if (deleteCountdown.value === 0) {
          clearInterval(deleteCountdownInterval.value);
          deleteProduct();
        }
      }, 1000);
    };

    const cancelDelete = () => {
      clearInterval(deleteCountdownInterval.value);
      deleteCountdownModal.value.hide();
    };

    const confirmDeleteNow = () => {
      clearInterval(deleteCountdownInterval.value);
      deleteProduct();
    };

    const deleteProduct = async () => {
      deleteCountdownModal.value.hide();
      showLoading('Deleting product...');
      try {
        await deleteDoc(doc(db, 'products', productToDelete.value.id));

        await addDoc(collection(db, 'adminHistory'), {
          adminEmail: auth.currentUser.email,
          action: 'Deleted product',
          productName: productToDelete.value.name,
          timestamp: serverTimestamp()
        });

        await fetchProducts();
        hideLoading();
        showSuccess('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        hideLoading();
        // Show error message to user
      }
    };

    const handleImageUpload = (event) => {
      selectedImage.value = event.target.files[0];
    };

    const clearForm = () => {
      product.value = {
        name: '',
        price: 0,
        description: '',
        imageUrl: '',
        category: '',
        featured: false
      };
      selectedImage.value = null;
      editMode.value = false;
    };

    const editProduct = (productToEdit) => {
      product.value = { ...productToEdit };
      currentProductId.value = productToEdit.id;
      editMode.value = true;
    };

    const toggleFeatured = async (productToToggle) => {
      await updateDoc(doc(db, 'products', productToToggle.id), {
        featured: productToToggle.featured
      });

      await addDoc(collection(db, 'adminHistory'), {
        adminEmail: auth.currentUser.email,
        action: productToToggle.featured ? 'Featured product' : 'Unfeatured product',
        productName: productToToggle.name,
        timestamp: serverTimestamp()
      });

      await fetchProducts();
    };

    onMounted(() => {
      fetchProducts();
      loadingModal.value = new Modal(document.getElementById('loadingModal'));
      successModal.value = new Modal(document.getElementById('successModal'));
      deleteModal.value = new Modal(document.getElementById('deleteModal'));
      deleteCountdownModal.value = new Modal(document.getElementById('deleteCountdownModal'));
    });

    return {
      products,
      featuredProducts,
      product,
      categories,
      editMode,
      addProduct,
      updateProduct,
      confirmDelete,
      deleteProduct,
      handleImageUpload,
      clearForm,
      editProduct,
      toggleFeatured,
      getCategoryClass,
      loadingMessage,
      successMessage,
      initiateDelete,
      cancelDelete,
      confirmDeleteNow,
      deleteCountdown,
      deleteCountdownProgress
    };
  }
};
</script>

<style scoped>
.admin-products {
  font-family: Arial, sans-serif;
}

.table th {
  background-color: #f8f9fa;
}

.table td {
  vertical-align: middle;
}

.card-header {
  background-color: #0d6efd;
}

.card-body {
  background-color: #fff;
}

.btn-outline-danger,
.btn-outline-primary {
  border: none;
  color: #6c757d;
}

.btn-outline-danger:hover,
.btn-outline-primary:hover {
  color: #fff;
  background-color: #6c757d;
}

.modal-content {
  border-radius: 8px;
}

.form-check-input {
  cursor: pointer;
}

.form-select {
  margin-top: 5px;
}

.countdown-circle {
  position: relative;
}

.countdown-circle svg {
  transform: rotate(-90deg);
}

.countdown-circle text {
  font-weight: bold;
  fill: #dc3545;
}
</style>