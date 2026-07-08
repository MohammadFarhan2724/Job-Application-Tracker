const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { importGmailApplications } = require('../controllers/import.controller');

router.post('/gmail', authMiddleware, importGmailApplications);

module.exports = router;