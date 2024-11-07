<template>
  <div class="user-shop">
    <div class="hero-section mb-5">
      <div class="container">
        <h1 class="text-center display-4 fw-bold text-white mb-4">Our Products</h1>
        <p class="text-center lead text-white mb-5">Discover our beautiful floral arrangements for every occasion</p>
        <div class="search-container">
          <input 
            v-model="searchQuery" 
            type="text" 
            class="form-control form-control-lg search-input" 
            placeholder="Search products..."
            aria-label="Search products"
          >
          <i class="bi bi-search search-icon"></i>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <!-- Filters Sidebar -->
        <div class="col-lg-3 mb-4">
          <div class="card shadow-sm border-0 rounded-3">
            <div class="card-body">
              <h2 class="card-title h5 mb-4 fw-bold">Filters</h2>
              
              <!-- Category Filter -->
              <div class="mb-4">
                <h3 class="h6 fw-bold mb-3">Categories</h3>
                <div v-for="category in categories" :key="category" class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    :id="category" 
                    :value="category" 
                    v-model="selectedCategories"
                  >
                  <label class="form-check-label" :for="category">
                    {{ category }}
                  </label>
                </div>
              </div>

              <!-- Price Range Filter -->
              <div class="mb-4">
                <h3 class="h6 fw-bold mb-3">Price Range</h3>
                <div class="price-range-inputs">
                  <input 
                    v-model.number="minPrice" 
                    type="number" 
                    class="form-control" 
                    placeholder="Min"
                    aria-label="Minimum price"
                  >
                  <span class="price-range-separator">-</span>
                  <input 
                    v-model.number="maxPrice" 
                    type="number" 
                    class="form-control" 
                    placeholder="Max"
                    aria-label="Maximum price"
                  >
                </div>
              </div>

              <!-- Sort By -->
              <div class="mb-4">
                <h3 class="h6 fw-bold mb-3">Sort By</h3>
                <select v-model="sortBy" class="form-select" aria-label="Sort products">
                  <option value="name">Name</option>
                  <option value="priceLowToHigh">Price: Low to High</option>
                  <option value="priceHighToLow">Price: High to Low</option>
                </select>
              </div>

              <button @click="resetFilters" class="btn btn-outline-primary w-100">Reset Filters</button>
            </div>
          </div>
        </div>

        <!-- Product Grid -->
        <div class="col-lg-9">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
          <div v-else>
            <p class="mb-4 fw-bold">Showing {{ filteredAndSortedProducts.length }} products</p>
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              <div v-for="product in filteredAndSortedProducts" :key="product.id" class="col">
                <div class="card h-100 shadow-sm product-card border-0">
                  <div class="position-relative">
                    <img :src="product.imageUrl" class="card-img-top" :alt="product.name">
                    <button 
                      @click="toggleFavorite(product)" 
                      class="btn btn-favorite"
                      :class="{ 'is-favorite': isFavorite(product.id) }"
                      :aria-label="isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'"
                    >
                      <i class="bi" :class="isFavorite(product.id) ? 'bi-heart-fill' : 'bi-heart'"></i>
                    </button>
                  </div>
                  <div class="card-body d-flex flex-column">
                    <h3 class="card-title h5 fw-bold">{{ product.name }}</h3>
                    <p class="card-text flex-grow-1">{{ product.description }}</p>
                    <div class="mt-auto">
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="price fw-bold">₱{{ product.price.toFixed(2) }}</span>
                        <span class="badge bg-secondary">{{ product.category }}</span>
                      </div>
                      <div class="d-flex justify-content-between">
                        <button @click="viewProduct(product)" class="btn btn-outline-primary flex-grow-1 me-2">
                          <i class="bi bi-eye me-2"></i>View
                        </button>
                        <button @click="addToCart(product)" class="btn btn-primary flex-grow-1" :disabled="product.added">
                          <i class="bi" :class="product.added ? 'bi-check' : 'bi-cart-plus'"></i>
                          {{ product.added ? 'Added' : 'Add' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add to Cart Modal -->
    <div class="modal fade" id="addToCartModal" tabindex="-1" aria-labelledby="addToCartModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center">
            <template v-if="cartActionStatus.success">
              <i class="bi bi-check-circle text-success display-1 mb-3"></i>
              <h2 class="modal-title h5 mb-3" id="addToCartModalLabel">Added to Cart Successfully!</h2>
              <p>{{ cartActionStatus.message }}</p>
            </template>
            <template v-else>
              <i class="bi bi-exclamation-circle text-danger display-1 mb-3"></i>
              <h2 class="modal-title h5 mb-3" id="addToCartModalLabel">Error Adding to Cart</h2>
              <p>{{ cartActionStatus.message }}</p>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, setDoc, deleteDoc, increment } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'UserShop',
  setup() {
    const router = useRouter()
    const auth = getAuth()
    const products = ref([])
    const loading = ref(true)
    const error = ref(null)
    const searchQuery = ref('')
    const selectedCategories = ref([])
    const minPrice = ref(null)
    const maxPrice = ref(null)
    const sortBy = ref('name')
    const categories = ref([])
    const favorites = ref([])
    const cartActionStatus = ref({ success: false, message: '' })

    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'))
        products.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          added: false
        }))
        categories.value = [...new Set(products.value.map(product => product.category))]
        loading.value = false
      } catch (err) {
        console.error("Error fetching products:", err)
        error.value = "An error occurred while fetching products. Please try again later."
        loading.value = false
      }
    }

    const fetchFavorites = async () => {
      const user = auth.currentUser
      if (user) {
        try {
          const favoritesSnapshot = await getDocs(collection(db, 'users', user.uid, 'favorites'))
          favorites.value = favoritesSnapshot.docs.map(doc => doc.id)
        } catch (err) {
          console.error("Error fetching favorites:", err)
        }
      }
    }

    const filteredAndSortedProducts = computed(() => {
      let result = products.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        )
      }

      if (selectedCategories.value.length > 0) {
        result = result.filter(product => selectedCategories.value.includes(product.category))
      }

      if (minPrice.value !== null) {
        result = result.filter(product => product.price >= minPrice.value)
      }
      if (maxPrice.value !== null) {
        result = result.filter(product => product.price <= maxPrice.value)
      }

      switch (sortBy.value) {
        case 'priceLowToHigh':
          result.sort((a, b) => a.price - b.price)
          break
        case 'priceHighToLow':
          result.sort((a, b) => b.price - a.price)
          break
        default:
          result.sort((a, b) => a.name.localeCompare(b.name))
      }

      return result
    })

    const addToCart = async (product) => {
      const user = auth.currentUser
      if (user) {
        try {
          const cartRef = doc(db, 'users', user.uid, 'cart', product.id)
          await setDoc(cartRef, {
            productId: product.id,
            quantity: increment(1)
          }, { merge: true })

          console.log(`Added ${product.name} to cart`)
          cartActionStatus.value = { 
            success: true, 
            message: `${product.name} has been added to your cart.`
          }
          product.added = true
          
          // Show modal
          const modal = new bootstrap.Modal(document.getElementById('addToCartModal'))
          modal.show()
          
          // Hide modal and reset product state after 2 seconds
          setTimeout(() => {
            modal.hide()
            product.added = false
          }, 2000)
        } catch (error) {
          console.error("Error adding to cart:", error)
          cartActionStatus.value = { 
            success: false, 
            message: "Failed to add item to cart. Please try again."
          }
          
          // Show error modal
          const modal = new bootstrap.Modal(document.getElementById('addToCartModal'))
          modal.show()
        }
      } else {
        cartActionStatus.value = { 
          success: false, 
          message: "Please log in to add items to your cart."
        }
        
        // Show error modal
        const modal = new bootstrap.Modal(document.getElementById('addToCartModal'))
        modal.show()
      }
    }

    const resetFilters = () => {
      searchQuery.value = ''
      selectedCategories.value = []
      minPrice.value = null
      maxPrice.value = null
      sortBy.value = 'name'
    }

    const toggleFavorite = async (product) => {
      const user = auth.currentUser
      if (user) {
        const favoriteRef = doc(db, 'users', user.uid, 'favorites', product.id)
        if (isFavorite(product.id)) {
          await deleteDoc(favoriteRef)
          favorites.value = favorites.value.filter(id => id !== product.id)
        } else {
          await setDoc(favoriteRef, { productId: product.id })
          favorites.value.push(product.id)
        }
      } else {
        alert('Please log in to add favorites')
      }
    }

    const isFavorite = (productId) => {
      return favorites.value.includes(productId)
    }

    const viewProduct = (product) => {
      router.push({ name: 'UserViewProduct', params: { id: product.id } })
    }

    onMounted(() => {
      fetchProducts()
      if (auth.currentUser) {
        fetchFavorites()
      }
    })

    onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchFavorites()
      } else {
        favorites.value = []
      }
    })

    return {
      products,
      loading,
      error,
      searchQuery,
      selectedCategories,
      minPrice,
      maxPrice,
      sortBy,
      categories,
      filteredAndSortedProducts,
      addToCart,
      resetFilters,
      toggleFavorite,
      isFavorite,
      viewProduct,
      cartActionStatus
    }
  }
}
</script>

<style scoped>
.user-shop {
  padding-top: 2rem;
  background-color: #f8f9fa;
}

.hero-section {
  background: linear-gradient(135deg, #6a3093 0%, #a044ff 100%);
  color: white;
  padding: 6rem 0;
  margin-bottom: 4rem;
  border-radius: 0 0 50% 50% / 20px;
}

.search-container {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  padding-right: 40px;
  border-radius: 30px;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #6a3093;
}

.card {
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  
  border-radius: 15px;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.card-img-top {
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
}

.product-card:hover .card-img-top {
  transform: scale(1.05);
}

.price {
  font-size: 1.25rem;
  color: #6a3093;
}

.btn-primary {
  background-color: #6a3093;
  border-color: #6a3093;
  transition: all 0.3s ease;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: #a044ff;
  border-color: #a044ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-outline-primary {
  color: #6a3093;
  border-color: #6a3093;
}

.btn-outline-primary:hover, .btn-outline-primary:focus {
  background-color: #6a3093;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-check-input:checked {
  background-color: #6a3093;
  border-color: #6a3093;
}

.price-range-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-range-separator {
  font-weight: bold;
}

.btn-favorite {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-favorite:hover {
  background-color: #f8f9fa;
  transform: scale(1.1);
}

.btn-favorite.is-favorite {
  color: #dc3545;
}

.badge {
  font-size: 0.8rem;
  padding: 0.5em 0.7em;
}

.modal-content {
  border-radius: 15px;
  border: none;
}

.modal-body {
  padding: 2rem;
}

.bi-check-circle {
  color: #28a745;
}

.bi-exclamation-circle {
  color: #dc3545;
}

@media (max-width: 991.98px) {
  .hero-section {
    padding: 4rem 0;
    border-radius: 0 0 25% 25% / 10px;
  }

  .search-container {
    max-width: 100%;
  }
}

@media (max-width: 767.98px) {
  .hero-section h1 {
    font-size: 2.5rem;
  }

  .hero-section p {
    font-size: 1rem;
  }

  .card-img-top {
    height: 200px;
  }
}
</style>