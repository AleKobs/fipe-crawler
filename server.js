const express = require('express')
const app = express()
const port = 80
app.use(express.json());
const puppeteer = require('puppeteer');


app.get('/placa/:placa', async (req, res) => {
    const {browser,page} = await setup();
    await page.goto(`https://www.tabelafipebrasil.com/placa/${req.params.placa}`);
    const data = await page.evaluate(() => document.querySelector('*').outerHTML);
    await browser.close();
    return res.send(data);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



 async function setup() { 
    // console.log('Starting Puppeteer Crawler');
    const browser = await puppeteer.launch({
        headless:false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (!["document", 'xhr', 'fetch'].includes(req.resourceType())) {
          return req.abort();
        }
        req.continue();
      });
    return {browser, page}
}

 async function getPageInfo(page) { 

    const _return = await page.evaluate(()=>{
        const returnData = [];
        for(var i = 1; i < 10; i++) {
            if (!document.querySelector("#ad-list > li:nth-child("+i+") > div > a")) { continue; }
            let _lastPostedUrl =   document.querySelector("#ad-list > li:nth-child("+i+") > div > a") ;
            let lastPostedUrl = _lastPostedUrl.href
            if (!lastPostedUrl) { continue; }
            let _lastPostedTitle = document.querySelector("#ad-list > li:nth-child("+i+") > div > a");
            let lastPostedTitle = _lastPostedTitle.title;
            let _lastPostedPrice = document.querySelector("#ad-list > li:nth-child("+i+") > div > a > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div > div > div:nth-child(1) > span");
            returnData.push({
                url: lastPostedUrl,
                title: lastPostedTitle,
                price: _lastPostedPrice.textContent,
            });
        }   
        return returnData;
    })
    return _return;
}

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }
