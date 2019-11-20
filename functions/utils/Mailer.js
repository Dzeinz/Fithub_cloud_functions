"use strict";
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

module.exports.sendEmail = async function (recipient, template) {
    const OAuth2 = google.auth.OAuth2;
    const APP_NAME = "FitHub";
    const clientID = "313017879174-smoahcsderaaprplpvg8a6ka3gtacg54.apps.googleusercontent.com";
    const clientSecret = "SrLxagKZz0AHgKPsUDyb-XRC";
    const refreshToken = "1//045KCr0b9d5loCgYIARAAGAQSNwF-L9IrT9JAOIy3eRxKeOjRa6BPmOhbSl4zoi-1ifna9v7v0RQn60PoBGn2kQXb8_ZEyt4mFxQ"

    var oauth2Client = new OAuth2(
        clientID,
        clientSecret,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
    refresh_token: refreshToken
    });
    const tokens = await oauth2Client.refreshAccessToken();
    const accessToken = tokens.credentials.access_token;

    const smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: "fithubdaxko@gmail.com",
            clientId: clientID,
            clientSecret: clientSecret,
            refreshToken: refreshToken,
            accessToken: accessToken
        }
    });

    const mailOptions = {
        from: `${APP_NAME} <fithubdaxko@gmail.com>`,
        to: recipient, //sending to email IDs in app request, please check README.md
        subject: `Hello from ${APP_NAME}!`,
        html: template
    };

    smtpTransport.sendMail(mailOptions, (error, info) => {
        if(error) {
            console.log(error);
            return false;
        }
        return true;
    });
}