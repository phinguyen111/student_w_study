// middleware/locals.js
module.exports = (app) => {
  app.use((req, res, next) => {
    // Biến cơ bản
    res.locals.user = req.user || null;
    res.locals.error = null;
    res.locals.success = null;
    
    // Helper functions
    res.locals.helpers = {
      // Format date
      formatDate: (date) => {
        return new Date(date).toLocaleDateString('vi-VN');
      },
      
      // Format currency
      formatCurrency: (amount) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(amount);
      },
      
      // Truncate text
      truncateText: (text, length = 100) => {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
      },
      
      // Escape HTML
      escapeHTML: (unsafe) => {
        if (!unsafe) return '';
        return String(unsafe)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }
    };
    
    next();
  });

  // Logging middleware
  app.use((req, res, next) => {
    console.log('Thời gian:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    next();
  });
};