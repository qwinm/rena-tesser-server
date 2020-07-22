
// const Tesseract = require('tesseract.js');
const { createWorker } = require('tesseract.js');

const worker = createWorker({
    logger: m => console.log(m)
});


module.exports = async function (path) {
    return new Promise(async (resolve, reject) => {
        console.log("tesseract generating text....");

        try {
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(path);
            // console.log(text);
            resolve(text)
            // await worker.terminate();
        } catch (err) {
            reject(err)
        }
    })

};