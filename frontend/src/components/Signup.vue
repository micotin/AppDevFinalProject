<template>
    <div class="signup-page d-flex justify-content-center align-items-center">
      <div class="card signup-card">
        <div class="card-body">
          <h2 class="card-title text-center mb-4">Join Sam1 Flower Shop</h2>
          <form @submit.prevent="handleSignUp">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="firstName" class="form-label">First Name</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-person"></i></span>
                  <input type="text" class="form-control" id="firstName" v-model="firstName" required>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label for="lastName" class="form-label">Last Name</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-person"></i></span>
                  <input type="text" class="form-control" id="lastName" v-model="lastName" required>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email address</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input type="email" class="form-control" id="email" v-model="email" required>
              </div>
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-lock"></i></span>
                <input type="password" class="form-control" id="password" v-model="password" required>
              </div>
            </div>
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
                <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword" required>
              </div>
            </div>
            <button type="submit" class="btn btn-primary w-100 mt-3">Sign Up</button>
          </form>
          <div class="text-center mt-3">
            <p>Already have an account? <router-link to="/login">Login here</router-link></p>
          </div>
          <div v-if="message" class="alert" :class="{'alert-danger': isError, 'alert-success': !isError}" role="alert">
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
    background-color: #ecfcf4;
    background-image: 
      radial-gradient(#c7c59e 15%, transparent 16%),
      radial-gradient(#c7c59e 15%, transparent 16%);
    background-size: 60px 60px;
    background-position: 0 0, 30px 30px;
  }
  
  .signup-card {
    max-width: 500px;
    background-color: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
  
  .card-title {
    color: #053735;
    font-family: 'Georgia', serif;
  }
  
  .form-label {
    color: #57693a;
  }
  
  .input-group-text {
    background-color: #c7c59e;
    border: 1px solid #c7c59e;
    color: #053735;
  }
  
  .form-control:focus {
    border-color: #bc697e;
    box-shadow: 0 0 0 0.2rem rgba(188, 105, 126, 0.25);
  }
  
  .btn-primary {
    background-color: #d27d36;
    border-color: #d27d36;
  }
  
  .btn-primary:hover, .btn-primary:focus {
    background-color: #bc697e;
    border-color: #bc697e;
  }
  
  a {
    color: #053735;
    text-decoration: none;
  }
  
  a:hover {
    color: #bc697e;
    text-decoration: underline;
  }
  </style>