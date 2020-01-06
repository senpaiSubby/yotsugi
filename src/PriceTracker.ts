/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import puppeteer from 'puppeteer'

class AmazonPriceTracker {
  public async fetchInfo(url: string) {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto(url)

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

    const shipping = await page.evaluate(() =>
      document
        .querySelector('#ourprice_shippingmessage')
        .textContent.trim()
        .replace('$', '')
        .replace('.00', '')
        .replace(/,/, '')
    )

    const productDetails = {
      title,
      price,
      shipping
    }

    await browser.close()
    return productDetails
  }
}

const priceTracker = new AmazonPriceTracker()
priceTracker.fetchInfo(
  'https://www.amazon.com/Estink-Snowboard-Protection-Detachable-Snowboarding/dp/B07H865M4B?pf_rd_p=8e3f9920-6029-4962-9823-342fbc264066&pd_rd_wg=wHbe7&pf_rd_r=69ZYY64NRWAFK2K4SP8S&ref_=pd_gw_unk&pd_rd_w=tTMMR&pd_rd_r=0e03140b-a22e-4531-9a56-2bea4d5898e7'
)

console.log(10.5 - 10)
