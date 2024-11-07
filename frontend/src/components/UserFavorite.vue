<template>
    <div class="user-favorite">
      <h2 class="text-2xl font-bold mb-4">Your Favorites</h2>
      <div v-if="favoriteItems.length === 0" class="text-center py-8">
        <p class="text-gray-500">You haven't added any favorites yet</p>
        <router-link to="/user/shop" class="mt-4 inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors">
          Explore Products
        </router-link>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="item in favoriteItems" :key="item.id" class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <img :src="item.imageUrl" :alt="item.name" class="w-full h-48 object-cover">
          <div class="p-4">
            <h3 class="font-semibold text-lg mb-2">{{ item.name }}</h3>
            <p class="text-gray-600 mb-4">₱{{ item.price.toFixed(2) }}</p>
            <div class="flex justify-between items-center">
              <button @click="addToCart(item)" class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors">
                Add to Cart
              </button>
              <button @click="removeFromFavorites(item)" class="text-red-500 hover:text-red-700">
                <i class="bi bi-heart-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useFavoriteStore } from '../stores/favoriteStore'
  import { useCartStore } from '../stores/cartStore'
  
  const favoriteStore = useFavoriteStore()
  const cartStore = useCartStore()
  
  const favoriteItems = computed(() => favoriteStore.items)
  
  const removeFromFavorites = (item) => {
    favoriteStore.removeFavorite(item.id)
  }
  
  const addToCart = (item) => {
    cartStore.addToCart(item)
  }
  </script>
  
  <style scoped>
  .user-favorite {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .bg-primary {
    background-color: #6a3093;
  }
  
  .bg-primary-dark {
    background-color: #5a2a7d;
  }
  
  .text-primary {
    color: #6a3093;
  }
  </style>