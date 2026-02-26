#############################################################################################################################
# file:  CMakeLists.txt
# brief: Template "CMakeLists.txt" for building of executables and static libraries.
#
# usage: Edit "VARIABLES"-section to suit project requirements.
#        For debug build:
#          cmake -DCMAKE_TOOLCHAIN_FILE=cubeide-gcc.cmake  -S ./ -B Debug -G"Unix Makefiles" -DCMAKE_BUILD_TYPE=Debug
#          make -C Debug VERBOSE=1 -j
#        For release build:
#          cmake -DCMAKE_TOOLCHAIN_FILE=cubeide-gcc.cmake  -S ./ -B Release -G"Unix Makefiles" -DCMAKE_BUILD_TYPE=Release
#          make -C Release VERBOSE=1 -j
#############################################################################################################################
cmake_minimum_required(VERSION 3.20)

###################### CONSTANTS ######################################
set (PROJECT_TYPE_EXECUTABLE          "exe")
set (PROJECT_TYPE_STATIC_LIBRARY      "static-lib")
set (MCPU_CORTEX_M0				      "-mcpu=cortex-m0")
set (MCPU_CORTEX_M0PLUS				  "-mcpu=cortex-m0plus")
set (MCPU_CORTEX_M3				      "-mcpu=cortex-m3")
set (MCPU_CORTEX_M4				      "-mcpu=cortex-m4")
set (MCPU_CORTEX_M7				      "-mcpu=cortex-m7")
set (MCPU_CORTEX_M33				  "-mcpu=cortex-m33")
set (MCPU_CORTEX_M55				  "-mcpu=cortex-m55")
set (MCPU_CORTEX_M85				  "-mcpu=cortex-m85")
set (MFPU_FPV4_SP_D16                 "-mfpu=fpv4-sp-d16")
set (MFPU_FPV4                        "-mfpu=vfpv4")
set (MFPU_FPV5_D16                    "-mfpu=fpv5-d16")
set (RUNTIME_LIBRARY_REDUCED_C        "--specs=nano.specs")
set (RUNTIME_LIBRARY_STD_C            "")
set (RUNTIME_LIBRARY_SYSCALLS_MINIMAL "--specs=nosys.specs")
set (RUNTIME_LIBRARY_SYSCALLS_NONE    "")
set (MFLOAT_ABI_SOFTWARE              "-mfloat-abi=soft")
set (MFLOAT_ABI_HARDWARE              "-mfloat-abi=hard")
set (MFLOAT_ABI_MIX                   "-mfloat-abi=softfp")
#######################################################################

###################### VARIABLES ######################################
set (PROJECT_NAME             "TrackerOS")
set (PROJECT_TYPE             "exe")
set (LINKER_SCRIPT            "../STM32WLE5JCIX_FLASH.ld")
set (MCPU                     "-mcpu=Cortex-M4")
set (MFLOAT_ABI               "")
set (RUNTIME_LIBRARY          "--specs=nano.specs")
set (RUNTIME_LIBRARY_SYSCALLS "--specs=nosys.specs")


set ( PROJECT_SOURCES 
    # Drivers/BSP/STM32WLxx_LoRa_E5_mini/stm32wlxx_LoRa_E5_mini.c
    # Drivers/BSP/STM32WLxx_LoRa_E5_mini/stm32wlxx_LoRa_E5_mini_radio.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_adc.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_adc_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_comp.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_cortex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_crc.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_crc_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_cryp.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_cryp_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_dac.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_dac_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_dma.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_dma_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_exti.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_flash.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_flash_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_gpio.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_gtzc.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_hsem.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_i2c.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_i2c_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_i2s.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_ipcc.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_irda.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_iwdg.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_lptim.c
    # Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_msp_template.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_pka.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_pwr.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_pwr_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_rcc.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_rcc_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_rng.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_rng_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_rtc.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_rtc_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_smartcard.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_smartcard_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_smbus.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_smbus_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_spi.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_spi_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_subghz.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_tim.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_tim_ex.c
    # Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_timebase_rtc_alarm_template.c
    # Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_timebase_rtc_wakeup_template.c
    # Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_timebase_tim_template.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_uart.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_uart_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_usart.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_usart_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_wwdg.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_adc.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_comp.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_crc.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_dac.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_dma.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_exti.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_gpio.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_i2c.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_lptim.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_lpuart.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_pka.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_pwr.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_rcc.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_rng.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_rtc.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_spi.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_tim.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_usart.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_ll_utils.c
    Middlewares/FreeRTOS/Source/CMSIS_RTOS/cmsis_os.c
    # Middlewares/FreeRTOS/Source/CMSIS_RTOS_V2/cmsis_os2.c
    Middlewares/FreeRTOS/Source/portable/GCC/ARM_CM3/port.c
    Middlewares/FreeRTOS/Source/portable/MemMang/heap_4.c
    Middlewares/FreeRTOS/Source/croutine.c
    Middlewares/FreeRTOS/Source/event_groups.c
    Middlewares/FreeRTOS/Source/list.c
    Middlewares/FreeRTOS/Source/queue.c
    Middlewares/FreeRTOS/Source/stream_buffer.c
    Middlewares/FreeRTOS/Source/tasks.c
    Middlewares/FreeRTOS/Source/timers.c
    # Middlewares/littlefs/bd/lfs_filebd.c
    # Middlewares/littlefs/bd/lfs_rambd.c
    # Middlewares/littlefs/bd/lfs_testbd.c
    Middlewares/littlefs/lfs.c
    Middlewares/littlefs/lfs_util.c
    # Middlewares/LoRaWAN/Conf/lora_info_template.c
    # Middlewares/LoRaWAN/Crypto/cmac.c
    # Middlewares/LoRaWAN/Crypto/lorawan_aes.c
    # Middlewares/LoRaWAN/Crypto/soft-se.c
    # Middlewares/LoRaWAN/LmHandler/Packages/FragDecoder.c
    # Middlewares/LoRaWAN/LmHandler/Packages/LmhpClockSync.c
    # Middlewares/LoRaWAN/LmHandler/Packages/LmhpCompliance.c
    # Middlewares/LoRaWAN/LmHandler/Packages/LmhpDataDistribution.c
    # Middlewares/LoRaWAN/LmHandler/Packages/LmhpFirmwareManagement.c
    # Middlewares/LoRaWAN/LmHandler/Packages/LmhpFragmentation.c
    # Middlewares/LoRaWAN/LmHandler/Packages/LmhpPackagesRegistration.c
    # Middlewares/LoRaWAN/LmHandler/Packages/LmhpRemoteMcastSetup.c
    # Middlewares/LoRaWAN/LmHandler/LmHandler.c
    # Middlewares/LoRaWAN/LmHandler/NvmDataMgmt.c
    # Middlewares/LoRaWAN/Mac/Region/Region.c
    # Middlewares/LoRaWAN/Mac/Region/RegionAS923.c
    # Middlewares/LoRaWAN/Mac/Region/RegionAU915.c
    # Middlewares/LoRaWAN/Mac/Region/RegionBaseUS.c
    # Middlewares/LoRaWAN/Mac/Region/RegionCN470.c
    # Middlewares/LoRaWAN/Mac/Region/RegionCN779.c
    # Middlewares/LoRaWAN/Mac/Region/RegionCommon.c
    # Middlewares/LoRaWAN/Mac/Region/RegionEU433.c
    # Middlewares/LoRaWAN/Mac/Region/RegionEU868.c
    # Middlewares/LoRaWAN/Mac/Region/RegionIN865.c
    # Middlewares/LoRaWAN/Mac/Region/RegionKR920.c
    # Middlewares/LoRaWAN/Mac/Region/RegionRU864.c
    # Middlewares/LoRaWAN/Mac/Region/RegionUS915.c
    # Middlewares/LoRaWAN/Mac/LoRaMac.c
    # Middlewares/LoRaWAN/Mac/LoRaMacAdr.c
    # Middlewares/LoRaWAN/Mac/LoRaMacClassB.c
    # Middlewares/LoRaWAN/Mac/LoRaMacCommands.c
    # Middlewares/LoRaWAN/Mac/LoRaMacConfirmQueue.c
    # Middlewares/LoRaWAN/Mac/LoRaMacCrypto.c
    # Middlewares/LoRaWAN/Mac/LoRaMacParser.c
    # Middlewares/LoRaWAN/Mac/LoRaMacSerializer.c
    # Middlewares/LoRaWAN/Utilities/utilities.c
    # Middlewares/SubGHz_Phy/Conf/subghz_template.c
    # Middlewares/SubGHz_Phy/stm32_radio_driver/radio.c
    # Middlewares/SubGHz_Phy/stm32_radio_driver/radio_driver.c
    # Middlewares/SubGHz_Phy/stm32_radio_driver/radio_fw.c
    Utilities/lpm/tiny_lpm/stm32_lpm.c
    Utilities/misc/stm32_mem.c
    Utilities/misc/stm32_systime.c
    Utilities/misc/stm32_tiny_sscanf.c
    Utilities/misc/stm32_tiny_vsnprintf.c
    Utilities/sequencer/stm32_seq.c
    Utilities/timer/stm32_timer.c
    Utilities/trace/adv_trace/stm32_adv_trace.c
    Core/Src/app_freertos.c
    Core/Src/main.c
    Core/Src/stm32wlxx_hal_msp.c
    Core/Src/stm32wlxx_it.c
    Core/Src/syscalls.c
    Core/Src/sysmem.c
    Core/Src/system_stm32wlxx.c
	Core/Startup/startup_stm32wle5jcix.s
)

set (PROJECT_DEFINES
	# LIST COMPILER DEFINITIONS HERE
    STM32WLE5xx

    )

set (PROJECT_INCLUDES
	# LIST INCLUDE DIRECTORIES HERE
    Core/Inc/
    
    Drivers/CMSIS/Device/ST/STM32WLxx/Include
    Drivers/CMSIS/Include

    Drivers/STM32WLxx_HAL_Driver/Inc
    Drivers/STM32WLxx_HAL_Driver/Inc/Legacy
    

    Drivers/BSP/STM32WLxx_LoRa_E5_mini

    Middlewares/FreeRTOS/Source
    Middlewares/FreeRTOS/Source/include
    Middlewares/FreeRTOS/Source/CMSIS_RTOS
    Middlewares/FreeRTOS/Source/portable/GCC/ARM_CM3
    
    Utilities/misc
    )

############ MODIFY ACCORDING TO REQUIREMENTS) ########################

#######################################################################

################## PROJECT SETUP ######################################
project(${PROJECT_NAME})
enable_language(ASM)

if (${PROJECT_TYPE} MATCHES ${PROJECT_TYPE_EXECUTABLE})
  add_executable(${PROJECT_NAME} ${PROJECT_SOURCES})
  add_custom_command(TARGET ${CMAKE_PROJECT_NAME} POST_BUILD COMMAND ${CMAKE_SIZE} $<TARGET_FILE:${CMAKE_PROJECT_NAME}>)
elseif (${PROJECT_TYPE} MATCHES ${PROJECT_TYPE_STATIC_LIBRARY})
  add_library(${PROJECT_NAME} ${PROJECT_SOURCES})
endif()

add_compile_definitions (${PROJECT_DEFINES})
include_directories (${PROJECT_INCLUDES})

set (CMAKE_EXECUTABLE_SUFFIX ".elf")
set (CMAKE_STATIC_LIBRARY_SUFFIX ".a")
set (CMAKE_C_FLAGS "${MCPU} -std=gnu11 ${MFPU} ${MFLOAT_ABI} ${RUNTIME_LIBRARY} -mthumb -Wall -Werror")
set (CMAKE_EXE_LINKER_FLAGS "-T${LINKER_SCRIPT} ${RUNTIME_LIBRARY_SYSCALLS} -Wl,-Map=test.map -Wl,--gc-sections -static -Wl,--start-group -lc -lm -Wl,--end-group")
set (CMAKE_ASM_FLAGS "${CMAKE_C_FLAGS} -x assembler-with-cpp")
