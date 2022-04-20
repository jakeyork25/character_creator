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
        if (textArray[i].includes("-")) {
            titles.push(textArray[i])
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

const CreateDescription = (attrList, titles, descText) => {
    for(var i = 0; i < titles.length; i++) {
        descText = descText.replace(titles[i], attrList[i]);
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

const GenerateFromScraping = (descText) => {

}


const CreateCharacter = async () => {
    //const page = InitPage();
    let descText = fs.readFileSync('desc.txt').toString();
    descText = GenerateFromFiles(descText);
    descText = GenerateFromInt(descText);
    console.log(descText);
}

CreateCharacter();