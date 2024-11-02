<template>
    <footer class="footer bg-light text-center text-lg-start">
      <div class="container p-4">
        <div class="row">
          <div class="col-lg-6 col-md-12 mb-4 mb-md-0">
            <h5 class="text-uppercase">Sam1 Flower Shop</h5>
            <p>
              Your one-stop shop for fresh flowers and unique gifts. We bring nature to your door!
            </p>
          </div>
          <div class="col-lg-6 col-md-12 mb-4 mb-md-0">
            <h5 class="text-uppercase">Contact Us</h5>
            <p>Email: info@sam1flowershop.com</p>
            <p>Phone: +63 123 456 7890</p>
          </div>
        </div>
      </div>
      <div class="text-center p-3 bg-light">
        <a href="https://facebook.com" target="_blank" class="me-4 text-dark">
          <i class="fab fa-facebook-f"></i>
        </a>
        <a href="https://instagram.com" target="_blank" class="me-4 text-dark">
          <i class="fab fa-instagram"></i>
        </a>
        <a href="https://twitter.com" target="_blank" class="me-4 text-dark">
          <i class="fab fa-twitter"></i>
        </a>
      </div>
      <div class="text-center p-3 bg-light">
        <p>&copy; 2024 Sam1 Flower Shop. All rights reserved.</p>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: 'Footer',
  };
  </script>
  
  <style scoped>
  .footer {
    margin-top: 20px;
    padding: 20px 0;
  }
  
  .footer .text-uppercase {
    font-weight: bold;
  }
  
  .footer a {
    color: #28a745; /* Green color for links */
  }
  </style>
  