/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        bg: "var(--color-bg)",
        text: "var(--color-text)",
      },
    },
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        // Default
        '[data-theme="default"]': {
          "--color-primary": "hsl(220, 90%, 55%)", // blue
          "--color-secondary": "hsl(160, 60%, 45%)", // teal
          "--color-bg": "hsl(0, 0%, 100%)", // white
          "--color-text": "hsl(210, 10%, 20%)", // dark gray
        },

        // 🍺 Heineken
        '[data-theme="heineken"]': {
          "--color-primary": "#008200", // Heineken Green
          "--color-secondary": "#E2231A", // Red Star
          "--color-bg": "#ffffff",
          "--color-text": "#111111",
        },

        // 🌞 Corona
        '[data-theme="corona"]': {
          "--color-primary": "#002D62", // Dark Blue
          "--color-secondary": "#FFCC00", // Golden Yellow
          "--color-bg": "#fffaf0", // Off white
          "--color-text": "#222222",
        },

        // 🥃 Black Label
        '[data-theme="blacklabel"]': {
          "--color-primary": "#000000", // Deep Black
          "--color-secondary": "#FFD700", // Gold
          "--color-bg": "#111111", // Dark background
          "--color-text": "#f5f5f5", // Light text
        },
      });
    },
  ],
};
