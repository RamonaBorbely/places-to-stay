/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#413F3D",
        darkBlue: "#697184",
        neutral: "#B1A6A4",
        lightSecondary: "#D8CFDO",
        light: "#F2F1EF",
        purple: "#6F2DA8"
      },
    },
  },
  plugins: [],
};
