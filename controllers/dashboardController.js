const { User } = require('../models/user');
const { File } = require('../models/file');
const { ParseIncomingForm } = require('../helpers/formParser');
const { uploadFilesInBoxStorage, generateDownloadURL, txtFileParser, deleteFileFromBox, readFileInfo } = require("../box_api/box")
const email = require("../email/email");
const fs = require("fs")
const path = require('path')
const tesseract = require("../tesseract/tesseract")



class FileController {
    async upload(req, res) {
        try {
            const user_id = req.user._id;
            const user = await User.findOne({ _id: user_id });
            const { data, fileName, path } = await ParseIncomingForm(req);
            ///
            const txtData = await tesseract(path)


            ///
            const { originFileId, txtFileId } = await uploadFilesInBoxStorage(fileName, data, txtData);

            // Update user file in DB
            // const userFiles = await File.findById(user_id);
            const documentURL = await generateDownloadURL(originFileId);
            const txtURL = await generateDownloadURL(txtFileId);
            await File.updateOne(
                { user_id },
                { $push: { files: { documentId: originFileId, textId: txtFileId, allText: txtData.toLowerCase() } } },
                { upsert: true });
            await email(user.name, "uploded a new file", fileName, "adm19814576@gmail.com");
            res.status(200).send({ documentURL, txtURL });
        } catch (error) {
            console.log(error);
            res.status(400).send({ error });
        }
    }

    async getFiles(req, res) {
        console.log("-----getfiles keyWord:", req.params.keyWord);///////
        const user_id = req.user._id
        let userFiles;

        if (!req.user.isAdmin) {
            userFiles = await File.find({ user_id }).lean();
        } else {
            userFiles = await File.find().lean();
        }

        const mergedfiles = [];
        if (userFiles && Array.isArray(userFiles)) {
            userFiles.forEach((doc) => {
                mergedfiles.push(...doc.files);
            });
        }

        const response = []
        if (req.params.keyWord !== "all") {
            for (const singleFile of mergedfiles) {
                let keyWordFound = false


                if (singleFile.allText.indexOf(req.params.keyWord) !== -1) {

                    keyWordFound = true
                }


                if (keyWordFound) {

                    // const documentURL = await generateDownloadURL(singleFile.documentId);
                    // const textURL = await generateDownloadURL(singleFile.textId);
                    // const documentName = await readFileInfo(singleFile.documentId);

                    response.push({
                        documentId: singleFile.documentId,
                        // documentName: documentName,
                        documentName: singleFile.documentId,
                        // documentURL,
                        textId: singleFile.textId,
                        // textURL
                    });
                }
            }
        } else {
            for (const singleFile of mergedfiles) {

                // const documentURL = await generateDownloadURL(singleFile.documentId);
                // const textURL = await generateDownloadURL(singleFile.textId);
                // const documentName = await readFileInfo(singleFile.documentId);

                response.push({
                    documentId: singleFile.documentId,
                    // documentName: documentName,S
                    documentName: singleFile.documentId,
                    // documentURL,
                    textId: singleFile.textId,
                    // textURL
                });
            }
        }
        // console.log(response.length);
        res.send(response);
    }

    async delete(req, res) {
        try {
            const { file, text } = req.params
            for (const docID of [file, text]) {
                await deleteFileFromBox(docID)
                await File.update({ user_id: req.user._id }, { $pull: { files: { documentId: docID } } }, { safe: true, multi: true }, function (err, obj) {
                    if (err) console.log(err);
                });
            }
            res.send({})


        } catch (error) {
            console.log(error);
            res.status(400).send({ error });

        }
    }

    async readDocumentFromURL(req, res) {
        try {
            const textURL = await generateDownloadURL(req.params.file);
            const response = await txtFileParser(textURL);
            res.status(200).send(response)

        } catch (error) {
            console.log('Failed in read txt document', error);
            res.status(400).send(error);
        }
    }
    async downloadFile(req, res) {
        const documentURL = await generateDownloadURL(req.params.id);
        res.send(documentURL)
    }
}
module.exports = new FileController()