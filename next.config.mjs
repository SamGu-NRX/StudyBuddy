// next.config.mjs

/** @type {import('next').NextConfig} */

import withSvgr from '@svgr/webpack';

const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  webpack(config) {
      config.module.rules.push({
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgo: true, // Disable SVGO optimization if you encounter issues
            },
          },
        ],
      });
      return config;
  },
};

export default nextConfig;

// webpack(config) {
//   config.module.rules.push({
//     test: /\.svg$/,
//     use: [
//       {
//         loader: '@svgr/webpack',
//         options: {
//           svgo: true, // Disable SVGO optimization if you encounter issues
//         },
//       },
//     ],
//   });
//   return config;
// },

