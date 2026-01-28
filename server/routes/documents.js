import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

// Upload verification document
router.post('/upload', authenticate, authorize('orphanage_admin', 'super_admin'), upload.single('document'), async (req, res) => {
  try {
    const { orphanage_id, document_type } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!orphanage_id || !document_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify orphanage exists and user has access
    const orphanage = await pool.query(
      'SELECT * FROM orphanages WHERE id = $1',
      [orphanage_id]
    );

    if (orphanage.rows.length === 0) {
      return res.status(404).json({ error: 'Orphanage not found' });
    }

    // Save document record
    const result = await pool.query(
      `INSERT INTO verification_documents (orphanage_id, document_type, file_path, file_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [orphanage_id, document_type, req.file.path, req.file.originalname]
    );

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: result.rows[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get all documents for an orphanage
router.get('/orphanage/:orphanageId', async (req, res) => {
  try {
    const { orphanageId } = req.params;

    const result = await pool.query(
      `SELECT vd.*, u.full_name as verified_by_name
       FROM verification_documents vd
       LEFT JOIN users u ON vd.verified_by = u.id
       WHERE vd.orphanage_id = $1
       ORDER BY vd.upload_date DESC`,
      [orphanageId]
    );

    res.json({
      documents: result.rows
    });
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Verify/reject a document (Government/NGO only)
router.patch('/:id/verify', authenticate, authorize('government_validator', 'ngo_partner', 'super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      `UPDATE verification_documents 
       SET status = $1, verified_by = $2, verification_date = CURRENT_TIMESTAMP, rejection_reason = $3
       WHERE id = $4
       RETURNING *`,
      [status, req.user.id, rejection_reason || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      message: 'Document verification updated',
      document: result.rows[0]
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ error: 'Failed to verify document' });
  }
});

// Get pending documents for validation
router.get('/pending', authenticate, authorize('government_validator', 'ngo_partner', 'super_admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT vd.*, o.name as orphanage_name, o.lga
       FROM verification_documents vd
       JOIN orphanages o ON vd.orphanage_id = o.id
       WHERE vd.status = 'pending'
       ORDER BY vd.upload_date ASC`
    );

    res.json({
      pending_documents: result.rows
    });
  } catch (error) {
    console.error('Fetch pending documents error:', error);
    res.status(500).json({ error: 'Failed to fetch pending documents' });
  }
});

export default router;
