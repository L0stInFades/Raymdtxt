const { expect, test } = require('@playwright/test')
const { closeElectron, launchElectron } = require('./helpers')

test.describe('Check Launch Vien', async () => {
  let app = null
  let page = null

  test.beforeAll(async () => {
    const { app: electronApp, page: firstPage } = await launchElectron()
    app = electronApp
    page = firstPage
  })

  test.afterAll(async () => {
    await closeElectron(app)
  })

  test('Empty Vien', async () => {
    const title = await page.title()
    expect(/^(Vien|Untitled-\d+ - Vien)$/.test(title)).toBeTruthy()
  })
})
