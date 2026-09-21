const express = require('express');
const router = express.Router();
const { getPool } = require('../db');


// GET /api/products (with optional ?search= parameter)
router.get('/products', async (req, res) => {
  try {
    const pool = getPool();
    const search = req.query.search ? req.query.search.trim() : '';

    let query = 'SELECT * FROM products';
    const params = [];

    if (search) {
      query += ' WHERE product_id LIKE ? OR product_name LIKE ? OR category LIKE ?';
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
});

// GET /api/products/:id
router.get('/products/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    const [rows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Product with ID '${id}' not found` });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product', error: error.message });
  }
});

// POST /api/products
router.post('/products', async (req, res) => {
  try {
    const pool = getPool();
    let { product_id, product_name, category, price } = req.body;

    // Validation
    if (!product_name || !product_name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required.' });
    }

    // If product_id not supplied, auto-generate a unique readable ID
    if (!product_id || !product_id.trim()) {
      product_id = `PRD-${Date.now().toString().slice(-4)}`;
    } else {
      product_id = product_id.trim();
    }

    product_name = product_name.trim();
    category = category ? category.trim() : 'General';
    const parsedPrice = price !== undefined && price !== '' ? parseFloat(price) : 0.00;

    // Check if ID already exists
    const [existing] = await pool.query('SELECT product_id FROM products WHERE product_id = ?', [product_id]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: `Product ID '${product_id}' already exists. Please choose a unique ID.` });
    }

    const insertQuery = `
      INSERT INTO products (product_id, product_name, category, price)
      VALUES (?, ?, ?, ?)
    `;
    await pool.query(insertQuery, [product_id, product_name, category, isNaN(parsedPrice) ? 0.00 : parsedPrice]);

    const [created] = await pool.query('SELECT * FROM products WHERE product_id = ?', [product_id]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: created[0]
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  }
});

// PUT /api/products/:id
router.put('/products/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    let { product_name, category, price } = req.body;

    if (!product_name || !product_name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required.' });
    }

    product_name = product_name.trim();
    category = category ? category.trim() : 'General';
    const parsedPrice = price !== undefined && price !== '' ? parseFloat(price) : 0.00;

    const [result] = await pool.query(
      'UPDATE products SET product_name = ?, category = ?, price = ? WHERE product_id = ?',
      [product_name, category, isNaN(parsedPrice) ? 0.00 : parsedPrice, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: `Product with ID '${id}' not found` });
    }

    const [updated] = await pool.query('SELECT * FROM products WHERE product_id = ?', [id]);
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
  }
});

// DELETE /api/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM products WHERE product_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: `Product with ID '${id}' not found` });
    }

    res.json({
      success: true,
      message: `Product '${id}' deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
  }
});


module.exports = router;
