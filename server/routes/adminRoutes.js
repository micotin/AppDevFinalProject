// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { addProduct, editProduct, deleteProduct, getProducts } = require('../controllers/adminController');

// Product management routes
router.post('/add-product', addProduct);
router.put('/edit-product/:id', editProduct);
router.delete('/delete-product/:id', deleteProduct);
router.get('/products', getProducts);

module.exports = router;
