# gradle-tests-summary

En enkel Github Action som viser oppsummering av gradle tester i Github Actions oppsummeringen

## Eksempel output:

| Subproject  |       Status       | Tests | Passed | Skipped | Failures | Errors |
| ----------- | :----------------: | :---: | :----: | :-----: | :------: | :----: |
| lib         |        :x:         | 2250  |  2248  |    0    |    2     |   0    |
| some-module | :white_check_mark: |  714  |  714   |    0    |    0     |   0    |

## Prior art

Heavily inspired by [test-summary-action](https://github.com/jeantessier/test-summary-action) by [Jean Tessier](https://github.com/jeantessier)
