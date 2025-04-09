import {heroui} from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#a855f7', // bg-purple-500
          hover: '#9333ea',   // bg-purple-600
        },
        facebook: {
          DEFAULT: '#1877F2', // bg-blue-500
          hover: '#165ED0',   // bg-blue-600
        },
        // Mantener los colores para tipos de media
        mediaType: {
          reel: {
            text: '#9333EA',
            bg: '#F3E8FF',
          },
          image: {
            text: '#2563EB',
            bg: '#EFF6FF',
          },
          carousel: {
            text: '#EA580C',
            bg: '#FFF7ED',
          },
        },
        // Paleta de 15 colores pasteles para categorías
        categoryPalette: {
          '1': { 
            bg: '#FFF7ED', // Naranja pastel
            text: '#EA580C'
          },
          '2': { 
            bg: '#FEF2F2', // Rojo pastel
            text: '#DC2626'
          },
          '3': { 
            bg: '#F0FDF4', // Verde pastel
            text: '#16A34A'
          },
          '4': { 
            bg: '#EFF6FF', // Azul pastel
            text: '#2563EB'
          },
          '5': { 
            bg: '#F3E8FF', // Morado pastel
            text: '#9333EA'
          },
          6: { text: '#DC2626', bg: '#FEF2F2' }, // Red
          7: { text: '#CA8A04', bg: '#FEFCE8' }, // Yellow
          8: { text: '#BE185D', bg: '#FDF2F8' }, // Pink
          9: { text: '#4F46E5', bg: '#EEF2FF' }, // Indigo
          10: { text: '#059669', bg: '#ECFDF5' }, // Emerald
          11: { text: '#7C3AED', bg: '#F5F3FF' }, // Violet
          12: { text: '#B45309', bg: '#FFF7ED' }, // Amber
          13: { text: '#0284C7', bg: '#F0F9FF' }, // Light Blue
          14: { text: '#9D174D', bg: '#FDF2F8' }, // Rose
          15: { text: '#115E59', bg: '#F0FDFA' }, // Teal
        },
        // Nueva paleta para gráficos que usa los mismos colores que las categorías
        chartPalette: {
          1: '#EA580C',  // Naranja
          2: '#DC2626',  // Rojo
          3: '#16A34A',  // Verde
          4: '#2563EB',  // Azul
          5: '#9333EA',  // Morado
          6: '#DC2626',  // Red
          7: '#CA8A04',  // Yellow
          8: '#BE185D',  // Pink
          9: '#4F46E5',  // Indigo
          10: '#059669', // Emerald
          11: '#7C3AED', // Violet
          12: '#B45309', // Amber
          13: '#0284C7', // Light Blue
          14: '#9D174D', // Rose
          15: '#115E59',  // Teal
          default: '#6B7280' // Para items sin categoría
        }
      },
    },
  },
  safelist: [
    {
      pattern: /(bg|text)-categoryPalette-\d+-(bg|text)/,
    },
    {
      pattern: /(bg|text)-mediaType-(reel|image|carousel)-(bg|text)/,
    }
  ],
  plugins: [heroui()],
};
