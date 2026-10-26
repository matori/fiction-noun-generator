import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { applyThemeMode, installThemeTokens, loadThemeMode } from './lib/theme/theme'

// 描画前にトークンとテーマを当てて、ちらつきを防ぐ
installThemeTokens()
applyThemeMode(loadThemeMode())

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
