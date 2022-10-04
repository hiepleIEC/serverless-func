const natural = require('natural');
const wordnet = new natural.WordNet();
const tokenizer = new natural.WordTokenizer();
const finalResult = [];
const getSynomyns = async function(gameName) {
    const tokens = tokenizer.tokenize(gameName);
    const synonymsArrPromise = tokens.map(token => renderSynonym(token));
    const synonymsArr = await Promise.all(synonymsArrPromise);
    const result = [];
    for (let i = 0; i < synonymsArr.length; i++) {
        result.push(...synonymsArr[i])
    };
    printCombination(result, result.length, 3);
    console.log(finalResult);
};
const renderSynonym = async (keyword) => {
    const listSynonyms = [];
    const data = await new Promise((resolve, reject) => {
        wordnet.lookup(keyword, function(results) {
            results.forEach(function(result) {
                result.synonyms.forEach(function(syn) {
                    if (listSynonyms.indexOf(syn) === -1 && listSynonyms.length <=3) {
                        listSynonyms.push(syn);
                    } 
                });
            });
            resolve(listSynonyms);
        });
    });
    return data;
}

const combinationUtil = (arr, n, r, index, data, i)=> {
    let str  = ""
    if (index == r) {
        for (let j = 0; j < r; j++) {
           str += (data[j] + " ");
        }
        finalResult.push(str);

        return;
    }

 
    if (i >= n) {
        return;
    }


    data[index] = arr[i];
    combinationUtil(arr, n, r, index + 1, data, i + 1);

    combinationUtil(arr, n, r, index, data, i + 1);

}


const printCombination = (arr, n, r)=> {
    let data = new Array(r);
    combinationUtil(arr, n, r, 0, data, 0);
}


getSynomyns('Water Sort Color Puzzle Game');