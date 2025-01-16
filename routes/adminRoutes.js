const express = require('express');
const adminController = require('../controllers/adminController')
const router = express.Router();

router.get('/adminUsers', adminController.get_adminUsers); 
router.get('/authenticate', adminController.get_authenticate);

router.post('/authenticate/accept', adminController.post_acceptApplicant);
router.post('/authenticate/reject', adminController.post_rejectApplicant);

router.delete('/:id/delete', adminController.delete_user);

module.exports =router;
