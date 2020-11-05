const path = require('path');

module.exports = {
  style: {
    postcss: {
      mode: 'extends' || 'file',
      plugins: [
        require('tailwindcss')('./tailwind.config.js'),
        require('postcss-preset-env')({
          stage: 3,
          features: {
            'nesting-rules': true,
          },
        }),
      ],
    },
  },
};
