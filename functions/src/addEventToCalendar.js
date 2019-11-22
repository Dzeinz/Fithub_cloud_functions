const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const calendar = google.calendar("v3");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const TIME_ZONE = "America/Chicago";

try {
  admin.initializeApp(functions.config().firebase);
} catch (e) {
  console.log(`addEventToCalendar: initialization failed. ${e}`);
}

const db = admin.firestore();
let trainerId = null;

module.exports = functions.firestore
  .document("events/{eventId}")
  .onCreate(async snap => {
    const newEvent = snap.data();
    trainerId = newEvent.trainerId;

    const trainer = await db
      .collection("users")
      .doc(newEvent.trainerId)
      .get()
      .then(doc => {
        console.log(doc.data());
        return doc.data();
      });

    const session = await db
      .collection("sessions")
      .doc(newEvent.sessionId)
      .get()
      .then(doc => {
        console.log(doc.data());
        return doc.data();
      });

    const eventData = {
      eventName: session.name,
      description: session.description,
      startTime: new Date(newEvent.startTime._seconds * 1000).toISOString(),
      endTime: new Date(newEvent.endTime._seconds * 1000).toISOString()
    };

    createEvent(eventData, trainer.tokens);
  });

async function createEvent(eventData, tokens) {
  const oAuth2Client = await getOauthClient(tokens);

  calendar.events.insert(
    {
      auth: oAuth2Client,
      calendarId: "primary",
      resource: {
        summary: eventData.eventName,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime,
          timeZone: TIME_ZONE
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: TIME_ZONE
        }
      }
    },
    err => {
      if (err) {
        console.log(
          "There was an error contacting the Calendar service: " + err
        );
        return;
      }
      console.log(
        `Successfully created event for trainer: ${trainerId} \n ${JSON.stringify(
          eventData
        )}`
      );
    }
  );
}

async function getOauthClient(userTokens) {
  const { accessToken, refreshToken, serverAuthCode } = userTokens;
  const clientID =
    "313017879174-c59296h7qtlfjhq0dcq5csk5d1a55hib.apps.googleusercontent.com";
  const clientSecret = "CkV0junuAhslcBqhh8V39p8Y";
  const redirectUrl = "https://lab-days.firebaseapp.com/__/auth/handler";
  const oauth = new OAuth2(clientID, clientSecret, redirectUrl);

  if (refreshToken && accessToken) {
    console.log("refreshing tokens");
    await oauth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  } else {
    try {
      const { tokens } = await oauth.getToken(serverAuthCode);
      console.log(tokens);

      const trainer = db.collection("users").doc(trainerId);
      trainer.update({
        tokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token
        }
      });

      await oauth.setCredentials(tokens);
    } catch (e) {
      console.log(`Error getting access token: ${e}`);
    }
  }

  return oauth;
}
