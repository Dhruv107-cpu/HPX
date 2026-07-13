"""
Developer Utility

Checks the latest available MERIT power station data
for every state by searching backwards for up to
14 days.

Run:

python -m app.analytics.check_data_availability
"""

from datetime import datetime, timedelta

import requests
from bs4 import BeautifulSoup

from app.analytics.constants import STATE_MAPPING

requests.packages.urllib3.disable_warnings()


MAX_DAYS_BACK = 14


def check_state(state_code: str, config: dict):

    session = requests.Session()

    page_url = f"https://meritindia.in/state-data/{config['page']}"

    try:

        # ---------------------------------------
        # Step 1 : Open state page
        # ---------------------------------------

        page = session.get(
            page_url,
            verify=False,
            timeout=30,
        )

        page.raise_for_status()

        soup = BeautifulSoup(page.text, "html.parser")

        token = soup.find(
            "input",
            {"name": "__RequestVerificationToken"},
        )

        if token is None:
            return {
                "status": "NO TOKEN",
                "report_date": "--",
                "stations": 0,
                "generation": 0,
                "attempts": 0,
            }

        # ---------------------------------------
        # Step 2 : Search previous days
        # ---------------------------------------

        current_date = datetime.now()

        for attempt in range(MAX_DAYS_BACK):

            report_date = current_date.strftime("%d %b %Y")

            payload = {
                "StateCode": config["merit_code"],
                "date": report_date,
            }

            response = session.post(
                "https://meritindia.in/StateWiseDetails/GetPowerStationData",
                json=payload,
                headers={
                    "Accept": "application/json, text/javascript, */*; q=0.01",
                    "Content-Type": "application/json; charset=UTF-8",
                    "Origin": "https://meritindia.in",
                    "Referer": page_url,
                    "X-Requested-With": "XMLHttpRequest",
                },
                verify=False,
                timeout=30,
            )

            response.raise_for_status()

            data = response.json()

            if not isinstance(data, list):
                current_date -= timedelta(days=1)
                continue

            total_generation = 0.0

            for station in data:

                try:

                    total_generation += float(
                        str(station.get("Schedule") or "0")
                        .replace(",", "")
                        .strip()
                    )

                except Exception:
                    pass

            if total_generation > 0:

                return {
                    "status": "OK",
                    "report_date": report_date,
                    "stations": len(data),
                    "generation": total_generation,
                    "attempts": attempt + 1,
                }

            current_date -= timedelta(days=1)

        # ---------------------------------------
        # Nothing found
        # ---------------------------------------

        return {
            "status": "NO DATA",
            "report_date": "--",
            "stations": 0,
            "generation": 0,
            "attempts": MAX_DAYS_BACK,
        }

    except Exception as e:

        return {
            "status": f"ERROR ({e})",
            "report_date": "--",
            "stations": 0,
            "generation": 0,
            "attempts": 0,
        }


def main():

    print("=" * 135)

    print(
        f"{'State':<8}"
        f"{'MERIT':<8}"
        f"{'Latest Date':<16}"
        f"{'Stations':<10}"
        f"{'Generation':<18}"
        f"{'Attempts':<10}"
        f"{'Status'}"
    )

    print("=" * 135)

    ok = 0
    no_data = 0
    failed = 0

    for state_code, config in STATE_MAPPING.items():

        result = check_state(
            state_code,
            config,
        )

        print(
            f"{state_code:<8}"
            f"{config['merit_code']:<8}"
            f"{result['report_date']:<16}"
            f"{result['stations']:<10}"
            f"{result['generation']:<18.2f}"
            f"{result['attempts']:<10}"
            f"{result['status']}"
        )

        if result["status"] == "OK":
            ok += 1
        elif result["status"] == "NO DATA":
            no_data += 1
        else:
            failed += 1

    print("=" * 135)

    print(f"States with Data : {ok}")
    print(f"No Data          : {no_data}")
    print(f"Errors           : {failed}")

    print("=" * 135)


if __name__ == "__main__":
    main()