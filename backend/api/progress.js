import express from 'express';
import UserProgress from '../models/UserProgress.js';
import Lesson from '../models/Lesson.js';
import Level from '../models/Level.js';
import QuizAssignment from '../models/QuizAssignment.js';
import QuizAssignmentResult from '../models/QuizAssignmentResult.js';
import { authenticate } from '../middleware/auth.js';
import { localizeData } from '../utils/i18n.js';
import Language from '../models/Language.js';

const resolveLocalizedString = (value, fallback = 'Unknown') => {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.en || value.vi || Object.values(value)[0] || fallback;
  }
  return fallback;
};

const router = express.Router();

// Public leaderboard by language
router.get('/leaderboard', async (req, res) => {
  try {
    const requestedLimit = parseInt(req.query.limit, 10);
    const limit = Math.min(Math.max(isNaN(requestedLimit) ? 5 : requestedLimit, 1), 20);

    const [languages, lessons, progresses] = await Promise.all([
      Language.find().select('name slug icon description').lean(),
      Lesson.find()
        .select('_id levelId')
        .populate({
          path: 'levelId',
          select: 'languageId',
        })
        .lean(),
      UserProgress.find()
        .select('userId lessonScores completedLessonIds totalStudyTime currentStreak updatedAt')
        .populate('userId', 'name email createdAt')
        .lean(),
    ]);

    const languageMap = new Map();
    languages.forEach((lang) => {
      languageMap.set(lang._id.toString(), lang);
    });

    const lessonLanguageMap = new Map();
    lessons.forEach((lesson) => {
      const level = lesson.levelId;
      const languageId =
        level?.languageId?._id?.toString() || level?.languageId?.toString();
      if (languageId) {
        lessonLanguageMap.set(lesson._id.toString(), languageId);
        if (
          typeof level?.languageId === 'object' &&
          level.languageId?._id &&
          !languageMap.has(languageId)
        ) {
          languageMap.set(languageId, level.languageId);
        }
      }
    });

    const leaderboardMap = new Map();

    progresses.forEach((progress) => {
      if (!progress.userId) return;

      const perLanguage = new Map();

      (progress.lessonScores || []).forEach((score) => {
        const lessonId =
          score.lessonId?._id?.toString() || score.lessonId?.toString();
        const languageId = lessonLanguageMap.get(lessonId);
        if (!languageId) return;

        if (!perLanguage.has(languageId)) {
          perLanguage.set(languageId, {
            totalScore: 0,
            lessonCount: 0,
            completedLessons: 0,
          });
        }

        const stats = perLanguage.get(languageId);
        const rawScore =
          typeof score.totalScore === 'number'
            ? score.totalScore
            : (score.quizScore || 0) + (score.codeScore || 0);
        stats.totalScore += rawScore;
        stats.lessonCount += 1;
      });

      (progress.completedLessonIds || []).forEach((lessonIdObj) => {
        const lessonId =
          lessonIdObj?._id?.toString() || lessonIdObj?.toString();
        const languageId = lessonLanguageMap.get(lessonId);
        if (!languageId) return;

        if (!perLanguage.has(languageId)) {
          perLanguage.set(languageId, {
            totalScore: 0,
            lessonCount: 0,
            completedLessons: 0,
          });
        }

        perLanguage.get(languageId).completedLessons += 1;
      });

      perLanguage.forEach((stats, languageId) => {
        if (stats.lessonCount === 0 && stats.completedLessons === 0) {
          return;
        }

        const learners = leaderboardMap.get(languageId) || [];
        const totalPoints = stats.totalScore / 2; // convert to 10-scale points
        const averageScore =
          stats.lessonCount > 0
            ? (stats.totalScore / stats.lessonCount) / 2
            : 0;

        learners.push({
          userId:
            progress.userId._id?.toString() || progress.userId?.toString(),
          name: progress.userId.name,
          email: progress.userId.email,
          totalPoints: Number(totalPoints.toFixed(2)),
          averageScore: Number(averageScore.toFixed(2)),
          lessonCount: stats.lessonCount,
          completedLessons: stats.completedLessons,
          currentStreak: progress.currentStreak || 0,
          totalStudyTime: progress.totalStudyTime || 0,
          lastUpdated: progress.updatedAt,
        });
        leaderboardMap.set(languageId, learners);
      });
    });

    const leaderboard = Array.from(leaderboardMap.entries())
      .map(([languageId, learners]) => {
        const languageInfo = languageMap.get(languageId) || {};
        const sortedLearners = learners
          .sort((a, b) => {
            if (b.averageScore === a.averageScore) {
              if (b.completedLessons === a.completedLessons) {
                return (b.totalPoints || 0) - (a.totalPoints || 0);
              }
              return (b.completedLessons || 0) - (a.completedLessons || 0);
            }
            return (b.averageScore || 0) - (a.averageScore || 0);
          })
          .slice(0, limit)
          .map((learner, index) => ({
            ...learner,
            rank: index + 1,
          }));

        return {
          languageId,
          languageName: resolveLocalizedString(languageInfo.name, 'Unknown'),
          languageSlug: resolveLocalizedString(languageInfo.slug, ''),
          languageIcon: resolveLocalizedString(languageInfo.icon, ''),
          totalLearners: learners.length,
          topLearners: sortedLearners,
        };
      })
      .filter((entry) => entry.topLearners.length > 0)
      .sort((a, b) => b.totalLearners - a.totalLearners);

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error generating leaderboard:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user progress
router.get('/', authenticate, async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    let progress = await UserProgress.findOne({ userId: req.user._id })
      .populate('completedLessonIds', 'title lessonNumber')
      .populate({
        path: 'lessonScores.lessonId',
        select: 'title lessonNumber levelId',
        populate: {
          path: 'levelId',
          select: 'title levelNumber languageId',
          populate: {
            path: 'languageId',
            select: 'name slug icon'
          }
        }
      })
      .populate({
        path: 'levelScores.levelId',
        populate: {
          path: 'languageId',
          select: 'name slug icon'
        }
      });

    if (!progress) {
      progress = await UserProgress.create({ userId: req.user._id });
    }

    // Localize progress data
    const progressObj = progress.toObject();
    const localizedProgress = localizeData(progressObj, lang);

    res.json({ success: true, progress: localizedProgress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit quiz score
router.post('/quiz/:lessonId', authenticate, async (req, res) => {
  try {
    const { quizScore, codeScore, sessionId } = req.body;
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    let progress = await UserProgress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = await UserProgress.create({ userId: req.user._id });
    }

    // Get quiz session tracking data if sessionId provided
    let quizTimeSpent = null;
    if (sessionId) {
      try {
        const QuizSessionTracking = (await import('../models/QuizSessionTracking.js')).default;
        const session = await QuizSessionTracking.findById(sessionId);
        if (session && session.activeDuration) {
          quizTimeSpent = session.activeDuration; // Time in milliseconds
        }
      } catch (error) {
        console.error('Error fetching quiz session:', error);
        // Continue without session data
      }
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
      
      // Update session tracking info
      if (sessionId) {
        progress.lessonScores[existingScoreIndex].quizSessionId = sessionId;
      }
      if (quizTimeSpent !== null) {
        progress.lessonScores[existingScoreIndex].quizTimeSpent = quizTimeSpent;
      }
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
        codeAttempts: codeScore !== undefined ? 1 : 0,
        quizSessionId: sessionId || null,
        quizTimeSpent: quizTimeSpent
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
          
          // Auto unlock next level if average >= 9
          if (averageScore >= 9 && !progress.levelScores[existingLevelScoreIndex].isUnlocked) {
            progress.levelScores[existingLevelScoreIndex].isUnlocked = true;
            progress.levelScores[existingLevelScoreIndex].unlockedBy = 'auto';
            progress.levelScores[existingLevelScoreIndex].unlockedAt = new Date();
          }
        } else {
          progress.levelScores.push({
            levelId: level._id,
            averageScore,
            isUnlocked: averageScore >= 9,
            unlockedBy: averageScore >= 9 ? 'auto' : null,
            unlockedAt: averageScore >= 9 ? new Date() : null
          });
        }
      }
    }

    await progress.save();

    // Localize progress data before returning
    const lang = req.query.lang || 'en';
    const progressObj = progress.toObject();
    const localizedProgress = localizeData(progressObj, lang);

    res.json({ success: true, progress: localizedProgress });
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
          
          if (averageScore >= 9 && !progress.levelScores[existingLevelScoreIndex].isUnlocked) {
            progress.levelScores[existingLevelScoreIndex].isUnlocked = true;
            progress.levelScores[existingLevelScoreIndex].unlockedBy = 'auto';
            progress.levelScores[existingLevelScoreIndex].unlockedAt = new Date();
          }
        } else {
          progress.levelScores.push({
            levelId: level._id,
            averageScore,
            isUnlocked: averageScore >= 9,
            unlockedBy: averageScore >= 9 ? 'auto' : null,
            unlockedAt: averageScore >= 9 ? new Date() : null
          });
        }
      }
    }

    await progress.save();

    // Localize progress data before returning
    const lang = req.query.lang || 'en';
    const progressObj = progress.toObject();
    const localizedProgress = localizeData(progressObj, lang);

    res.json({ success: true, progress: localizedProgress });
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

// Quiz Assignment endpoints for users

// Get user's quiz assignments
router.get('/quiz-assignments', authenticate, async (req, res) => {
  try {
    const assignments = await QuizAssignment.find({
      assignedTo: req.user._id,
      status: { $in: ['active', 'expired'] }
    })
      .populate('assignedBy', 'name email')
      .sort({ deadline: 1 });

    // Get user's results for each assignment
    const assignmentsWithResults = await Promise.all(
      assignments.map(async (assignment) => {
        const result = await QuizAssignmentResult.findOne({
          assignmentId: assignment._id,
          userId: req.user._id
        }).sort({ submittedAt: -1 });

        // If result exists and is abandoned, exclude from list or mark as abandoned
        if (result && result.status === 'abandoned') {
          return null; // Don't show abandoned assignments
        }

        const isExpired = new Date(assignment.deadline) < new Date();
        const isSubmitted = !!result && result.status === 'submitted';
        const isAbandoned = result && result.status === 'abandoned';

        return {
          ...assignment.toObject(),
          isExpired,
          isSubmitted,
          isAbandoned,
          userResult: result || null,
          canSubmit: !isSubmitted && !isAbandoned && !isExpired
        };
      })
    );

    // Filter out null assignments (abandoned)
    const filteredAssignments = assignmentsWithResults.filter(a => a !== null);

    res.json({ success: true, assignments: filteredAssignments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get quiz assignment by ID (for taking quiz)
router.get('/quiz-assignments/:id', authenticate, async (req, res) => {
  try {
    const assignment = await QuizAssignment.findById(req.params.id)
      .populate('assignedBy', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'Quiz assignment not found' });
    }

    // Check if user is assigned to this quiz
    const isAssigned = assignment.assignedTo.some(
      userId => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this quiz' });
    }

    // Get user's previous results
    const previousResults = await QuizAssignmentResult.find({
      assignmentId: assignment._id,
      userId: req.user._id
    }).sort({ submittedAt: -1 });

    const isExpired = new Date(assignment.deadline) < new Date();
    const latestResult = previousResults.length > 0 ? previousResults[0] : null;

    // Return assignment without correct answers if user hasn't submitted yet
    // Or if deadline has passed, show correct answers
    const assignmentData = {
      _id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      passingScore: assignment.passingScore,
      deadline: assignment.deadline,
      assignedBy: assignment.assignedBy,
      isExpired,
      canSubmit: !latestResult && !isExpired,
      previousResults,
      latestResult
    };

    // Include questions
    if (latestResult || isExpired) {
      // User already submitted or deadline passed - show questions with correct answers
      assignmentData.questions = assignment.questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));
    } else {
      // User hasn't submitted - show questions without correct answers
      assignmentData.questions = assignment.questions.map((q) => ({
        question: q.question,
        options: q.options
      }));
    }

    res.json({ success: true, assignment: assignmentData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit quiz assignment
router.post('/quiz-assignments/:id/submit', authenticate, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;

    const assignment = await QuizAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Quiz assignment not found' });
    }

    // Check if user is assigned to this quiz
    const isAssigned = assignment.assignedTo.some(
      userId => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this quiz' });
    }

    // Check if deadline has passed
    const isExpired = new Date(assignment.deadline) < new Date();
    if (isExpired) {
      return res.status(400).json({ message: 'Deadline has passed for this quiz' });
    }

    // Check if user already submitted
    const existingResult = await QuizAssignmentResult.findOne({
      assignmentId: assignment._id,
      userId: req.user._id
    }).sort({ submittedAt: -1 });

    if (existingResult) {
      return res.status(400).json({ message: 'You have already submitted this quiz' });
    }

    // Calculate score
    let correctCount = 0;
    const submittedAnswers = Array.isArray(answers) ? answers : [];

    // Ensure we have the same number of questions
    if (submittedAnswers.length !== assignment.questions.length) {
      console.warn(`Answer count mismatch: submitted ${submittedAnswers.length}, expected ${assignment.questions.length}`);
    }

    assignment.questions.forEach((question, index) => {
      const userAnswer = submittedAnswers[index];
      
      if (question.type === 'code') {
        // For code questions, check if code matches expected output
        // This is a simple check - in production, you might want more sophisticated validation
        const codeAnswer = userAnswer?.codeAnswer || '';
        const expectedOutput = question.expectedOutput || '';
        
        // Simple check: if code contains expected output or vice versa
        // In production, you'd want to actually execute and compare outputs
        if (codeAnswer && expectedOutput) {
          const codeLower = codeAnswer.toLowerCase().trim();
          const expectedLower = expectedOutput.toLowerCase().trim();
          
          // Check if code contains expected output or if they're similar
          if (codeLower.includes(expectedLower) || expectedLower.includes(codeLower)) {
            correctCount++;
          }
        }
      } else {
        // Multiple-choice question
        const correctAnswer = question.correctAnswer;
        
        // Only count as correct if:
        // 1. User provided an answer (not undefined, not null)
        // 2. Correct answer is defined
        // 3. They match exactly (using strict equality)
        if (
          userAnswer !== undefined && 
          userAnswer !== null &&
          correctAnswer !== undefined && 
          correctAnswer !== null &&
          Number(userAnswer) === Number(correctAnswer)
        ) {
          correctCount++;
        }
      }
    });

    const score = assignment.questions.length > 0 
      ? (correctCount / assignment.questions.length) * 10 
      : 0;
    const passed = score >= assignment.passingScore;

    // Get attempt number
    const attemptNumber = (await QuizAssignmentResult.countDocuments({
      assignmentId: assignment._id,
      userId: req.user._id
    })) + 1;

    // Create result
    const result = await QuizAssignmentResult.create({
      assignmentId: assignment._id,
      userId: req.user._id,
      answers: submittedAnswers.map((answer, index) => {
        const question = assignment.questions[index];
        if (question.type === 'code') {
          return {
            questionIndex: index,
            codeAnswer: answer?.codeAnswer || answer?.code || '',
            codeType: answer?.codeType || question.codeType
          };
        } else {
          return {
            questionIndex: index,
            selectedAnswer: answer?.selectedAnswer !== undefined ? answer.selectedAnswer : answer
          };
        }
      }),
      score,
      passingScore: assignment.passingScore,
      passed,
      timeTaken: timeTaken || 0,
      attemptNumber,
      status: 'submitted'
    });

    const populatedResult = await QuizAssignmentResult.findById(result._id)
      .populate('userId', 'name email')
      .populate('assignmentId', 'title');

    res.json({ success: true, result: populatedResult });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save code answer for a quiz assignment question (temporary, before final submission)
router.post('/quiz-assignments/:id/save-code-answer', authenticate, async (req, res) => {
  try {
    const { questionIndex, code, codeType } = req.body;

    const assignment = await QuizAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Quiz assignment not found' });
    }

    // Check if user is assigned to this quiz
    const isAssigned = assignment.assignedTo.some(
      userId => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this quiz' });
    }

    // Check if question exists and is a code question
    if (!assignment.questions[questionIndex]) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const question = assignment.questions[questionIndex];
    if (question.type !== 'code') {
      return res.status(400).json({ message: 'This is not a code question' });
    }

    // For now, just return success - in a full implementation, you might want to
    // store this temporarily in a separate collection or session
    res.json({ 
      success: true, 
      message: 'Code answer saved',
      questionIndex,
      codeType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Abandon quiz assignment
router.post('/quiz-assignments/:id/abandon', authenticate, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const assignment = await QuizAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Quiz assignment not found' });
    }

    // Check if user is assigned to this quiz
    const isAssigned = assignment.assignedTo.some(
      userId => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this quiz' });
    }

    // Check if user already submitted or abandoned
    const existingResult = await QuizAssignmentResult.findOne({
      assignmentId: assignment._id,
      userId: req.user._id
    }).sort({ submittedAt: -1 });

    if (existingResult) {
      // If already abandoned or submitted, just return success
      return res.json({ 
        success: true, 
        result: existingResult,
        message: existingResult.status === 'abandoned' 
          ? 'This quiz has already been abandoned' 
          : 'You have already submitted this quiz'
      });
    }

    // Get attempt number
    const attemptNumber = (await QuizAssignmentResult.countDocuments({
      assignmentId: assignment._id,
      userId: req.user._id
    })) + 1;

    // Create abandoned result with reason
    const result = await QuizAssignmentResult.create({
      assignmentId: assignment._id,
      userId: req.user._id,
      answers: [], // Empty answers
      score: 0,
      passingScore: assignment.passingScore,
      passed: false,
      timeTaken: 0,
      attemptNumber,
      status: 'abandoned',
      abandonReason: reason || 'unknown' // Store reason for admin reference
    });

    res.json({ 
      success: true, 
      result,
      message: reason === 'browser_leave' 
        ? 'Quiz abandoned: You left the browser. Please contact admin to retake.'
        : 'Quiz abandoned successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's quiz assignment results
router.get('/quiz-assignments/results', authenticate, async (req, res) => {
  try {
    // Only get submitted results, exclude abandoned ones
    const results = await QuizAssignmentResult.find({ 
      userId: req.user._id,
      status: 'submitted' // Only show submitted quizzes, not abandoned
    })
      .populate('assignmentId', 'title deadline passingScore')
      .sort({ submittedAt: -1 });

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;



