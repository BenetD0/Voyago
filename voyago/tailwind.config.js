// tailwind.config.js
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ngjyrat e nxjerra direkt nga logoja jote
        brand: {
          purple: "#9D50BB", // Vjollca kryesore
          blue: "#6E7AFF",   // E kaltra e ndritshme
          dark: "#1A1A2E",   // Background i errët premium
          light: "#F8F9FF",  // Background i hapur
        },
        journey: {
          forest: "#14532D",
          leaf: "#22C55E",
          earth: "#7C5E3C",
          sand: "#FAF3E0",
        },
      },
      backgroundImage: {
        'brand-gradient': "linear-gradient(135deg, #9D50BB 0%, #6E7AFF 100%)",
        'deep-space': "linear-gradient(135deg, #1A1A2E 0%, #0D0D15 100%)",
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        pulseMap: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        ticker: 'ticker 30s linear infinite',
        pulseMap: 'pulseMap 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
