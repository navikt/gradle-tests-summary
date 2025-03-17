import { ReportGenerator } from './report-generator'
import * as fs from 'fs'

const pathPrefix = process.env.GITHUB_WORKSPACE
  ? `${process.env.GITHUB_WORKSPACE}/`
  : fs.existsSync('/github/workspace')
    ? '/github/workspace/'
    : ''

const reportGenerator = new ReportGenerator(pathPrefix)

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, '')
  const out = fs.createWriteStream(process.env.GITHUB_STEP_SUMMARY, { flags: 'a' })
  reportGenerator.generateReport(out)
  out.end()
} else {
  reportGenerator.generateReport(process.stdout)
}
