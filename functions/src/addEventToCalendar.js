const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const calendar = google.calendar("v3");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const TIME_ZONE = "CST";
const serverAuthCode =
  "4/tgFh5Ve4IheQ2yRY8uORml7z3esvwE1b9dbwUwV9ryAlWoT2vQlNX64lz9bI2GwKXyQBC6oqXlML1KYZqYwWTwI";

try {
  admin.initializeApp(functions.config().firebase);
} catch (e) {
  console.log(`addEventToCalendar: initialization failed. ${e}`);
}

const db = admin.firestore();

module.exports = functions.firestore
  .document("events/{eventId}")
  .onCreate(snap => {
    const newEvent = snap.data();

    // Trying to just get the first session we find until we get this thing working.
    const sessionQuery = db.collection("sessions").limit(1);

    const session = sessionQuery.get();

    console.log(session.name);
    console.log(session.description);
    console.log(newEvent.startTime);
    console.log(newEvent.endTime);

    const eventData = {
      eventName: "Test name",
      description: "Test description",
      startTime: newEvent.startTime,
      endTime: newEvent.endTime
    };

    createEvent(eventData);
  });

async function createEvent(eventData) {
  const oAuth2Client = await getOauthClient(serverAuthCode);

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
    (err, event) => {
      if (err) {
        console.log(
          "There was an error contacting the Calendar service: " + err
        );
        return;
      }
      console.log("Event created: %s", event.htmlLink);
    }
  );
}

function getOauthClient(serverAuthCode) {
  const clientID =
    "313017879174-smoahcsderaaprplpvg8a6ka3gtacg54.apps.googleusercontent.com";
  const clientSecret = "SrLxagKZz0AHgKPsUDyb-XRC";
  const oauth = new OAuth2(clientID, clientSecret);
  let accessToken = null;

  try {
    accessToken = oauth.getToken(serverAuthCode);
  } catch (e) {
    console.log(`Error getting access token: ${e}`);
  }

  console.log("oath getToken response:");
  console.log(accessToken);
  oauth.setCredentials({ access_token: accessToken });
  return oauth;
}
