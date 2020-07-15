const formidable = require('formidable');
const fs = require('fs');


async function ParseIncomingForm(req) {
  const form = new formidable.IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      try {
        const data = fs.readFileSync(files.file.path);
        const fileName = files.file.name;
        const path = files.file.path
        resolve({
          path,
          data,
          fileName,
          // txtData: fields.readResult,
        });
      } catch (error) {
        reject(error);
      }
    });
  });
};

module.exports = {
  ParseIncomingForm,
};
