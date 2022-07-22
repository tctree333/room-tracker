import json
import os
from datetime import datetime, timedelta, timezone

import requests

SPREADSHEET_URL = os.getenv("SPREADSHEET_URL")

PST_TIME = datetime.now(timezone(-timedelta(hours=8)))
FILENAME_TODAY = PST_TIME.strftime("archive/data/day/%Y-%m-%d.json")
FILENAME_ROLLING = "archive/data/rolling.json"


def main():
    resp = requests.get(SPREADSHEET_URL)
    new_data = resp.json()

    today = []
    if os.path.exists(FILENAME_TODAY):
        with open(FILENAME_TODAY, "rt") as f:
            today = json.load(f)
    today.extend(new_data)
    today = list(sorted(today, key=lambda x: x["timestamp"]))
    with open(FILENAME_TODAY, "wt") as f:
        json.dump(today, f, indent=2)

    rolling = []
    if os.path.exists(FILENAME_ROLLING):
        with open(FILENAME_ROLLING, "rt") as f:
            rolling = json.load(f)
    rolling.extend(new_data)
    rolling = list(
        sorted(
            filter(
                lambda x: datetime.fromisoformat(x["timestamp"].replace("Z", "+00:00"))
                .astimezone(timezone(-timedelta(hours=8)))
                .date()
                == PST_TIME.date(),
                rolling,
            ),
            key=lambda x: x["timestamp"],
        )
    )
    with open(FILENAME_ROLLING, "wt") as f:
        json.dump(rolling, f, indent=2)


if __name__ == "__main__":
    main()
