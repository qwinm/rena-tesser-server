const config = require('./config.json');
const BoxSDK = require('box-node-sdk');
const sdk = BoxSDK.getPreconfiguredInstance(config);
const client = sdk.getAppAuthClient('enterprise', "434476159");
const fs = require('fs');
const request = require('request');
// Keep BOX env variables in .ENV => TO DO

// const fileData = createReadStream(join(__dirname, "/dsa.pdf"))//name.pdf ---- name from dir
const uploadFilesInBoxStorage = async (nameEx, fileData, txtData) => {
  return new Promise((resolve, reject) => {
    const randName = Date.now() + nameEx
    client.files.uploadFile('0', randName, fileData, (err, uploadedFile) => {
      if (err) {
        console.log('Uploading file in the Box failed', err);
        reject(err);
      }

      // Convert string as a stream for txt
      const txtFileName = `${randName.split('.')[0]}.txt`;
      fs.writeFileSync(txtFileName, txtData);
      const txtStream = fs.readFileSync(txtFileName);

      client.files.uploadFile('0', txtFileName, txtStream, (err, uploadedTxtFile) => {
        if (err) {
          console.log('Uploading txt file in the box failed', err);
        }

        console.log('Txt file uploaded', uploadedTxtFile);
        fs.unlinkSync(txtFileName);
        resolve({
          originFileId: uploadedFile.entries[0].id,
          txtFileId: uploadedTxtFile.entries[0].id,
        });
      });
    });
  });
};

// Expires after 15 min.
const generateDownloadURL = async (fileId) => {
  return await client.files.getDownloadURL(fileId);
};

const txtFileParser = async (textURL) => {
  return new Promise((resolve, reject) => {

    request.get(textURL, function (error, response, body) {
      if (error) {
        console.log(error);
        reject(error)
      }
      // Continue with your processing here.
      resolve({ text: body || "" });
    });
  })
};


const readFileInfo = async (fileId) => {

  const fileInfo = await client.files.get(fileId)
  if (!fileInfo) throw new Error("file is not found")
  return fileInfo.name

};

const deleteFileFromBox = (fileID) => {
  return new Promise((resolve, reject) => {

    client.files.delete(fileID)
      .then(() => {
        console.log("file successfully deleted from box");
        client.files.deletePermanently(fileID)
          .then(() => {
            // deletion succeeded — no value returned
            resolve("ok")
          }).catch(err => {
            console.log(err.message);
            reject(err)
          })

        // File successfully deleted

      })
      .catch(err => {
        if (err) {
          console.log(err.message);

          reject(err)
        }
      });
  })
};


module.exports = {
  uploadFilesInBoxStorage,
  generateDownloadURL,
  readFileInfo,
  txtFileParser,
  deleteFileFromBox,
};
