const express = require('express')
const router = express.Router()
const authMiddleware = require ('../middleware/auth.middleware')

const {
    createApplication,
    getApplication,
    getApplicationById,
    updateApplication,
    deleteApplication
} = require ('../controllers/application.controller')

router.post('/', authMiddleware, createApplication)
router.get('/', authMiddleware, getApplication)
router.get('/:id', authMiddleware, getApplicationById)
router.patch('/:id', authMiddleware, updateApplication)
router.delete('/:id', authMiddleware, deleteApplication)

module.exports = router