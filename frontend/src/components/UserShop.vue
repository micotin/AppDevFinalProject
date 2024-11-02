<template>
  <div class="user-shop">
    <div class="hero-section mb-5">
      <div class="container">
        <h1 class="text-center">Our Products</h1>
        <p class="text-center">Discover our beautiful floral arrangements for every occasion</p>
        <div class="search-container">
          <input 
            v-model="searchQuery" 
            type="text" 
            class="form-control search-input" 
            placeholder="Search products..."
          >
          <i class="bi bi-search search-icon"></i>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <!-- Filters Sidebar -->
        <div class="col-lg-3 mb-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-3">Filters</h5>
              
              <!-- Category Filter -->
              <div class="mb-3">
                <h6>Categories</h6>
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
              <div class="mb-3">
                <h6>Price Range</h6>
                <div class="price-range-inputs">
                  <input v-model.number="minPrice" type="number" class="form-control form-control-sm" placeholder="Min">
                  <span class="price-range-separator">-</span>
                  <input v-model.number="maxPrice" type="number" class="form-control form-control-sm" placeholder="Max">
                </div>
              </div>

              <!-- Sort By -->
              <div class="mb-3">
                <h6>Sort By</h6>
                <select v-model="sortBy" class="form-select">
                  <option value="name">Name</option>
                  <option value="priceLowToHigh">Price: Low to High</option>
                  <option value="priceHighToLow">Price: High to Low</option>
                </select>
              </div>

              <button @click="resetFilters" class="btn btn-outline-secondary w-100">Reset Filters</button>
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
            <p class="mb-4">Showing {{ filteredAndSortedProducts.length }} products</p>
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              <div v-for="product in filteredAndSortedProducts" :key="product.id" class="col">
                <div class="card h-100 shadow-sm product-card">
                  <img :src="product.imageUrl" class="card-img-top" :alt="product.name">
                  <button 
                    @click="toggleFavorite(product)" 
                    class="btn btn-favorite"
                    :class="{ 'is-favorite': isFavorite(product.id) }"
                  >
                    <i class="bi" :class="isFavorite(product.id) ? 'bi-heart-fill' : 'bi-heart'"></i>
                  </button>
                  <div class="card-body d-flex flex-column">
                    <h5 class="card-title">{{ product.name }}</h5>
                    <p class="card-text flex-grow-1">{{ product.description }}</p>
                    <div class="mt-auto">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="price">₱{{ product.price.toFixed(2) }}</span>
                        <span class="badge bg-secondary">{{ product.category }}</span>
                      </div>
                      <button @click="addToCart(product)" class="btn btn-primary w-100">
                        <i class="bi bi-cart-plus me-2"></i>Add to Cart
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
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { getAuth } from 'firebase/auth'

export default {
  name: 'UserShop',
  setup() {
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

    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'))
        products.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
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
      const auth = getAuth()
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
        result = result.filter(product => 
          product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.value.toLowerCase())
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

    const addToCart = (product) => {
      // TODO: Implement add to cart functionality
      console.log(`Added ${product.name} to cart`)
      alert(`${product.name} added to cart!`)
    }

    const resetFilters = () => {
      searchQuery.value = ''
      selectedCategories.value = []
      minPrice.value = null
      maxPrice.value = null
      sortBy.value = 'name'
    }

    const toggleFavorite = async (product) => {
      const auth = getAuth()
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

    onMounted(() => {
      fetchProducts()
      fetchFavorites()
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
      isFavorite
    }
  }
}
</script>

<style scoped>
.user-shop {
  padding-top: 2rem;
}

.hero-section {
  background: linear-gradient(135deg, #6a3093 0%, #a044ff 100%);
  color: white;
  padding: 4rem 0;
  margin-bottom: 3rem;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-section p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.search-container {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-input {
  padding-right: 40px;
  border-radius: 25px;
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6a3093;
}

.card {
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.product-card {
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}

.price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #6a3093;
}

.btn-primary {
  background-color: #6a3093;
  border-color: #6a3093;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #a044ff;
  border-color: #a044ff;
  transform: translateY(-2px);
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
}

.btn-favorite:hover {
  background-color: #f8f9fa;
}

.btn-favorite.is-favorite {
  color: #dc3545;
}

@media (max-width: 991.98px) {
  .hero-section {
    padding: 3rem 0;
  }

  .hero-section h1 {
    font-size: 2.5rem;
  }

  .hero-section p {
    font-size: 1rem;
  }
}
</style>