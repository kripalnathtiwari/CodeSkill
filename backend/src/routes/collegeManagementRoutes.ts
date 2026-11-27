import { Router } from 'express';
import { 
  getAllInstitutions, 
  getPublicInstitutions, 
  createInstitution, 
  updateInstitution, 
  deleteInstitution, 
  deleteTutor,
  getCourseCategories,
  getPublicCourseCategories,
  createCourseCategory,
  updateCourseCategory,
  deleteCourseCategory,
  createCourseClass,
  updateCourseClass,
  deleteCourseClass,
  addCourseStudent,
  removeCourseStudent,
  assignCourseInstructor,
  removeCourseInstructor
} from '../controllers/collegeManagementController';
import { authenticateJWT, requireRole } from '../middlewares/authMiddleware';
import { cache } from '../middlewares/cacheMiddleware';

const router = Router();

const PUBLIC_CATALOG_CACHE = cache(600, {
  scope: 'public',
  maxAge: 60,
  staleWhileRevalidate: 600,
});

// Get public institutions (cached 10m server-side, 60s browser + 600s SWR)
router.get('/public', PUBLIC_CATALOG_CACHE, getPublicInstitutions);

// Get public course categories (cached 10m server-side, 60s browser + 600s SWR)
router.get('/public/courses', PUBLIC_CATALOG_CACHE, getPublicCourseCategories);

// Get all institutions
router.get('/', authenticateJWT, cache(300, 'private'), getAllInstitutions);

// Create a new institution
router.post('/', authenticateJWT, requireRole(['ADMIN']), createInstitution);

// Update an existing institution
router.put('/:id', authenticateJWT, requireRole(['ADMIN']), updateInstitution);

// Delete an institution by ID
router.delete('/:id', authenticateJWT, requireRole(['ADMIN']), deleteInstitution);

// Delete a tutor by ID
router.delete('/:collegeId/tutors/:tutorId', authenticateJWT, requireRole(['ADMIN']), deleteTutor);

// ==========================================
// Course Category Section Routes
// ==========================================

router.get('/courses', authenticateJWT, getCourseCategories);
router.post('/courses', authenticateJWT, requireRole(['ADMIN']), createCourseCategory);
router.put('/courses/:id', authenticateJWT, requireRole(['ADMIN']), updateCourseCategory);
router.delete('/courses/:id', authenticateJWT, requireRole(['ADMIN']), deleteCourseCategory);

// Class / Section routes
router.post('/courses/:id/classes', authenticateJWT, requireRole(['ADMIN']), createCourseClass);
router.put('/courses/classes/:classId', authenticateJWT, requireRole(['ADMIN']), updateCourseClass);
router.delete('/courses/classes/:classId', authenticateJWT, requireRole(['ADMIN']), deleteCourseClass);

router.post('/courses/:id/students', authenticateJWT, requireRole(['ADMIN']), addCourseStudent);
router.delete('/courses/:id/students/:studentId', authenticateJWT, requireRole(['ADMIN']), removeCourseStudent);
router.post('/courses/:id/instructors', authenticateJWT, requireRole(['ADMIN']), assignCourseInstructor);
router.delete('/courses/:id/instructors/:instructorId', authenticateJWT, requireRole(['ADMIN']), removeCourseInstructor);

export default router;
