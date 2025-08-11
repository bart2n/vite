// tailwind.config.js
module.exports = {
    content: [
      './index.html',
      './src/**/*.{js,ts,jsx,tsx,html,css}', // all source files + styles
      './src/css/styles.css', // ✅ Add this explicitly
    ],
    theme: {
      extend: {
        spacing: {
          '3.25': '0.8125rem', // allow custom size for w-3.25 / h-3.25
        },
        borderRadius: {
          xs: '0.125rem', // for rounded-xs if you need it again
        },
        colors:{
          gray: {
            100: '#f3f4f6', // override or redefine gray.100
            // optionally add more shades if needed
          },
        }
      },
    },
    safelist: [
      'w-20', 'h-20',
      'w-5', 'h-5',
      'w-full', 'h-full',
      'rounded-full',
      'rounded-sm', 'rounded-md', 'rounded-lg','shadow-sm',"bg-white","bg-white"
    ],
    plugins: [require("tailwindcss-animate")],
  };
  