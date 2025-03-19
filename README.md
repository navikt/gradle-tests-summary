# gradle-tests-summary

En enkel Github Action som viser oppsummering av gradle tester i Github Actions oppsummeringen

## Ta i bruk

```yaml
jobs:
  build:
    steps:
      - name: Checkout the repo
        uses: actions/checkout@v4

      # Bygg og test appen din

      - name: Summarize tests results
        uses: navikt/gradle-tests-summary@v1
        if: ${{ always() }}
```

`if: ${{ always() }}` gjør at testen din kan oppsummeres selv om det feiler og stopper eksekveringen av stepsa dine.

## Eksempel output:

| Subproject  |       Status       | Tests | Passed | Skipped | Failures | Errors |
| ----------- | :----------------: | :---: | :----: | :-----: | :------: | :----: |
| lib         |        :x:         | 2250  |  2248  |    0    |    2     |   0    |
| some-module | :white_check_mark: |  714  |  714   |    0    |    0     |   0    |

## Utvikling

### Ny versjon

Tag ny commit
```
git tag -a -m "Tag message" v1.x.x
git push --follow-tags
```

Oppdater v1 til å peke på ny versjon

```
git tag -f v1 v1.0.2 && git push origin v1 --force
```

## Prior art

Heavily inspired by [test-summary-action](https://github.com/jeantessier/test-summary-action) by [Jean Tessier](https://github.com/jeantessier)