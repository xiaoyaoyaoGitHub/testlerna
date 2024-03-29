import { options, setTraceId } from '@gymito/monitor-core'
import { _support } from '@gymito/monitor-utils'

describe('options.ts', () => {
  it('should setTraceId func work', () => {
    options.bindOptions({
      includeHttpUrlTraceIdRegExp: /cjh/,
      enableTraceId: true
    })
    let testIsRun = false
    setTraceId('http://www.test.com/a/b', (headerFieldName: string, traceId: string) => {
      testIsRun = true
    })
    expect(testIsRun).toBeFalsy()
    let cjhIsRun = false
    setTraceId('http://www.cjh.com/a/b', (headerFieldName: string, traceId: string) => {
      cjhIsRun = true
      expect(headerFieldName).toBe(options.traceIdFieldName)
    })
    expect(cjhIsRun).toBeTruthy()
  })
})
