"""
Developer utility.

Verifies that every state in STATE_MAPPING:

1. Has a valid MERIT page.
2. Returns a valid API response.
3. Has a RequestVerificationToken.
4. Returns station data.
5. Shows total scheduled generation.

Run:

python -m app.analytics.verify_state_mapping
"""

from datetime import datetime

import requests
from bs4 import BeautifulSoup

from app.analytics.constants import STATE_MAPPING

requests.packages.urllib3.disable_warnings()


def verify_state(state_code: str, config: dict):

    session = requests.Session()

    page_url = f"https://meritindia.in/state-data/{config['page']}"

    try:

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
                "stations": 0,
                "generation": 0,
            }

        date_used = "08 Jul 2026"

        payload = {
            "StateCode": config["merit_code"],
            "date": date_used,
        }

        print(
            config["name"],
            date_used,
        )

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
            return {
                "status": "INVALID RESPONSE",
                "stations": 0,
                "generation": 0,
            }

        total_generation = 0

        for station in data:

            try:
                total_generation += float(
                    str(station.get("Schedule") or "0")
                    .replace(",", "")
                    .strip()
                )
            except Exception:
                pass

        if total_generation == 0:
            status = "ZERO DATA"
        else:
            status = "OK"

        return {
            "status": status,
            "stations": len(data),
            "generation": total_generation,
        }

    except Exception as e:

        return {
            "status": f"ERROR ({e})",
            "stations": 0,
            "generation": 0,
        }


def main():

    print("=" * 110)

    print(
        f"{'State':<8}"
        f"{'MERIT':<8}"
        f"{'Page':<28}"
        f"{'Stations':<10}"
        f"{'Generation':<15}"
        f"{'Status'}"
    )

    print("=" * 110)

    ok = 0
    zero = 0
    failed = 0

    for state_code, config in STATE_MAPPING.items():

        result = verify_state(
            state_code,
            config,
        )

        print(
            f"{state_code:<8}"
            f"{config['merit_code']:<8}"
            f"{config['page']:<28}"
            f"{result['stations']:<10}"
            f"{result['generation']:<15.2f}"
            f"{result['status']}"
        )

        if result["status"] == "OK":
            ok += 1
        elif result["status"] == "ZERO DATA":
            zero += 1
        else:
            failed += 1

    print("=" * 110)

    print(f"OK States      : {ok}")
    print(f"Zero Data      : {zero}")
    print(f"Failed States  : {failed}")

    print("=" * 110)


if __name__ == "__main__":
    main()