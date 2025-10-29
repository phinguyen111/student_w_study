const helmet = require('helmet');
const cors = require('cors');
// const xss = require('xss-clean');
const sanitize = require('./sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

module.exports = (app) =>{
   app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://student-swin-study.vercel.app',
    /\.vercel\.app$/   // cho phép tất cả domain preview của Vercel (ví dụ: branch builds)
  ],
  credentials: true
}));
    // helmet
     app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:']
        }
        }
    }));
    // XSS protection
    // app.use(xss());
    // thay the cho xss và chuyển xss qua middlewares/sanitize
    app.use(sanitize);
    // Rate limiting 
    const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Quá nhiều request từ IP này, vui lòng thử lại sau 15 phút'
  });
  app.use('/api', limiter);

  // HTTP Parameter Pollution
  app.use(hpp());

  // Cookie parser
  app.use(cookieParser());
};