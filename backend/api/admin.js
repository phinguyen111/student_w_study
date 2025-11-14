import express from 'express';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Lesson from '../models/Lesson.js';
import Level from '../models/Level.js';
import Language from '../models/Language.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user progress
router.get('/users/:userId/progress', async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ userId: req.params.userId })
      .populate('completedLessonIds')
      .populate('lessonScores.lessonId')
      .populate('levelScores.levelId');
    
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve level unlock for user
router.post('/users/:userId/unlock-level/:levelId', async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ userId: req.params.userId });
    
    if (!progress) {
      progress = await UserProgress.create({ userId: req.params.userId });
    }

    const levelScoreIndex = progress.levelScores.findIndex(
      ls => ls.levelId.toString() === req.params.levelId
    );

    if (levelScoreIndex >= 0) {
      progress.levelScores[levelScoreIndex].isUnlocked = true;
      progress.levelScores[levelScoreIndex].unlockedBy = 'admin';
      progress.levelScores[levelScoreIndex].unlockedAt = new Date();
      progress.levelScores[levelScoreIndex].adminApproved = true;
    } else {
      progress.levelScores.push({
        levelId: req.params.levelId,
        isUnlocked: true,
        unlockedBy: 'admin',
        unlockedAt: new Date(),
        adminApproved: true
      });
    }

    await progress.save();
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create quiz for user(s)
router.post('/quiz', async (req, res) => {
  try {
    const { lessonId, questions, userIds } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    lesson.quiz.questions = questions;
    await lesson.save();

    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all lessons (for admin)
router.get('/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.find()
      .populate('levelId', 'title levelNumber');
    res.json({ success: true, lessons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create lesson
router.post('/lessons', async (req, res) => {
  try {
    const { levelId, lessonNumber, title, content, codeExample, quiz } = req.body;
    
    const lesson = await Lesson.create({
      levelId,
      lessonNumber,
      title,
      content,
      codeExample,
      quiz
    });

    // Add to level
    const level = await Level.findById(levelId);
    if (level) {
      level.lessons.push(lesson._id);
      await level.save();
    }

    res.status(201).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create level
router.post('/levels', async (req, res) => {
  try {
    const { languageId, levelNumber, title, description } = req.body;
    
    const level = await Level.create({
      languageId,
      levelNumber,
      title,
      description
    });

    // Add to language
    const language = await Language.findById(languageId);
    if (language) {
      language.levels.push(level._id);
      await language.save();
    }

    res.status(201).json({ success: true, level });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create language
router.post('/languages', async (req, res) => {
  try {
    const { name, slug, description, icon } = req.body;
    
    const language = await Language.create({
      name,
      slug,
      description,
      icon
    });

    res.status(201).json({ success: true, language });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all languages
router.get('/languages', async (req, res) => {
  try {
    const languages = await Language.find().populate('levels');
    res.json({ success: true, languages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all levels
router.get('/levels', async (req, res) => {
  try {
    const levels = await Level.find()
      .populate('languageId', 'name')
      .populate('lessons', 'title lessonNumber');
    res.json({ success: true, levels });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user progress
    await UserProgress.deleteMany({ userId: req.params.userId });
    
    // Delete user
    await User.findByIdAndDelete(req.params.userId);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update lesson
router.put('/lessons/:lessonId', async (req, res) => {
  try {
    const { title, content, codeExample, quiz } = req.body;
    
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.lessonId,
      { title, content, codeExample, quiz },
      { new: true }
    );
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete lesson
router.delete('/lessons/:lessonId', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Remove from level
    const level = await Level.findById(lesson.levelId);
    if (level) {
      level.lessons = level.lessons.filter(
        id => id.toString() !== req.params.lessonId
      );
      await level.save();
    }
    
    await Lesson.findByIdAndDelete(req.params.lessonId);
    
    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update level
router.put('/levels/:levelId', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const level = await Level.findByIdAndUpdate(
      req.params.levelId,
      { title, description },
      { new: true }
    );
    
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }
    
    res.json({ success: true, level });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete level
router.delete('/levels/:levelId', async (req, res) => {
  try {
    const level = await Level.findById(req.params.levelId);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }
    
    // Delete all lessons in this level
    await Lesson.deleteMany({ levelId: req.params.levelId });
    
    // Remove from language
    const language = await Language.findById(level.languageId);
    if (language) {
      language.levels = language.levels.filter(
        id => id.toString() !== req.params.levelId
      );
      await language.save();
    }
    
    await Level.findByIdAndDelete(req.params.levelId);
    
    res.json({ success: true, message: 'Level deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update language
router.put('/languages/:languageId', async (req, res) => {
  try {
    const { name, slug, description, icon } = req.body;
    
    const language = await Language.findByIdAndUpdate(
      req.params.languageId,
      { name, slug, description, icon },
      { new: true }
    );
    
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }
    
    res.json({ success: true, language });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete language
router.delete('/languages/:languageId', async (req, res) => {
  try {
    const language = await Language.findById(req.params.languageId);
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }
    
    // Delete all levels and their lessons
    for (const levelId of language.levels) {
      await Lesson.deleteMany({ levelId });
      await Level.findByIdAndDelete(levelId);
    }
    
    await Language.findByIdAndDelete(req.params.languageId);
    
    res.json({ success: true, message: 'Language deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalLanguages = await Language.countDocuments();
    const totalLevels = await Level.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const totalProgress = await UserProgress.countDocuments();
    
    // Get recent users
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get all user progress for statistics
    const allProgress = await UserProgress.find()
      .populate('userId', 'name email')
      .populate('lessonScores.lessonId', 'title lessonNumber');
    
    // Calculate score statistics
    let totalQuizScores = 0;
    let totalCodeScores = 0;
    let quizCount = 0;
    let codeCount = 0;
    let totalScores = 0;
    let scoreCount = 0;
    
    const userStats = [];
    
    allProgress.forEach(progress => {
      let userQuizTotal = 0;
      let userCodeTotal = 0;
      let userQuizCount = 0;
      let userCodeCount = 0;
      let userTotalScore = 0;
      
      progress.lessonScores.forEach(ls => {
        if (ls.quizScore !== null && ls.quizScore !== undefined) {
          totalQuizScores += ls.quizScore;
          quizCount++;
          userQuizTotal += ls.quizScore;
          userQuizCount++;
        }
        if (ls.codeScore !== null && ls.codeScore !== undefined) {
          totalCodeScores += ls.codeScore;
          codeCount++;
          userCodeTotal += ls.codeScore;
          userCodeCount++;
        }
        if (ls.totalScore > 0) {
          totalScores += ls.totalScore;
          scoreCount++;
          userTotalScore += ls.totalScore;
        }
      });
      
      const avgQuiz = userQuizCount > 0 ? userQuizTotal / userQuizCount : 0;
      const avgCode = userCodeCount > 0 ? userCodeTotal / userCodeCount : 0;
      const avgTotal = scoreCount > 0 ? userTotalScore / scoreCount : 0;
      
      userStats.push({
        userId: progress.userId,
        name: progress.userId?.name || 'Unknown',
        email: progress.userId?.email || '',
        completedLessons: progress.completedLessonIds.length,
        quizAverage: avgQuiz,
        codeAverage: avgCode,
        totalAverage: avgTotal / 2, // Convert from 20 to 10 scale
        totalScore: userTotalScore, // Total score out of 20 (sum of all lesson scores)
        grandTotalScore: userTotalScore, // Same as totalScore for clarity
        quizAttempts: progress.lessonScores.reduce((sum, ls) => sum + (ls.quizAttempts || 0), 0),
        codeAttempts: progress.lessonScores.reduce((sum, ls) => sum + (ls.codeAttempts || 0), 0),
        currentStreak: progress.currentStreak,
        totalStudyTime: progress.totalStudyTime
      });
    });
    
    // Sort users by total average score
    const topUsers = [...userStats]
      .sort((a, b) => b.totalAverage - a.totalAverage)
      .slice(0, 10);
    
    // Calculate averages
    const avgQuizScore = quizCount > 0 ? totalQuizScores / quizCount : 0;
    const avgCodeScore = codeCount > 0 ? totalCodeScores / codeCount : 0;
    const avgTotalScore = scoreCount > 0 ? totalScores / scoreCount / 2 : 0; // Convert from 20 to 10 scale
    
    // Calculate grand total score (sum of all total scores across all users)
    const grandTotalScore = allProgress.reduce((sum, p) => {
      return sum + p.lessonScores.reduce((s, ls) => s + (ls.totalScore || 0), 0);
    }, 0);
    
    // User growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Active users (users with progress in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await UserProgress.countDocuments({
      updatedAt: { $gte: sevenDaysAgo }
    });
    
    // Score distribution
    const scoreDistribution = {
      excellent: 0, // 9-10
      good: 0,      // 7-8.9
      average: 0,   // 5-6.9
      poor: 0       // <5
    };
    
    allProgress.forEach(progress => {
      progress.lessonScores.forEach(ls => {
        const avgScore = ls.totalScore / 2; // Convert to 10 scale
        if (avgScore >= 9) scoreDistribution.excellent++;
        else if (avgScore >= 7) scoreDistribution.good++;
        else if (avgScore >= 5) scoreDistribution.average++;
        else if (avgScore > 0) scoreDistribution.poor++;
      });
    });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalLanguages,
        totalLevels,
        totalLessons,
        totalProgress,
        newUsersLast30Days,
        activeUsers,
        avgQuizScore: avgQuizScore.toFixed(2),
        avgCodeScore: avgCodeScore.toFixed(2),
        avgTotalScore: avgTotalScore.toFixed(2),
        grandTotalScore: grandTotalScore,
        totalQuizAttempts: allProgress.reduce((sum, p) => 
          sum + p.lessonScores.reduce((s, ls) => s + (ls.quizAttempts || 0), 0), 0),
        totalCodeAttempts: allProgress.reduce((sum, p) => 
          sum + p.lessonScores.reduce((s, ls) => s + (ls.codeAttempts || 0), 0), 0),
        scoreDistribution
      },
      recentUsers,
      topUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;



