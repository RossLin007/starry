/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F8E4',
          100: '#E1F2C9',
          500: '#019A4A',
          600: '#018A42',
          700: '#017A3A',
        },
        starry: {
          green: '#019A4A',   // 若星绿 (品牌主色·唯一行动色)
          ink: '#16300F',     // 深林绿 (主要正文字)
          tea: '#38502E',     // 橄榄绿 (辅助文字)
          olive: '#7BAF42',   // 橄榄黄绿
          paper: '#FEFFFD',   // 纸白 (底色)
          bud: '#F0F8E4',     // 浅芽绿 (浅底)
          rice: '#F0F2E9',    // 暖米灰 (边框描边)
          ash: '#4F5345',     // 灰褐 (弱文字)
          crimson: '#B04A33', // 绯红 (印章与警示)
          night: '#1F2A44',   // 夜空蓝 (星夜世界)
          mist: '#3D4E73',    // 雾蓝
          star: '#F0D9A8',    // 星光金
          cream: '#E9E4D8',   // 星夜米白
        }
      }
    },
  },
  plugins: [],
}
