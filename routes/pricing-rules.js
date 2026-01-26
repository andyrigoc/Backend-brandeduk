const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

/**
 * GET /api/pricing-rules
 * Get all active pricing rules
 */
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, version, from_price, to_price, markup_percent, description
      FROM pricing_rules
      WHERE active = true
      ORDER BY from_price ASC
    `);
    
    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        from: parseFloat(row.from_price),
        to: parseFloat(row.to_price) >= 999999 ? null : parseFloat(row.to_price),
        percent: parseFloat(row.markup_percent),
        description: row.description
      })),
      count: result.rows.length
    });
  } catch (error) {
    console.error('[PRICING-RULES] Error fetching rules:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing rules',
      message: error.message
    });
  }
});

/**
 * PUT /api/pricing-rules
 * Replace all pricing rules with new ones
 */
router.put('/', async (req, res) => {
  try {
    const { tiers, mode, fixedPercent } = req.body;
    
    if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'tiers array is required and must not be empty'
      });
    }

    // Validate tiers
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      if (typeof tier.from !== 'number' || tier.from < 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tier',
          message: `Tier ${i + 1}: 'from' must be a positive number`
        });
      }
      if (typeof tier.percent !== 'number' || tier.percent < 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tier',
          message: `Tier ${i + 1}: 'percent' must be a positive number`
        });
      }
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Deactivate all existing rules
      await query(`UPDATE pricing_rules SET active = false, updated_at = CURRENT_TIMESTAMP`);

      // Insert new rules
      const version = new Date().toISOString().split('T')[0].replace(/-/g, '.');
      
      for (const tier of tiers) {
        const toPrice = tier.to === null || tier.to === undefined ? 999999.99 : tier.to;
        const description = `${tier.percent}% markup for £${tier.from.toFixed(2)}-${tier.to ? '£' + tier.to.toFixed(2) : '+'}`;
        
        await query(`
          INSERT INTO pricing_rules (version, from_price, to_price, markup_percent, active, description)
          VALUES ($1, $2, $3, $4, true, $5)
        `, [version, tier.from, toPrice, tier.percent, description]);
      }

      await query('COMMIT');

      console.log(`[PRICING-RULES] Updated ${tiers.length} pricing rules`);
      
      res.json({
        success: true,
        message: `Successfully updated ${tiers.length} pricing rules`,
        count: tiers.length,
        version
      });
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('[PRICING-RULES] Error updating rules:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update pricing rules',
      message: error.message
    });
  }
});

/**
 * POST /api/pricing-rules/reprice
 * Trigger repricing of all products with the new markup rules
 */
router.post('/reprice', async (req, res) => {
  try {
    // Get active pricing rules
    const rulesResult = await query(`
      SELECT from_price, to_price, markup_percent
      FROM pricing_rules
      WHERE active = true
      ORDER BY from_price ASC
    `);

    if (rulesResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No active pricing rules found'
      });
    }

    // Build CASE statement for markup calculation
    let caseStatement = 'CASE';
    for (const rule of rulesResult.rows) {
      caseStatement += ` WHEN cost_price >= ${rule.from_price} AND cost_price <= ${rule.to_price} THEN cost_price * (1 + ${rule.markup_percent} / 100)`;
    }
    caseStatement += ' ELSE cost_price * 1.50 END'; // Default 50% markup

    // Update product prices
    const updateResult = await query(`
      UPDATE products
      SET 
        sell_price = ${caseStatement},
        updated_at = CURRENT_TIMESTAMP
      WHERE cost_price IS NOT NULL AND cost_price > 0
    `);

    console.log(`[PRICING-RULES] Repriced ${updateResult.rowCount} products`);

    res.json({
      success: true,
      message: `Successfully repriced ${updateResult.rowCount} products`,
      productsUpdated: updateResult.rowCount
    });
  } catch (error) {
    console.error('[PRICING-RULES] Error repricing products:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to reprice products',
      message: error.message
    });
  }
});

module.exports = router;
