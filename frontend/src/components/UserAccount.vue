<template>
  <div class="user-account">
    <h2 class="mb-4">Your Account</h2>
    <div class="row g-4">
      <div class="col-lg-4">
        <div class="card profile-card h-100">
          <div class="card-body text-center d-flex flex-column">
            <div class="profile-image-container mb-3">
              <img :src="userProfileImage" alt="Profile Picture" class="profile-picture img-fluid rounded-circle mb-3" />
              <button class="btn btn-sm btn-light change-photo-btn" @click="changePhoto">
                <i class="bi bi-camera"></i>
              </button>
            </div>
            <h3 class="card-title mb-1">{{ userName }}</h3>
            <p class="card-text text-muted mb-3">{{ userEmail }}</p>
            <div class="mt-auto">
              <p class="mb-1"><strong>Member Since:</strong> {{ memberSince }}</p>
              <p class="mb-0"><strong>Last Login:</strong> {{ lastLogin }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <div class="card h-100">
          <div class="card-body">
            <h4 class="card-title mb-4">Account Information</h4>
            <form @submit.prevent="updateAccount">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="firstName" class="form-label">First Name</label>
                  <input type="text" class="form-control" id="firstName" v-model="updatedFirstName" required>
                </div>
                <div class="col-md-6">
                  <label for="lastName" class="form-label">Last Name</label>
                  <input type="text" class="form-control" id="lastName" v-model="updatedLastName" required>
                </div>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" v-model="updatedEmail" readonly>
              </div>
              <div class="mb-3">
                <label for="phone" class="form-label">Phone</label>
                <input type="tel" class="form-control" id="phone" v-model="updatedPhone" placeholder="+63 XXX XXX XXXX" @input="formatPhoneNumber">
              </div>
              <div class="mb-3">
                <label for="address" class="form-label">Address</label>
                <textarea class="form-control" id="address" v-model="updatedAddress" rows="3"></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Update Account</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="successModalLabel">Success</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Your account has been updated successfully!
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getAuth } from 'firebase/auth';
import { db, storage } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Modal } from 'bootstrap';

export default {
  name: 'UserAccount',
  setup() {
    const userName = ref('');
    const userEmail = ref('');
    const userProfileImage = ref('https://via.placeholder.com/150');
    const updatedFirstName = ref('');
    const updatedLastName = ref('');
    const updatedEmail = ref('');
    const updatedPhone = ref('');
    const updatedAddress = ref('');
    const memberSince = ref('');
    const lastLogin = ref('');
    let successModal = null;

    const fetchUserInfo = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          userName.value = `${userData.firstName} ${userData.lastName}`;
          userEmail.value = userData.email;
          updatedFirstName.value = userData.firstName;
          updatedLastName.value = userData.lastName;
          updatedEmail.value = userData.email;
          updatedPhone.value = formatPhoneNumber(userData.phone || '');
          updatedAddress.value = userData.address || '';
          userProfileImage.value = userData.profileImage || 'https://via.placeholder.com/150';
          memberSince.value = new Date(user.metadata.creationTime).toLocaleDateString();
          lastLogin.value = new Date(user.metadata.lastSignInTime).toLocaleString();
        }
      }
    };

    const updateAccount = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);

        await updateDoc(userRef, {
          firstName: updatedFirstName.value,
          lastName: updatedLastName.value,
          phone: updatedPhone.value,
          address: updatedAddress.value,
        });

        successModal.show();
        await fetchUserInfo(); // Refresh user info
      }
    };

    const changePhoto = async () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const auth = getAuth();
          const user = auth.currentUser;
          if (user) {
            const imageRef = storageRef(storage, `profileImages/${user.uid}`);
            await uploadBytes(imageRef, file);
            const downloadURL = await getDownloadURL(imageRef);
            
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { profileImage: downloadURL });
            
            userProfileImage.value = downloadURL;
          }
        }
      };
      input.click();
    };

    const formatPhoneNumber = (phoneNumber) => {
      // Remove all non-digit characters
      const cleaned = phoneNumber.replace(/\D/g, '');
      
      // Check if the number starts with +63, if not, add it
      const withCountryCode = cleaned.startsWith('63') ? cleaned : `63${cleaned}`;
      
      // Format the number
      const match = withCountryCode.match(/^(\d{2})(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
      }
      
      // If the number doesn't match the expected format, return the original input
      return phoneNumber;
    };

    onMounted(() => {
      fetchUserInfo();
      successModal = new Modal(document.getElementById('successModal'));
    });

    return {
      userName,
      userEmail,
      userProfileImage,
      updatedFirstName,
      updatedLastName,
      updatedEmail,
      updatedPhone,
      updatedAddress,
      memberSince,
      lastLogin,
      updateAccount,
      changePhoto,
      formatPhoneNumber,
    };
  },
};
</script>

<style scoped>
.user-account {
  background-color: transparent;
}

.profile-card {
  background: linear-gradient(135deg, #6a3093, #a044ff);
  color: white;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.profile-image-container {
  position: relative;
  display: inline-block;
}

.profile-picture {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.profile-picture:hover {
  border-color: rgba(255, 255, 255, 0.5);
}

.change-photo-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.change-photo-btn:hover {
  background-color: white;
  transform: scale(1.1);
}

.card {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
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

.form-control:focus {
  border-color: #a044ff;
  box-shadow: 0 0 0 0.2rem rgba(160, 68, 255, 0.25);
}

h2, h4 {
  color: #6a3093;
}

@media (max-width: 991.98px) {
  .profile-card {
    margin-bottom: 1.5rem;
  }
}
</style>