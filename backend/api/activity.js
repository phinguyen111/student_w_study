import express from 'express';
import UserActivityTracking from '../models/UserActivityTracking.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Track user activity (tab switch, page leave, etc.)
router.post('/track', authenticate, async (req, res) => {
  try {
    const { action, pageUrl, pageTitle, duration, metadata } = req.body;

    if (!action || !pageUrl) {
      return res.status(400).json({ message: 'Action and pageUrl are required' });
    }

    const activity = await UserActivityTracking.create({
      userId: req.user._id,
      action,
      pageUrl,
      pageTitle: pageTitle || '',
      duration: duration || 0,
      metadata: metadata || {},
      timestamp: new Date()
    });

    res.json({ success: true, activity });
  } catch (error) {
    console.error('Error tracking activity:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user activity logs (for admin or user viewing)
router.get('/logs', authenticate, async (req, res) => {
  try {
    const { limit = 100, startDate, endDate, action } = req.query;
    
    const query = { userId: req.user._id };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    if (action) {
      query.action = action;
    }

    const activities = await UserActivityTracking.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ success: true, activities, count: activities.length });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get activity statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { userId: req.user._id };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Count actions by type
    const actionStats = await UserActivityTracking.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get total time away (sum of tab_switch_away durations)
    const timeAway = await UserActivityTracking.aggregate([
      {
        $match: {
          ...query,
          action: { $in: ['tab_switch_away', 'window_blur', 'page_leave'] }
        }
      },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: '$duration' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      actionStats,
      totalTimeAway: timeAway.length > 0 ? timeAway[0].totalDuration : 0,
      totalAwayEvents: timeAway.length > 0 ? timeAway[0].count : 0
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

