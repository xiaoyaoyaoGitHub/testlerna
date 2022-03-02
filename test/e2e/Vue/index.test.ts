import { BREADCRUMBCATEGORYS, BREADCRUMBTYPES, ERRORTYPES, SDK_NAME, SDK_VERSION } from '@gymito/monitor-shared'
import { vueUrl } from '@/test/config'
import { TransportDataType, BreadcrumbPushData, ReportDataType } from '@gymito/monitor-types'
import { Severity } from '@gymito/monitor-utils'
import puppeteer from 'puppeteer'
import {} from '@gymito/monitor-types'

describe('Vue e2e', () => {
  const timeout = 3000
  let page: puppeteer.Page
  let browser: puppeteer.Browser
  const uploadRequestHandles = []
  const finishedRequestHandles = []
  async function getStack() {
    return await page.evaluate(() => {
      return window['__MITO__'].breadcrumb.stack as BreadcrumbPushData[]
    })
  }
  beforeEach(async () => {
    browser = await puppeteer.launch()
    page = await browser.newPage()
    // page.on('console', (msg) => {
    //   for (let i = 0; i < msg.args().length; ++i) console.log(`${i}: ${msg.args()[i]}`)
    // })
    await page.goto(vueUrl)
    page.on('request', (request) => {
      if (request.url().includes('/errors/upload') && uploadRequestHandles.length > 0) {
        uploadRequestHandles.shift()(request)
      }
    })
    page.on('requestfinished', (request) => {
      if (finishedRequestHandles.length > 0) {
        finishedRequestHandles.shift()(request)
      }
    })
  })

  afterEach(async () => {
    browser.close()
  })

  afterAll(() => {
    browser.close()
  })

  it(
    'vue code error',
    async (done) => {
      async function uploadRequestHandle(request: puppeteer.Request) {
        // breadcrumb valid
        const stack = await getStack()
        expect(stack[1].category).toBe(BREADCRUMBCATEGORYS.EXCEPTION)
        expect(stack[1].type).toBe(BREADCRUMBTYPES.VUE)
        expect(stack[1].level).toBe(Severity.Error)
        // upload
        const { authInfo, data } = JSON.parse(request.postData()) as TransportDataType
        expect((data as ReportDataType).type).toBe(ERRORTYPES.VUE_ERROR)
        expect((data as ReportDataType).level).toBe(Severity.Normal)
        expect((data as ReportDataType).name).toBe('TypeError')
        expect((data as ReportDataType).level).toBe(Severity.Normal)
        expect((data as ReportDataType).message).toBe("Cannot set property 'a' of undefined(v-on handler)")
        // stack is string
        expect((data as ReportDataType).stack).toBeDefined()
        expect(authInfo.sdkName).toBe(SDK_NAME)
        expect(authInfo.sdkVersion).toBe(SDK_VERSION)
        done()
      }
      uploadRequestHandles.push(uploadRequestHandle)
      page.click('#vueCodeError')
    },
    timeout
  )
})
