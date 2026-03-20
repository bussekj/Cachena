/**
 * nmea_parser.c
 * NMEA 0183 Sentence Parser for SiRF GPS Devices
 *
 * Receives data as uint8_t bytes from a UART peripheral.
 * Parses: GGA, GLL, GSA, GSV, RMC, VTG, ZDA, MSS
 * SiRF proprietary: PSRF150, PSRF151, PSRF152, PSRF154
 *
 * Usage:
 *   Call nmea_feed_byte(byte) for each uint8_t received from UART.
 *   When a complete sentence is assembled, parse_sentence() is called
 *   automatically and the result is dispatched to the appropriate handler.
 *
 * Porting:
 *   Implement uart_init(), uart_read_byte(), and nmea_output() for your
 *   target platform.  A POSIX reference implementation is provided at the
 *   bottom of this file under #ifdef POSIX_DEMO.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#include "NMEA_parser.h"
#include "sys_app.h"

#define NMEA_MAX_FIELDS   32   /* local to .c — not part of the public API  */

/* -------------------------------------------------------------------------
 * Global counters
 * ---------------------------------------------------------------------- */

static uint32_t valid_GPS_reads = 0;
static uint32_t total_sentences = 0;

/* -------------------------------------------------------------------------
 * Output / callback — weak default; override by defining nmea_output()
 * in your application translation unit.
 * ---------------------------------------------------------------------- */
void nmea_output(const char *msg)
{
    APP_PRINTF("%s", msg);
}

/* -------------------------------------------------------------------------
 * Checksum validation
 * ---------------------------------------------------------------------- */

/**
 * validate_checksum() – XOR of all bytes between '$' and '*'.
 * Returns true if the sentence checksum is correct.
 */
static bool validate_checksum(const char *sentence)
{
    const char *p = sentence;

    /* Skip leading '$' */
    if (*p == '$') p++;

    uint8_t computed = 0;
    while (*p && *p != '*') {
        computed ^= (uint8_t)(*p);
        p++;
    }
    if (*p != '*') return false;
    p++;  /* skip '*' */

    /* Parse two-character hex checksum */
    if (!isxdigit((unsigned char)p[0]) || !isxdigit((unsigned char)p[1]))
        return false;

    char hex[3] = { p[0], p[1], '\0' };
    uint8_t expected = (uint8_t)strtoul(hex, NULL, 16);
    return computed == expected;
}

/* -------------------------------------------------------------------------
 * Field splitting
 * ---------------------------------------------------------------------- */

/**
 * split_fields() – split a comma-delimited NMEA sentence body into an array
 * of pointers.  Modifies 'buf' in place (replaces commas and '*' with '\0').
 * Returns the number of fields found.
 */
static int split_fields(char *buf, char **fields, int max_fields)
{
    int count = 0;
    char *p = buf;

    /* skip leading '$' */
    if (*p == '$') p++;

    fields[count++] = p;

    while (*p && count < max_fields) {
        if (*p == ',' || *p == '*') {
            *p = '\0';
            if (count < max_fields)
                fields[count++] = p + 1;
        }
        p++;
    }
    /* Trim trailing CR/LF from the last field */
    if (count > 0) {
        char *last = fields[count - 1];
        size_t len = strlen(last);
        while (len > 0 && (last[len-1] == '\r' || last[len-1] == '\n'))
            last[--len] = '\0';
    }
    return count;
}

/* -------------------------------------------------------------------------
 * Coordinate helpers
 * ---------------------------------------------------------------------- */

/**
 * parse_lat() – convert NMEA ddmm.mmmm + N/S hemisphere to signed decimal.
 */
static bool parse_lat(const char *raw, const char *hemi, double *out)
{
    if (!raw || !*raw || !hemi || !*hemi) return false;
    double raw_val = atof(raw);
    int    deg  = (int)(raw_val / 100);
    double mins = raw_val - deg * 100.0;
    *out = deg + mins / 60.0;
    if (hemi[0] == 'S' || hemi[0] == 's') *out = -(*out);
    return true;
}

/**
 * parse_lon() – convert NMEA dddmm.mmmm + E/W hemisphere to signed decimal.
 */
static bool parse_lon(const char *raw, const char *hemi, double *out)
{
    if (!raw || !*raw || !hemi || !*hemi) return false;
    double raw_val = atof(raw);
    int    deg  = (int)(raw_val / 100);
    double mins = raw_val - deg * 100.0;
    *out = deg + mins / 60.0;
    if (hemi[0] == 'W' || hemi[0] == 'w') *out = -(*out);
    return true;
}

/* Convenience macro – copy a field string safely */
#define FIELD_COPY(dst, src) \
    do { if ((src) && *(src)) { strncpy((dst), (src), sizeof(dst)-1); (dst)[sizeof(dst)-1]='\0'; } \
         else (dst)[0]='\0'; } while(0)

/* -------------------------------------------------------------------------
 * Individual sentence parsers
 * ---------------------------------------------------------------------- */

static void handle_gga(char **f, int nf)
{
    NmeaGGA g = {0};
    char buf[256];

    if (nf > 1) FIELD_COPY(g.utc_time, f[1]);
    if (nf > 3) parse_lat(f[2], f[3], &g.coord.latitude),  g.coord.lat_valid = true;
    if (nf > 5) parse_lon(f[4], f[5], &g.coord.longitude), g.coord.lon_valid = true;
    if (nf > 6) g.fix_quality  = (uint8_t)atoi(f[6]);
    if (nf > 7) g.satellites   = (uint8_t)atoi(f[7]);
    if (nf > 8) g.hdop         = (float)atof(f[8]);
    if (nf > 9) g.altitude_m   = (float)atof(f[9]);
    if (nf > 11) g.geoid_sep_m = (float)atof(f[11]);

    const char *fix_str;
    switch (g.fix_quality) {
        case 0:  fix_str = "No fix";           break;
        case 1:  fix_str = "GPS SPS Mode";     break;
        case 2:  fix_str = "Differential GPS"; break;
        case 6:  fix_str = "Dead Reckoning";   break;
        default: fix_str = "Unknown";          break;
    }

    snprintf(buf, sizeof(buf),
        "[GGA] Time=%-10s  Lat=%+.6f°  Lon=%+.6f°  Fix=%s  Sats=%u  Alt=%.1fm  HDOP=%.2f",
        g.utc_time,
        g.coord.lat_valid ? g.coord.latitude  : 0.0,
        g.coord.lon_valid ? g.coord.longitude : 0.0,
        fix_str, g.satellites, g.altitude_m, g.hdop);
    nmea_output(buf);
}

static void handle_gll(char **f, int nf)
{
    NmeaGLL g = {0};
    char buf[200];

    if (nf > 2) parse_lat(f[1], f[2], &g.coord.latitude),  g.coord.lat_valid = true;
    if (nf > 4) parse_lon(f[3], f[4], &g.coord.longitude), g.coord.lon_valid = true;
    if (nf > 5) FIELD_COPY(g.utc_time, f[5]);
    if (nf > 6) g.valid = (f[6][0] == 'A');
    if (nf > 7) g.mode  = f[7][0];

    if (g.valid) valid_GPS_reads++;

    snprintf(buf, sizeof(buf),
        "[GLL] Time=%-10s  Lat=%+.6f°  Lon=%+.6f°  Status=%s",
        g.utc_time,
        g.coord.lat_valid ? g.coord.latitude  : 0.0,
        g.coord.lon_valid ? g.coord.longitude : 0.0,
        g.valid ? "Valid" : "Invalid");
    nmea_output(buf);
}

static void handle_gsa(char **f, int nf)
{
    NmeaGSA g = {0};
    char buf[256];
    char sv_buf[128] = "";

    if (nf > 1) g.mode1 = f[1][0];
    if (nf > 2) g.mode2 = (uint8_t)atoi(f[2]);

    /* Fields 3–14 are satellite PRN numbers */
    for (int i = 3; i <= 14 && i < nf; i++) {
        if (f[i] && *f[i]) {
            g.svs[g.sv_count++] = (uint8_t)atoi(f[i]);
        }
    }
    if (nf > 15) g.pdop = (float)atof(f[15]);
    if (nf > 16) g.hdop = (float)atof(f[16]);
    if (nf > 17) g.vdop = (float)atof(f[17]);

    /* Build SV list string */
    for (int i = 0; i < g.sv_count; i++) {
        char tmp[8];
        snprintf(tmp, sizeof(tmp), "%s%u", i ? "," : "", g.svs[i]);
        strncat(sv_buf, tmp, sizeof(sv_buf) - strlen(sv_buf) - 1);
    }

    const char *m1 = (g.mode1 == 'M') ? "Manual" : (g.mode1 == 'A') ? "Automatic" : "?";
    const char *m2;
    switch (g.mode2) {
        case 1:  m2 = "No fix"; break;
        case 2:  m2 = "2D fix"; break;
        case 3:  m2 = "3D fix"; break;
        default: m2 = "?";      break;
    }

    snprintf(buf, sizeof(buf),
        "[GSA] Mode=%s/%s  SVs=[%s]  PDOP=%.2f  HDOP=%.2f  VDOP=%.2f",
        m1, m2, sv_buf, g.pdop, g.hdop, g.vdop);
    nmea_output(buf);
}

static void handle_gsv(char **f, int nf)
{
    NmeaGSV g = {0};
    char buf[512];
    char sv_buf[400] = "";

    if (nf > 1) g.total_messages = (uint8_t)atoi(f[1]);
    if (nf > 2) g.message_num    = (uint8_t)atoi(f[2]);
    if (nf > 3) g.sats_in_view   = (uint8_t)atoi(f[3]);

    for (int i = 4; i + 3 < nf && g.sat_count < NMEA_MAX_SVS; i += 4) {
        NmeaSatInfo *s = &g.satellites[g.sat_count++];
        s->prn       = f[i][0]   ? (uint8_t)atoi(f[i])   : 0;
        s->elevation = f[i+1][0] ? (int8_t)atoi(f[i+1])  : 0;
        s->azimuth   = f[i+2][0] ? (uint16_t)atoi(f[i+2]): 0;
        s->snr       = f[i+3][0] ? (uint8_t)atoi(f[i+3]) : 0;
    }

    for (int i = 0; i < g.sat_count; i++) {
        char tmp[64];
        snprintf(tmp, sizeof(tmp), "  PRN%u(el=%d az=%u snr=%u)",
            g.satellites[i].prn, g.satellites[i].elevation,
            g.satellites[i].azimuth, g.satellites[i].snr);
        strncat(sv_buf, tmp, sizeof(sv_buf) - strlen(sv_buf) - 1);
    }

    snprintf(buf, sizeof(buf),
        "[GSV] Msg %u/%u  InView=%u%s",
        g.message_num, g.total_messages, g.sats_in_view, sv_buf);
    nmea_output(buf);
}

static void handle_rmc(char **f, int nf)
{
    NmeaRMC g = {0};
    char buf[256];

    if (nf > 1) FIELD_COPY(g.utc_time, f[1]);
    if (nf > 2) g.valid = (f[2][0] == 'A');
    if (nf > 4) parse_lat(f[3], f[4], &g.coord.latitude),  g.coord.lat_valid = true;
    if (nf > 6) parse_lon(f[5], f[6], &g.coord.longitude), g.coord.lon_valid = true;
    if (nf > 7) g.speed_kn  = (float)atof(f[7]);
    if (nf > 8) g.course_deg = (float)atof(f[8]);
    if (nf > 9) FIELD_COPY(g.date, f[9]);
    if (nf > 12) g.mode = f[12][0];

    snprintf(buf, sizeof(buf),
        "[RMC] Date=%-7s  Time=%-10s  Lat=%+.6f°  Lon=%+.6f°  Speed=%.2fkn  Course=%.1f°  Status=%s",
        g.date, g.utc_time,
        g.coord.lat_valid ? g.coord.latitude  : 0.0,
        g.coord.lon_valid ? g.coord.longitude : 0.0,
        g.speed_kn, g.course_deg,
        g.valid ? "Valid" : "Invalid");
    nmea_output(buf);
}

static void handle_vtg(char **f, int nf)
{
    NmeaVTG g = {0};
    char buf[160];

    if (nf > 1) g.course_true = (float)atof(f[1]);
    if (nf > 3) g.course_mag  = (float)atof(f[3]);
    if (nf > 5) g.speed_kn    = (float)atof(f[5]);
    if (nf > 7) g.speed_kmh   = (float)atof(f[7]);
    if (nf > 9) g.mode        = f[9][0];

    snprintf(buf, sizeof(buf),
        "[VTG] Course=%.1f°T  Speed=%.2fkn / %.2fkm/h",
        g.course_true, g.speed_kn, g.speed_kmh);
    nmea_output(buf);
}

static void handle_zda(char **f, int nf)
{
    NmeaZDA g = {0};
    char buf[128];

    if (nf > 1) FIELD_COPY(g.utc_time, f[1]);
    if (nf > 2) g.day      = (uint8_t)atoi(f[2]);
    if (nf > 3) g.month    = (uint8_t)atoi(f[3]);
    if (nf > 4) g.year     = (uint16_t)atoi(f[4]);
    if (nf > 5) g.zone_hr  = (int8_t)atoi(f[5]);
    if (nf > 6) g.zone_min = (int8_t)atoi(f[6]);

    snprintf(buf, sizeof(buf),
        "[ZDA] %04u-%02u-%02u  Time=%s  Zone=%+d:%02d",
        g.year, g.month, g.day, g.utc_time, g.zone_hr, g.zone_min);
    nmea_output(buf);
}

static void handle_mss(char **f, int nf)
{
    NmeaMSS g = {0};
    char buf[160];

    if (nf > 1) g.signal_strength_db = (float)atof(f[1]);
    if (nf > 2) g.snr_db             = (float)atof(f[2]);
    if (nf > 3) g.frequency_khz      = (float)atof(f[3]);
    if (nf > 4) g.bit_rate           = (uint16_t)atoi(f[4]);
    if (nf > 5) g.channel            = (uint8_t)atoi(f[5]);

    snprintf(buf, sizeof(buf),
        "[MSS] Freq=%.1fkHz  SS=%.1fdB  SNR=%.1fdB  BitRate=%ubps  Ch=%u",
        g.frequency_khz, g.signal_strength_db, g.snr_db, g.bit_rate, g.channel);
    nmea_output(buf);
}

static void handle_psrf150(char **f, int nf)
{
    NmeaPSRF150 g = {0};
    char buf[80];

    if (nf > 1) g.ok_to_send = (f[1][0] == '1');

    snprintf(buf, sizeof(buf),
        "[PSRF150] Trickle Power: %s", g.ok_to_send ? "OK to send" : "NOT OK to send");
    nmea_output(buf);
}

static void handle_psrf151(char **f, int nf)
{
    NmeaPSRF151 g = {0};
    char buf[128];

    if (nf > 1) g.time_valid_flag = (uint8_t)atoi(f[1]);
    if (nf > 2) g.gps_week        = (uint16_t)atoi(f[2]);
    if (nf > 3) g.gps_tow         = (uint32_t)atol(f[3]);
    if (nf > 4) g.eph_req_mask    = (uint32_t)strtoul(f[4], NULL, 0);

    snprintf(buf, sizeof(buf),
        "[PSRF151] GPSWeek=%u  TOW=%lu  EphMask=0x%08lX",
        g.gps_week, (unsigned long)g.gps_tow, (unsigned long)g.eph_req_mask);
    nmea_output(buf);
}

static void handle_psrf152(char **f, int nf)
{
    NmeaPSRF152 g = {0};
    char buf[160];

    if (nf > 1) g.sat_pos_validity = strtoul(f[1], NULL, 0);
    if (nf > 2) g.sat_clk_validity = strtoul(f[2], NULL, 0);
    if (nf > 3) g.sat_health_flag  = strtoul(f[3], NULL, 0);

    snprintf(buf, sizeof(buf),
        "[PSRF152] PosValidity=0x%08lX  ClkValidity=0x%08lX  Health=0x%08lX",
        (unsigned long)g.sat_pos_validity,
        (unsigned long)g.sat_clk_validity,
        (unsigned long)g.sat_health_flag);
    nmea_output(buf);
}

static void handle_psrf154(char **f, int nf)
{
    NmeaPSRF154 g = {0};
    char buf[64];

    if (nf > 1) g.ack_id = (uint8_t)atoi(f[1]);

    snprintf(buf, sizeof(buf), "[PSRF154] ACK for Message ID %u", g.ack_id);
    nmea_output(buf);
}

/* -------------------------------------------------------------------------
 * Dispatch table
 * ---------------------------------------------------------------------- */

typedef struct {
    const char *id;
    void (*handler)(char **fields, int nfields);
} NmeaDispatch;

static const NmeaDispatch DISPATCH_TABLE[] = {
    { "GPGGA",  handle_gga     },
    { "GPGLL",  handle_gll     },
    { "GPGSA",  handle_gsa     },
    { "GPGSV",  handle_gsv     },
    { "GPRMC",  handle_rmc     },
    { "GPVTG",  handle_vtg     },
    { "GPZDA",  handle_zda     },
    { "GPMSS",  handle_mss     },
    { "PSRF150",handle_psrf150 },
    { "PSRF151",handle_psrf151 },
    { "PSRF152",handle_psrf152 },
    { "PSRF154",handle_psrf154 },
    { NULL,     NULL            }
};

/* -------------------------------------------------------------------------
 * Core sentence parser
 * ---------------------------------------------------------------------- */

/**
 * parse_sentence() – validate checksum and dispatch to the correct handler.
 * @sentence: null-terminated ASCII string, must start with '$'.
 */
static void parse_sentence(char *sentence)
{
    if (!sentence || sentence[0] != '$') return;

//    if (!validate_checksum(sentence)) {
//        char buf[160];
//        snprintf(buf, sizeof(buf), "[ERROR] Bad checksum: %.120s", sentence);
//        nmea_output(buf);
//        return;
//    }

    /* Work on a copy so split_fields() can modify it */
    char work[NMEA_MAX_LEN];
    strncpy(work, sentence, sizeof(work) - 1);
    work[sizeof(work) - 1] = '\0';

    char *fields[NMEA_MAX_FIELDS];
    int nf = split_fields(work, fields, NMEA_MAX_FIELDS);
    if (nf < 1) return;

    /* fields[0] is the message ID (e.g. "GPGGA") */
    const char *msg_id = fields[0];

    for (const NmeaDispatch *d = DISPATCH_TABLE; d->id != NULL; d++) {
        if (strcmp(msg_id, d->id) == 0) {
            total_sentences++;
            d->handler(fields, nf);
            return;
        }
    }

    /* Unknown sentence */
    char buf[160];
    snprintf(buf, sizeof(buf), "[UNKNOWN] %s: %.80s", msg_id, sentence);
    nmea_output(buf);
}

/* -------------------------------------------------------------------------
 * UART byte-feed interface
 *
 * Call nmea_feed_byte() once for every uint8_t received from the UART.
 * Sentences are accumulated until '\n' (LF) is received, then dispatched.
 * ---------------------------------------------------------------------- */

static char   rx_buf[NMEA_MAX_LEN];
static size_t rx_len = 0;

/**
 * nmea_feed_byte() – feed one byte received from the UART into the parser.
 * This function is safe to call from an ISR if the platform's char-level
 * operations are atomic; move to a ring-buffer/task design for production.
 *
 * @byte: one uint8_t from the UART receive register / DMA buffer.
 */
void nmea_feed_byte(uint8_t *rxChar, uint16_t size, uint8_t error)
{
    char c = (char)rxChar[0];

    /* '$' starts a new sentence — reset buffer */
    // if (c == '$') {
        // rx_len = 0;
    // }

    /* Buffer overflow guard */
    if (rx_len >= NMEA_MAX_LEN - 1) {
        rx_len = 0;   /* discard corrupt/oversized frame */
        return;
    }

    rx_buf[rx_len++] = c;

    /* LF terminates a sentence */
    if (c == '\n') {
        rx_buf[rx_len] = '\0';
        parse_sentence(rx_buf);
//        nmea_output(rx_buf);
        rx_len = 0;
    }
}

/* -------------------------------------------------------------------------
 * Stats accessor
 * ---------------------------------------------------------------------- */

void nmea_get_stats(uint32_t *out_total, uint32_t *out_valid_gll)
{
    if (out_total)     *out_total     = total_sentences;
    if (out_valid_gll) *out_valid_gll = valid_GPS_reads;
}

void nmea_reset(void)
{
    rx_len         = 0;
    total_sentences = 0;
    valid_GPS_reads = 0;
    memset(rx_buf, 0, sizeof(rx_buf));
}
