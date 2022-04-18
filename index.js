import puppeteerExtra from 'puppeteer-extra';
import stealthPluggin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

const InitPage = async () => {
    puppeteerExtra.use(stealthPluggin());
    const browser = await puppeteerExtra.launch({ headless: false });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    return page
}

const cleanTextFile = (text) => {
    let textArray = text.split('\r\n');
    textArray = textArray.filter(item => !item.includes("="))
    return textArray
}

const CreateCharacter = async () => {
    //const page = InitPage();
    var hairColor = fs.readFileSync('input.txt').toString();
    let text = cleanTextFile(hairColor);
    console.log(text)
}

CreateCharacter();