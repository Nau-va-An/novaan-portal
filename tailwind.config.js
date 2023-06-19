/** @type {import('tailwindcss').Config} */

const colors = {
    cprimary: {
        100: '#1aeda7',
        200: '#13ad7a',
        300: '#12a171',
        400: '#0f875f',
        500: '#0b6144',
    },
    cinfo: '#1e96fc',
    cwarning: '#f32839',
}

module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',

        // Or if using `src` directory:
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors,
        },
    },
    plugins: [],
    customColors: colors,
}
