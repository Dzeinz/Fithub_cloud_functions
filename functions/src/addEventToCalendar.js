const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const calendar = google.calendar("v3");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
const TIME_ZONE = "CST";
const token =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6ImRiMDJhYjMwZTBiNzViOGVjZDRmODE2YmI5ZTE5NzhmNjI4NDk4OTQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzMTMwMTc4NzkxNzQtOWU4dGE4ZjZoaWQ3NTI2NmI5c3Z2MzhoYjFxaHYyYnMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzMTMwMTc4NzkxNzQtYzU5Mjk2aDdxdGxmamhxMGRjcTVjc2s1ZDFhNTVoaWIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTU4OTQ2NzA4MDAyMjUxMzAwNjAiLCJlbWFpbCI6ImJlbjU2NzU2N0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Im5RRDJGY1VVZXdnYUhIY2M0VjJhR1EiLCJub25jZSI6IlFra29mbmJpTUROcDl0MHlySFBRQTF4VlQyTmFxTTVSWE9qMzRPZW9COEEiLCJuYW1lIjoiYmVuIHdhcmQiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDQuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy1yTERtMUNGMzE1Zy9BQUFBQUFBQUFBSS9BQUFBQUFBQUFBQS9BQ0hpM3JmZzdteVJsZ2UySDQ5QmN4SU9ZekNhNzF4UUJ3L3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJiZW4iLCJmYW1pbHlfbmFtZSI6IndhcmQiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTU3NDI3ODIzNSwiZXhwIjoxNTc0MjgxODM1fQ.FZs7XV34fjRWEV6SDtHMLEPDl21D8tnDV4ZxavOsv-UuZ6hfjstoT4Fw4tP75GTRsYNPDNTKOhZpBELbP0MYqRzrA4mJ5tOJz1DCgmr1i4bcFZQOca6Pf5Vc_c9pM9O62Tds82mAkIYafpmOiVrY7MBcfkjIWYRFk1gTJW9LGk8CPMXL_PDhzi7ZDIHL0dP8XvwQjkqaqibVX17R_t_XMtJ1wx4_TPDEIT6_jvV3VkR3EMNYBIeWM3iBcaUlIu3f27vgOsyZcWidHGjzY4wCUJ9yLmtJog6RJefvjhJicT5aT98ARptS8VjgcKSrApFJfRmJapHF7s70x6Tpdit6CQ";

try {
  admin.initializeApp(functions.config().firebase);
} catch (e) {
  console.log(`addEventToCalendar: initialization failed. ${e}`);
}

exports.addEventToCalendar = functions.firestore
  .document("events/{eventId}")
  .onCreate(snap => {
    const newEvent = snap.data();

    const sessionQuery = db
      .collection("sessions")
      //.where("sessionId", "==", newEvent.sessionId)
      .limit(1);

    const session = sessionQuery.get().then(querySnapshot => {
      return querySnapshot.docs.map(doc => doc.data())[0];
    });

    const eventData = {
      eventName: session.name,
      description: session.description,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime
    };

    const oAuth2Client = getOauthClient(token);

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
  });

function getOauthClient(accessToken) {
  var oauth = new OAuth2();
  oauth.setCredentials({ access_token: accessToken });
  return oauth;
}
