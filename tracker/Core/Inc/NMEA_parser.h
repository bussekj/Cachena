/**
 * nmea_parser.h
 * NMEA 0183 / SiRF GPS Sentence Parser — Public Interface
 *
 * Include this header in any translation unit that needs to feed bytes to
 * the parser or query its statistics.  All implementation details live in
 * nmea_parser.c.
 */

#ifndef NMEA_PARSER_H
#define NMEA_PARSER_H

#include <stdint.h>
#include <stdbool.h>

/* -------------------------------------------------------------------------
 * Configuration constants
 * ---------------------------------------------------------------------- */

#define NMEA_MAX_LEN        128   /**< Maximum bytes in one NMEA sentence    */
#define NMEA_MAX_FIELDS      32   /**< Maximum comma-separated fields        */
#define NMEA_MAX_SVS         16   /**< Maximum satellites in a GSV message   */

/* -------------------------------------------------------------------------
 * Coordinate pair
 * ---------------------------------------------------------------------- */

/** Signed decimal-degree coordinate.  Check lat_valid / lon_valid before use. */
typedef struct {
    double  latitude;       /**< Positive = North, Negative = South */
    double  longitude;      /**< Positive = East,  Negative = West  */
    bool    lat_valid;
    bool    lon_valid;
} NmeaCoord;

/* -------------------------------------------------------------------------
 * GGA – Global Positioning System Fixed Data
 * ---------------------------------------------------------------------- */

/** GPS fix quality indicator values stored in NmeaGGA.fix_quality */
typedef enum {
    NMEA_FIX_NONE   = 0,
    NMEA_FIX_GPS    = 1,
    NMEA_FIX_DGPS   = 2,
    NMEA_FIX_DR     = 6,
} NmeaFixQuality;

typedef struct {
    char            utc_time[16];   /**< hhmmss.ss                          */
    NmeaCoord       coord;
    NmeaFixQuality  fix_quality;
    uint8_t         satellites;     /**< Number of satellites in use        */
    float           hdop;
    float           altitude_m;     /**< Antenna altitude above MSL (m)     */
    float           geoid_sep_m;    /**< Geoid separation (m)               */
} NmeaGGA;

/* -------------------------------------------------------------------------
 * GLL – Geographic Position Latitude/Longitude
 * ---------------------------------------------------------------------- */

typedef struct {
    NmeaCoord   coord;
    char        utc_time[16];
    bool        valid;              /**< true = data valid ('A' status)     */
    char        mode;               /**< NMEA 2.3+ mode indicator           */
} NmeaGLL;

/* -------------------------------------------------------------------------
 * GSA – GNSS DOP and Active Satellites
 * ---------------------------------------------------------------------- */

typedef enum {
    NMEA_GSA_MANUAL    = 'M',
    NMEA_GSA_AUTOMATIC = 'A',
} NmeaGsaMode1;

typedef enum {
    NMEA_GSA_NO_FIX = 1,
    NMEA_GSA_2D     = 2,
    NMEA_GSA_3D     = 3,
} NmeaGsaMode2;

typedef struct {
    NmeaGsaMode1    mode1;
    NmeaGsaMode2    mode2;
    uint8_t         svs[12];        /**< PRN numbers of active satellites   */
    uint8_t         sv_count;
    float           pdop;
    float           hdop;
    float           vdop;
} NmeaGSA;

/* -------------------------------------------------------------------------
 * GSV – GNSS Satellites in View
 * ---------------------------------------------------------------------- */

typedef struct {
    uint8_t     prn;
    int8_t      elevation;          /**< Degrees above horizon              */
    uint16_t    azimuth;            /**< True north, 0–359°                 */
    uint8_t     snr;                /**< C/No dB-Hz; 0 when not tracking    */
} NmeaSatInfo;

typedef struct {
    uint8_t     total_messages;
    uint8_t     message_num;
    uint8_t     sats_in_view;
    NmeaSatInfo satellites[NMEA_MAX_SVS];
    uint8_t     sat_count;
} NmeaGSV;

/* -------------------------------------------------------------------------
 * RMC – Recommended Minimum Specific GNSS Data
 * ---------------------------------------------------------------------- */

typedef struct {
    char        utc_time[16];
    bool        valid;
    NmeaCoord   coord;
    float       speed_kn;
    float       course_deg;
    char        date[8];            /**< DDMMYY                             */
    char        mode;
} NmeaRMC;

/* -------------------------------------------------------------------------
 * VTG – Course Over Ground and Ground Speed
 * ---------------------------------------------------------------------- */

typedef struct {
    float   course_true;            /**< Degrees, true north reference      */
    float   course_mag;             /**< Degrees, magnetic north reference  */
    float   speed_kn;
    float   speed_kmh;
    char    mode;
} NmeaVTG;

/* -------------------------------------------------------------------------
 * ZDA – Time & Date
 * ---------------------------------------------------------------------- */

typedef struct {
    char        utc_time[16];
    uint8_t     day;
    uint8_t     month;
    uint16_t    year;
    int8_t      zone_hr;            /**< Local zone offset hours, -13..+13  */
    int8_t      zone_min;           /**< Local zone offset minutes, 0..59   */
} NmeaZDA;

/* -------------------------------------------------------------------------
 * MSS – MSK Receiver Signal
 * ---------------------------------------------------------------------- */

typedef struct {
    float       signal_strength_db;
    float       snr_db;
    float       frequency_khz;
    uint16_t    bit_rate;           /**< Bits per second                    */
    uint8_t     channel;
} NmeaMSS;

/* -------------------------------------------------------------------------
 * SiRF proprietary sentences
 * ---------------------------------------------------------------------- */

/** PSRF150 – OkToSend (trickle power mode) */
typedef struct {
    bool    ok_to_send;
} NmeaPSRF150;

/** PSRF151 – GPS Data and Extended Ephemeris Mask */
typedef struct {
    uint8_t     time_valid_flag;
    uint16_t    gps_week;
    uint32_t    gps_tow;            /**< GPS time of week (ms)              */
    uint32_t    eph_req_mask;       /**< Bitmask of requested ephemerides   */
} NmeaPSRF151;

/** PSRF152 – Extended Ephemeris Integrity */
typedef struct {
    uint32_t    sat_pos_validity;
    uint32_t    sat_clk_validity;
    uint32_t    sat_health_flag;
} NmeaPSRF152;

/** PSRF154 – Extended Ephemeris ACK */
typedef struct {
    uint8_t     ack_id;
} NmeaPSRF154;

/* -------------------------------------------------------------------------
 * Public API
 * ---------------------------------------------------------------------- */

/**
 * nmea_feed_byte() — feed one byte received from the UART into the parser.
 *
 * Call this function for every uint8_t that arrives on the UART.  It buffers
 * bytes internally and dispatches a complete sentence for parsing as soon as
 * a line-feed character (0x0A) is received.
 *
 * This function is the sole entry point for normal operation.
 *
 * @param byte  One octet from the UART receive register or DMA buffer.
 */
void nmea_feed_byte(uint8_t *rxChar, uint16_t size, uint8_t error);

/**
 * nmea_get_stats() — retrieve cumulative parser statistics.
 *
 * Either output pointer may be NULL if that value is not needed.
 *
 * @param out_total      Total number of successfully dispatched sentences.
 * @param out_valid_gll  Number of GLL sentences with 'A' (valid) status.
 */
void nmea_get_stats(uint32_t *out_total, uint32_t *out_valid_gll);

/**
 * nmea_reset() — reset the internal byte buffer and statistics counters.
 *
 * Call this after a UART framing error or when re-initialising the parser.
 */
void nmea_reset(void);

/* -------------------------------------------------------------------------
 * Output callback — implement in your application
 *
 * nmea_output() is called by the parser with a null-terminated, human-
 * readable string after each sentence is processed (including errors).
 * Provide a definition in your application code, for example:
 *
 *     void nmea_output(const char *msg) { printf("%s\n", msg); }
 *
 * ---------------------------------------------------------------------- */

/**
 * nmea_output() — application-supplied output sink.
 *
 * @param msg  Null-terminated formatted string produced by the parser.
 */
void nmea_output(const char *msg);

#endif /* NMEA_PARSER_H */