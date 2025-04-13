import { type Config } from "tailwindcss";

const config: Config = {
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx}",
        // Add shadcn path
        "./components/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;
