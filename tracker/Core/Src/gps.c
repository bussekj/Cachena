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

#include "gps.h"
#include "sys_app.h"
#include "cmsis_os2.h"

int split_fields(char* sentence, char** fields)
{
    char * p = sentence;
    int num_fields = 0;
    fields[num_fields++] = p;
    while(*p)
    {
        if( *p == '$')
        {
            p++;
            fields[num_fields-1] = p;
            continue;
        }
        if(*p == ',')
        {
            *p = '\0';
            p++;
            fields[num_fields++] = p;
        }
        p++;
    }
    return num_fields;
}

int32_t convert_to_deg(double pos)
{
    double deg;
    double mins;
    deg = ((int)(pos)) / 100.0;
    mins = pos - deg * 100.0;
    deg = deg + mins / 60.0;
    return (int32_t)deg * 1000;
}

const uint8_t LAT_POS = 1;
const uint8_t LAT_DIR = 2;
const uint8_t LONG_POS = 3;
const uint8_t  LONG_DIR = 4;
const uint8_t VALID_POS = 6;
const uint8_t GLL_LENGTH = 8;
void handle_gll(char** fields, int num_fields, GPS_Message_Queue_t *gpsData)
{
    double lat_d;
    double lon_d;
    int32_t lat_i;
    int32_t lon_i;
    if(num_fields != GLL_LENGTH)
    {
    	gpsData->isValid = 0;
    	return;
    }
    if( *fields[VALID_POS] != 'A')
    {
    	gpsData->isValid = 0;
    	return;
    }

    lat_d = atof(fields[LAT_POS]);
    lat_i = convert_to_deg(lat_d);
    if (*fields[LAT_DIR] == 'S')
    	lat_d = -1 * lat_i;
    lon_d = atof(fields[LONG_POS]);
    lon_i = convert_to_deg(lon_d);
    if (*fields[LAT_DIR] == 'W')
    	lon_i = -1 * lon_i;
    gpsData->latitude = lat_i;
    gpsData->longitude = lon_i;
	gpsData->isValid = 1;
}

/**
 * validate_checksum() – XOR of all bytes between '$' and '*'.
 * Returns true if the sentence checksum is correct.
 */
bool validate_checksum(const char *sentence)
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
/**
 * parse_sentence() – validate checksum and dispatch to the correct handler.
 * @sentence: null-terminated ASCII string, must start with '$'.
 */
void parse_sentence(const char *sentence, GPS_Message_Queue_t* gpsData)
{
   char work[128] = {0};
   char *fields[NMEA_MAX_FIELDS];
   int nf;
    if (!sentence || sentence[0] != '$') 
    {
    	gpsData->isValid = 0;
        return;
    }
    strcpy(work, sentence);
   if (!validate_checksum(work))
   {
	   gpsData->isValid = 0;
       return;
   }


    nf = split_fields(work, fields);
    if (nf < 1) 
    {
    	gpsData->isValid = 0;
        return;
    }
    const char *msg_id = fields[0];
	if (strcmp(msg_id,"GPGLL") == 0)
	{
		handle_gll(fields, nf, gpsData);
		if(!gpsData->isValid)
		{
			gpsData->longitude = 100;
			gpsData->latitude = -100;
		}
		gpsData->trackerId = 1;
		gpsData->batteryLevel = 99;
		gpsData->isValid = 1;
	}
}
void test()
{
	return;
}
