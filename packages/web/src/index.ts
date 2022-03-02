import { init as initBrowser, SDK_VERSION, SDK_NAME, log } from '@gymito/monitor-browser'
import { MitoVue } from '@gymito/monitor-vue'
import { WebVitals } from '@gymito/monitor-web-performance'

// 测试publish
const init = (options) => {
  const { webVitals, ...params } = options || {}
  initBrowser(params)
  webVitals && new WebVitals(webVitals)
}

// import { errorBoundaryReport } from '@gymito/monitor-react'
export { init, SDK_VERSION, SDK_NAME, MitoVue, log }
