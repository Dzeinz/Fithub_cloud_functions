const functions = require('firebase-functions')
const admin = require('firebase-admin')
const Mailer = require('../utils/Mailer')
const newTraineeTemplate = require('../templates/newTrainee')

try {admin.initializeApp(functions.config().firebase)} catch(e) {
    console.log(`onUserCreate: initialization failed. ${e}`)
}

module.exports = functions.firestore
.document('users/{userId}')
.onCreate((snap, context) => {
    const data = snap.data();
    const template = data.isTrainer ? newTrainerTemplate : newTraineeTemplate;
    return Mailer.sendEmail(data.email, template);
});