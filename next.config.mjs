// next.config.mjs
const nextConfig = {
    output: 'export',
    basePath: process.env.NODE_ENV === 'production' ? '/Zhichengu1.github.io' : '',
    images: {
      unoptimized: true,
    },
  };
  
  export default nextConfig;