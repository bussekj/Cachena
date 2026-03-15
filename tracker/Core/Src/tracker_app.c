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
    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_5, 1);
    osDelay(delay);
    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_5, 0);
    osDelay(delay);
  }
}