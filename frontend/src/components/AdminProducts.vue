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
                    <th class="py-3">Description</th>
                    <th class="py-3">Category</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in featuredProducts" :key="product.id">
                    <td class="py-3"><img :src="product.imageUrl" :alt="product.name" class="rounded-3" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td class="py-3">{{ product.name }}</td>
                    <td class="py-3">₱{{ product.price.toFixed(2) }}</td>
                    <td class="py-3">{{ product.description }}</td>
                    <td class="py-3"><span class="badge bg-info text-dark">{{ product.category }}</span></td>
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
                    <td class="py-3"><span class="badge bg-info text-dark">{{ product.category }}</span></td>
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
            <button type="button" class="btn btn-danger" @click="deleteProduct">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
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
    const deleteModal = ref(null);
    const productToDelete = ref(null);

    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      products.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      featuredProducts.value = products.value.filter(product => product.featured);
    };

    const addProduct = async () => {
      const imageUrl = await uploadImage(selectedImage.value);
      await addDoc(collection(db, 'products'), {
        ...product.value,
        imageUrl,
        featured: product.value.featured,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      clearForm();
      fetchProducts();
    };

    const updateProduct = async () => {
      const productRef = doc(db, 'products', currentProductId.value);
      if (selectedImage.value) {
        product.value.imageUrl = await uploadImage(selectedImage.value);
      }
      await updateDoc(productRef, {
        ...product.value,
        updatedAt: serverTimestamp()
      });
      clearForm();
      fetchProducts();
    };

    const editProduct = (productToEdit) => {
      product.value = { ...productToEdit };
      editMode.value = true;
      currentProductId.value = productToEdit.id;
    };

    const toggleFeatured = async (product) => {
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, { featured: product.featured });
      fetchProducts();
    };

    const confirmDelete = (productToDelete) => {
      productToDelete.value = productToDelete;
      deleteModal.value = new Modal(document.getElementById('deleteModal'));
      deleteModal.value.show();
    };

    const deleteProduct = async () => {
      await deleteDoc(doc(db, 'products', productToDelete.value.id));
      deleteModal.value.hide();
      fetchProducts();
    };

    const clearForm = () => {
      product.value = { name: '', price: 0, description: '', imageUrl: '', category: '', featured: false };
      editMode.value = false;
      selectedImage.value = null;
    };

    const handleImageUpload = (event) => {
      selectedImage.value = event.target.files[0];
    };

    const uploadImage = async (image) => {
      if (!image) return '';
      const storageReference = storageRef(storage, `product-images/${image.name}`);
      await uploadBytes(storageReference, image);
      return await getDownloadURL(storageReference);
    };

    onMounted(fetchProducts);

    return {
      products,
      featuredProducts,
      product,
      categories,
      editMode,
      addProduct,
      updateProduct,
      editProduct,
      deleteProduct,
      clearForm,
      confirmDelete,
      handleImageUpload,
      toggleFeatured
    };
  }
};
</script>

<style scoped>
.admin-products {
  padding: 2rem;
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.table th, .table td {
  vertical-align: middle;
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.modal-content {
  border: none;
  border-radius: 0.5rem;
}

.modal-header {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

@media (max-width: 992px) {
  .admin-products {
    padding: 1rem;
  }
}
</style>