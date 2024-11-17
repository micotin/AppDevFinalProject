<template>
    <div class="admin-customize-attachment">
      <h2 class="text-2xl font-bold mb-4">Manage Flower Types</h2>
      
      <!-- Add New Flower Type Form -->
      <form @submit.prevent="addFlowerType" class="mb-6 p-4 bg-gray-100 rounded-lg">
        <div class="mb-4">
          <label for="newFlowerName" class="block text-sm font-medium text-gray-700">Flower Name</label>
          <input v-model="newFlower.name" type="text" id="newFlowerName" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
        </div>
        <div class="mb-4">
          <label for="newFlowerImage" class="block text-sm font-medium text-gray-700">Image URL</label>
          <input v-model="newFlower.image" type="url" id="newFlowerImage" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
        </div>
        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          Add Flower Type
        </button>
      </form>
  
      <!-- Flower Types List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="flower in flowerTypes" :key="flower.id" class="border rounded-lg p-4 flex flex-col">
          <img :src="flower.image" :alt="flower.name" class="w-full h-40 object-cover mb-2 rounded">
          <h3 class="text-lg font-semibold mb-2">{{ flower.name }}</h3>
          <div class="mt-auto flex justify-between">
            <button @click="editFlower(flower)" class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50">
              Edit
            </button>
            <button @click="removeFlower(flower.id)" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
              Remove
            </button>
          </div>
        </div>
      </div>
  
      <!-- Edit Flower Modal -->
      <div v-if="editingFlower" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
        <div class="bg-white p-5 rounded-lg shadow-xl w-full max-w-md">
          <h3 class="text-xl font-bold mb-4">Edit Flower Type</h3>
          <form @submit.prevent="updateFlower">
            <div class="mb-4">
              <label for="editFlowerName" class="block text-sm font-medium text-gray-700">Flower Name</label>
              <input v-model="editingFlower.name" type="text" id="editFlowerName" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            </div>
            <div class="mb-4">
              <label for="editFlowerImage" class="block text-sm font-medium text-gray-700">Image URL</label>
              <input v-model="editingFlower.image" type="url" id="editFlowerImage" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            </div>
            <div class="flex justify-end space-x-2">
              <button type="button" @click="cancelEdit" class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  import { useFirestore } from 'vuefire'
  import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
  
  export default {
    name: 'AdminCustomizeAttachment',
    setup() {
      const db = useFirestore()
      const flowerTypes = ref([])
      const newFlower = ref({ name: '', image: '' })
      const editingFlower = ref(null)
  
      const addFlowerType = async () => {
        try {
          await addDoc(collection(db, 'flowerTypes'), newFlower.value)
          newFlower.value = { name: '', image: '' }
        } catch (error) {
          console.error('Error adding flower type:', error)
        }
      }
  
      const removeFlower = async (id) => {
        try {
          await deleteDoc(doc(db, 'flowerTypes', id))
        } catch (error) {
          console.error('Error removing flower type:', error)
        }
      }
  
      const editFlower = (flower) => {
        editingFlower.value = { ...flower }
      }
  
      const updateFlower = async () => {
        try {
          const { id, ...updateData } = editingFlower.value
          await updateDoc(doc(db, 'flowerTypes', id), updateData)
          editingFlower.value = null
        } catch (error) {
          console.error('Error updating flower type:', error)
        }
      }
  
      const cancelEdit = () => {
        editingFlower.value = null
      }
  
      return {
        flowerTypes,
        newFlower,
        editingFlower,
        addFlowerType,
        removeFlower,
        editFlower,
        updateFlower,
        cancelEdit
      }
    }
  }
  </script>
  
  <style scoped>
  .admin-customize-attachment {
    padding: 20px;
  }
  </style>