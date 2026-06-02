/** @type {import('tailwindcss').Config} */

module.exports = {

  content: [

    "./src/**/*.{js,jsx,ts,tsx}",

  ],

  theme: {

    extend: {

      // =====================================================
      // COLORS
      // =====================================================

      colors: {

        primary: "#16a34a",

        secondary: "#22c55e",

        accent: "#0ea5e9",

        bg: "#f8fafc",

        card: "#ffffff",

        text: "#0f172a",

        muted: "#64748b",

        danger: "#ef4444",

        warning: "#f59e0b",

        success: "#10b981",

        dark: "#0f172a",

        light: "#f1f5f9",
      },

      // =====================================================
      // SPACING
      // =====================================================

      spacing: {

        xs: "8px",

        sm: "12px",

        md: "16px",

        lg: "24px",

        xl: "32px",

        "2xl": "48px",
      },

      // =====================================================
      // BORDER RADIUS
      // =====================================================

      borderRadius: {

        sm: "10px",

        md: "14px",

        lg: "18px",

        xl: "24px",

        "2xl": "32px",
      },

      // =====================================================
      // SHADOWS
      // =====================================================

      boxShadow: {

        card: "0 6px 24px rgba(0,0,0,0.08)",

        glass: "0 8px 32px rgba(31, 38, 135, 0.15)",

        premium: "0 10px 40px rgba(0,0,0,0.12)",
      },

      // =====================================================
      // FONT
      // =====================================================

      fontFamily: {

        sans: [

          "Inter",

          "system-ui",

          "sans-serif"
        ],
      },

      // =====================================================
      // ANIMATIONS
      // =====================================================

      animation: {

        float: "float 4s ease-in-out infinite",

        fadeIn: "fadeIn 0.6s ease-in-out",

        pulseSlow: "pulse 3s infinite",
      },

      // =====================================================
      // KEYFRAMES
      // =====================================================

      keyframes: {

        float: {

          "0%, 100%": {
            transform: "translateY(0px)"
          },

          "50%": {
            transform: "translateY(-10px)"
          },
        },

        fadeIn: {

          "0%": {
            opacity: "0"
          },

          "100%": {
            opacity: "1"
          },
        },
      },
    },
  },

  plugins: [],
};