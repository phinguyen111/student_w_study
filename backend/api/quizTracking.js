import express from 'express';
import QuizSessionTracking from '../models/QuizSessionTracking.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Start quiz session tracking
router.post('/start', authenticate, async (req, res) => {
  try {
    const { assignmentId, lessonId, quizType } = req.body;

    if (!quizType || !['assignment', 'lesson'].includes(quizType)) {
      return res.status(400).json({ message: 'quizType is required and must be assignment or lesson' });
    }

    if (quizType === 'assignment' && !assignmentId) {
      return res.status(400).json({ message: 'assignmentId is required for assignment quiz' });
    }

    if (quizType === 'lesson' && !lessonId) {
      return res.status(400).json({ message: 'lessonId is required for lesson quiz' });
    }

    // Close any active session for this quiz
    await QuizSessionTracking.updateMany(
      {
        userId: req.user._id,
        [quizType === 'assignment' ? 'assignmentId' : 'lessonId']: 
          quizType === 'assignment' ? assignmentId : lessonId,
        isActive: true
      },
      { 
        isActive: false,
        endTime: new Date()
      }
    );

    // Create new tracking session
    const session = await QuizSessionTracking.create({
      userId: req.user._id,
      assignmentId: quizType === 'assignment' ? assignmentId : null,
      lessonId: quizType === 'lesson' ? lessonId : null,
      quizType,
      startTime: new Date(),
      isActive: true
    });

    res.json({ success: true, sessionId: session._id, session });
  } catch (error) {
    console.error('Error starting quiz session:', error);
    res.status(500).json({ message: error.message });
  }
});

// Track tab switch or visibility change
router.post('/track-event', authenticate, async (req, res) => {
  try {
    const { sessionId, action, url, title, timestamp, currentUrl } = req.body;

    if (!sessionId || !action) {
      return res.status(400).json({ message: 'sessionId and action are required' });
    }

    const session = await QuizSessionTracking.findOne({
      _id: sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ message: 'Active quiz session not found' });
    }

    const eventTimestamp = timestamp ? new Date(timestamp) : new Date();
    const lastEvent = session.tabSwitches.length > 0 
      ? session.tabSwitches[session.tabSwitches.length - 1] 
      : null;

    // Calculate duration since last event
    let duration = 0;
    if (lastEvent) {
      duration = eventTimestamp.getTime() - new Date(lastEvent.timestamp).getTime();
    }

    // Extract domain from URL
    let domain = '';
    let pageInfo = {
      domain: '',
      pageTitle: title || '',
      isExternal: false,
      isSuspicious: false
    };

    try {
      if (url || currentUrl) {
        const urlToCheck = url || currentUrl;
        const urlObj = new URL(urlToCheck);
        domain = urlObj.hostname.replace('www.', '').toLowerCase();
        pageInfo.domain = domain;
        
        // Detect if external (not our domain)
        const ourDomains = [
          'localhost:3000',
          'localhost',
          '127.0.0.1',
          'codecatalyst.vercel.app',
          'code-catalyst-sigma.vercel.app'
        ];
        
        // Add FRONTEND_URL domains if available
        if (process.env.FRONTEND_URL) {
          process.env.FRONTEND_URL.split(',').forEach(url => {
            try {
              const urlObj = new URL(url.trim())
              ourDomains.push(urlObj.hostname.replace('www.', ''))
            } catch (e) {
              // Invalid URL, ignore
            }
          })
        }
        
        // Check if domain is external
        pageInfo.isExternal = !ourDomains.some(ourDomain => 
          domain.includes(ourDomain) || ourDomain.includes(domain)
        );
        
        // Detect suspicious/cheating websites
        const suspiciousDomains = [
          'chatgpt.com', 'chat.openai.com', 'openai.com',
          'facebook.com', 'fb.com', 'messenger.com',
          'google.com', 'docs.google.com', 'translate.google.com',
          'stackoverflow.com', 'github.com', 'w3schools.com',
          'youtube.com', 'youtu.be',
          'discord.com', 'slack.com',
          'reddit.com'
        ];
        
        pageInfo.isSuspicious = suspiciousDomains.some(susp => 
          domain.includes(susp)
        );
      }
    } catch (e) {
      domain = url || currentUrl || '';
      pageInfo.domain = domain;
    }

    // If title contains certain keywords, flag as suspicious
    if (title) {
      const titleLower = title.toLowerCase();
      const suspiciousKeywords = ['chatgpt', 'openai', 'facebook', 'messenger', 'google translate', 'stack overflow'];
      if (suspiciousKeywords.some(keyword => titleLower.includes(keyword))) {
        pageInfo.isSuspicious = true;
      }
    }

    // Extract route from URL if external
    let route = ''
    if (pageInfo.isExternal && (url || currentUrl)) {
      try {
        const urlToCheck = url || currentUrl
        const urlObj = new URL(urlToCheck)
        route = urlObj.pathname + urlObj.search
      } catch (e) {
        // Invalid URL, ignore
      }
    }

    // Add tab switch event with page info
    const tabSwitchEvent = {
      url: url || currentUrl || '',
      title: title || '',
      timestamp: eventTimestamp,
      duration: duration > 0 ? duration : 0,
      action,
      domain: pageInfo.domain,
      isExternal: pageInfo.isExternal,
      isSuspicious: pageInfo.isSuspicious,
      route: route || '',
      pageInfo
    };

    session.tabSwitches.push(tabSwitchEvent);

    // Update counters
    if (action === 'switch_away' || action === 'switch_back') {
      session.tabSwitchCount += 1;
      session.visibilityChangeCount += 1;
    } else if (action === 'window_blur' || action === 'window_focus') {
      session.windowBlurCount += 1;
    }

    // If switched away, add to away duration
    if (action === 'switch_away' || action === 'window_blur') {
      if (lastEvent && (lastEvent.action === 'switch_back' || lastEvent.action === 'window_focus')) {
        session.awayDuration += duration;
      }
    }

    // Update visited domain tracking (only for external domains)
    if (pageInfo.domain && pageInfo.isExternal && url && (action === 'switch_away' || action === 'window_blur')) {
      session.updateVisitedDomain(pageInfo.domain, duration);
      
      // If suspicious domain, add to suspicious activities
      if (pageInfo.isSuspicious) {
        session.suspiciousActivities.push({
          type: 'unusual_pattern',
          timestamp: eventTimestamp,
          description: `Visited suspicious website during quiz: ${pageInfo.domain}`,
          metadata: { 
            domain: pageInfo.domain,
            url: url || currentUrl || '',
            title: title || '',
            duration 
          }
        });
      }
    }

    // Detect suspicious activities
    if (session.tabSwitches.length > 1) {
      const recentSwitches = session.tabSwitches.slice(-5);
      // Rapid tab switching (more than 5 switches in 30 seconds)
      const timeSpan = recentSwitches[recentSwitches.length - 1].timestamp - recentSwitches[0].timestamp;
      if (recentSwitches.length >= 5 && timeSpan < 30000) {
        session.suspiciousActivities.push({
          type: 'rapid_tab_switch',
          timestamp: eventTimestamp,
          description: `Rapid tab switching detected: ${recentSwitches.length} switches in ${timeSpan}ms`,
          metadata: { switchCount: recentSwitches.length, timeSpan }
        });
      }

      // Long away time (more than 5 minutes)
      if (action === 'switch_away' && duration > 300000) {
        session.suspiciousActivities.push({
          type: 'long_away_time',
          timestamp: eventTimestamp,
          description: `Long away time detected: ${Math.round(duration / 60000)} minutes`,
          metadata: { 
            duration, 
            domain: pageInfo.domain,
            url: url || currentUrl || '',
            isSuspicious: pageInfo.isSuspicious
          }
        });
      }

      // Multiple blur events (user keeps leaving and coming back)
      if (session.windowBlurCount > 10) {
        session.suspiciousActivities.push({
          type: 'multiple_blur',
          timestamp: eventTimestamp,
          description: `Multiple window blur events detected: ${session.windowBlurCount} times`,
          metadata: { blurCount: session.windowBlurCount }
        });
      }
    }

    await session.save();

    res.json({ success: true, session });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ message: error.message });
  }
});

// End quiz session and calculate final durations
router.post('/end', authenticate, async (req, res) => {
  try {
    const { sessionId, submitTime } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    const session = await QuizSessionTracking.findOne({
      _id: sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ message: 'Active quiz session not found' });
    }

    const endTime = submitTime ? new Date(submitTime) : new Date();
    const startTime = new Date(session.startTime);
    
    // Calculate total duration
    session.totalDuration = endTime.getTime() - startTime.getTime();
    
    // Calculate active duration (total - away)
    session.activeDuration = Math.max(0, session.totalDuration - session.awayDuration);
    
    session.submitTime = submitTime ? new Date(submitTime) : new Date();
    session.endTime = endTime;
    session.isActive = false;

    // Process last event if any
    if (session.tabSwitches.length > 0) {
      const lastEvent = session.tabSwitches[session.tabSwitches.length - 1];
      const lastEventTime = new Date(lastEvent.timestamp);
      
      // If last event was away, add remaining time to away duration
      if (lastEvent.action === 'switch_away' || lastEvent.action === 'window_blur') {
        const remainingTime = endTime.getTime() - lastEventTime.getTime();
        session.awayDuration += remainingTime;
        session.activeDuration = Math.max(0, session.totalDuration - session.awayDuration);
      }
    }

    await session.save();

    res.json({ success: true, session });
  } catch (error) {
    console.error('Error ending quiz session:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get quiz session tracking data
router.get('/session/:sessionId', authenticate, async (req, res) => {
  try {
    const session = await QuizSessionTracking.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Quiz session not found' });
    }

    res.json({ success: true, session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all quiz sessions for user (admin or self)
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const { assignmentId, lessonId, quizType, userId } = req.query;

    const query = {};
    
    // Admin can view any user's sessions, regular users can only view their own
    if (req.user.role === 'admin' && userId) {
      query.userId = userId;
    } else {
      query.userId = req.user._id;
    }

    if (assignmentId) query.assignmentId = assignmentId;
    if (lessonId) query.lessonId = lessonId;
    if (quizType) query.quizType = quizType;

    const sessions = await QuizSessionTracking.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'name email')
      .populate('assignmentId', 'title')
      .populate('lessonId', 'title');

    res.json({ success: true, sessions, count: sessions.length });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

