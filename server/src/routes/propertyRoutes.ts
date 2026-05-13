import express from 'express';
import {
	getProperties,
	getProperty,
	createProperty,
} from '../controllers/propertyControllers.ts';
import multer from 'multer';
// import {authMiddleware} from '../middleware/authMiddleware';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Add this right before your other routes
router.get('/test-property/:id', (req, res) => {
	console.log('🔵 Test route hit with ID:', req.params.id);
	res.json({ message: 'Test route working' });
});

router.get('/', getProperties);
router.get('/:id', getProperty);
router.post('/', upload.array('photos'), createProperty);

export default router;
