const { createWorker } = require('tesseract.js');



const worker = createWorker();

module.exports = async function (path) {
    console.log("tesseract generating text....");
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(path);
    // console.log(text);//////////// text is the one!!!!

    // await worker.terminate();
    return text

};