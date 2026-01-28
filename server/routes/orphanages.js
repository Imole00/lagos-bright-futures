import express from 'express';
import pool from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all orphanages (with filtering)
router.get('/', async (req, res) => {
  try {
    const { lga, status, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM orphanages WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (lga) {
      query += ` AND lga = $${paramCount}`;
      params.push(lga);
      paramCount++;
    }

    if (status) {
      query += ` AND verification_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await pool.query(query, params);

    res.json({
      count: result.rows.length,
      orphanages: result.rows
    });
  } catch (error) {
    console.error('Fetch orphanages error:', error);
    res.status(500).json({ error: 'Failed to fetch orphanages' });
  }
});

// Get single orphanage by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT o.*, u.full_name as admin_name, u.email as admin_email 
       FROM orphanages o 
       LEFT JOIN users u ON o.admin_user_id = u.id 
       WHERE o.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orphanage not found' });
    }

    // Get verification documents
    const docs = await pool.query(
      'SELECT * FROM verification_documents WHERE orphanage_id = $1',
      [id]
    );

    res.json({
      orphanage: result.rows[0],
      documents: docs.rows
    });
  } catch (error) {
    console.error('Fetch orphanage error:', error);
    res.status(500).json({ error: 'Failed to fetch orphanage' });
  }
});

// Create new orphanage (Orphanage Admin only)
router.post('/', authenticate, authorize('orphanage_admin', 'super_admin'), async (req, res) => {
  try {
    const {
      name, registration_number, lga, address, latitude, longitude,
      capacity, contact_person, contact_email, contact_phone,
      year_established, description
    } = req.body;

    const result = await pool.query(
      `INSERT INTO orphanages (
        name, registration_number, lga, address, latitude, longitude,
        capacity, contact_person, contact_email, contact_phone,
        year_established, description, admin_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        name, registration_number, lga, address, latitude, longitude,
        capacity, contact_person, contact_email, contact_phone,
        year_established, description, req.user.id
      ]
    );

    res.status(201).json({
      message: 'Orphanage created successfully',
      orphanage: result.rows[0]
    });
  } catch (error) {
    console.error('Create orphanage error:', error);
    res.status(500).json({ error: 'Failed to create orphanage' });
  }
});

// Update orphanage verification status (Government/NGO only)
router.patch('/:id/verify', authenticate, authorize('government_validator', 'ngo_partner', 'super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['verified', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get current status
    const currentOrphanage = await pool.query(
      'SELECT verification_status FROM orphanages WHERE id = $1',
      [id]
    );

    if (currentOrphanage.rows.length === 0) {
      return res.status(404).json({ error: 'Orphanage not found' });
    }

    const previousStatus = currentOrphanage.rows[0].verification_status;

    // Update status
    const result = await pool.query(
      'UPDATE orphanages SET verification_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    // Log the verification action
    await pool.query(
      `INSERT INTO verification_logs (orphanage_id, validator_id, action, previous_status, new_status, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, req.user.id, 'status_change', previousStatus, status, notes]
    );

    res.json({
      message: 'Verification status updated',
      orphanage: result.rows[0]
    });
  } catch (error) {
    console.error('Verify orphanage error:', error);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
});

// Get statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_orphanages,
        COUNT(*) FILTER (WHERE verification_status = 'verified') as verified,
        COUNT(*) FILTER (WHERE verification_status = 'pending') as pending,
        COUNT(*) FILTER (WHERE verification_status = 'rejected') as rejected,
        SUM(capacity) as total_capacity,
        SUM(current_children) as total_children
      FROM orphanages
    `);

    const lgaDistribution = await pool.query(`
      SELECT lga, COUNT(*) as count
      FROM orphanages
      WHERE verification_status = 'verified'
      GROUP BY lga
      ORDER BY count DESC
    `);

    res.json({
      overview: stats.rows[0],
      lga_distribution: lgaDistribution.rows
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
