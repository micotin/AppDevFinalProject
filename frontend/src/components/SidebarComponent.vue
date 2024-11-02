<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <nav id="sidebar" class="col-md-3 col-lg-2 d-md-block sidebar collapse">
        <div class="position-sticky pt-3">
          <div class="text-center mb-4">
            <div class="logo-placeholder">
              <i class="bi bi-flower1"></i>
            </div>
            <h5 class="mt-2 text-white">Blossom Admin</h5>
          </div>
          <ul class="nav flex-column">
            <li class="nav-item">
              <router-link class="nav-link active" to="/admin">
                <i class="bi bi-house-door me-2"></i>
                Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/products">
                <i class="bi bi-flower1 me-2"></i>
                Products
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/orders">
                <i class="bi bi-cart me-2"></i>
                Orders
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/customers">
                <i class="bi bi-people me-2"></i>
                Customers
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/reports">
                <i class="bi bi-bar-chart me-2"></i>
                Reports
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Main content -->
      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
        <router-view></router-view> <!-- This is where the routed components will be displayed -->
      </main>
    </div>
  </div>
</template>
