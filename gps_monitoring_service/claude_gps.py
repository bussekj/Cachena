#!/usr/bin/env python3
"""
NMEA Sentence Parser for SiRF GPS Devices
Parses standard NMEA 0183 messages: GGA, GLL, GSA, GSV, RMC, VTG, ZDA
and SiRF proprietary messages: PSRF150, PSRF151, PSRF152, PSRF154
"""

import serial
import argparse
import sys
from dataclasses import dataclass, field
from typing import Optional

valid_GPS_reads = 0

# ---------------------------------------------------------------------------
# Checksum validation
# ---------------------------------------------------------------------------

def validate_checksum(sentence: str) -> bool:
    """Verify NMEA checksum (XOR of all bytes between $ and *)."""
    try:
        if "*" not in sentence:
            return False
        data, checksum_str = sentence.lstrip("$").rsplit("*", 1)
        computed = 0
        for ch in data:
            computed ^= ord(ch)
        return computed == int(checksum_str.strip(), 16)
    except (ValueError, IndexError):
        return False


# ---------------------------------------------------------------------------
# Parsers for each sentence type
# ---------------------------------------------------------------------------

def _fields(sentence: str) -> list[str]:
    """Strip message ID prefix and checksum, return comma-split fields."""
    body = sentence.lstrip("$")
    if "*" in body:
        body = body.rsplit("*", 1)[0]
    return body.split(",")


def parse_gga(sentence: str) -> dict:
    """GGA – Global Positioning System Fixed Data."""
    f = _fields(sentence)
    fix_indicators = {
        "0": "Fix not available",
        "1": "GPS SPS Mode",
        "2": "Differential GPS",
        "6": "Dead Reckoning",
    }
    return {
        "type": "GGA",
        "utc_time":       f[1] if len(f) > 1 else "",
        "latitude":       _lat(f[2], f[3]) if len(f) > 3 else None,
        "longitude":      _lon(f[4], f[5]) if len(f) > 5 else None,
        "fix":            fix_indicators.get(f[6], "Unknown") if len(f) > 6 else "",
        "satellites":     f[7] if len(f) > 7 else "",
        "hdop":           f[8] if len(f) > 8 else "",
        "altitude_m":     f[9] if len(f) > 9 else "",
        "geoid_sep_m":    f[11] if len(f) > 11 else "",
    }


def parse_gll(sentence: str) -> dict:
    """GLL – Geographic Position Latitude/Longitude."""
    f = _fields(sentence)
    if len(f) > 6 and f[6] == "A":
        global valid_GPS_reads
        valid_GPS_reads += 1
    return {
        "type":       "GLL",
        "latitude":   _lat(f[1], f[2]) if len(f) > 2 else None,
        "longitude":  _lon(f[3], f[4]) if len(f) > 4 else None,
        "utc_time":   f[5] if len(f) > 5 else "",
        "status":     "Valid"  if len(f) > 6 and f[6] == "A" else "Invalid",
        "mode":       f[7] if len(f) > 7 else "",
    }


def parse_gsa(sentence: str) -> dict:
    """GSA – GNSS DOP and Active Satellites."""
    f = _fields(sentence)
    mode1_map = {"M": "Manual", "A": "Automatic"}
    mode2_map = {"1": "No fix", "2": "2D fix", "3": "3D fix"}
    svs = [f[i] for i in range(3, 15) if len(f) > i and f[i]]
    return {
        "type":    "GSA",
        "mode1":   mode1_map.get(f[1], f[1]) if len(f) > 1 else "",
        "mode2":   mode2_map.get(f[2], f[2]) if len(f) > 2 else "",
        "svs":     svs,
        "pdop":    f[15] if len(f) > 15 else "",
        "hdop":    f[16] if len(f) > 16 else "",
        "vdop":    f[17] if len(f) > 17 else "",
    }


def parse_gsv(sentence: str) -> dict:
    """GSV – GNSS Satellites in View."""
    f = _fields(sentence)
    satellites = []
    for i in range(4, len(f) - 3, 4):
        if len(f) > i + 3:
            satellites.append({
                "prn":       f[i],
                "elevation": f[i + 1],
                "azimuth":   f[i + 2],
                "snr":       f[i + 3].split("*")[0],
            })
    return {
        "type":           "GSV",
        "total_messages": f[1] if len(f) > 1 else "",
        "message_num":    f[2] if len(f) > 2 else "",
        "sats_in_view":   f[3] if len(f) > 3 else "",
        "satellites":     satellites,
    }


def parse_rmc(sentence: str) -> dict:
    """RMC – Recommended Minimum Specific GNSS Data."""
    f = _fields(sentence)
    return {
        "type":       "RMC",
        "utc_time":   f[1] if len(f) > 1 else "",
        "status":     "Valid" if len(f) > 2 and f[2] == "A" else "Invalid",
        "latitude":   _lat(f[3], f[4]) if len(f) > 4 else None,
        "longitude":  _lon(f[5], f[6]) if len(f) > 6 else None,
        "speed_kn":   f[7] if len(f) > 7 else "",
        "course_deg": f[8] if len(f) > 8 else "",
        "date":       f[9] if len(f) > 9 else "",
        "mode":       f[12].split("*")[0] if len(f) > 12 else "",
    }


def parse_vtg(sentence: str) -> dict:
    """VTG – Course Over Ground and Ground Speed."""
    f = _fields(sentence)
    return {
        "type":         "VTG",
        "course_true":  f[1] if len(f) > 1 else "",
        "course_mag":   f[3] if len(f) > 3 else "",
        "speed_kn":     f[5] if len(f) > 5 else "",
        "speed_kmh":    f[7] if len(f) > 7 else "",
        "mode":         f[9].split("*")[0] if len(f) > 9 else "",
    }


def parse_zda(sentence: str) -> dict:
    """ZDA – SiRF Timing Message (1 PPS)."""
    f = _fields(sentence)
    return {
        "type":       "ZDA",
        "utc_time":   f[1] if len(f) > 1 else "",
        "day":        f[2] if len(f) > 2 else "",
        "month":      f[3] if len(f) > 3 else "",
        "year":       f[4] if len(f) > 4 else "",
        "zone_hr":    f[5] if len(f) > 5 else "",
        "zone_min":   f[6].split("*")[0] if len(f) > 6 else "",
    }


def parse_mss(sentence: str) -> dict:
    """MSS – MSK Receiver Signal."""
    f = _fields(sentence)
    return {
        "type":           "MSS",
        "signal_strength": f[1] if len(f) > 1 else "",
        "snr":            f[2] if len(f) > 2 else "",
        "frequency_khz":  f[3] if len(f) > 3 else "",
        "bit_rate":       f[4] if len(f) > 4 else "",
        "channel":        f[5].split("*")[0] if len(f) > 5 else "",
    }


def parse_psrf150(sentence: str) -> dict:
    """PSRF150 – OkToSend (trickle power mode)."""
    f = _fields(sentence)
    val = f[1].split("*")[0] if len(f) > 1 else ""
    return {
        "type":      "PSRF150",
        "ok_to_send": val == "1",
        "raw":        val,
    }


def parse_psrf151(sentence: str) -> dict:
    """PSRF151 – GPS Data and Extended Ephemeris Mask."""
    f = _fields(sentence)
    return {
        "type":            "PSRF151",
        "time_valid_flag": f[1] if len(f) > 1 else "",
        "gps_week":        f[2] if len(f) > 2 else "",
        "gps_tow":         f[3] if len(f) > 3 else "",
        "eph_req_mask":    f[4].split("*")[0] if len(f) > 4 else "",
    }


def parse_psrf152(sentence: str) -> dict:
    """PSRF152 – Extended Ephemeris Integrity."""
    f = _fields(sentence)
    return {
        "type":               "PSRF152",
        "sat_pos_validity":   f[1] if len(f) > 1 else "",
        "sat_clk_validity":   f[2] if len(f) > 2 else "",
        "sat_health_flag":    f[3].split("*")[0] if len(f) > 3 else "",
    }


def parse_psrf154(sentence: str) -> dict:
    """PSRF154 – Extended Ephemeris ACK."""
    f = _fields(sentence)
    return {
        "type":   "PSRF154",
        "ack_id": f[1].split("*")[0] if len(f) > 1 else "",
    }


# ---------------------------------------------------------------------------
# Coordinate helpers
# ---------------------------------------------------------------------------

def _lat(raw: str, hemi: str) -> Optional[float]:
    """Convert NMEA ddmm.mmmm + N/S to signed decimal degrees."""
    try:
        deg = float(raw[:2])
        mins = float(raw[2:])
        val = deg + mins / 60.0
        return -val if hemi.upper() == "S" else val
    except (ValueError, IndexError):
        return None


def _lon(raw: str, hemi: str) -> Optional[float]:
    """Convert NMEA dddmm.mmmm + E/W to signed decimal degrees."""
    try:
        deg = float(raw[:3])
        mins = float(raw[3:])
        val = deg + mins / 60.0
        return -val if hemi.upper() == "W" else val
    except (ValueError, IndexError):
        return None


# ---------------------------------------------------------------------------
# Dispatch table
# ---------------------------------------------------------------------------

PARSERS = {
    "GPGGA":    parse_gga,
    "GPGLL":    parse_gll,
    "GPGSA":    parse_gsa,
    "GPGSV":    parse_gsv,
    "GPRMC":    parse_rmc,
    "GPVTG":    parse_vtg,
    "GPZDA":    parse_zda,
    "GPMSS":    parse_mss,
    "PSRF150":  parse_psrf150,
    "PSRF151":  parse_psrf151,
    "PSRF152":  parse_psrf152,
    "PSRF154":  parse_psrf154,
}


def parse_sentence(sentence: str) -> Optional[dict]:
    """Validate checksum and dispatch to the appropriate parser."""
    sentence = sentence.strip()
    if not sentence.startswith("$"):
        return None
    if not validate_checksum(sentence):
        return {"type": "CHECKSUM_ERROR", "raw": sentence}
    msg_id = sentence.lstrip("$").split(",")[0].upper()
    parser = PARSERS.get(msg_id)
    if parser:
        try:
            return parser(sentence)
        except Exception as e:
            return {"type": "PARSE_ERROR", "msg_id": msg_id, "error": str(e)}
    return {"type": "UNKNOWN", "msg_id": msg_id, "raw": sentence}


# ---------------------------------------------------------------------------
# Pretty printer
# ---------------------------------------------------------------------------

def format_parsed(parsed: dict) -> str:
    msg_type = parsed.get("type", "?")

    if msg_type == "GGA":
        lat = f"{parsed['latitude']:.6f}°" if parsed['latitude'] is not None else "N/A"
        lon = f"{parsed['longitude']:.6f}°" if parsed['longitude'] is not None else "N/A"
        return (f"[GGA] Time={parsed['utc_time']}  "
                f"Lat={lat}  Lon={lon}  "
                f"Fix={parsed['fix']}  Sats={parsed['satellites']}  "
                f"Alt={parsed['altitude_m']}m  HDOP={parsed['hdop']}")

    elif msg_type == "GLL":
        lat = f"{parsed['latitude']:.6f}°" if parsed['latitude'] is not None else "N/A"
        lon = f"{parsed['longitude']:.6f}°" if parsed['longitude'] is not None else "N/A"
        return (f"[GLL] Time={parsed['utc_time']}  "
                f"Lat={lat}  Lon={lon}  Status={parsed['status']}")

    elif msg_type == "GSA":
        return (f"[GSA] Mode={parsed['mode1']}/{parsed['mode2']}  "
                f"SVs={','.join(parsed['svs'])}  "
                f"PDOP={parsed['pdop']}  HDOP={parsed['hdop']}  VDOP={parsed['vdop']}")

    elif msg_type == "GSV":
        sv_info = "  ".join(
            f"PRN{s['prn']}(el={s['elevation']} az={s['azimuth']} snr={s['snr']})"
            for s in parsed["satellites"]
        )
        return (f"[GSV] Msg {parsed['message_num']}/{parsed['total_messages']}  "
                f"InView={parsed['sats_in_view']}  {sv_info}")

    elif msg_type == "RMC":
        lat = f"{parsed['latitude']:.6f}°" if parsed['latitude'] is not None else "N/A"
        lon = f"{parsed['longitude']:.6f}°" if parsed['longitude'] is not None else "N/A"
        return (f"[RMC] Date={parsed['date']} Time={parsed['utc_time']}  "
                f"Lat={lat}  Lon={lon}  "
                f"Speed={parsed['speed_kn']}kn  Course={parsed['course_deg']}°  "
                f"Status={parsed['status']}")

    elif msg_type == "VTG":
        return (f"[VTG] Course={parsed['course_true']}°T  "
                f"Speed={parsed['speed_kn']}kn / {parsed['speed_kmh']}km/h")

    elif msg_type == "ZDA":
        return (f"[ZDA] {parsed['year']}-{parsed['month']}-{parsed['day']}  "
                f"Time={parsed['utc_time']}  Zone={parsed['zone_hr']}:{parsed['zone_min']}")

    elif msg_type == "MSS":
        return (f"[MSS] Freq={parsed['frequency_khz']}kHz  "
                f"SS={parsed['signal_strength']}dB  SNR={parsed['snr']}dB  "
                f"BitRate={parsed['bit_rate']}bps  Ch={parsed['channel']}")

    elif msg_type == "PSRF150":
        status = "OK to send" if parsed["ok_to_send"] else "NOT OK to send"
        return f"[PSRF150] Trickle Power: {status}"

    elif msg_type == "PSRF151":
        return (f"[PSRF151] GPSWeek={parsed['gps_week']}  "
                f"TOW={parsed['gps_tow']}  EphMask={parsed['eph_req_mask']}")

    elif msg_type == "PSRF152":
        return (f"[PSRF152] PosValidity={parsed['sat_pos_validity']}  "
                f"ClkValidity={parsed['sat_clk_validity']}  "
                f"Health={parsed['sat_health_flag']}")

    elif msg_type == "PSRF154":
        return f"[PSRF154] ACK for Message ID {parsed['ack_id']}"

    elif msg_type == "CHECKSUM_ERROR":
        return f"[ERROR] Bad checksum: {parsed['raw']}"

    elif msg_type == "PARSE_ERROR":
        return f"[ERROR] Parse failed for {parsed['msg_id']}: {parsed['error']}"

    elif msg_type == "UNKNOWN":
        return f"[UNKNOWN] {parsed['msg_id']}: {parsed['raw']}"

    return f"[{msg_type}] {parsed}"


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Read and parse NMEA sentences from a serial GPS device."
    )
    parser.add_argument("port", help="Serial port (e.g. /dev/ttyUSB0 or COM3)")
    parser.add_argument("--baud", type=int, default=9600,
                        help="Baud rate (default: 9600)")
    parser.add_argument("--timeout", type=float, default=1.0,
                        help="Read timeout in seconds (default: 1.0)")
    parser.add_argument("--filter", nargs="*",
                        help="Only show these message types, e.g. --filter GGA RMC")
    parser.add_argument("--raw", action="store_true",
                        help="Also print the raw NMEA sentence")
    parser.add_argument("--count", type=int, default=0,
                        help="Stop after N sentences (0 = run forever)")
    args = parser.parse_args()

    filter_set = {t.upper() for t in args.filter} if args.filter else None

    print(f"Opening {"/dev/ttyACM0"} at {args.baud} baud...")
    try:
        ser = serial.Serial("/dev/ttyACM0", baudrate=args.baud, timeout=args.timeout)
    except serial.SerialException as e:
        print(f"Error opening port: {e}", file=sys.stderr)
        sys.exit(1)

    print("Listening for NMEA sentences. Press Ctrl+C to stop.\n")
    count = 0
    try:
        while True:
            try:
                line = ser.readline().decode("ascii", errors="replace").strip()
            except serial.SerialException as e:
                print(f"Serial read error: {e}", file=sys.stderr)
                break

            if not line.startswith("$"):
                continue

            parsed = parse_sentence(line)
            if parsed is None:
                continue

            msg_type = parsed.get("type", "")
            if filter_set and msg_type not in filter_set:
                continue

            if args.raw:
                print(f"  RAW: {line}")
            print(format_parsed(parsed))

            count += 1
            if args.count and count >= args.count:
                print(f"\nReached {args.count} sentences. Stopping.")
                break

    except KeyboardInterrupt:
        print("\nStopped by user.")
    finally:
        ser.close()
        print(f"Port {args.port} closed. Total sentences parsed: {count}")
        print(f"Valid GPS reads: {valid_GPS_reads}")


if __name__ == "__main__":
    main()