/**
 ******************************************************************************
 * @file    uart_echo.c
 * @brief   USART1 echo driver for STM32WLE5JC.
 *
 * RX  — Single-byte HAL_UART_Receive_IT().  Each received byte is pushed
 *        into a software ring buffer by HAL_UART_RxCpltCallback(), which
 *        immediately re-arms the next single-byte receive.
 *        (No DMA RX channel is present in the CubeMX config.)
 *
 * TX  — HAL_UART_Transmit_DMA() using the existing DMA1_Channel1 TX link.
 *        UartEcho_Process() drains the ring buffer and fires a DMA TX burst
 *        whenever the line is free.
 ******************************************************************************
 */

#include "uart_echo.h"
#include "usart.h"
#include <string.h>

/* ── compile-time power-of-2 checks ─────────────────────────────────────── */
typedef char _RxPow2[(( ECHO_RX_BUF_SIZE & (ECHO_RX_BUF_SIZE-1U))==0U)?1:-1];
typedef char _TxPow2[(( ECHO_TX_BUF_SIZE & (ECHO_TX_BUF_SIZE-1U))==0U)?1:-1];

#define RX_MASK  ((uint16_t)(ECHO_RX_BUF_SIZE - 1U))

/* ── private state ───────────────────────────────────────────────────────── */

/** Single-byte staging area used by HAL_UART_Receive_IT(). */
static uint8_t s_rxStaging;

/** Software ring buffer filled by the RX-complete callback. */
static uint8_t           s_rxRing[ECHO_RX_BUF_SIZE];
static volatile uint16_t s_rxHead;   /* written by ISR/callback */
static volatile uint16_t s_rxTail;   /* read    by Process()    */

/** Flat TX buffer handed to DMA. */
static uint8_t           s_txBuf[ECHO_TX_BUF_SIZE];

/** Non-zero while a DMA TX transfer is in flight. */
static volatile uint8_t  s_txBusy;

/* ── public API ──────────────────────────────────────────────────────────── */
HAL_StatusTypeDef UartEcho_Init(void)
{
    s_rxHead = 0U;
    s_rxTail = 0U;
    s_txBusy = 0U;

    /* Arm the first single-byte interrupt receive. */
    return HAL_UART_Receive_IT(&huart1, &s_rxStaging, 1U);
}

void UartEcho_Process(void)
{
    if (s_txBusy)
    {
        return;
    }

    /* Optional debug ping: use a uint8_t buffer and correct length. */
    // static uint8_t ping[] = "PING\n\r";
    // HAL_StatusTypeDef status = HAL_UART_Transmit_IT(&huart1, ping, (uint16_t)(sizeof(ping) - 1U));
    // if (status!= HAL_OK)
    // {
    //     s_txBusy = 0U;
    // }
    uint16_t head = s_rxHead;
    uint16_t tail = s_rxTail;

    if (head == tail)
    {
        return; /* Ring buffer empty — nothing to echo. */
    }

    /*
     * Copy available bytes from the ring buffer into the flat TX buffer.
     * Handle the wrap-around in two passes if needed.
     */
    uint16_t txLen = 0U;

    if (head > tail)
    {
        txLen = head - tail;
        if (txLen > ECHO_TX_BUF_SIZE) { txLen = ECHO_TX_BUF_SIZE; }
        memcpy(s_txBuf, &s_rxRing[tail], txLen);
    }
    else
    {
        uint16_t first  = ECHO_RX_BUF_SIZE - tail;
        uint16_t second = head;
        if ((first + second) > ECHO_TX_BUF_SIZE)
        {
            first  = ECHO_TX_BUF_SIZE;
            second = 0U;
        }
        memcpy(s_txBuf,         &s_rxRing[tail], first);
        memcpy(s_txBuf + first,  s_rxRing,       second);
        txLen = first + second;
    }

    s_rxTail = (uint16_t)((tail + txLen) & RX_MASK);

    s_txBusy = 1U;
    if (HAL_UART_Transmit_IT(&huart1, s_txBuf, txLen) != HAL_OK)
    {
        s_txBusy = 0U;
    }
}

/* ── ISR forwarders (wire these in stm32wlxx_it.c) ──────────────────────── */

void UartEcho_UART_IRQHandler(void)
{
    HAL_UART_IRQHandler(&huart1);
}

void UartEcho_DMA_IRQHandler(void)
{
    HAL_DMA_IRQHandler(&hdma_usart1_tx);
}

/* ── HAL callbacks ───────────────────────────────────────────────────────── */

/**
 * @brief  One byte has been received into s_rxStaging.
 *         Push it into the ring buffer then re-arm immediately.
 */
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
    if (huart->Instance != USART1) { return; }

    uint16_t nextHead = (uint16_t)((s_rxHead + 1U) & RX_MASK);

    if (nextHead != s_rxTail)           /* drop byte if ring buffer full */
    {
        s_rxRing[s_rxHead] = s_rxStaging;
        s_rxHead           = nextHead;
    }

    /* Re-arm — must not block inside callback. */
    (void)HAL_UART_Receive_IT(&huart1, &s_rxStaging, 1U);
}

/**
 * @brief  DMA TX complete — release the busy flag.
 */
void HAL_UART_TxCpltCallback(UART_HandleTypeDef *huart)
{
    if (huart->Instance == USART1)
    {
        s_txBusy = 0U;
    }
}

/**
 * @brief  UART error — clear flags and recover by re-arming RX.
 */
void HAL_UART_ErrorCallback(UART_HandleTypeDef *huart)
{
    if (huart->Instance != USART1) { return; }

    HAL_UART_DMAStop(huart);
    s_txBusy = 0U;
    s_rxHead = 0U;
    s_rxTail = 0U;

    (void)HAL_UART_Receive_IT(&huart1, &s_rxStaging, 1U);
}
