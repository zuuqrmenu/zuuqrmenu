import express from 'express';
import { register, login, me, logout, updateProfile, createMenuIdentity, changePassword, reauthenticate, updateEmail, firebaseSession } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { linkFirebaseAccount } from '../controllers/firebaseLinkController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { registerFirebase } from '../controllers/firebaseRegistrationController.js';

const router = express.Router();

router.post('/register', register);
router.post('/register-firebase', firebaseAuth, registerFirebase);
router.post('/firebase-session', firebaseAuth, firebaseSession);
router.post('/login', login);
router.get('/me', auth, me);
router.post('/logout', auth, logout);
router.put('/profile', auth, updateProfile);
router.post('/menu-setup', auth, createMenuIdentity);
router.post('/reauthenticate', auth, reauthenticate);
router.put('/email', auth, updateEmail);
router.put('/change-password', auth, changePassword);
router.post('/link-firebase', auth, firebaseAuth, linkFirebaseAccount);

export default router;
