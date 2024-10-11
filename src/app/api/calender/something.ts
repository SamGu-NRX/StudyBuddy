import { google } from "googleapis";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";

export async function getCalendarEvents(session, events, id: String) {
  const this_session = await getSession({ session });

  if (!session) {
    events.status(401).json({ error: "Unauthorized" });
    return;
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: id,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    events.status(200).json(response.data.items);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    events.status(500).json({ error: "Error fetching calendar events" });
  }
}

export function isAvailable(
  session: Session,
  args: {
    startDate: Date;
    endDate: Date;
    calanderId: String;
  }
) {
  var events;

  getCalendarEvents(session, new Response(), args.calanderId)
    .then((res) => {
      res.json();
    })
    .then((data) => {
      events = data;
    });

  if (events["error"] == null) {
    return null;
  }
}
