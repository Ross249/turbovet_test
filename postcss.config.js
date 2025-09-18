module.exports = {
  plugins: [
    require('@tailwindcss/postcss')({ config: './turbovet.tailwind.config.js' }),
    require('autoprefixer'),
  ],
};
