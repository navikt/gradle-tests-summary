import { test, expect } from 'bun:test'

import { ReportGenerator } from '../report-generator'
import { captureWritable } from './stream-util'

test('should handle single module', () => {
  const reportGenerator = new ReportGenerator('src/_test_/data/single-module/')

  const output = captureWritable()
  reportGenerator.generateReport(output.stream)

  expect(output.getOutput()).toMatchSnapshot()
})

test('should handle single module', () => {
  const reportGenerator = new ReportGenerator('src/_test_/data/multi-module/')

  const output = captureWritable()
  reportGenerator.generateReport(output.stream)

  expect(output.getOutput()).toMatchSnapshot()
})
