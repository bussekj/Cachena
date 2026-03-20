
#ifndef _TRACKER_APP_H
#define _TRACKER_APP_H

#include "usart_if.h"


void StartBlinkerTask(void *argument);
void UARTSendTask(void *argument);
extern UART_HandleTypeDef huart2;
#endif /* __TRACKER_APP_H */
