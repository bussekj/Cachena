
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

project(${PROJECT_NAME})

enable_language(C ASM)

# STM32CubeMX generated symbols (macros)
set(MX_Defines_Syms 
	CORE_CM4 
	USE_HAL_DRIVER 
	STM32WLE5xx 
	STM32_THREAD_SAFE_STRATEGY=4
    $<$<CONFIG:Debug>:DEBUG>
)

set(Include_Dirs
    Core/Inc
    SubGHz_Phy/App
    SubGHz_Phy/Target
    Drivers/STM32WLxx_HAL_Driver/Inc
    Utilities/trace/adv_trace
    Drivers/STM32WLxx_HAL_Driver/Inc/Legacy
    Utilities/misc
    Utilities/timer
    Utilities/lpm/tiny_lpm
    Middlewares/Third_Party/FreeRTOS/Source/include
    Middlewares/Third_Party/FreeRTOS/Source/CMSIS_RTOS_V2
    Middlewares/Third_Party/FreeRTOS/Source/portable/GCC/ARM_CM3
    Drivers/CMSIS/RTOS2/Include
    Drivers/CMSIS/Device/ST/STM32WLxx/Include
    Middlewares/Third_Party/SubGHz_Phy/radio_driver
    Drivers/CMSIS/Include
)

set(Application_Src
    SubGHz_Phy/App/app_subghz_phy.c
    SubGHz_Phy/App/subghz_phy_app.c
    SubGHz_Phy/Target/radio_board_if.c
    Core/Src/main.c
    Core/Src/app_freertos.c
    Core/Src/stm32_lpm_if.c
    Core/Src/sys_app.c
    Core/Src/timer_if.c
    Core/Src/usart_if.c
    Core/Src/stm32wlxx_it.c
    Core/Src/stm32wlxx_hal_msp.c
    Core/Src/stm32wlxx_hal_timebase_tim.c
    Core/Src/sysmem.c
    Core/Src/syscalls.c
    startup_stm32wle5xx.s
)

# STM32 HAL/LL Drivers
set(STM32_Drivers_Src
    Core/Src/system_stm32wlxx.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_tim.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_tim_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_rcc.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_rcc_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_flash.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_flash_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_gpio.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_dma.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_dma_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_pwr.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_pwr_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_cortex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_exti.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_lptim.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_uart.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_uart_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_rng.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_rng_ex.c
    Drivers/STM32WLxx_HAL_Driver/Src/stm32wlxx_hal_subghz.c
)

set(Utilities_Src
    Utilities/trace/adv_trace/stm32_adv_trace.c
    Utilities/misc/stm32_mem.c
    Utilities/misc/stm32_systime.c
    Utilities/misc/stm32_tiny_sscanf.c
    Utilities/misc/stm32_tiny_vsnprintf.c
    Utilities/timer/stm32_timer.c
    Utilities/lpm/tiny_lpm/stm32_lpm.c
)
set(FreeRTOS_Src
    Middlewares/Third_Party/FreeRTOS/Source/croutine.c
    Middlewares/Third_Party/FreeRTOS/Source/event_groups.c
    Middlewares/Third_Party/FreeRTOS/Source/list.c
    Middlewares/Third_Party/FreeRTOS/Source/queue.c
    Middlewares/Third_Party/FreeRTOS/Source/stream_buffer.c
    Middlewares/Third_Party/FreeRTOS/Source/tasks.c
    Middlewares/Third_Party/FreeRTOS/Source/timers.c
    Middlewares/Third_Party/FreeRTOS/Source/CMSIS_RTOS_V2/cmsis_os2.c
    Middlewares/Third_Party/FreeRTOS/Source/portable/MemMang/heap_4.c
    Middlewares/Third_Party/FreeRTOS/Source/portable/GCC/ARM_CM3/port.c
)
set(SubGHz_Phy_Src
    Middlewares/Third_Party/SubGHz_Phy/radio_driver/wl_lr_fhss.c
    Middlewares/Third_Party/SubGHz_Phy/radio_driver/radio.c
    Middlewares/Third_Party/SubGHz_Phy/radio_driver/radio_fw.c
    Middlewares/Third_Party/SubGHz_Phy/radio_driver/radio_driver.c
    Middlewares/Third_Party/SubGHz_Phy/radio_driver/lr_fhss_mac.c
)

set (PROJECT_DEFINES
	# LIST COMPILER DEFINITIONS HERE
    STM32WLE5xx

    )

    # Link directories setup
set(LINK_DIRS

)
# Project static libraries
set(LINK_LIBS 
    STM32_Drivers
    ${TOOLCHAIN_LINK_LIBRARIES}
    Utilities
    FreeRTOS
    SubGHz_Phy
)

# Interface library for includes and symbols
add_library(stm32cubemx INTERFACE)
target_include_directories(stm32cubemx INTERFACE ${Include_Dirs})
target_compile_definitions(stm32cubemx INTERFACE ${Defines_Syms})

# Create STM32_Drivers static library
add_library(STM32_Drivers OBJECT)
target_sources(STM32_Drivers PRIVATE ${STM32_Drivers_Src})
target_link_libraries(STM32_Drivers PUBLIC stm32cubemx)


# Create Utilities static library
add_library(Utilities OBJECT)
target_sources(Utilities PRIVATE ${Utilities_Src})
target_link_libraries(Utilities PUBLIC stm32cubemx)

# Create FreeRTOS static library
add_library(FreeRTOS OBJECT)
target_sources(FreeRTOS PRIVATE ${FreeRTOS_Src})
target_link_libraries(FreeRTOS PUBLIC stm32cubemx)

# Create SubGHz_Phy static library
add_library(SubGHz_Phy OBJECT)
target_sources(SubGHz_Phy PRIVATE ${SubGHz_Phy_Src})
target_link_libraries(SubGHz_Phy PUBLIC stm32cubemx)

# Create the final executable target including application sources and object-library objects
add_executable(${PROJECT_NAME}
    ${Application_Src}
    $<TARGET_OBJECTS:STM32_Drivers>
    $<TARGET_OBJECTS:Utilities>
    $<TARGET_OBJECTS:FreeRTOS>
    $<TARGET_OBJECTS:SubGHz_Phy>
)

# Link directories setup (toolchain / linker search paths)
target_link_directories(${PROJECT_NAME} PRIVATE ${LINK_DIRS})

# Link toolchain/system libraries; object libraries' object files are already added to the executable above.
# Keep stm32cubemx attached so its include dirs / compile defs propagate
target_link_libraries(${PROJECT_NAME} PRIVATE ${TOOLCHAIN_LINK_LIBRARIES} stm32cubemx)

# Add the map file to the list of files to be removed with 'clean' target
set_target_properties(${PROJECT_NAME} PROPERTIES ADDITIONAL_CLEAN_FILES ${PROJECT_NAME}.map)

# Validate that STM32CubeMX code is compatible with C standard
if((CMAKE_C_STANDARD EQUAL 90) OR (CMAKE_C_STANDARD EQUAL 99))
    message(ERROR "Generated code requires C11 or higher")
endif()
################## PROJECT SETUP ######################################
# Project target is created above with add_executable; duplicate project/add_executable block removed.

add_compile_definitions (${PROJECT_DEFINES})
include_directories (${PROJECT_INCLUDES})

set (CMAKE_EXECUTABLE_SUFFIX ".elf")
set (CMAKE_STATIC_LIBRARY_SUFFIX ".a")
set (CMAKE_C_FLAGS "${MCPU} -std=gnu11 ${MFPU} ${MFLOAT_ABI} ${RUNTIME_LIBRARY} -mthumb -Wall")
set (CMAKE_EXE_LINKER_FLAGS "-T${LINKER_SCRIPT} ${RUNTIME_LIBRARY_SYSCALLS} -Wl,-Map=test.map -Wl,--gc-sections -static -Wl,--start-group -lc -lm -Wl,--end-group")
set (CMAKE_ASM_FLAGS "${CMAKE_C_FLAGS} -x assembler-with-cpp")
