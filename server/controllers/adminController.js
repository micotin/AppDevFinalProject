// server/controllers/adminController.js
const db = require('../config/firestore');

// Add new product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl } = req.body;
    const productRef = db.collection('products').doc();
    await productRef.set({ name, description, price, imageUrl });
    res.status(200).send('Product added successfully!');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Edit product
exports.editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, imageUrl } = req.body;
    const productRef = db.collection('products').doc(productId);
    await productRef.update({ name, description, price, imageUrl });
    res.status(200).send('Product updated successfully!');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productRef = db.collection('products').doc(productId);
    await productRef.delete();
    res.status(200).send('Product deleted successfully!');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const productsSnapshot = await db.collection('products').get();
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
