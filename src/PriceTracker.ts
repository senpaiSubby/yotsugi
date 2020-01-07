/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import puppeteer from 'puppeteer'

class AmazonPriceTracker {
  public async grab() {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto(
      'https://www.amazon.com/NordicTrack-Fusion-1-Year-iFit-Membership/dp/B07W4SGHL5?pf_rd_p=463a8b2d-8005-4598-aa50-9c1d36f731d6&pf_rd_r=A23FNTMHJHYE4VKNSGCM'
    )

    const title = await page.evaluate(() =>
      document.querySelector('#productTitle').textContent.trim()
    )
    const price = await page.evaluate(() =>
      document
        .querySelector('#priceblock_ourprice')
        .textContent.trim()
        .replace('$', '')
        .replace('.00', '')
        .replace(/,/, '')
    )

    const productDetails = {
      title,
      price
    }

    console.log(productDetails)

    browser.close()
  }
}
const priceTracker = new AmazonPriceTracker()
priceTracker.grab()
