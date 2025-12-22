export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this path to where your components live
  ],
  theme: {
    extend: {
      colors: {
        page: "#F6F8FA",
        "muted-border": "#E6E9EE",
        "text-muted": "#6B7280",
        "primary-bg": "#FFFFFF",
        "secondary-bg": "#1A1A1A",
        accent: "#0047FF",
        "text-primary": "#1A1A1A",
        "text-reversed": "#FFFFFF",
        "text-secondary": "#555555",
        "feedback-star": "#FFC107",
        "ui-border": "#E0E0E0",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif", "system-ui"], // Using Inter as the modern sans-serif font
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
      },
    },
  },
  plugins: [],
};
