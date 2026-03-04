/**
 ******************************************************************************
 * @file    uart_echo.h
 * @brief   USART1 echo driver — receives bytes via DMA/interrupt and
 *          immediately transmits them back using DMA TX.
 *
 * Pins (from usart.c MspInit):
 *   PB6  USART1_TX  AF7
 *   PB7  USART1_RX  AF7
 *   115200 8N1, FIFO enabled, DMA TX on DMA1_Channel1
 *
 * Integration
 * ───────────
 *   1. Call UartEcho_Init() once after MX_USART1_UART_Init().
 *   2. In stm32wlxx_it.c forward both ISRs:
 *        void USART1_IRQHandler(void)   { UartEcho_UART_IRQHandler(); }
 *        void DMA1_Channel1_IRQHandler(void) { UartEcho_DMA_IRQHandler(); }
 *   3. Call UartEcho_Process() from the main loop (handles TX queuing).
 ******************************************************************************
 */

#ifndef UART_ECHO_H
#define UART_ECHO_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32wlxx_hal.h"
#include <stdint.h>

/**
 * Size of the software RX ring buffer (bytes, power of 2).
 * Interrupt RX is used — there is no DMA RX channel in this CubeMX config.
 */
#define ECHO_RX_BUF_SIZE    256U

/** Size of the TX staging buffer (bytes, power of 2, >= ECHO_RX_BUF_SIZE). */
#define ECHO_TX_BUF_SIZE    256U

/**
 * @brief  Initialise the echo driver.
 *         Must be called after MX_USART1_UART_Init() and MX_DMA_Init().
 *         Starts single-byte interrupt RX; each received byte is pushed into
 *         a ring buffer and re-arms the next receive automatically.
 * @retval HAL_OK on success, HAL_ERROR on failure.
 */
HAL_StatusTypeDef UartEcho_Init(void);

/**
 * @brief  Main-loop task — copies any newly received bytes into the TX
 *         staging buffer and kicks off a DMA TX if the line is idle.
 *         Call as often as possible from while(1).
 */
void UartEcho_Process(void);

/**
 * @brief  Forward USART1_IRQHandler here from stm32wlxx_it.c.
 */
void UartEcho_UART_IRQHandler(void);

/**
 * @brief  Forward DMA1_Channel1_IRQHandler here from stm32wlxx_it.c.
 */
void UartEcho_DMA_IRQHandler(void);

#ifdef __cplusplus
}
#endif

#endif /* UART_ECHO_H */