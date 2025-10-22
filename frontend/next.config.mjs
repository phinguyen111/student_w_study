/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'http://127.0.0.1:4000/api/:path*' }];
  },
  i18n: {
    locales: ['vi', 'en', 'ja'], // Ngôn ngữ bạn hỗ trợ
    defaultLocale: 'vi', // Ngôn ngữ mặc định
    localeDetection: false, // Tùy chọn: Tắt tự động phát hiện ngôn ngữ trình duyệt
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
