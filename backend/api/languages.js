import express from 'express';
import Language from '../models/Language.js';
import Level from '../models/Level.js';
import { authenticate } from '../middleware/auth.js';
import UserProgress from '../models/UserProgress.js';
import { localizeData } from '../utils/i18n.js';

const router = express.Router();

// Get all languages
router.get('/', authenticate, async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const languages = await Language.find().populate('levels');
    
    // Transform languages to localized version
    const localizedLanguages = languages.map(langObj => {
      const langObjData = langObj.toObject();
      return localizeData(langObjData, lang);
    });
    
    res.json({ success: true, languages: localizedLanguages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single language with levels and unlock status
router.get('/:langId', authenticate, async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const language = await Language.findById(req.params.langId)
      .populate({
        path: 'levels',
        populate: {
          path: 'lessons',
          select: 'title lessonNumber'
        }
      });

    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }

    // Get user progress to check unlock status
    const progress = await UserProgress.findOne({ userId: req.user._id });
    
    const levelsWithStatus = language.levels.map(level => {
      const levelProgress = progress?.levelScores.find(
        ls => ls.levelId.toString() === level._id.toString()
      );

      const levelObj = level.toObject();
      const localizedLevel = localizeData(levelObj, lang);

      return {
        ...localizedLevel,
        isUnlocked: levelProgress?.isUnlocked || level.levelNumber === 1,
        averageScore: levelProgress?.averageScore || 0
      };
    });

    const languageObj = language.toObject();
    const localizedLanguage = localizeData(languageObj, lang);

    res.json({
      success: true,
      language: {
        ...localizedLanguage,
        levels: levelsWithStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;



