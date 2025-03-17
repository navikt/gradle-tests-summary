import * as fs from 'fs'
import * as path from 'path'
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

  generateReport(out: fs.WriteStream ) {
    this.printHeaders(out)

    const testFiles = glob.sync(`${this.pathPrefix}**/{TEST,test}-*.xml`)
    const grouped = this.groupBySubproject(testFiles)

    for (const [group, testResults] of Object.entries(grouped)) {
      this.process(out, group, testResults)
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

  private process(out: fs.WriteStream, group: string, testResults: string[]) {
    const docs = testResults.map((file) => {
      const content = fs.readFileSync(file, 'utf-8')
      return new DOMParser().parseFromString(content, 'text/xml')
    })

    this.printGroup(out, group, this.counts(docs))
  }

  private counts(docs: Document[]): Record<CountKeys, number> {
    return Object.fromEntries(
      Object.entries(COUNT_XPATHS).map(([key, xpathQuery]) => [key, this.count(docs, xpathQuery)]),
    ) as Record<CountKeys, number>
  }

  private count(docs: Document[], xpathQuery: string): number {
    return docs.reduce((sum, doc) => sum + (xpath.select('count(' + xpathQuery + ')', doc) as number), 0)
  }

  private printHeaders(out: fs.WriteStream) {
    out.write('| Subproject | Status | Tests | Passed | Skipped | Failures | Errors |\n')
    out.write('|------------|:------:|:-----:|:------:|:-------:|:--------:|:------:|\n')
  }

  private printGroup(out: fs.WriteStream, group: string, counts: Record<CountKeys, number>) {
    const status = counts.failures === 0 && counts.errors === 0 ? ':white_check_mark:' : ':x:'
    const stats = [group, status, counts.tests, counts.passed, counts.skipped, counts.failures, counts.errors]
    out.write(`| ${stats.join(' | ')} |
`)
  }
}
