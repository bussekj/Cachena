/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Main program body
  ******************************************************************************
  * @attention
  *
  * Copyright (c) 2022 STMicroelectronics.
  * All rights reserved.
  *
  * This software is licensed under terms that can be found in the LICENSE file
  * in the root directory of this software component.
  * If no LICENSE file comes with this software, it is provided AS-IS.
  *
  ******************************************************************************
  */
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "app_subghz_phy.h"
#include "gpio.h"
#include "sys_app.h"
/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include "radio.h"
#include "stm32_timer.h"
#include "FreeRTOS.h"
#include "cmsis_os2.h"
#include "semphr.h"
#include "subghz_phy_app.h"
#include "gps.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */
void StartBlinkerTask(void *argument);
void StartRadioTask(void *argument);
void StartReceiverTask(void *argument);
void StartTrackerTask(void *argument);
/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */
/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/

/* USER CODE BEGIN PV */

/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
/* USER CODE BEGIN PFP */

/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */
osThreadId_t blinkerTaskHandle;
const osThreadAttr_t blinkerTask_attributes = {
  .name = "blinkerTask",
  .priority = (osPriority_t) osPriorityNormal,
  .stack_size = 128 * 4
};
osThreadId_t radioTaskHandle;
const osThreadAttr_t radioTask_attributes = {
  .name = "pingPongTask",
  .priority = (osPriority_t) osPriorityNormal,
  .stack_size = 128 * 4
};
osThreadId_t receiverTaskHandle;
const osThreadAttr_t receiverTask_attributes = {
  .name = "receiverTask",
  .priority = (osPriority_t) osPriorityNormal,
  .stack_size = 128 * 4
};
osThreadId_t trackerTaskHandle;
const osThreadAttr_t trackerTask_attributes = {
  .name = "trackerTask",
  .priority = (osPriority_t) osPriorityNormal,
  .stack_size = 128 * 4
};

// Semaphores
osSemaphoreId_t radioBinarySemHandle;
osSemaphoreId_t gpsDataBinarySemHandle;

// Message Queue Sizes
#define GPS_MSG_OBJECTS 8
#define RAW_GPS_MSG_OBJECTS 128
// Message Queues
osMessageQueueId_t rawGPSDataQueueHandle;
osMessageQueueId_t gpsDataQueueHandle;
osMessageQueueAttr_t gpsDataAttributes = {
		.name = "gpsData",
		.attr_bits = 0
};
// Buffer
static char TxDataBuffer[64];

static GPS_Message_Queue_t  gpsData = {0,0,0,0,0};
 
/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */
#define TRACKER
int main(void)
{

  /* USER CODE BEGIN 1 */

  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  /* Reset of all peripherals, Initializes the Flash interface and the Systick. */

	HAL_Init();

  /* USER CODE BEGIN Init */

  /* USER CODE END Init */

  /* Configure the system clock */
  SystemClock_Config();

  /* USER CODE BEGIN SysInit */

  /* USER CODE END SysInit */

  /* Initialize all configured peripherals */
  MX_SubGHz_Phy_Init();

  osKernelInitialize();

  // Create semaphores
  radioBinarySemHandle = osSemaphoreNew(1U,1U, NULL);
  gpsDataBinarySemHandle = osSemaphoreNew(1U,1U, NULL);
  // Create message queues

  gpsDataQueueHandle = osMessageQueueNew(GPS_MSG_OBJECTS, sizeof(GPS_Message_Queue_t)*8, NULL);
  if (gpsDataQueueHandle == NULL)
  {
	  Error_Handler();
  }
  rawGPSDataQueueHandle = osMessageQueueNew(RAW_GPS_MSG_OBJECTS, sizeof(uint8_t), NULL);
  if (rawGPSDataQueueHandle == NULL)
  {
	  Error_Handler();
  }

  // Create threads
  blinkerTaskHandle = osThreadNew(StartBlinkerTask, NULL, &blinkerTask_attributes);
#ifdef TRACKER
  trackerTaskHandle = osThreadNew(StartTrackerTask, NULL, &trackerTask_attributes);
#else
  receiverTaskHandle = osThreadNew(StartReceiverTask, NULL, &receiverTask_attributes);
#endif

  osKernelStart();
  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  // We will never reach here! The RTOS scheduler will take over after osKernelStart() is called.
  while (1)
  {
    /* USER CODE BEGIN 3 */
  }
  /* USER CODE END 3 */
}

void gpsData_to_buffer(GPS_Message_Queue_t *msg, char *buffer)
{
  // Convert the GPS data to a byte buffer for transmission
    snprintf(buffer, 255, "\"UUID\":%d,\"lat\":%d,\"lon\":%d,\"battery\":%d",
    		msg->trackerId,
			msg->latitude, msg->longitude,
			msg->batteryLevel);
}

void StartReceiverTask(void *argument)
{
	osStatus_t status;
	while (1)
	{
		osSemaphoreAcquire(radioBinarySemHandle, osWaitForever);
		RadioReceive(0);
		osDelay(1000);
	}
}
#define GPSTESTDATA "$GPGLL,3908.53679,N,08437.66193,W,212204.00,A,A*73\n\0"
void testingPass(char* buffer, GPS_Message_Queue_t* gpsData);
void StartTrackerTask(void *argument)
{
	osStatus_t status;
	uint8_t c;
	size_t bytesRead;
	char rawGPSBuffer[128];
	for(;;)
	{
		status = osMessageQueueGet(rawGPSDataQueueHandle, &c, NULL, osWaitForever);
		if (status == osOK)
		{
			if ( c == '$')
			{
				bytesRead = 0;
			}
			/* Buffer overflow guard */
			if (bytesRead >= NMEA_MAX_LEN - 2)
			{
				bytesRead = 0;
				continue;
			}

			rawGPSBuffer[bytesRead++] = c;
			/* LF terminates a sentence */
			if (c == '\n')
			{

				rawGPSBuffer[bytesRead] = '\0';
				bytesRead = 0;
//				strcpy(rawGPSBuffer, GPSTESTDATA);
				parse_sentence(rawGPSBuffer, &gpsData);
				if(gpsData.isValid)
				{
					  osSemaphoreAcquire(radioBinarySemHandle, osWaitForever);
					  APP_LOG(TS_ON, VLEVEL_H, "Received parsed data from GPS\r\n");
					  gpsData_to_buffer(&gpsData, TxDataBuffer);
					  RadioSend(TxDataBuffer, sizeof(TxDataBuffer));
					  gpsData.isValid = 0;
				}
			}
		}
	}
}

void StartBlinkerTask(void *argument)
{
	int delay = 500;
	APP_LOG(TS_OFF, VLEVEL_L, "Debugging LEVEL L\r\n");
	APP_LOG(TS_OFF, VLEVEL_M, "Debugging LEVEL M\r\n");
	APP_LOG(TS_OFF, VLEVEL_H, "Debugging LEVEL H\r\n");

	UTIL_TIMER_Time_t past_ticks = 0;
	UTIL_TIMER_Time_t ticks = 0;
	for(;;)
	{
		ticks = UTIL_TIMER_GetCurrentTime();
		if (past_ticks + 1000 < ticks)
		{
			APP_LOG(TS_OFF, VLEVEL_H, "Tick: %d\r\n", ticks);
			past_ticks = ticks;
		}
		HAL_GPIO_WritePin(GPIOB, GPIO_PIN_5, 1);
		osDelay(delay);
		HAL_GPIO_WritePin(GPIOB, GPIO_PIN_5, 0);
		osDelay(delay);
	}
}

/**
  * @brief System Clock Configuration
  * @retval None
  */
void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

  /** Configure LSE Drive Capability
  */
  HAL_PWR_EnableBkUpAccess();
  __HAL_RCC_LSEDRIVE_CONFIG(RCC_LSEDRIVE_LOW);

  /** Configure the main internal regulator output voltage
  */
  __HAL_PWR_VOLTAGESCALING_CONFIG(PWR_REGULATOR_VOLTAGE_SCALE1);

  /** Initializes the CPU, AHB and APB buses clocks
  */
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_LSE|RCC_OSCILLATORTYPE_MSI;
  RCC_OscInitStruct.LSEState = RCC_LSE_ON;
  RCC_OscInitStruct.MSIState = RCC_MSI_ON;
  RCC_OscInitStruct.MSICalibrationValue = RCC_MSICALIBRATION_DEFAULT;
  RCC_OscInitStruct.MSIClockRange = RCC_MSIRANGE_11;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_NONE;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }

  /** Configure the SYSCLKSource, HCLK, PCLK1 and PCLK2 clocks dividers
  */
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK3|RCC_CLOCKTYPE_HCLK
                              |RCC_CLOCKTYPE_SYSCLK|RCC_CLOCKTYPE_PCLK1
                              |RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_MSI;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV1;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;
  RCC_ClkInitStruct.AHBCLK3Divider = RCC_SYSCLK_DIV1;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_2) != HAL_OK)
  {
    Error_Handler();
  }
}

/* USER CODE BEGIN 4 */

/* USER CODE END 4 */

/**
  * @brief  This function is executed in case of error occurrence.
  * @retval None
  */
void Error_Handler(void)
{
  /* USER CODE BEGIN Error_Handler_Debug */
  /* User can add his own implementation to report the HAL error return state */
  __disable_irq();
  while (1)
  {
  }
  /* USER CODE END Error_Handler_Debug */
}

#ifdef  USE_FULL_ASSERT
/**
  * @brief  Reports the name of the source file and the source line number
  *         where the assert_param error has occurred.
  * @param  file: pointer to the source file name
  * @param  line: assert_param error line source number
  * @retval None
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* USER CODE BEGIN 6 */
  /* User can add his own implementation to report the file name and line number,
     ex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */
