import type { Config } from "tailwindcss";
import daisyui from "daisyui";

export default {
  content: [
    "{routes,islands,components,lib}/**/*.{ts,tsx,js,jsx}",
    "../../packages/ui-lib/components/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: true, // true: all themes | false: only light + dark | array: specific themes
  },
} satisfies Config;