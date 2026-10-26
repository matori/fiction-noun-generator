import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // サブディレクトリに置けるよう、ビルド後の参照を相対パスにする
  base: './',
  plugins: [svelte()],
})
