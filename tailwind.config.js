/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2430",
        paper: "#F4F2ED",
        panel: "#FFFFFF",
        signal: "#C8792A",
        accepted: "#3A7D63",
        rejected: "#B3462C",
        pending: "#8A8F98",
        line: "#D9D5CB",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
