import express from 'express';
import Lesson from '../models/Lesson.js';
import { authenticate } from '../middleware/auth.js';
import { localizeData } from '../utils/i18n.js';

const router = express.Router();

// Get all lessons for a level
router.get('/level/:levelId', authenticate, async (req, res) => {
  try {
    const lang = req.query.lang || 'en'; // Get language from query parameter
    const lessons = await Lesson.find({ levelId: req.params.levelId })
      .sort({ lessonNumber: 1 })
      .populate('levelId', 'title levelNumber');
    
    // Transform lessons to localized version
    const localizedLessons = lessons.map(lesson => {
      const lessonObj = lesson.toObject();
      return localizeData(lessonObj, lang);
    });
    
    res.json({ success: true, lessons: localizedLessons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single lesson
router.get('/:lessonId', authenticate, async (req, res) => {
  try {
    const lang = req.query.lang || 'en'; // Get language from query parameter
    const lesson = await Lesson.findById(req.params.lessonId)
      .populate('levelId', 'title levelNumber');
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Transform lesson to localized version
    const lessonObj = lesson.toObject();
    const localizedLesson = localizeData(lessonObj, lang);

    res.json({ success: true, lesson: localizedLesson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;



