const Mailer = require("nodemailer");

module.exports = function (userName, text, fileName, to) {
    return new Promise((resolve, reject) => {

        const transportar = Mailer.createTransport({
            service: "gmail",
            auth: {
                user: "adm19814576@gmail.com",
                pass: "adm32hh$frad3",
            },
        });

        const mailOptions = {
            from: "adm19814576@gmail.com",
            to: to,
            subject: "New upload",
            html: `<h2 style="color: red"><span style="color:blue">${userName}</span> ${text}</h2><p style="color: blue">${fileName}</p>`, // Description
        };


        // Send an Email
        transportar.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                reject(error)
            }
            resolve("ok")
            // console.log(info);
        });
    })
}