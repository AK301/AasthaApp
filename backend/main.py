from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import icalendar

app = FastAPI()

# ✅ Allow React frontend to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] if you want to restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Correct Update247 iCal link
ICAL_URL = "http://www.update247.com.au/calendar/cal_room_block.php?roomid=21784&roomtoken=665ni5dnit&siteid=1"


@app.get("/ical_import")
def import_ical():
    """
    Fetch and parse the iCal feed from Update247.
    """
    try:
        response = requests.get(ICAL_URL)
        response.raise_for_status()
        cal = icalendar.Calendar.from_ical(response.text)
        bookings = []

        for component in cal.walk():
            if component.name == "VEVENT":
                bookings.append(
                    {
                        "summary": str(component.get("summary")),
                        "start_date": component.get("dtstart").dt.strftime("%Y-%m-%d"),
                        "end_date": component.get("dtend").dt.strftime("%Y-%m-%d"),
                        "status": "Blocked",
                        "source": "Update247",
                    }
                )

        return {"success": True, "bookings": bookings}

    except Exception as e:
        return {"success": False, "error": str(e)}
