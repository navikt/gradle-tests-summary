import type { Writable } from 'node:stream'
import * as fs from 'node:fs'
import * as path from 'node:path'

import * as glob from 'glob'
import { DOMParser } from 'xmldom'
import * as xpath from 'xpath'

type CountKeys = 'tests' | 'passed' | 'skipped' | 'failures' | 'errors'

const COUNT_XPATHS: Record<CountKeys, string> = {
  tests: '//testcase',
  passed: '//testcase[not(*)]',
  skipped: '//testcase[skipped]',
  failures: '//testcase[failure]',
  errors: '//testcase[error]',
}

export class ReportGenerator {
  constructor(private pathPrefix: string) {}

  generateReport(out: Writable) {
    const testFiles = glob.sync(`${this.pathPrefix}**/{TEST,test}-*.xml`)    
    const grouped = this.groupBySubproject(testFiles)

    // Determine the widest subproject name
    const subprojects = Object.keys(grouped)
    const subprojectWidth = Math.max('Subproject'.length, ...subprojects.map((p) => p.length))

    this.printHeaders(out, subprojectWidth)

    for (const [group, testResults] of Object.entries(grouped)) {
      this.process(out, group, testResults, subprojectWidth)
    }
  }

  private groupBySubproject(files: string[]): Record<string, string[]> {
    return files.reduce(
      (acc, file) => {
        const relativePath = file.slice(this.pathPrefix.length)
        const group = relativePath.split(path.sep)[0]
        acc[group] = acc[group] || []
        acc[group].push(file)
        return acc
      },
      {} as Record<string, string[]>,
    )
  }

  private process(out: Writable, group: string, testResults: string[], subprojectWidth: number) {
    const docs = testResults.map((file) => {
      const content = fs.readFileSync(file, 'utf-8')
      return new DOMParser({
        errorHandler: (level, msg) => {
          if (level === 'fatalError' || process.env.VERBOSE === 'true') {
            console.error(msg)
          }
        },
      }).parseFromString(content, 'text/xml')
    })

    this.printGroup(out, group, this.counts(docs), subprojectWidth)
  }

  private counts(docs: Document[]): Record<CountKeys, number> {
    return Object.fromEntries(
      Object.entries(COUNT_XPATHS).map(([key, xpathQuery]) => [key, this.count(docs, xpathQuery)]),
    ) as Record<CountKeys, number>
  }

  private count(docs: Document[], xpathQuery: string): number {
    return docs.reduce((sum, doc) => sum + (xpath.select('count(' + xpathQuery + ')', doc) as number), 0)
  }

  private printHeaders(out: Writable, subprojectWidth: number) {
    const subprojectCol = 'Subproject'.padEnd(subprojectWidth)
    out.write(`| ${subprojectCol} | Status | Tests | Passed | Skipped | Failures | Errors |\n`)
    out.write(`|-${'-'.repeat(subprojectWidth)}-|:------:|:-----:|:------:|:-------:|:--------:|:------:|\n`)
  }

  private printGroup(out: Writable, group: string, counts: Record<CountKeys, number>, subprojectWidth: number) {
    const status = counts.failures === 0 && counts.errors === 0 ? ' ✅ ' : ' ❌ '
    const paddedGroup = group.padEnd(subprojectWidth)

    const formatNumber = (num: number, headerWidth: number) => num.toString().padStart(headerWidth, ' ')

    const stats = [
      paddedGroup,
      status.padStart(5).padEnd(3),
      formatNumber(counts.tests, 5),
      formatNumber(counts.passed, 6),
      formatNumber(counts.skipped, 7),
      formatNumber(counts.failures, 8),
      formatNumber(counts.errors, 6),
    ]

    out.write(`| ${stats.join(' | ')} |\n`)
  }
}
