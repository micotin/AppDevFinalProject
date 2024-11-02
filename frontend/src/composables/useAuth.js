// src/composables/useAuth.js
import { ref } from 'vue';
import { getAuth } from 'firebase/auth';

const auth = getAuth();

export function useAuth() {
  const isAuthenticated = ref(false);

  // Check authentication state
  auth.onAuthStateChanged((user) => {
    isAuthenticated.value = !!user; // Set to true if user is logged in
  });

  return { isAuthenticated };
}
