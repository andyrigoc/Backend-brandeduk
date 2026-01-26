const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

/**
 * GET /api/product-order
 * Get ordered products for "recommended" display (first 15 = recommended)
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const result = await query(`
      SELECT 
        po.style_code,
        po.display_order,
        s.style_name,
        b.name as brand_name,
        pt.name as product_type,
        MIN(p.primary_image_url) as image
      FROM product_display_order po
      LEFT JOIN styles s ON s.style_code = po.style_code
      LEFT JOIN brands b ON b.id = s.brand_id
      LEFT JOIN product_types pt ON pt.id = s.product_type_id
      LEFT JOIN products p ON p.style_code = po.style_code
      WHERE po.active = true
      ORDER BY po.display_order ASC
      LIMIT $1
    `, [parseInt(limit)]);
    
    res.json({
      success: true,
      data: result.rows.map((row, idx) => ({
        code: row.style_code,
        name: row.style_name,
        brand: row.brand_name,
        productType: row.product_type,
        image: row.image,
        displayOrder: row.display_order,
        isRecommended: idx < 15
      })),
      count: result.rows.length,
      recommendedCount: Math.min(result.rows.length, 15)
    });
  } catch (error) {
    // Table might not exist yet - return empty
    if (error.code === '42P01') {
      console.log('[PRODUCT-ORDER] Table does not exist, creating...');
      await createProductOrderTable();
      return res.json({ success: true, data: [], count: 0, recommendedCount: 0 });
    }
    
    console.error('[PRODUCT-ORDER] Error fetching order:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product order',
      message: error.message
    });
  }
});

/**
 * GET /api/product-order/recommended
 * Get top 15 recommended products for frontend
 */
router.get('/recommended', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        po.style_code as code,
        s.style_name as name,
        b.name as brand,
        pt.name as "productType",
        MIN(p.primary_image_url) as image,
        MIN(p.single_price) as price,
        po.display_order
      FROM product_display_order po
      LEFT JOIN styles s ON s.style_code = po.style_code
      LEFT JOIN brands b ON b.id = s.brand_id
      LEFT JOIN product_types pt ON pt.id = s.product_type_id
      LEFT JOIN products p ON p.style_code = po.style_code
      WHERE po.active = true
      GROUP BY po.style_code, s.style_name, b.name, pt.name, po.display_order
      ORDER BY po.display_order ASC
      LIMIT 15
    `);
    
    res.json({
      success: true,
      items: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    if (error.code === '42P01') {
      return res.json({ success: true, items: [], count: 0 });
    }
    console.error('[PRODUCT-ORDER] Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/product-order/move
 * Move a single product up or down
 */
router.put('/move', async (req, res) => {
  try {
    const { styleCode, direction } = req.body;
    
    if (!styleCode || !['up', 'down'].includes(direction)) {
      return res.status(400).json({
        success: false,
        error: 'styleCode and direction (up/down) are required'
      });
    }

    await query('BEGIN');

    try {
      // Get current position
      const currentResult = await query(
        'SELECT display_order FROM product_display_order WHERE style_code = $1',
        [styleCode]
      );

      if (currentResult.rows.length === 0) {
        // Product not in order table, add it
        const maxResult = await query('SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM product_display_order');
        await query(
          'INSERT INTO product_display_order (style_code, display_order, active) VALUES ($1, $2, true)',
          [styleCode, maxResult.rows[0].next_order]
        );
        await query('COMMIT');
        return res.json({ success: true, message: 'Product added to order list' });
      }

      const currentOrder = currentResult.rows[0].display_order;
      let swapOrder;

      if (direction === 'up') {
        // Find product with next lower order
        const swapResult = await query(
          'SELECT style_code, display_order FROM product_display_order WHERE display_order < $1 ORDER BY display_order DESC LIMIT 1',
          [currentOrder]
        );
        if (swapResult.rows.length === 0) {
          await query('ROLLBACK');
          return res.json({ success: true, message: 'Already at top' });
        }
        swapOrder = swapResult.rows[0];
      } else {
        // Find product with next higher order
        const swapResult = await query(
          'SELECT style_code, display_order FROM product_display_order WHERE display_order > $1 ORDER BY display_order ASC LIMIT 1',
          [currentOrder]
        );
        if (swapResult.rows.length === 0) {
          await query('ROLLBACK');
          return res.json({ success: true, message: 'Already at bottom' });
        }
        swapOrder = swapResult.rows[0];
      }

      // Swap positions
      await query(
        'UPDATE product_display_order SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE style_code = $2',
        [swapOrder.display_order, styleCode]
      );
      await query(
        'UPDATE product_display_order SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE style_code = $2',
        [currentOrder, swapOrder.style_code]
      );

      await query('COMMIT');
      
      console.log(`[PRODUCT-ORDER] Moved ${styleCode} ${direction}`);
      res.json({ success: true, message: `Product moved ${direction}` });
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('[PRODUCT-ORDER] Move error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/product-order/to-top
 * Move selected products to the top of the list (bulk action)
 */
router.put('/to-top', async (req, res) => {
  try {
    const { styleCodes } = req.body;
    
    if (!Array.isArray(styleCodes) || styleCodes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'styleCodes array is required'
      });
    }

    await query('BEGIN');

    try {
      // Get max order to shift existing products
      const maxResult = await query('SELECT COALESCE(MAX(display_order), 0) as max_order FROM product_display_order');
      const shift = styleCodes.length;

      // Shift all existing products down
      await query(
        'UPDATE product_display_order SET display_order = display_order + $1, updated_at = CURRENT_TIMESTAMP',
        [shift]
      );

      // Insert/update the selected products at top
      for (let i = 0; i < styleCodes.length; i++) {
        const styleCode = styleCodes[i];
        await query(`
          INSERT INTO product_display_order (style_code, display_order, active)
          VALUES ($1, $2, true)
          ON CONFLICT (style_code) DO UPDATE SET display_order = $2, active = true, updated_at = CURRENT_TIMESTAMP
        `, [styleCode, i + 1]);
      }

      // Re-normalize order numbers
      await normalizeDisplayOrder();

      await query('COMMIT');
      
      console.log(`[PRODUCT-ORDER] Moved ${styleCodes.length} products to top`);
      res.json({ 
        success: true, 
        message: `${styleCodes.length} product(s) moved to top`,
        count: styleCodes.length
      });
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('[PRODUCT-ORDER] To-top error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/product-order/reorder
 * Set complete order for products
 */
router.put('/reorder', async (req, res) => {
  try {
    const { orderedCodes } = req.body;
    
    if (!Array.isArray(orderedCodes) || orderedCodes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'orderedCodes array is required'
      });
    }

    await query('BEGIN');

    try {
      // Update each product's order
      for (let i = 0; i < orderedCodes.length; i++) {
        await query(`
          INSERT INTO product_display_order (style_code, display_order, active)
          VALUES ($1, $2, true)
          ON CONFLICT (style_code) DO UPDATE SET display_order = $2, active = true, updated_at = CURRENT_TIMESTAMP
        `, [orderedCodes[i], i + 1]);
      }

      await query('COMMIT');
      
      console.log(`[PRODUCT-ORDER] Reordered ${orderedCodes.length} products`);
      res.json({ 
        success: true, 
        message: `Reordered ${orderedCodes.length} products`,
        count: orderedCodes.length
      });
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('[PRODUCT-ORDER] Reorder error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/product-order/:styleCode
 * Remove product from custom order (will use default order)
 */
router.delete('/:styleCode', async (req, res) => {
  try {
    const { styleCode } = req.params;
    
    await query(
      'UPDATE product_display_order SET active = false, updated_at = CURRENT_TIMESTAMP WHERE style_code = $1',
      [styleCode]
    );
    
    res.json({ success: true, message: 'Product removed from custom order' });
  } catch (error) {
    console.error('[PRODUCT-ORDER] Delete error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper: Create table if not exists
async function createProductOrderTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS product_display_order (
      style_code VARCHAR(50) PRIMARY KEY,
      display_order INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await query('CREATE INDEX IF NOT EXISTS idx_product_order_display ON product_display_order (display_order) WHERE active = true');
  console.log('[PRODUCT-ORDER] Table created');
}

// Helper: Normalize display order numbers
async function normalizeDisplayOrder() {
  await query(`
    WITH ordered AS (
      SELECT style_code, ROW_NUMBER() OVER (ORDER BY display_order ASC) as new_order
      FROM product_display_order
      WHERE active = true
    )
    UPDATE product_display_order p
    SET display_order = o.new_order
    FROM ordered o
    WHERE p.style_code = o.style_code
  `);
}

module.exports = router;
