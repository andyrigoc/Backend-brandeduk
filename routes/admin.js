const express = require('express');
const router = express.Router();
const { pool, queryWithTimeout } = require('../config/database');

/* =============================================
   PRODUCT TYPES CRUD
============================================= */

// GET /api/admin/product-types — list all with product counts
router.get('/product-types', async (req, res) => {
  try {
    const result = await queryWithTimeout(`
      SELECT pt.id, pt.name, pt.slug, pt.display_order, pt.description,
             COUNT(p.id)::int AS product_count
      FROM product_types pt
      LEFT JOIN products p ON p.product_type_id = pt.id
      GROUP BY pt.id
      ORDER BY pt.name ASC
    `, [], 15000);

    res.json({ productTypes: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('[ADMIN] Error fetching product types:', err.message);
    res.status(500).json({ error: 'Failed to fetch product types' });
  }
});

// POST /api/admin/product-types — create a new product type
router.post('/product-types', async (req, res) => {
  try {
    const { name, slug, display_order, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const finalSlug = (slug || name).trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Check duplicate slug
    const existing = await queryWithTimeout(
      'SELECT id FROM product_types WHERE slug = $1', [finalSlug], 5000
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: `Product type with slug "${finalSlug}" already exists` });
    }

    const result = await queryWithTimeout(`
      INSERT INTO product_types (name, slug, display_order, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, slug, display_order, description
    `, [name.trim(), finalSlug, display_order || 0, description || null], 5000);

    console.log(`[ADMIN] Created product type: ${name} (${finalSlug})`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[ADMIN] Error creating product type:', err.message);
    res.status(500).json({ error: 'Failed to create product type' });
  }
});

// POST /api/admin/product-types/bulk — create multiple product types at once
router.post('/product-types/bulk', async (req, res) => {
  try {
    const { types } = req.body;

    if (!Array.isArray(types) || types.length === 0) {
      return res.status(400).json({ error: 'types array is required' });
    }

    const created = [];
    const skipped = [];

    for (const t of types) {
      const name = (t.name || '').trim();
      if (!name) { skipped.push({ name: t.name, reason: 'empty name' }); continue; }

      const slug = (t.slug || name).toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      const existing = await queryWithTimeout(
        'SELECT id FROM product_types WHERE slug = $1', [slug], 5000
      );

      if (existing.rows.length > 0) {
        skipped.push({ name, slug, reason: 'already exists' });
        continue;
      }

      const result = await queryWithTimeout(`
        INSERT INTO product_types (name, slug, display_order, description)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, slug, display_order
      `, [name, slug, t.display_order || 0, t.description || null], 5000);

      created.push(result.rows[0]);
    }

    console.log(`[ADMIN] Bulk create: ${created.length} created, ${skipped.length} skipped`);
    res.status(201).json({ created, skipped, total: created.length });
  } catch (err) {
    console.error('[ADMIN] Error bulk creating product types:', err.message);
    res.status(500).json({ error: 'Failed to bulk create product types' });
  }
});

// PUT /api/admin/product-types/:id — update a product type
router.put('/product-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, display_order, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const finalSlug = slug ? slug.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') : undefined;

    // Check slug conflict (only if slug is being changed)
    if (finalSlug) {
      const conflict = await queryWithTimeout(
        'SELECT id FROM product_types WHERE slug = $1 AND id != $2', [finalSlug, id], 5000
      );
      if (conflict.rows.length > 0) {
        return res.status(409).json({ error: `Slug "${finalSlug}" is already in use` });
      }
    }

    const fields = ['name = $1', 'updated_at = NOW()'];
    const values = [name.trim()];
    let idx = 2;

    if (finalSlug) { fields.push(`slug = $${idx}`); values.push(finalSlug); idx++; }
    if (display_order !== undefined) { fields.push(`display_order = $${idx}`); values.push(display_order); idx++; }
    if (description !== undefined) { fields.push(`description = $${idx}`); values.push(description); idx++; }

    values.push(id);

    const result = await queryWithTimeout(`
      UPDATE product_types SET ${fields.join(', ')} WHERE id = $${idx}
      RETURNING id, name, slug, display_order, description
    `, values, 5000);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product type not found' });
    }

    console.log(`[ADMIN] Updated product type #${id}: ${name}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[ADMIN] Error updating product type:', err.message);
    res.status(500).json({ error: 'Failed to update product type' });
  }
});

// DELETE /api/admin/product-types/:id — delete (only if no products linked)
router.delete('/product-types/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check for linked products
    const check = await queryWithTimeout(
      'SELECT COUNT(*)::int AS cnt FROM products WHERE product_type_id = $1', [id], 5000
    );
    if (check.rows[0].cnt > 0) {
      return res.status(409).json({
        error: `Cannot delete: ${check.rows[0].cnt} products are linked to this type`
      });
    }

    const result = await queryWithTimeout(
      'DELETE FROM product_types WHERE id = $1 RETURNING id, name', [id], 5000
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product type not found' });
    }

    console.log(`[ADMIN] Deleted product type #${id}: ${result.rows[0].name}`);
    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    console.error('[ADMIN] Error deleting product type:', err.message);
    res.status(500).json({ error: 'Failed to delete product type' });
  }
});

module.exports = router;
