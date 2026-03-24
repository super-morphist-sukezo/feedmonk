import type { Config } from "tailwindcss";

const config: Config = {
  // 以下の1行を追加します
  darkMode: "class",
  
  content:[
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins:[],
};
export default config;