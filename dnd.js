import fs from 'fs';
import Jimp from 'jimp';
import puppeteerExtra from 'puppeteer-extra';
import stealthPluggin from 'puppeteer-extra-plugin-stealth';

function randomInt(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const ChooseRace = () => {
    var raceNames = fs.readFileSync('dndTextFiles/races.txt').toString();
    let raceArray = raceNames.split("\r\n");
    let index = randomInt(0, raceArray.length - 1);
    return raceArray[index];
}

const ChooseClass = () => {
    let clss = fs.readFileSync('dndTextFiles/classes.txt').toString();
    let classArray = clss.split("\r\n");
    let index = randomInt(0, classArray.length - 1);
    return classArray[index];
}

const ChooseBackground = () => {
    let backgroundNames = fs.readFileSync('dndTextFiles/background.txt').toString();
    let backgroundArray = backgroundNames.split("\r\n");
    let index = randomInt(0, backgroundArray.length - 1);
    return backgroundArray[index];
}

const RemoveMinFromArray = (arr) => {
    const min = Math.min(...arr);
    const index = arr.indexOf(min);
    
    return arr.filter((_, i) => i !== index);
}

const RemoveValueFromArray = (value, arr) => {
    var index = arr.indexOf(value); 
    return arr.filter((_, i) => i !== index);
}

const FindLargestValue = (arr) => {
    var largest = 0;
    for(var i = 0; i < arr.length; i++) {
        if(arr[i] > largest) largest = arr[i];
    }
    return largest;
}

const SetScoreArray = (arr, largest, largestIndex, next, nextIndex) => {
    var finalArr = [];
    var loopLength = arr.length + 2;
    for(var i = 0; i < loopLength; i++) {
        if(i == largestIndex) {
            finalArr.push(largest)
        } else if(i == nextIndex) {
            finalArr.push(next);
        } else {
            var randomIndex = randomInt(0, arr.length - 1);
            var randomValue = arr[randomIndex];
            arr = RemoveValueFromArray(randomValue, arr);
            finalArr.push(randomValue);
        }
    }
    return finalArr;
}

const UpdateScoreArray = (scoreArr, increaseArr) => {
    for(var i = 0; i < scoreArr.length; i++) {
        scoreArr[i] = scoreArr[i] + increaseArr[i];
    }
    return scoreArr;
}

const CreateHalfElfArray = () => {
    var arr = [0, 0, 0, 0, 0, 2];
    var index1 = randomInt(0, 4);
    var index2 = randomInt(0, 4);
    while(index2 == index1) {
        index2 = randomInt(0, 4);
    }
    arr[index1] = 1;
    arr[index2] = 1;
    return arr;
}

const GetScoreArray = (clss, race) => {
    let scoreArray = [];
    let randArray = [];
    let largest = 0;
    let nextLargest = 0;
    for(var i = 0; i < 6; i++) {
        var rollArray = [];
        for(var j = 0; j < 4; j++) {
            rollArray.push(randomInt(1, 6));
        }
        rollArray = RemoveMinFromArray(rollArray);  
        var rollSum = rollArray.reduce((partialSum, a) => partialSum + a, 0);
        randArray.push(rollSum);
    }
    largest = FindLargestValue(randArray);
    randArray = RemoveValueFromArray(largest, randArray);
    nextLargest = FindLargestValue(randArray);
    randArray = RemoveValueFromArray(nextLargest, randArray);
    switch (clss) {
        case "barbarian": scoreArray = SetScoreArray(randArray, largest, 0, nextLargest, 2); break;
        case "bard": scoreArray = SetScoreArray(randArray, largest, 5, nextLargest, 1); break;
        case "cleric": scoreArray = SetScoreArray(randArray, largest, 4, nextLargest, 0); break;
        case "druid": scoreArray = SetScoreArray(randArray, largest, 4, nextLargest, 2); break;
        case "fighter": scoreArray = SetScoreArray(randArray, largest, 1, nextLargest, 3); break;
        case "monk": scoreArray = SetScoreArray(randArray, largest, 1, nextLargest, 4); break;
        case "paladin": scoreArray = SetScoreArray(randArray, largest, 0, nextLargest, 5); break;
        case "ranger": scoreArray = SetScoreArray(randArray, largest, 1, nextLargest, 4); break;
        case "rogue": scoreArray = SetScoreArray(randArray, largest, 1, nextLargest, 3); break;
        case "sorcerer": scoreArray = SetScoreArray(randArray, largest, 5, nextLargest, 2); break;
        case "warlock": scoreArray = SetScoreArray(randArray, largest, 5, nextLargest, 2); break;
        case "wizard": scoreArray = SetScoreArray(randArray, largest, 2, nextLargest, 5); break;
        default: console.log("Unexpected class type." + clss);
            break;
    }



    switch (race) {
        case "dragonborn": scoreArray = UpdateScoreArray(scoreArray, [2, 0, 0, 0, 0, 1]); break;
        case "dwarf": scoreArray = UpdateScoreArray(scoreArray, [0, 0, 2, 0, 0, 0]); break;
        case "elf": scoreArray = UpdateScoreArray(scoreArray, [0, 2, 0, 0, 0, 0]); break;
        case "gnome": scoreArray = UpdateScoreArray(scoreArray, [0, 0, 0, 2, 0, 0]); break;
        case "half-elf": scoreArray = UpdateScoreArray(scoreArray, CreateHalfElfArray()); break;
        case "halfling": scoreArray = UpdateScoreArray(scoreArray, [0, 2, 0, 0, 0, 0]); break;
        case "half-orc": scoreArray = UpdateScoreArray(scoreArray, [2, 0, 1, 0, 0, 0]); break;
        case "human": scoreArray = UpdateScoreArray(scoreArray, [1, 1, 1, 1, 1, 1]); break;
        case "tiefling": scoreArray = UpdateScoreArray(scoreArray, [0, 0, 0, 1, 0, 2]); break;
        default: console.log("Unexpected race type." + clss);
            break;
    }
    return scoreArray
}

const GetAbilityModArray = (scoreArr) => {
    let abilityModArray = [];
    for(var i = 0; i < scoreArr.length; i++) {
        var score = scoreArr[i];
        var mod = Math.round((score - 10)/2 - .1);
        if(mod == -0) mod = 0;
        abilityModArray.push(mod)
    }
    return abilityModArray;
}

const GenerateName = async () => {
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
    await page.waitForXPath('//div[@class="random-results"]/a');
    var [nameDiv] = await page.$x('//div[@class="random-results"]/a');
    var name = await nameDiv.evaluate(el => el.textContent);
    browser.close();
    return name;
}

const WriteScores = (scoreArray) => {
    var loadedImage;
    Jimp.read('dnd.png')
        .then(function (image) {
            loadedImage = image;
            return Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        })
        .then(function (font) {
            for(var i = 0; i < scoreArray.length; i++) {
                var x = 50;
                if(scoreArray[i] < 10) x = 60;
                loadedImage.print(font, x, 200 + (i * 105), scoreArray[i].toString());
            }
            loadedImage.write('test2.png');
        })
        .catch(function (err) {
            console.error(err);
        });
}

const WriteAbilityMods = (abilityModArray) => {
    var loadedImage;
    Jimp.read('test2.png')
        .then(function (image) {
            loadedImage = image;
            return Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
        })
        .then(function (font) {
            for(var i = 0; i < abilityModArray.length; i++) {
                loadedImage.print(font, 62, 250 + (i * 104), abilityModArray[i].toString());
            }
            loadedImage.write('test.png');
        })
        .catch(function (err) {
            console.error(err);
        });
}

const Main = () => {
    let race = ChooseRace();
    let clss = ChooseClass();
    let background = ChooseBackground();
    let scoreArray = GetScoreArray(clss, race);
    let abilityModArray = GetAbilityModArray(scoreArray);
    WriteScores(scoreArray);
    WriteAbilityMods(abilityModArray);


}

Main();