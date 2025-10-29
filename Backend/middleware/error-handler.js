// API trả JSON, Web (nếu có) mới render EJS
module.exports = (app) => {
  // 404
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not Found', path: req.path });
    }
    try {
      return res.status(404).render('errors/404', {
        title: 'Không tìm thấy trang',
        message: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.'
      });
    } catch {
      return res.status(404).json({ error: 'Not Found' });
    }
  });

  // 500
  app.use((err, req, res, next) => {
    console.error('Unhandled:', err);
    const isDev = process.env.NODE_ENV === 'development';
    if (req.path.startsWith('/api')) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: isDev ? String(err?.message || err) : 'Đã xảy ra lỗi.'
      });
    }
    try {
      return res.status(500).render('errors/500', {
        title: 'Lỗi máy chủ',
        message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
        error: isDev ? err : {}
      });
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};
