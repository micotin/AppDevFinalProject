<template>
    <div class="admin-management">
      <header class="mb-4">
        <h2>Admin Management</h2>
        <p>Manage admin accounts for Sam1 Flower Shop.</p>
      </header>
  
      <!-- Add Admin Form -->
      <div class="add-admin-form card p-4 mb-4">
        <h4>Add New Admin</h4>
        <form @submit.prevent="addAdmin">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" class="form-control" id="username" v-model="newAdmin.username" required>
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" v-model="newAdmin.email" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="newAdmin.password" required>
          </div>
          <button type="submit" class="btn btn-primary">Add Admin</button>
        </form>
      </div>
  
      <!-- Admin List Table -->
      <div class="admin-list card p-4">
        <h4>Admin List</h4>
        <table class="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="admin in admins" :key="admin.id">
              <td>{{ admin.username }}</td>
              <td>{{ admin.email }}</td>
              <td>
                <button @click="removeAdmin(admin.id)" class="btn btn-danger btn-sm">
                  <i class="bi bi-trash"></i> Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { db } from "@/firebaseConfig"; // Make sure you have Firebase setup and db exported
  import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
  
  export default {
    name: "AdminManagement",
    setup() {
      const admins = ref([]);
      const newAdmin = ref({ username: "", email: "", password: "" });
  
      const fetchAdmins = async () => {
        const querySnapshot = await getDocs(collection(db, "admins"));
        admins.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      };
  
      const addAdmin = async () => {
        if (newAdmin.value.username && newAdmin.value.email && newAdmin.value.password) {
          await addDoc(collection(db, "admins"), {
            username: newAdmin.value.username,
            email: newAdmin.value.email,
            password: newAdmin.value.password,
          });
          fetchAdmins();
          newAdmin.value = { username: "", email: "", password: "" };
        }
      };
  
      const removeAdmin = async (id) => {
        await deleteDoc(doc(db, "admins", id));
        fetchAdmins();
      };
  
      onMounted(() => {
        fetchAdmins();
      });
  
      return {
        admins,
        newAdmin,
        addAdmin,
        removeAdmin,
      };
    },
  };
  </script>
  
  <style scoped>
  .admin-management {
    padding: 20px;
    background-color: #f8f9fa;
  }
  
  .add-admin-form,
  .admin-list {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  header h2 {
    font-weight: bold;
    color: #6a3093;
  }
  
  .table {
    background-color: #fff;
  }
  </style>
  