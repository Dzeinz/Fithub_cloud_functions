// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

module.exports = functions.https.onRequest((request, response) => {
 response.send("Welcome to FitHub!");
});
