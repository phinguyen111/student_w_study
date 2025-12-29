import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Lesson from '../models/Lesson.js';
import Level from '../models/Level.js';
import Language from '../models/Language.js';
import QuizAssignment from '../models/QuizAssignment.js';
import QuizAssignmentResult from '../models/QuizAssignmentResult.js';
import QuizSessionTracking from '../models/QuizSessionTracking.js';
import FileAssignment from '../models/FileAssignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { localizeData, extractLocalizedString } from '../utils/i18n.js';
import uploadFile from '../middleware/uploadFile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const lang = req.query.lang || 'en';
    const progress = await UserProgress.findOne({ userId: req.params.userId })
      .populate('completedLessonIds')
      .populate('lessonScores.lessonId')
      .populate({
        path: 'levelScores.levelId',
        populate: {
          path: 'languageId',
          select: 'name slug icon'
        }
      });
    
    if (!progress) {
      return res.json({ success: true, progress: null });
    }
    
    const progressObj = progress.toObject();
    const localizedProgress = localizeData(progressObj, lang);
    
    res.json({ success: true, progress: localizedProgress });
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

// Lock level for user (revoke access)
router.post('/users/:userId/lock-level/:levelId', async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ userId: req.params.userId });
    
    if (!progress) {
      return res.status(404).json({ message: 'User progress not found' });
    }

    const levelScoreIndex = progress.levelScores.findIndex(
      ls => ls.levelId.toString() === req.params.levelId
    );

    if (levelScoreIndex >= 0) {
      progress.levelScores[levelScoreIndex].isUnlocked = false;
      progress.levelScores[levelScoreIndex].unlockedBy = null;
      progress.levelScores[levelScoreIndex].unlockedAt = null;
      // Keep adminApproved flag to track that admin has interacted with this level
    } else {
      // If level score doesn't exist, create it as locked
      progress.levelScores.push({
        levelId: req.params.levelId,
        isUnlocked: false,
        unlockedBy: null,
        unlockedAt: null,
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
    const lang = req.query.lang || 'en';
    const lessons = await Lesson.find()
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

// Create lesson
router.post('/lessons', async (req, res) => {
  try {
    const { levelId, lessonNumber, title, content, codeExample, codeExercise, quiz } = req.body;
    
    const lesson = await Lesson.create({
      levelId,
      lessonNumber,
      title,
      content,
      codeExample,
      codeExercise,
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

// Get all levels
router.get('/levels', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const levels = await Level.find()
      .populate('languageId', 'name')
      .populate('lessons', 'title lessonNumber');
    
    // Transform levels to localized version
    const localizedLevels = levels.map(level => {
      const levelObj = level.toObject();
      return localizeData(levelObj, lang);
    });
    
    res.json({ success: true, levels: localizedLevels });
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

// Update user password
router.put('/users/:userId/password', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Please provide a new password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk create users
router.post('/users/bulk', async (req, res) => {
  try {
    const { users } = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of users' });
    }

    let created = 0;
    let failed = 0;
    const errors = [];

    for (const userData of users) {
      try {
        const { name, email, password } = userData;
        
        if (!name || !email || !password) {
          failed++;
          errors.push(`User ${email || 'unknown'}: Missing required fields`);
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          failed++;
          errors.push(`User ${email}: Already exists`);
          continue;
        }

        // Create user
        await User.create({ name, email, password });
        created++;
      } catch (error) {
        failed++;
        errors.push(`User ${userData.email || 'unknown'}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      created,
      failed,
      errors: errors.length > 0 ? errors : undefined
    });
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
    const { levelId, lessonNumber, title, content, codeExample, codeExercise, quiz } = req.body;
    
    // Debug log
    console.log('Updating lesson:', req.params.lessonId);
    console.log('levelId:', levelId);
    console.log('lessonNumber:', lessonNumber);
    console.log('codeExercise received:', JSON.stringify(codeExercise, null, 2));
    console.log('description type:', typeof codeExercise?.description);
    console.log('description value:', codeExercise?.description);
    
    // Build update object, only include fields that are provided
    const updateData = {};
    if (levelId !== undefined) updateData.levelId = levelId;
    if (lessonNumber !== undefined) updateData.lessonNumber = lessonNumber;
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (codeExample !== undefined) updateData.codeExample = codeExample;
    if (codeExercise !== undefined) updateData.codeExercise = codeExercise;
    if (quiz !== undefined) updateData.quiz = quiz;
    
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.lessonId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    console.log('Lesson updated successfully. LevelId:', lesson.levelId, 'LessonNumber:', lesson.lessonNumber);
    console.log('Description:', lesson.codeExercise?.description);
    
    res.json({ success: true, lesson });
  } catch (error) {
    console.error('Error updating lesson:', error);
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

// Get detailed activity log - all sessions with full details
router.get('/activity-log', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const { limit = 100, skip = 0, userId, quizType } = req.query;
    
    // Build query
    const query = {};
    if (userId) query.userId = userId;
    if (quizType) query.quizType = quizType;
    
    // Get all sessions with full details
    const sessions = await QuizSessionTracking.find(query)
      .populate('userId', 'name email')
      .populate('assignmentId', 'title')
      .populate('lessonId', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Format sessions with detailed activity timeline
    const detailedSessions = sessions.map(session => {
      // Create activity timeline from tabSwitches
      const activityTimeline = [];
      
      // Get our domain for comparison
      const ourDomain = process.env.FRONTEND_URL 
        ? new URL(process.env.FRONTEND_URL.split(',')[0]).hostname.replace('www.', '').toLowerCase()
        : 'localhost:3000';
      
      if (session.tabSwitches && session.tabSwitches.length > 0) {
        session.tabSwitches.forEach(switchEvent => {
          let domain = 'unknown';
          let isExternal = false;
          
          try {
            // First check if isExternal is already stored in the event
            if (switchEvent.isExternal !== undefined) {
              isExternal = switchEvent.isExternal;
            }
            
            // Extract domain from URL or use stored domain
            if (switchEvent.url) {
              const urlObj = new URL(switchEvent.url);
              domain = urlObj.hostname.replace('www.', '').toLowerCase();
            } else if (switchEvent.domain) {
              domain = switchEvent.domain.toLowerCase();
            }
            
            // If isExternal not set, determine it from domain
            if (switchEvent.isExternal === undefined && domain) {
              isExternal = !domain.includes(ourDomain) && 
                          !domain.includes('localhost') && 
                          !domain.includes('127.0.0.1') &&
                          domain !== 'unknown';
            }
          } catch (e) {
            // If URL parsing fails, try to extract from switchEvent data
            if (switchEvent.domain) {
              domain = switchEvent.domain.toLowerCase();
              if (switchEvent.isExternal === undefined) {
                isExternal = !domain.includes(ourDomain) && 
                            !domain.includes('localhost') && 
                            !domain.includes('127.0.0.1');
              } else {
                isExternal = switchEvent.isExternal;
              }
            }
            if (switchEvent.isExternal !== undefined) {
              isExternal = switchEvent.isExternal;
            }
          }
          
          // Extract route/path from URL
          let route = '';
          try {
            if (switchEvent.url) {
              const urlObj = new URL(switchEvent.url);
              route = urlObj.pathname + urlObj.search + urlObj.hash;
            }
          } catch (e) {
            // If URL parsing fails, try to extract path manually
            if (switchEvent.url && switchEvent.url.includes('/')) {
              const urlParts = switchEvent.url.split('/');
              if (urlParts.length > 3) {
                route = '/' + urlParts.slice(3).join('/');
              }
            }
          }
          
          activityTimeline.push({
            type: 'tab_switch',
            action: switchEvent.action,
            url: switchEvent.url || '',
            domain: domain,
            route: route,
            title: switchEvent.title || '',
            timestamp: switchEvent.timestamp,
            duration: switchEvent.duration || 0,
            durationSeconds: Math.round((switchEvent.duration || 0) / 1000),
            durationMinutes: ((switchEvent.duration || 0) / 60000).toFixed(2),
            isExternal: isExternal,
            isSuspicious: switchEvent.isSuspicious || false
          });
        });
      }
      
      // Add suspicious activities to timeline
      if (session.suspiciousActivities && session.suspiciousActivities.length > 0) {
        session.suspiciousActivities.forEach(activity => {
          activityTimeline.push({
            type: 'suspicious_activity',
            activityType: activity.type,
            description: activity.description || '',
            timestamp: activity.timestamp,
            metadata: activity.metadata || {}
          });
        });
      }
      
      // Sort timeline by timestamp
      activityTimeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Localize session data
      const sessionObj = session.toObject();
      const localizedSession = localizeData(sessionObj, lang);
      
      // Extract quiz title from localized nested objects
      const quizTitle = extractLocalizedString(
        localizedSession.assignmentId?.title || localizedSession.lessonId?.title, 
        lang
      ) || 'Unknown';
      
      return {
        ...localizedSession,
        _id: session._id,
        quizType: session.quizType,
        quizTitle: quizTitle,
        startTime: session.startTime,
        submitTime: session.submitTime,
        endTime: session.endTime,
        totalDuration: session.totalDuration,
        activeDuration: session.activeDuration,
        awayDuration: session.awayDuration,
        totalDurationMinutes: (session.totalDuration / 60000).toFixed(2),
        activeDurationMinutes: (session.activeDuration / 60000).toFixed(2),
        awayDurationMinutes: (session.awayDuration / 60000).toFixed(2),
        tabSwitchCount: session.tabSwitchCount || 0,
        windowBlurCount: session.windowBlurCount || 0,
        visibilityChangeCount: session.visibilityChangeCount || 0,
        visitedDomains: session.visitedDomains || [],
        suspiciousActivities: session.suspiciousActivities || [],
        suspiciousCount: session.suspiciousActivities?.length || 0,
        hasSuspiciousActivity: (session.suspiciousActivities?.length || 0) > 0,
        hasExternalVisits: (session.visitedDomains?.length || 0) > 0,
        activityTimeline: activityTimeline,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      };
    });

    res.json({
      success: true,
      sessions: detailedSessions,
      total: await QuizSessionTracking.countDocuments(query)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete activity log session
router.delete('/activity-log/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await QuizSessionTracking.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    await QuizSessionTracking.findByIdAndDelete(sessionId);
    
    res.json({ success: true, message: 'Activity log session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tracking statistics
router.get('/tracking-stats', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    // Get all quiz sessions
    const allSessions = await QuizSessionTracking.find()
      .populate('userId', 'name email')
      .populate('assignmentId', 'title')
      .populate('lessonId', 'title');
    
    // Localize sessions
    const localizedSessions = allSessions.map(session => {
      const sessionObj = session.toObject();
      return localizeData(sessionObj, lang);
    });

    // Calculate statistics using localized sessions
    const totalSessions = localizedSessions.length;
    const activeSessions = localizedSessions.filter(s => s.isActive).length;
    
    // Sessions with external visits
    const sessionsWithExternalVisits = localizedSessions.filter(s => 
      s.visitedDomains && s.visitedDomains.length > 0
    );
    
    // Sessions with suspicious activities
    const sessionsWithSuspicious = localizedSessions.filter(s => 
      s.suspiciousActivities && s.suspiciousActivities.length > 0
    );
    
    // Calculate total external time
    const totalExternalTime = localizedSessions.reduce((sum, s) => {
      if (s.visitedDomains && s.visitedDomains.length > 0) {
        return sum + s.visitedDomains.reduce((domainSum, domain) => 
          domainSum + (domain.totalDuration || 0), 0
        );
      }
      return sum;
    }, 0);
    
    // Calculate total tab switches
    const totalTabSwitches = localizedSessions.reduce((sum, s) => 
      sum + (s.tabSwitchCount || 0), 0
    );
    
    // Calculate total window blurs
    const totalWindowBlurs = localizedSessions.reduce((sum, s) => 
      sum + (s.windowBlurCount || 0), 0
    );
    
    // Most visited external domains
    const domainMap = new Map();
    localizedSessions.forEach(session => {
      if (session.visitedDomains) {
        session.visitedDomains.forEach(domain => {
          const existing = domainMap.get(domain.domain) || { count: 0, totalDuration: 0 };
          domainMap.set(domain.domain, {
            count: existing.count + (domain.count || 0),
            totalDuration: existing.totalDuration + (domain.totalDuration || 0)
          });
        });
      }
    });
    
    const topDomains = Array.from(domainMap.entries())
      .map(([domain, data]) => ({
        domain,
        count: data.count,
        totalDuration: data.totalDuration,
        totalDurationMinutes: (data.totalDuration / 60000).toFixed(2)
      }))
      .sort((a, b) => b.totalDuration - a.totalDuration)
      .slice(0, 10);
    
    // Suspicious activity types
    const suspiciousActivityTypes = {
      rapid_tab_switch: 0,
      long_away_time: 0,
      multiple_blur: 0,
      unusual_pattern: 0
    };
    
    localizedSessions.forEach(session => {
      if (session.suspiciousActivities) {
        session.suspiciousActivities.forEach(activity => {
          if (suspiciousActivityTypes.hasOwnProperty(activity.type)) {
            suspiciousActivityTypes[activity.type]++;
          }
        });
      }
    });
    
    // Recent suspicious sessions (last 10)
    const recentSuspiciousSessions = localizedSessions
      .filter(s => s.suspiciousActivities && s.suspiciousActivities.length > 0)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(s => {
        // Extract quiz title from localized nested objects
        const quizTitle = extractLocalizedString(
          s.assignmentId?.title || s.lessonId?.title, 
          lang
        ) || 'Unknown';
        
        return {
          _id: s._id,
          userId: s.userId,
          assignmentId: s.assignmentId,
          lessonId: s.lessonId,
          quizType: s.quizType,
          quizTitle: quizTitle,
          suspiciousCount: s.suspiciousActivities.length,
          externalVisitsCount: s.visitedDomains?.length || 0,
          tabSwitchCount: s.tabSwitchCount || 0,
          createdAt: s.createdAt
        };
      });
    
    res.json({
      success: true,
      stats: {
        totalSessions,
        activeSessions,
        sessionsWithExternalVisits: sessionsWithExternalVisits.length,
        sessionsWithSuspicious: sessionsWithSuspicious.length,
        totalExternalTime,
        totalExternalTimeMinutes: (totalExternalTime / 60000).toFixed(2),
        totalTabSwitches,
        totalWindowBlurs,
        topDomains,
        suspiciousActivityTypes,
        recentSuspiciousSessions
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
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
    
    // Localize progress data
    const localizedProgress = allProgress.map(progress => {
      const progressObj = progress.toObject();
      return localizeData(progressObj, lang);
    });
    
    // Calculate score statistics
    let totalQuizScores = 0;
    let totalCodeScores = 0;
    let quizCount = 0;
    let codeCount = 0;
    let totalScores = 0;
    let scoreCount = 0;
    
    const userStats = [];
    
    localizedProgress.forEach(progress => {
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
    const grandTotalScore = localizedProgress.reduce((sum, p) => {
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
    
    localizedProgress.forEach(progress => {
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
        totalQuizAttempts: localizedProgress.reduce((sum, p) => 
          sum + p.lessonScores.reduce((s, ls) => s + (ls.quizAttempts || 0), 0), 0),
        totalCodeAttempts: localizedProgress.reduce((sum, p) => 
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

// Quiz Assignment Management

// Create quiz assignment
router.post('/quiz-assignments', async (req, res) => {
  try {
    const { title, description, questions, passingScore, assignedTo, deadline } = req.body;

    if (!title || !questions || !assignedTo || !deadline) {
      return res.status(400).json({ message: 'Title, questions, assignedTo, and deadline are required' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions must be a non-empty array' });
    }

    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({ message: 'assignedTo must be a non-empty array' });
    }

    // Validate each question based on type
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.type || !['multiple-choice', 'code'].includes(q.type)) {
        return res.status(400).json({ message: `Question ${i + 1}: type must be 'multiple-choice' or 'code'` });
      }
      
      if (q.type === 'multiple-choice') {
        if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
          return res.status(400).json({ message: `Question ${i + 1}: options are required for multiple-choice questions` });
        }
        if (q.correctAnswer === undefined || q.correctAnswer === null) {
          return res.status(400).json({ message: `Question ${i + 1}: correctAnswer is required for multiple-choice questions` });
        }
        if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
          return res.status(400).json({ message: `Question ${i + 1}: correctAnswer must be a valid option index` });
        }
      } else if (q.type === 'code') {
        if (!q.codeType || !['html', 'css', 'javascript', 'html-css-js'].includes(q.codeType)) {
          return res.status(400).json({ message: `Question ${i + 1}: codeType is required for code questions` });
        }
        if (!q.starterCode) {
          return res.status(400).json({ message: `Question ${i + 1}: starterCode is required for code questions` });
        }
        if (!q.expectedOutput) {
          return res.status(400).json({ message: `Question ${i + 1}: expectedOutput is required for code questions` });
        }
      }
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ message: 'Invalid deadline date' });
    }

    // Normalize questions - remove correctAnswer for code questions, remove code fields for multiple-choice
    const normalizedQuestions = questions.map(q => {
      if (q.type === 'code') {
        const { correctAnswer, options, ...codeQuestion } = q;
        return codeQuestion;
      } else {
        const { codeType, starterCode, expectedOutput, ...multipleChoiceQuestion } = q;
        return multipleChoiceQuestion;
      }
    });

    const assignment = await QuizAssignment.create({
      title,
      description: description || '',
      questions: normalizedQuestions,
      passingScore: passingScore || 7,
      assignedBy: req.user._id,
      assignedTo,
      deadline: deadlineDate
    });

    const populatedAssignment = await QuizAssignment.findById(assignment._id)
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json({ success: true, assignment: populatedAssignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all quiz assignments
router.get('/quiz-assignments', async (req, res) => {
  try {
    const assignments = await QuizAssignment.find()
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    // Get results count for each assignment
    const assignmentsWithStats = await Promise.all(
      assignments.map(async (assignment) => {
        const results = await QuizAssignmentResult.find({ assignmentId: assignment._id });
        const submittedCount = results.length;
        const passedCount = results.filter(r => r.passed).length;
        
        return {
          ...assignment.toObject(),
          submittedCount,
          passedCount,
          totalAssigned: assignment.assignedTo.length
        };
      })
    );

    res.json({ success: true, assignments: assignmentsWithStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get quiz assignment by ID
router.get('/quiz-assignments/:id', async (req, res) => {
  try {
    const assignment = await QuizAssignment.findById(req.params.id)
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'Quiz assignment not found' });
    }

    // Get results for this assignment
    const results = await QuizAssignmentResult.find({ assignmentId: assignment._id })
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 });

    res.json({ success: true, assignment, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update quiz assignment
router.put('/quiz-assignments/:id', async (req, res) => {
  try {
    const { title, description, questions, passingScore, assignedTo, deadline, status } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (questions) updateData.questions = questions;
    if (passingScore !== undefined) updateData.passingScore = passingScore;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return res.status(400).json({ message: 'Invalid deadline date' });
      }
      updateData.deadline = deadlineDate;
    }
    if (status) updateData.status = status;

    const assignment = await QuizAssignment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'Quiz assignment not found' });
    }

    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete quiz assignment
router.delete('/quiz-assignments/:id', async (req, res) => {
  try {
    const assignment = await QuizAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Quiz assignment not found' });
    }

    // Delete all results for this assignment
    await QuizAssignmentResult.deleteMany({ assignmentId: assignment._id });

    // Delete assignment
    await QuizAssignment.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Quiz assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tracking sessions for a quiz assignment
router.get('/quiz-assignments/:id/tracking', async (req, res) => {
  try {
    const assignment = await QuizAssignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Quiz assignment not found' });
    }

    // Get all tracking sessions for this assignment
    const sessions = await QuizSessionTracking.find({
      assignmentId: assignment._id,
      quizType: 'assignment'
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Format sessions with external visits summary
    const sessionsWithDetails = sessions.map(session => {
      const externalVisits = session.visitedDomains || [];
      const suspiciousCount = session.suspiciousActivities?.length || 0;
      const totalExternalTime = externalVisits.reduce((sum, visit) => sum + (visit.totalDuration || 0), 0);
      
      return {
        _id: session._id,
        userId: session.userId,
        startTime: session.startTime,
        submitTime: session.submitTime,
        endTime: session.endTime,
        totalDuration: session.totalDuration,
        activeDuration: session.activeDuration,
        awayDuration: session.awayDuration,
        tabSwitchCount: session.tabSwitchCount,
        windowBlurCount: session.windowBlurCount,
        externalVisits: externalVisits.map(visit => ({
          domain: visit.domain,
          count: visit.count,
          totalDuration: visit.totalDuration,
          totalDurationSeconds: Math.round(visit.totalDuration / 1000),
          totalDurationMinutes: (visit.totalDuration / 60000).toFixed(2),
          firstVisit: visit.firstVisit,
          lastVisit: visit.lastVisit
        })),
        suspiciousActivities: session.suspiciousActivities || [],
        suspiciousCount,
        hasSuspiciousActivity: suspiciousCount > 0,
        hasExternalVisits: externalVisits.length > 0,
        totalExternalTime,
        totalExternalTimeSeconds: Math.round(totalExternalTime / 1000),
        totalExternalTimeMinutes: (totalExternalTime / 60000).toFixed(2)
      };
    });

    res.json({ success: true, sessions: sessionsWithDetails });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get quiz assignment results
router.get('/quiz-assignments/:id/results', async (req, res) => {
  try {
    const assignment = await QuizAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Quiz assignment not found' });
    }

    const results = await QuizAssignmentResult.find({ assignmentId: assignment._id })
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 });

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// File Assignment Management

// Create file assignment
router.post('/file-assignments', uploadFile.single('file'), async (req, res) => {
  try {
    const { title, description, assignedTo, deadline } = req.body;

    if (!title || !req.file || !assignedTo || !deadline) {
      return res.status(400).json({ message: 'Title, file, assignedTo, and deadline are required' });
    }

    let assignedToArray;
    try {
      assignedToArray = JSON.parse(assignedTo);
    } catch (e) {
      assignedToArray = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    }

    if (!Array.isArray(assignedToArray) || assignedToArray.length === 0) {
      return res.status(400).json({ message: 'assignedTo must be a non-empty array' });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ message: 'Invalid deadline date' });
    }

    // Upload file to R2
    let fileUrl = '';
    let fileKey = '';

    if (req.file) {
      try {
        const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

        // Log R2 envs for debugging (non-sensitive values only)
        console.log('R2 upload - env', {
          endpointSet: !!process.env.R2_ENDPOINT,
          bucket: process.env.R2_BUCKET || null,
          region: process.env.R2_REGION || null
        });

        const s3Client = new S3Client({
          region: process.env.R2_REGION || 'auto',
          endpoint: process.env.R2_ENDPOINT,
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
          },
        });

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = req.file.originalname.split('.').pop();
        const name = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]*$/, '');
        fileKey = `assignments/${name}-${uniqueSuffix}.${ext}`;

        const uploadParams = {
          Bucket: process.env.R2_BUCKET,
          Key: fileKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        console.log('R2 upload - sending PutObject', { Key: fileKey, Bucket: process.env.R2_BUCKET });

        const { PutObjectCommand: POC } = await import('@aws-sdk/client-s3');
        await s3Client.send(new POC(uploadParams));

        fileUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${fileKey}`;
      } catch (uploadError) {
        console.error('R2 upload error full:', uploadError);
        // Return detailed error to help debugging on Vercel logs
        return res.status(500).json({
          message: 'Failed to upload file to R2',
          error: uploadError && uploadError.message ? uploadError.message : String(uploadError),
          stack: process.env.NODE_ENV === 'development' && uploadError && uploadError.stack ? uploadError.stack : undefined
        });
      }
    }

    const assignment = await FileAssignment.create({
      title,
      description: description || '',
      fileUrl: fileUrl,
      fileKey: fileKey,
      fileName: req.file.originalname,
      assignedBy: req.user._id,
      assignedTo: assignedToArray,
      deadline: deadlineDate
    });

    const populatedAssignment = await FileAssignment.findById(assignment._id)
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json({ success: true, assignment: populatedAssignment });
  } catch (error) {
    console.error('Error creating file assignment:', error);
    res.status(500).json({ message: error.message || 'Error creating file assignment' });
  }
});

// Get all file assignments
router.get('/file-assignments', async (req, res) => {
  try {
    const assignments = await FileAssignment.find()
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    // Get submissions count for each assignment
    const assignmentsWithStats = await Promise.all(
      assignments.map(async (assignment) => {
        const submissions = await AssignmentSubmission.find({ assignmentId: assignment._id });
        const submittedCount = submissions.length;
        
        return {
          ...assignment.toObject(),
          submittedCount,
          totalAssigned: assignment.assignedTo.length
        };
      })
    );

    res.json({ success: true, assignments: assignmentsWithStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get file assignment by ID
router.get('/file-assignments/:id', async (req, res) => {
  try {
    const assignment = await FileAssignment.findById(req.params.id)
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'File assignment not found' });
    }

    // Get submissions for this assignment
    const submissions = await AssignmentSubmission.find({ assignmentId: assignment._id })
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 });

    res.json({ success: true, assignment, submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Grade file assignment submission
router.put('/file-assignments/:assignmentId/submissions/:submissionId/grade', async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { score, feedback } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({ message: 'Score is required' });
    }

    if (score < 0 || score > 10) {
      return res.status(400).json({ message: 'Score must be between 0 and 10' });
    }

    const submission = await AssignmentSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.assignmentId.toString() !== assignmentId) {
      return res.status(400).json({ message: 'Submission does not belong to this assignment' });
    }

    submission.score = score;
    submission.feedback = feedback || '';
    submission.status = 'reviewed';
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();

    await submission.save();

    const populatedSubmission = await AssignmentSubmission.findById(submission._id)
      .populate('userId', 'name email')
      .populate('gradedBy', 'name email');

    res.json({ success: true, submission: populatedSubmission });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete file assignment
router.delete('/file-assignments/:id', async (req, res) => {
  try {
    const assignment = await FileAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'File assignment not found' });
    }

    // Delete all submissions for this assignment
    const submissions = await AssignmentSubmission.find({ assignmentId: assignment._id });
    
    // Delete submission files
    for (const submission of submissions) {
      if (submission.fileUrl && submission.fileUrl.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', 'public', submission.fileUrl);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error('Error deleting submission file:', err);
        }
      }
    }
    
    await AssignmentSubmission.deleteMany({ assignmentId: assignment._id });

    // Delete assignment file
    if (assignment.fileUrl && assignment.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', 'public', assignment.fileUrl);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error('Error deleting assignment file:', err);
      }
    }

    // Delete assignment
    await FileAssignment.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'File assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;




