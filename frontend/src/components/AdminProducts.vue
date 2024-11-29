<template>
  <div class="admin-products">
    <h2 class="page-title"><i class="bi bi-snow2 me-2"></i>Product Management</h2>

    <div class="notification-container">
      <transition-group name="notification">
        <div v-for="notif in notifications" :key="notif.id" class="notification" :class="notif.type">
          {{ notif.message }}
        </div>
      </transition-group>
    </div>

    <div class="card">
      <div class="card-header">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'featured' }" @click="setActiveTab('featured')">
              <i class="bi bi-star-fill me-2"></i>Featured Products
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'all-products' }" @click="setActiveTab('all-products')">
              <i class="bi bi-grid me-2"></i>All Products
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'add-edit' }" @click="setActiveTab('add-edit')">
              <i class="bi" :class="editMode ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
              {{ editMode ? 'Edit' : 'Add' }} Product
            </button>
          </li>
        </ul>
      </div>
      <div class="card-body">
        <!-- Featured Products Tab -->
        <div v-show="activeTab === 'featured'" class="tab-pane">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in featuredProducts" :key="product.id">
                  <td>
                    <img :src="product.imageUrl" :alt="product.name" class="product-image">
                  </td>
                  <td>{{ product.name }}</td>
                  <td>₱{{ product.price.toFixed(2) }}</td>
                  <td>
                    <span :class="['badge', getCategoryClass(product.category)]">
                      {{ product.category }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1" @click="editProduct(product)">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(product)">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- All Products Tab -->
        <div v-show="activeTab === 'all-products'" class="tab-pane">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in products" :key="product.id">
                  <td>
                    <img :src="product.imageUrl" :alt="product.name" class="product-image">
                  </td>
                  <td>{{ product.name }}</td>
                  <td>₱{{ product.price.toFixed(2) }}</td>
                  <td>
                    <span :class="['badge', getCategoryClass(product.category)]">
                      {{ product.category }}
                    </span>
                  </td>
                  <td>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" v-model="product.featured" @change="toggleFeatured(product)">
                    </div>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1" @click="editProduct(product)">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(product)">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Add/Edit Product Tab -->
        <div v-show="activeTab === 'add-edit'" class="tab-pane">
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
            <div class="mb-3 form-check form-switch">
              <input class="form-check-input" type="checkbox" id="featured" v-model="product.featured">
              <label class="form-check-label" for="featured">Featured Product</label>
            </div>
            <button type="submit" class="btn btn-primary">{{ editMode ? 'Update' : 'Add' }} Product</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteConfirmationModal" tabindex="-1" aria-labelledby="deleteConfirmationModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteConfirmationModalLabel">Confirm Deletion</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
import { ref, computed, onMounted } from 'vue';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { db, storage } from '@/firebaseConfig';
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
    const notifications = ref([]);
    const notificationId = ref(0);
    const activeTab = ref('featured');
    const productToDelete = ref(null);
    const deleteModal = ref(null);

    const auth = getAuth();

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

    const showNotification = (message, type = 'success') => {
      const id = notificationId.value++;
      notifications.value.push({ id, message, type });
      setTimeout(() => {
        notifications.value = notifications.value.filter(n => n.id !== id);
      }, 5000);
    };

    const setActiveTab = (tab) => {
      activeTab.value = tab;
    };

    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        products.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        featuredProducts.value = products.value.filter(product => product.featured);
      } catch (error) {
        console.error('Error fetching products:', error);
        showNotification('Error fetching products. Please try again.', 'error');
      }
    };

    const addProduct = async () => {
      if (selectedImage.value) {
        try {
          const storageReference = storageRef(storage, 'productImages/' + selectedImage.value.name);
          await uploadBytes(storageReference, selectedImage.value);
          const imageUrl = await getDownloadURL(storageReference);

          await addDoc(collection(db, 'products'), {
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
          showNotification('Product added successfully!');
          setActiveTab('all-products');
        } catch (error) {
          console.error('Error adding product:', error);
          showNotification('Error adding product. Please try again.', 'error');
        }
      }
    };

    const updateProduct = async () => {
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
        showNotification('Product updated successfully!');
        setActiveTab('all-products');
      } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Error updating product. Please try again.', 'error');
      }
    };

    const confirmDelete = (product) => {
      productToDelete.value = product;
      deleteModal.value.show();
    };

    const deleteProduct = async () => {
      try {
        await deleteDoc(doc(db, 'products', productToDelete.value.id));

        await addDoc(collection(db, 'adminHistory'), {
          adminEmail: auth.currentUser.email,
          action: 'Deleted product',
          productName: productToDelete.value.name,
          timestamp: serverTimestamp()
        });

        await fetchProducts();
        deleteModal.value.hide();
        showNotification('Product deleted successfully!');
        setActiveTab('all-products');
      } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product. Please try again.', 'error');
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
      currentProductId.value = null;
    };

    const editProduct = (productToEdit) => {
      product.value = { ...productToEdit };
      currentProductId.value = productToEdit.id;
      editMode.value = true;
      setActiveTab('add-edit');
    };

    const toggleFeatured = async (productToToggle) => {
      try {
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
        showNotification(`Product ${productToToggle.featured ? 'featured' : 'unfeatured'} successfully!`);
      } catch (error) {
        console.error('Error toggling featured status:', error);
        showNotification('Error updating product feature status. Please try again.', 'error');
      }
    };

    onMounted(() => {
      fetchProducts();
      deleteModal.value = new Modal(document.getElementById('deleteConfirmationModal'));
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
      notifications,
      activeTab,
      setActiveTab
    };
  }
};
</script>

<style scoped>
.admin-products {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  color: #333;
}

.card {
  background-color: #fff;
  border: none;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: none;
}

.nav-tabs {
  border-bottom: none;
}

.nav-link {
  color: #495057;
  border: none;
  padding: 10px 15px;
}

.nav-link:hover {
  color: #007bff;
}

.nav-link.active {
  color: #007bff;
  background-color: #fff;
  border-bottom: 2px solid #007bff;
}

.table {
  margin-bottom: 0;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
}

.badge {
  font-size: 0.8rem;
  padding: 0.4em 0.6em;
}

.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.notification {
  padding: 15px 20px;
  margin-bottom: 10px;
  border-radius: 4px;
  color: #ffffff;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.notification.success {
  background-color: #28a745;
}

.notification.error {
  background-color: #dc3545;
}

.notification-enter-active, .notification-leave-active {
  transition: all 0.5s ease;
}

.notification-enter-from, .notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@media (max-width: 768px) {
  .admin-products {
    padding: 10px;
  }

  .card-header {
    padding: 10px;
  }

  .nav-link {
    padding: 8px 12px;
  }
}
</style>

