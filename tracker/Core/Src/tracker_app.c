#include "tracker_app.h"
#include "main.h"
#include "cmsis_os2.h"
#include "sys_app.h"

/**
  * @brief  Function implementing the defaultTask thread.
  * @param  argument: Not used
  * @retval None
  *//* USER CODE END Header_StartBlinkerTask */
void StartBlinkerTask(void *argument)
{
  int delay = 500;
  for(;;)
  {
    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_4, 1);
    osDelay(delay);
    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_4, 0);
    osDelay(delay);
  }
}

void UARTSendTask(void *argument)
{
  int delay = 500;
  for(;;)
  {
    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_3, 1);
    // uint8_t msg[] = {0x0F, 0x01};
    // HAL_UART_Transmit_DMA(&huart2, msg, sizeof(msg)-1);
    osDelay(delay);
    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_3, 0);
    osDelay(delay);
  }
}
