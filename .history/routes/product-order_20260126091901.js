const express = require('express');
const router = express.Router();
const { simpleQuery: query } = require('../config/database');

// Ensure table exists on module load
let tableChecked = false;

async function ensureTableExists() {
  if (tableChecked) return;
  
  try {
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
    tableChecked = true;
    console.log('[PRODUCT-ORDER] Table verified/created');
  } catch (error) {
    console.error('[PRODUCT-ORDER] Error creating table:', error.message);
  }
}

// Call on module load
ensureTableExists();

/**
 * GET /api/product-order
 * Get ordered products for "recommended" display (first 15 = recommended)
 */
router.get('/', async (req, res) => {
  try {
    await ensureTableExists();
    const { limit = 100 } = req.query;
    
    const result = await query(`
      SELECT 
        po.style_code,
        po.display_order
      FROM product_display_order po
      WHERE po.active = true
      ORDER BY po.display_order ASC
      LIMIT $1
    `, [parseInt(limit)]);
    
    res.json({
      success: true,
      data: result.rows.map((row, idx) => ({
        code: row.style_code,
        displayOrder: row.display_order,
        isRecommended: idx < 15
      })),
      count: result.rows.length,
      recommendedCount: Math.min(result.rows.length, 15)
    });
  } catch (error) {
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
    await ensureTableExists();
    
    const result = await query(`
      SELECT 
        po.style_code as code,
        po.display_order
      FROM product_display_order po
      WHERE po.active = true
      ORDER BY po.display_order ASC
      LIMIT 15
    `);
    
    res.json({
      success: true,
      items: result.rows,
      count: result.rows.length
    });
  } catch (error) {
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
    await ensureTableExists();
    const { styleCode, direction } = req.body;
    
    if (!styleCode || !['up', 'down'].includes(direction)) {
      return res.status(400).json({
        success: false,
        error: 'styleCode and direction (up/down) are required'
      });
    }

    // Get current position
    const currentResult = await query(
      'SELECT display_order FROM product_display_order WHERE style_code = $1 AND active = true',
      [styleCode]
    );

    if (currentResult.rows.length === 0) {
      // Product not in order table, add it first
      const maxResult = await query('SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM product_display_order WHERE active = true');
      const nextOrder = maxResult.rows[0].next_order;
      
      await query(
        'INSERT INTO product_display_order (style_code, display_order, active) VALUES ($1, $2, true) ON CONFLICT (style_code) DO UPDATE SET display_order = $2, active = true',
        [styleCode, nextOrder]
      );
      
      return res.json({ success: true, message: 'Product added to order list at position ' + nextOrder });
    }

    const currentOrder = currentResult.rows[0].display_order;
    let swapResult;

    if (direction === 'up') {
      // Find product with next lower order
      swapResult = await query(
        'SELECT style_code, display_order FROM product_display_order WHERE display_order < $1 AND active = true ORDER BY display_order DESC LIMIT 1',
        [currentOrder]
      );
      if (swapResult.rows.length === 0) {
        return res.json({ success: true, message: 'Already at top' });
      }
    } else {
      // Find product with next higher order
      swapResult = await query(
        'SELECT style_code, display_order FROM product_display_order WHERE display_order > $1 AND active = true ORDER BY display_order ASC LIMIT 1',
        [currentOrder]
      );
      if (swapResult.rows.length === 0) {
        return res.json({ success: true, message: 'Already at bottom' });
      }
    }

    const swapRow = swapResult.rows[0];

    // Swap positions using a temp value to avoid unique constraint issues
    await query(
      'UPDATE product_display_order SET display_order = -1, updated_at = CURRENT_TIMESTAMP WHERE style_code = $1',
      [styleCode]
    );
    await query(
      'UPDATE product_display_order SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE style_code = $2',
      [currentOrder, swapRow.style_code]
    );
    await query(
      'UPDATE product_display_order SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE style_code = $2',
      [swapRow.display_order, styleCode]
    );

    console.log(`[PRODUCT-ORDER] Moved ${styleCode} ${direction}: ${currentOrder} <-> ${swapRow.display_order}`);
    res.json({ success: true, message: `Product moved ${direction}` });
    
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
    await ensureTableExists();
    const { styleCodes } = req.body;
    
    if (!Array.isArray(styleCodes) || styleCodes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'styleCodes array is required'
      });
    }

    // Get current max order
    const maxResult = await query('SELECT COALESCE(MAX(display_order), 0) as max_order FROM product_display_order WHERE active = true');
    const currentMax = maxResult.rows[0].max_order;

    // Shift all existing products down by the count of new products
    const shift = styleCodes.length;
    await query(
      'UPDATE product_display_order SET display_order = display_order + $1, updated_at = CURRENT_TIMESTAMP WHERE active = true',
      [shift]
    );

    // Insert/update the selected products at top positions
    for (let i = 0; i < styleCodes.length; i++) {
      const styleCode = styleCodes[i];
      await query(`
        INSERT INTO product_display_order (style_code, display_order, active)
        VALUES ($1, $2, true)
        ON CONFLICT (style_code) DO UPDATE SET display_order = $2, active = true, updated_at = CURRENT_TIMESTAMP
      `, [styleCode, i + 1]);
    }

    console.log(`[PRODUCT-ORDER] Moved ${styleCodes.length} products to top`);
    res.json({ 
      success: true, 
      message: `${styleCodes.length} product(s) moved to top`,
      count: styleCodes.length
    });
    
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
    await ensureTableExists();
    const { orderedCodes } = req.body;
    
    if (!Array.isArray(orderedCodes) || orderedCodes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'orderedCodes array is required'
      });
    }

    // Update each product's order
    for (let i = 0; i < orderedCodes.length; i++) {
      await query(`
        INSERT INTO product_display_order (style_code, display_order, active)
        VALUES ($1, $2, true)
        ON CONFLICT (style_code) DO UPDATE SET display_order = $2, active = true, updated_at = CURRENT_TIMESTAMP
      `, [orderedCodes[i], i + 1]);
    }

    console.log(`[PRODUCT-ORDER] Reordered ${orderedCodes.length} products`);
    res.json({ 
      success: true, 
      message: `Reordered ${orderedCodes.length} products`,
      count: orderedCodes.length
    });
    
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
    await ensureTableExists();
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

module.exports = router;
