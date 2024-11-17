/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
      '../../libs/shared/ui/**/*.{js,ts,jsx,tsx}', // Add this line
    ],
    // presets: [
    //   require('../../libs/shared/ui/tailwind.config.js')
    // ],
    presets: [require('../../tailwind-workspace-preset.js')],
    theme: {
      extend: {},
    },
    plugins: [],
  }