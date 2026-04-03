/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      spacing: {
        "safe-bottom": "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        "safe-top": "max(0.5rem, env(safe-area-inset-top, 0px))",
      },
    },
  },
  plugins: [],
};
