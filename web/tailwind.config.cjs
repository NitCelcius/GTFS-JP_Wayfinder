/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // semantic token は無視していい
    { pattern: /\[var\(--.*\)\]/ },
  ],
};
