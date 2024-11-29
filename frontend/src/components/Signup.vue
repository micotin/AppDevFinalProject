<template>
  <div class="signup-page d-flex justify-content-center align-items-center">
    <div class="signup-card">
      <div class="card-body p-4">
        <h2 class="text-white mb-2">Sign Up</h2>
        <p class="text-light-purple mb-4">Join Sam1 Flower Shop</p>
        
        <form @submit.prevent="handleSignUp">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="firstName" class="form-label text-light-purple">First Name</label>
              <input 
                type="text" 
                class="form-control custom-input" 
                id="firstName" 
                v-model="firstName" 
                placeholder="Enter your first name"
                required
              >
            </div>
            <div class="col-md-6 mb-3">
              <label for="lastName" class="form-label text-light-purple">Last Name</label>
              <input 
                type="text" 
                class="form-control custom-input" 
                id="lastName" 
                v-model="lastName" 
                placeholder="Enter your last name"
                required
              >
            </div>
          </div>
          
          <div class="mb-3">
            <label for="email" class="form-label text-light-purple">Email</label>
            <input 
              type="email" 
              class="form-control custom-input" 
              id="email" 
              v-model="email" 
              placeholder="Enter your email"
              required
            >
          </div>
          
          <div class="mb-3">
            <label for="password" class="form-label text-light-purple">Password</label>
            <input 
              type="password" 
              class="form-control custom-input" 
              id="password" 
              v-model="password" 
              placeholder="Enter your password"
              required
            >
          </div>
          
          <div class="mb-4">
            <label for="confirmPassword" class="form-label text-light-purple">Confirm Password</label>
            <input 
              type="password" 
              class="form-control custom-input" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              placeholder="Confirm your password"
              required
            >
          </div>
          
          <button type="submit" class="btn custom-button w-100 mb-3">Sign Up</button>
        </form>
        
        <div class="text-center">
          <p class="text-light-purple mb-0">
            Already have an account? 
            <router-link to="/login" class="login-link">Login</router-link>
          </p>
        </div>
        
        <div v-if="message" :class="['alert', 'mt-3', isError ? 'alert-danger' : 'alert-success']" role="alert">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useRouter } from 'vue-router';

export default {
  setup() {
    const auth = getAuth();
    const db = getFirestore();
    const router = useRouter();

    const firstName = ref('');
    const lastName = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const message = ref('');
    const isError = ref(false);

    const handleSignUp = async () => {
      if (password.value !== confirmPassword.value) {
        message.value = "Passwords do not match.";
        isError.value = true;
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const user = userCredential.user;

        // Send verification email
        await sendEmailVerification(user);

        // Save user details to Firestore with verified status set to false
        await setDoc(doc(db, "users", user.uid), {
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          verified: false,
          role: 'user'
        });

        // Navigate to the verification page
        router.push({ name: 'Verification', params: { email: email.value } });

        message.value = "A verification email has been sent. Please check your inbox.";
        isError.value = false;
      } catch (error) {
        console.error("Error signing up:", error);
        message.value = "Error signing up: " + error.message;
        isError.value = true;
      }
    };

    return {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      message,
      isError,
      handleSignUp
    };
  }
};
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2d1b69 0%, #a12c82 100%);
}

.signup-card {
  width: 100%;
  max-width: 500px;
  background: rgba(28, 28, 45, 0.9);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.text-light-purple {
  color: #b4b4bb;
}

.custom-input {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  padding: 12px 16px;
}

.custom-input:focus {
  background: rgba(40, 40, 55, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.custom-input::placeholder {
  color: #6c6c7d;
}

.custom-button {
  background: linear-gradient(135deg, #e5484d 0%, #a12c82 100%);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 12px;
  font-weight: 500;
  transition: opacity 0.2s;
}

.custom-button:hover {
  opacity: 0.9;
  color: white;
}

.login-link {
  color: #e5484d;
  text-decoration: none;
  transition: color 0.2s;
}

.login-link:hover {
  color: white;
}

.alert {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.alert-danger {
  background: rgba(229, 72, 77, 0.1);
  border-color: rgba(229, 72, 77, 0.2);
}

.alert-success {
  background: rgba(46, 160, 67, 0.1);
  border-color: rgba(46, 160, 67, 0.2);
}

h2 {
  font-size: 1.75rem;
  font-weight: 600;
}

p {
  font-size: 0.95rem;
  line-height: 1.6;
}
</style>