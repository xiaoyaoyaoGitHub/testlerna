import { InitOptions } from '@gymito/monitor-types'
import { isWxMiniEnv } from '@gymito/monitor-utils'
import { setupReplace } from './load'
import { initOptions, log } from '@gymito/monitor-core'
import { sendTrackData, track } from './initiative'
import { SDK_NAME, SDK_VERSION } from '@gymito/monitor-shared'
import { MitoVue } from '@gymito/monitor-vue'
import { errorBoundaryReport } from '@gymito/monitor-react'
export function init(options: InitOptions = {}) {
  if (!isWxMiniEnv) return
  initOptions(options)
  setupReplace()
  Object.assign(wx, { mitoLog: log, SDK_NAME, SDK_VERSION })
}
export { log, sendTrackData, track, MitoVue, errorBoundaryReport }
