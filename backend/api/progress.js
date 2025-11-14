import express from 'express';
import UserProgress from '../models/UserProgress.js';
import Lesson from '../models/Lesson.js';
import Level from '../models/Level.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user progress
router.get('/', authenticate, async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ userId: req.user._id })
      .populate('completedLessonIds', 'title lessonNumber')
      .populate('lessonScores.lessonId', 'title lessonNumber')
      .populate('levelScores.levelId', 'title levelNumber');

    if (!progress) {
      progress = await UserProgress.create({ userId: req.user._id });
    }

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit quiz score
router.post('/quiz/:lessonId', authenticate, async (req, res) => {
  try {
    const { quizScore, codeScore } = req.body;
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    let progress = await UserProgress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = await UserProgress.create({ userId: req.user._id });
    }

    // Update lesson score
    const existingScoreIndex = progress.lessonScores.findIndex(
      ls => ls.lessonId.toString() === lessonId
    );

    if (existingScoreIndex >= 0) {
      // Update existing score
      if (quizScore !== undefined) {
        progress.lessonScores[existingScoreIndex].quizScore = quizScore;
        progress.lessonScores[existingScoreIndex].quizAttempts += 1;
      }
      if (codeScore !== undefined) {
        progress.lessonScores[existingScoreIndex].codeScore = codeScore;
        progress.lessonScores[existingScoreIndex].codeAttempts += 1;
      }
      
      // Calculate total score (quiz + code, max 20)
      const quiz = progress.lessonScores[existingScoreIndex].quizScore || 0;
      const code = progress.lessonScores[existingScoreIndex].codeScore || 0;
      progress.lessonScores[existingScoreIndex].totalScore = quiz + code;
      progress.lessonScores[existingScoreIndex].completedAt = new Date();
    } else {
      // Create new score entry
      const quiz = quizScore || 0;
      const code = codeScore || 0;
      progress.lessonScores.push({
        lessonId,
        quizScore: quizScore || null,
        codeScore: codeScore || null,
        totalScore: quiz + code,
        quizAttempts: quizScore !== undefined ? 1 : 0,
        codeAttempts: codeScore !== undefined ? 1 : 0
      });
    }

    // Add to completed lessons if total score >= 14 (7/10 for each part = 14/20)
    const lessonScore = progress.lessonScores.find(
      ls => ls.lessonId.toString() === lessonId
    );
    if (lessonScore && lessonScore.totalScore >= 14 && !progress.completedLessonIds.includes(lessonId)) {
      progress.completedLessonIds.push(lessonId);
    }
    
    // Update updatedAt timestamp
    progress.updatedAt = new Date();

    // Calculate level average score (based on totalScore / 2 to get average out of 10)
    const level = await Level.findById(lesson.levelId);
    if (level) {
      const levelLessons = await Lesson.find({ levelId: level._id });
      const levelLessonIds = levelLessons.map(l => l._id.toString());
      
      const levelScores = progress.lessonScores.filter(ls =>
        levelLessonIds.includes(ls.lessonId.toString())
      );

      if (levelScores.length > 0) {
        // Calculate average based on totalScore (out of 20), then divide by 2 to get out of 10
        const averageScore = levelScores.reduce((sum, ls) => sum + (ls.totalScore || 0), 0) / levelScores.length / 2;

        const existingLevelScoreIndex = progress.levelScores.findIndex(
          ls => ls.levelId.toString() === level._id.toString()
        );

        if (existingLevelScoreIndex >= 0) {
          progress.levelScores[existingLevelScoreIndex].averageScore = averageScore;
          
          // Auto unlock next level if average >= 7
          if (averageScore >= 7 && !progress.levelScores[existingLevelScoreIndex].isUnlocked) {
            progress.levelScores[existingLevelScoreIndex].isUnlocked = true;
            progress.levelScores[existingLevelScoreIndex].unlockedBy = 'auto';
            progress.levelScores[existingLevelScoreIndex].unlockedAt = new Date();
          }
        } else {
          progress.levelScores.push({
            levelId: level._id,
            averageScore,
            isUnlocked: averageScore >= 7,
            unlockedBy: averageScore >= 7 ? 'auto' : null,
            unlockedAt: averageScore >= 7 ? new Date() : null
          });
        }
      }
    }

    await progress.save();

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit code exercise score
router.post('/code/:lessonId', authenticate, async (req, res) => {
  try {
    const { codeScore } = req.body;
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    let progress = await UserProgress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = await UserProgress.create({ userId: req.user._id });
    }

    // Update lesson score
    const existingScoreIndex = progress.lessonScores.findIndex(
      ls => ls.lessonId.toString() === lessonId
    );

    if (existingScoreIndex >= 0) {
      progress.lessonScores[existingScoreIndex].codeScore = codeScore;
      progress.lessonScores[existingScoreIndex].codeAttempts += 1;
      
      // Calculate total score
      const quiz = progress.lessonScores[existingScoreIndex].quizScore || 0;
      progress.lessonScores[existingScoreIndex].totalScore = quiz + codeScore;
      progress.lessonScores[existingScoreIndex].completedAt = new Date();
    } else {
      progress.lessonScores.push({
        lessonId,
        codeScore,
        totalScore: codeScore,
        codeAttempts: 1
      });
    }

    // Add to completed lessons if total score >= 14 (7/10 for each part = 14/20)
    const lessonScore = progress.lessonScores.find(
      ls => ls.lessonId.toString() === lessonId
    );
    if (lessonScore && lessonScore.totalScore >= 14 && !progress.completedLessonIds.includes(lessonId)) {
      progress.completedLessonIds.push(lessonId);
    }
    
    // Update updatedAt timestamp
    progress.updatedAt = new Date();

    // Calculate level average score
    const level = await Level.findById(lesson.levelId);
    if (level) {
      const levelLessons = await Lesson.find({ levelId: level._id });
      const levelLessonIds = levelLessons.map(l => l._id.toString());
      
      const levelScores = progress.lessonScores.filter(ls =>
        levelLessonIds.includes(ls.lessonId.toString())
      );

      if (levelScores.length > 0) {
        const averageScore = levelScores.reduce((sum, ls) => sum + (ls.totalScore || 0), 0) / levelScores.length / 2;

        const existingLevelScoreIndex = progress.levelScores.findIndex(
          ls => ls.levelId.toString() === level._id.toString()
        );

        if (existingLevelScoreIndex >= 0) {
          progress.levelScores[existingLevelScoreIndex].averageScore = averageScore;
          
          if (averageScore >= 7 && !progress.levelScores[existingLevelScoreIndex].isUnlocked) {
            progress.levelScores[existingLevelScoreIndex].isUnlocked = true;
            progress.levelScores[existingLevelScoreIndex].unlockedBy = 'auto';
            progress.levelScores[existingLevelScoreIndex].unlockedAt = new Date();
          }
        } else {
          progress.levelScores.push({
            levelId: level._id,
            averageScore,
            isUnlocked: averageScore >= 7,
            unlockedBy: averageScore >= 7 ? 'auto' : null,
            unlockedAt: averageScore >= 7 ? new Date() : null
          });
        }
      }
    }

    await progress.save();

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update study time
router.post('/time', authenticate, async (req, res) => {
  try {
    const { minutes } = req.body;

    let progress = await UserProgress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = await UserProgress.create({ userId: req.user._id });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStatIndex = progress.timeStats.findIndex(
      ts => new Date(ts.date).setHours(0, 0, 0, 0) === today.getTime()
    );

    if (todayStatIndex >= 0) {
      progress.timeStats[todayStatIndex].minutes += minutes;
    } else {
      progress.timeStats.push({ date: today, minutes });
    }

    progress.totalStudyTime += minutes;

    // Update streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (progress.lastStudyDate) {
      const lastDate = new Date(progress.lastStudyDate);
      lastDate.setHours(0, 0, 0, 0);

      if (lastDate.getTime() === yesterday.getTime()) {
        progress.currentStreak += 1;
      } else if (lastDate.getTime() !== today.getTime()) {
        progress.currentStreak = 1;
      }
    } else {
      progress.currentStreak = 1;
    }

    progress.lastStudyDate = today;
    await progress.save();

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;



