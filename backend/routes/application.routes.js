const express = require('express')
const router = express.Router()

const {
    createApplication,
    getApplication,
    getApplicationById,
    updateApplication,
    deleteApplication
} = require ('../controllers/application.controller')

router.post('/', createApplication)
router.get('/', getApplication)
router.get('/:id', getApplicationById)
router.patch('/:id', updateApplication)
router.delete('/:id', deleteApplication)

module.exports = router