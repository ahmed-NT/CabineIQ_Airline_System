"""Seed flight_db with a realistic set of Royal Air Maroc flights so the
dashboard map and the live status bar are well populated for screenshots.

Times are computed relative to now so the flight-service auto-status scheduler
keeps each flight in its intended state (DELAYED/CANCELLED are forced and never
overridden by the scheduler)."""

import random
from datetime import datetime, timedelta

import pymysql

random.seed(7)

# (flight_number, origin, destination, duration_hours, status)
FLIGHTS = [
    ("AT201", "CMN", "CDG", 3.25, "DEPARTED"),
    ("AT780", "CMN", "JFK", 8.0,  "DEPARTED"),
    ("AT800", "CMN", "LHR", 3.5,  "BOARDING"),
    ("AT970", "CMN", "MAD", 1.5,  "ARRIVED"),
    ("AT974", "CMN", "BCN", 1.83, "DEPARTED"),
    ("AT558", "CMN", "DXB", 7.5,  "SCHEDULED"),
    ("AT240", "CMN", "GVA", 3.0,  "SCHEDULED"),
    ("AT612", "CMN", "MRS", 2.25, "DEPARTED"),
    ("AT616", "CMN", "LYS", 2.67, "SCHEDULED"),
    ("AT620", "CMN", "NCE", 2.5,  "DELAYED"),
    ("AT520", "CMN", "TUN", 2.0,  "ARRIVED"),
    ("AT451", "CMN", "ALG", 1.75, "BOARDING"),
    ("AT530", "CMN", "CAI", 5.0,  "SCHEDULED"),
    ("AT500", "CMN", "DAK", 3.0,  "DEPARTED"),
    # return legs
    ("AT202", "CDG", "CMN", 3.25, "SCHEDULED"),
    ("AT781", "JFK", "CMN", 8.0,  "DEPARTED"),
    ("AT801", "LHR", "CMN", 3.5,  "ARRIVED"),
    ("AT971", "MAD", "CMN", 1.5,  "DEPARTED"),
    ("AT559", "DXB", "CMN", 7.5,  "DEPARTED"),
    ("AT613", "MRS", "CMN", 2.25, "SCHEDULED"),
    ("AT521", "TUN", "CMN", 2.0,  "BOARDING"),
    ("AT531", "CAI", "CMN", 5.0,  "DELAYED"),
    ("AT501", "DAK", "CMN", 3.0,  "ARRIVED"),
    ("AT975", "BCN", "CMN", 1.83, "CANCELLED"),
]

AIRCRAFT_IDS = [11, 12, 13, 15, 16]


def times_for(status: str, dur_h: float, now: datetime):
    d = timedelta(hours=dur_h)
    if status == "DEPARTED":
        dep = now - timedelta(hours=1)
        return dep, dep + d
    if status == "ARRIVED":
        arr = now - timedelta(hours=1)
        return arr - d, arr
    if status == "BOARDING":
        dep = now + timedelta(minutes=20)
        return dep, dep + d
    if status == "DELAYED":
        dep = now + timedelta(hours=1, minutes=30)
        return dep, dep + d
    if status == "CANCELLED":
        dep = now + timedelta(hours=4)
        return dep, dep + d
    # SCHEDULED
    dep = now + timedelta(hours=random.uniform(3, 9))
    return dep, dep + d


def main():
    conn = pymysql.connect(host="localhost", port=3306, user="root",
                           password="root", database="flight_db")
    now = datetime.now()
    inserted = 0
    with conn.cursor() as cur:
        for i, (num, org, dst, dur, status) in enumerate(FLIGHTS):
            dep, arr = times_for(status, dur, now)
            gate = f"{random.choice('ABCDEF')}{random.randint(1, 24)}"
            cur.execute(
                """INSERT INTO flights
                   (flight_number, origin, destination, departure_time,
                    arrival_time, status, aircraft_id, gate, created_at, updated_at)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),NOW())
                   ON DUPLICATE KEY UPDATE
                     origin=VALUES(origin), destination=VALUES(destination),
                     departure_time=VALUES(departure_time), arrival_time=VALUES(arrival_time),
                     status=VALUES(status), aircraft_id=VALUES(aircraft_id), gate=VALUES(gate),
                     updated_at=NOW()""",
                (num, org, dst, dep, arr, status,
                 AIRCRAFT_IDS[i % len(AIRCRAFT_IDS)], gate),
            )
            inserted += 1
    conn.commit()
    conn.close()
    print(f"[SEED] {inserted} vols Royal Air Maroc insérés / mis à jour.")


if __name__ == "__main__":
    main()
