import puppeteerExtra from 'puppeteer-extra';
import stealthPluggin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

function randomInt(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const InitPage = async () => {
    puppeteerExtra.use(stealthPluggin());
    const browser = await puppeteerExtra.launch({ headless: false });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    return page
}

const PullSubarray = (arr, startIndex, endIndex) => {
    return arr.slice(startIndex + 1, endIndex);
}

const GetTextArray = (fileName) => {
    var textFile = fs.readFileSync(`${fileName}.txt`).toString();
    return textFile.split('\r\n');
}

const GetTitleIndexes = (textArray) => {
    var titleIndexes = []
    for (var i=0; i<textArray.length; i++){
        if (textArray[i].includes("-")) {
            titleIndexes.push(i)
        }
    }
    return titleIndexes;
}

const GetTitles = (textArray) => {
    var titles = []
    for (var i=0; i<textArray.length; i++){
        var text = textArray[i];
        if (text.includes("-")) {
            titles.push(text);
        }
    }
    return titles;
}

const ChooseOptions = (textArray, titleIndexes, startIndex, endIndex) => {
    var options = PullSubarray(textArray, titleIndexes[startIndex], titleIndexes[endIndex]);
    return options[randomInt(0, options.length - 1)];
}

const GenerateAttrList = (numOfAttr, textArray, titleIndexes) => {
    var arr = []
    for(var i = 0; i < numOfAttr; i++) {
        var attr = ChooseOptions(textArray, titleIndexes, i, i + 1);
        arr.push(attr);
    }
    return arr;
}

const GenerateIntList = (numOfAttr, textArray, titleIndexes) => {
    var arr = []
    for(var i = 0; i < numOfAttr; i++) {        
        var smallest = parseInt(textArray[titleIndexes[i] + 1]);
        var largest = parseInt(textArray[titleIndexes[i] + 2]);
        var int = randomInt(smallest, largest);
        arr.push(int);
    }
    return arr;
}

const GenerateScrapeList = async (titles) => {
    var arr = [];
    puppeteerExtra.use(stealthPluggin());
    const browser = await puppeteerExtra.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await page.goto('https://www.behindthename.com/random/');
    const mythButton = await page.$('input[id="usage-myth"]');
    await mythButton.click();
    const anciButton = await page.$('input[id="usage-anci"]');
    await anciButton.click();
    const fntsyButton = await page.$('input[id="usage-fntsy"]');
    await fntsyButton.click();
    const [submitButton] = await page.$x('//center/form/div[1]/input');
    await submitButton.click();
    for(var i = 0; i < titles.length; i++) {
        await page.waitForXPath('//div[@class="random-results"]/a');
        var [nameDiv] = await page.$x('//div[@class="random-results"]/a');
        var name = await nameDiv.evaluate(el => el.textContent);
        arr.push(name);
        var [regenButton] = await page.$x('//div[@id="body-inner"]/div[1]/div/nav/a');
        await regenButton.click();
        await page.waitForTimeout(2000);
    }
    browser.close();
    return arr;
}

const CreateDescription = (attrList, titles, descText) => {
    for(var i = 0; i < titles.length; i++) {
        descText = descText.replaceAll(titles[i], attrList[i]);
    }
    return descText;
}

//The Big Three
const GenerateFromFiles = (descText) => {
    let fileArray = ['appearance', 'background'];
    for(var i = 0; i < fileArray.length; i++) {
        let textArray = GetTextArray(fileArray[i]);
        let titles = GetTitles(textArray);
        let titleIndexes = GetTitleIndexes(textArray);
        let attrList = GenerateAttrList(titles.length, textArray, titleIndexes);
        descText = CreateDescription(attrList, titles, descText);
    }
    return descText;
}

const GenerateFromInt = (descText) => {
    let textArray = GetTextArray('integer');
    let titles = GetTitles(textArray);
    let titleIndexes = GetTitleIndexes(textArray);
    let intList = GenerateIntList(titles.length, textArray, titleIndexes);
    descText = CreateDescription(intList, titles, descText);
    return descText;
}

const GenerateFromScraping = async (descText) => {
    let textArray = GetTextArray('scrape');
    let titles = GetTitles(textArray);
    let scrapeList = await GenerateScrapeList(titles);
    descText = CreateDescription(scrapeList, titles, descText);
    return descText;
}


const CreateCharacter = async () => {
    let descText = fs.readFileSync('desc.txt').toString();
    descText = GenerateFromFiles(descText);
    descText = GenerateFromInt(descText);
    descText = await GenerateFromScraping(descText);
    console.log(descText);

}

CreateCharacter();