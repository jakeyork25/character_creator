import fs, { readlink } from 'fs';
import Jimp from 'jimp';
import puppeteerExtra from 'puppeteer-extra';
import stealthPluggin from 'puppeteer-extra-plugin-stealth';

function randomInt(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const ChooseRandomText = (fileName) => {
    var options = fs.readFileSync(`dndTextFiles/${fileName}.txt`).toString();
    let optionArray = options.split("\r\n");
    let index = randomInt(0, optionArray.length - 1);
    return optionArray[index];
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
        case "Barbarian": scoreArray = SetScoreArray(randArray, largest, 0, nextLargest, 2); break;
        case "Bard": scoreArray = SetScoreArray(randArray, largest, 5, nextLargest, 1); break;
        case "Cleric": scoreArray = SetScoreArray(randArray, largest, 4, nextLargest, 0); break;
        case "Druid": scoreArray = SetScoreArray(randArray, largest, 4, nextLargest, 2); break;
        case "Fighter": scoreArray = SetScoreArray(randArray, largest, 1, nextLargest, 3); break;
        case "Monk": scoreArray = SetScoreArray(randArray, largest, 1, nextLargest, 4); break;
        case "Paladin": scoreArray = SetScoreArray(randArray, largest, 0, nextLargest, 5); break;
        case "Ranger": scoreArray = SetScoreArray(randArray, largest, 1, nextLargest, 4); break;
        case "Rogue": scoreArray = SetScoreArray(randArray, largest, 1, nextLargest, 3); break;
        case "Sorcerer": scoreArray = SetScoreArray(randArray, largest, 5, nextLargest, 2); break;
        case "Warlock": scoreArray = SetScoreArray(randArray, largest, 5, nextLargest, 2); break;
        case "Wizard": scoreArray = SetScoreArray(randArray, largest, 2, nextLargest, 5); break;
        default: console.log("Unexpected class type." + clss);
            break;
    }



    switch (race) {
        case "Dragonborn": scoreArray = UpdateScoreArray(scoreArray, [2, 0, 0, 0, 0, 1]); break;
        case "Dwarf": scoreArray = UpdateScoreArray(scoreArray, [0, 0, 2, 0, 0, 0]); break;
        case "Elf": scoreArray = UpdateScoreArray(scoreArray, [0, 2, 0, 0, 0, 0]); break;
        case "Gnome": scoreArray = UpdateScoreArray(scoreArray, [0, 0, 0, 2, 0, 0]); break;
        case "Half-elf": scoreArray = UpdateScoreArray(scoreArray, CreateHalfElfArray()); break;
        case "Halfling": scoreArray = UpdateScoreArray(scoreArray, [0, 2, 0, 0, 0, 0]); break;
        case "Half-orc": scoreArray = UpdateScoreArray(scoreArray, [2, 0, 1, 0, 0, 0]); break;
        case "Human": scoreArray = UpdateScoreArray(scoreArray, [1, 1, 1, 1, 1, 1]); break;
        case "Tiefling": scoreArray = UpdateScoreArray(scoreArray, [0, 0, 0, 1, 0, 2]); break;
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

const GetTextFileIndex = (fileName, text) => {
    var options = fs.readFileSync(`dndTextFiles/${fileName}.txt`).toString();
    let optionArray = options.split("\r\n");
    return optionArray.indexOf(text);
}

const GetSavingProf = (clss) => {
    let index = GetTextFileIndex('classes', clss);
    let profArr = [];
    switch (index) {
        case 0: profArr = [1, 0, 1, 0, 0, 0]; break;
        case 1: profArr = [0, 1, 0, 0, 0, 1]; break;
        case 2: profArr = [0, 0, 0, 0, 1, 1]; break;
        case 3: profArr = [0, 0, 0, 1, 1, 0]; break;
        case 4: profArr = [1, 0, 1, 0, 0, 0]; break;
        case 5: profArr = [1, 1, 0, 0, 0, 0]; break;
        case 6: profArr = [0, 0, 0, 0, 1, 1]; break;
        case 7: profArr = [1, 1, 0, 0, 0, 0]; break;
        case 8: profArr = [0, 1, 0, 0, 1, 0]; break;
        case 9: profArr = [0, 0, 1, 0, 0, 1]; break;
        case 10: profArr = [0, 0, 0, 0, 1, 1]; break;
        case 11: profArr = [0, 0, 0, 1, 1, 0]; break;
    }
    return profArr;
}

const GetSkillIndexes = (arr, amount) => {
    var indexArr = [];
    for(var i = 0; i < amount; i++) {
        var option = randomInt(0, arr.length - 1);
        while(indexArr.includes(option)) {
            option = randomInt(0, arr.length - 1);
        }
        indexArr.push(option);
    }
    return indexArr;
}

const MergeArrays = (mainArr, addArr) => {
    for(var i = 0; i < addArr.length; i++) {
        mainArr.push(addArr[i]);
    }
    return mainArr;
}

const FilterArray = (mainArr, subArr) => {
    for(var i = 0; i < subArr.length; i++) {
        mainArr = mainArr.filter(function(item) {
            return item !== subArr[i]
        })
    }
    return mainArr;
}

const GetSkills = (clss, background) => {
    let classIndex = GetTextFileIndex('classes', clss);
    let bgIndex = GetTextFileIndex('background', background);
    let bgSkills;
    let skillIndexes = [];
    switch (bgIndex) {
        case 0: bgSkills = [6, 14]; break;
        case 1: bgSkills = [4, 15]; break;
        case 2: bgSkills = [4, 16]; break;
        case 3: bgSkills = [0, 12]; break;
        case 4: bgSkills = [1, 17]; break;
        case 5: bgSkills = [6, 13]; break;
        case 6: bgSkills = [9, 14]; break;
        case 7: bgSkills = [5, 13]; break;
        case 8: bgSkills = [3, 17]; break;
        case 9: bgSkills = [2, 5]; break;
        case 10: bgSkills = [3, 11]; break;
        case 11: bgSkills = [3, 7]; break;
        case 12: bgSkills = [15, 16]; break;
    }
    switch (classIndex) {
        case 0: skillIndexes = GetSkillIndexes(FilterArray([1, 3, 7, 10, 11, 17], bgSkills), 2); break;
        case 1: skillIndexes = GetSkillIndexes(FilterArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], bgSkills), 3); break;
        case 2: skillIndexes = GetSkillIndexes(FilterArray([5, 6, 9, 13, 14], bgSkills), 2); break;
        case 3: skillIndexes = GetSkillIndexes(FilterArray([1, 2, 6, 9, 10, 11, 14, 17], bgSkills), 2); break;
        case 4: skillIndexes = GetSkillIndexes(FilterArray([0, 1, 3, 5, 6, 7, 11, 17], bgSkills), 2); break;
        case 5: skillIndexes = GetSkillIndexes(FilterArray([0, 3, 5, 6, 14, 16], bgSkills), 2); break;
        case 6: skillIndexes = GetSkillIndexes(FilterArray([3, 6, 7, 9, 13, 14], bgSkills), 2); break;
        case 7: skillIndexes = GetSkillIndexes(FilterArray([1, 3, 6, 8, 10, 11, 16, 17], bgSkills), 3); break;
        case 8: skillIndexes = GetSkillIndexes(FilterArray([0, 3, 4, 6, 7, 8, 11, 12, 13, 15, 16], bgSkills), 4); break;
        case 9: skillIndexes = GetSkillIndexes(FilterArray([2, 4, 6, 7, 13, 14], bgSkills), 2); break;
        case 10: skillIndexes = GetSkillIndexes(FilterArray([2, 4, 5, 7, 8, 10, 14], bgSkills), 2); break;
        case 11: skillIndexes = GetSkillIndexes(FilterArray([2, 5, 6, 8, 9, 14], bgSkills), 2); break;
    }

    skillIndexes = MergeArrays(skillIndexes, bgSkills);

    let skillArray = [];
    for(var i = 0; i < 18; i++) {
        if(skillIndexes.includes(i)) skillArray.push(1);
        else skillArray.push(0);
    }
    return skillArray;
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

const Write32Font = (abilityModArray) => {
    var loadedImage;
    Jimp.read('images/dnd.png')
        .then(function (image) {
            loadedImage = image;
            return Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        })
        .then(function (font) {
            var modString;
            for(var i = 0; i < abilityModArray.length; i++) {
                modString = abilityModArray[i].toString();
                if(abilityModArray[i] > -1) modString = "+" + modString;
                loadedImage.print(font, 50, 200 + (i * 105), modString);
            }
            loadedImage.write('images/32font.png');
        })
        .catch(function (err) {
            console.error(err);
        });
}

const PrintSavings = (loadedImage, font, startingY, arr, abilityModArray) => {
    for(var i = 0; i < arr.length; i++) {
        var modValue = abilityModArray[i];
        var modString;
        if(arr[i] == 0) {
            modString = modValue.toString();
            if(modValue > -1) modString = "+" + modString;
            loadedImage.print(font, 149, startingY + (i * 18), modString);
        }
        else {
            modValue = modValue + 2;
            modString = modValue.toString();
            if(modValue > -1) modString = "+" + modString;
            loadedImage.print(font, 149, startingY + (i * 18), (modString).toString());
        }
    }
}

const PrintSkills = (loadedImage, font, startingY, arr, modArr) => {
    var yDiff = 18.35;
    var modValue;
    for(var i = 0; i < arr.length; i++) {      
        switch (i) {
            case 0: modValue = modArr[1]; break;
            case 1: modValue = modArr[4]; break;
            case 2: modValue = modArr[3]; break;
            case 3: modValue = modArr[0]; break;
            case 4: modValue = modArr[5]; break;
            case 5: modValue = modArr[3]; break;
            case 6: modValue = modArr[4]; break;
            case 7: modValue = modArr[5]; break;
            case 8: modValue = modArr[3]; break;
            case 9: modValue = modArr[4]; break;
            case 10: modValue = modArr[3]; break;
            case 11: modValue = modArr[4]; break;
            case 12: modValue = modArr[5]; break;
            case 13: modValue = modArr[5]; break;
            case 14: modValue = modArr[3]; break;
            case 15: modValue = modArr[1]; break;
            case 16: modValue = modArr[1]; break;
            case 17: modValue = modArr[4]; break;
        }
        var modString;
        if(arr[i] == 0) {
            modString = modValue.toString();
            if(modValue > -1) modString = "+" + modString;
            loadedImage.print(font, 149, startingY + (i * yDiff), modString);
        }
        else {
            modValue = modValue + 2;
            modString = modValue.toString();
            if(modValue > -1) modString = "+" + modString;
            loadedImage.print(font, 149, startingY + (i * yDiff), (modString).toString());
        }
    }
}

const PrintPassivePerception = (loadedImage, font, perception, modArr) => {
    var modValue = modArr[4];
    if(perception == 1) modValue = modValue + 2;
    loadedImage.print(font, 141, 783, modValue.toString());
}

const GetExtraProfs = (profText) => {
    var extraArr = [];
    let fileName = profText.substring(2);
    let extra = ChooseRandomText(fileName);
    for(var i = 0; i < parseInt(profText[1]); i++) {
        while(extraArr.includes(extra)) {
            extra = ChooseRandomText(fileName);
        }
        extraArr.push(extra);
    }
    return extraArr;
}

const PrintProficiencies = (clss) => {
    var options = fs.readFileSync('dndTextFiles/classProfs.txt').toString();
    let optionArray = options.split("\r\n");
    let profString;
    for(var i = 0; i < optionArray.length; i++) {
        if(optionArray[i].includes(clss)) profString = optionArray[i + 1];
    }
    let profArray = profString.split(", ");
    let extraProfs = [];
    profArray.forEach(prof => {
        if(prof.includes('/')){
            var extrasArr = prof.split('/');
            var extraText = extrasArr[randomInt(0, 1)];
            extraProfs = GetExtraProfs(extraText);
        } else if(prof.includes('x')) {
            extraProfs = GetExtraProfs(prof);
        }
    });
    console.log(extraProfs)
}

const Write16Font = (race, clss, background, alignment, saves, skills, abilityModArray, scoreArray) => {
    var loadedImage;
    Jimp.read('images/32font.png')
        .then(function (image) {
            loadedImage = image;
            return Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
        })
        .then(function (font) {
            for(var i = 0; i < scoreArray.length; i++) {
                var x = 58;
                if(scoreArray[i] < 10) x = 63;
                loadedImage.print(font, x, 247 + (i * 104), scoreArray[i].toString());
            }
            loadedImage.print(font, 500, 63, race);
            loadedImage.print(font, 355, 63, clss);
            loadedImage.print(font, 500, 96, alignment);
            loadedImage.print(font, 640, 96, background);
            loadedImage.print(font, 134, 215, "+2"); //Proficiency bonus
            PrintPassivePerception(loadedImage, font, skills[11], abilityModArray);
            PrintSavings(loadedImage, font, 256, saves, abilityModArray);
            PrintSkills(loadedImage, font, 406, skills, abilityModArray);
            PrintProficiencies(loadedImage, font, )
            loadedImage.write('images/final.png');
        })
        .catch(function (err) {
            console.error(err);
        });
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const Main = async () => {
    let race = ChooseRandomText('races');
    let clss = ChooseRandomText('classes');
    let background = ChooseRandomText('background');
    let alignment = ChooseRandomText('alignments');
    let scoreArray = GetScoreArray(clss, race);
    let abilityModArray = GetAbilityModArray(scoreArray); 
    let saves = GetSavingProf(clss);
    let skills = GetSkills(clss, background);
    Write32Font(abilityModArray);
    await sleep(200);
    Write16Font(race, clss, background, alignment, saves, skills, abilityModArray, scoreArray);

}

PrintProficiencies('Monk');