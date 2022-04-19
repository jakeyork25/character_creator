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

const GetTextArray = () => {
    var textFile = fs.readFileSync('appearance.txt').toString();
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
        if (textArray[i].includes("-")) {
            titles.push(textArray[i])
        }
    }
    return titles;
}

const ChooseAppearanceOptions = (textArray, titleIndexes, startIndex, endIndex) => {
    var appearanceOptions = PullSubarray(textArray, titleIndexes[startIndex], titleIndexes[endIndex]);
    return appearanceOptions[randomInt(0, appearanceOptions.length - 1)];
}

const GenerateAppearAttrList = (numOfAttr, textArray, titleIndexes) => {
    var arr = []
    for(var i = 0; i < numOfAttr; i++) {
        var appearAttr = ChooseAppearanceOptions(textArray, titleIndexes, i, i + 1);
        arr.push(appearAttr);
    }
    return arr;
}

const CreateAppearanceDescription = (attrList, titles) => {
    var descText = fs.readFileSync('desc.txt').toString();
    for(var i = 0; i < titles.length; i++) {
        descText = descText.replace(titles[i], attrList[i]);
    }
    return descText;
}

const GenerateAppearance = () => {
    let textArray = GetTextArray();
    let titles = GetTitles(textArray);
    let titleIndexes = GetTitleIndexes(textArray);
    let attrList = GenerateAppearAttrList(titles.length, textArray, titleIndexes);
    let descText = CreateAppearanceDescription(attrList, titles);
    console.log(descText)
}

const CreateCharacter = async () => {
    //const page = InitPage();
    GenerateAppearance();
}

CreateCharacter();