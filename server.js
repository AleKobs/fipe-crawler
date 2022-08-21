const express = require('express')
const app = express()
const port = 8080
app.use(express.json());
const puppeteer = require('puppeteer');


app.get('/placa/:placa', async (req, res) => {
    let who = req.query.who;
    if (who != 'admin13rubinei') {
        return res.json({access:'denied'});
    }
    const {browser,page} = await setup();
    await page.goto(`https://www.tabelafipebrasil.com/placa/${req.params.placa}`, {
        timeout: 10000,
        waitUntil: 'networkidle0',
    });
    const data = await page.evaluate(() => document.querySelector('body').innerHTML);
    await browser.close();
    return res.send(data);
})
app.get('/url/:url', async (req, res) => {
    let who = req.query.who;
    if (who != 'admin13rubinei') {
        return res.json({access:'denied'});
    }

    const {browser,page} = await setup();
    await page.goto(`${req.params.url}`, {
        timeout: 10000,
        waitUntil: 'networkidle0',
    });
    const data = await page.evaluate(() => document.querySelector('body').innerHTML);
    await browser.close();
    return res.send(data);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



 async function setup() { 
    // console.log('Starting Puppeteer Crawler');
    const browser = await puppeteer.launch({
        headless:true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0')
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
