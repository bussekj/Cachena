cmake -DCMAKE_TOOLCHAIN_FILE=gcc-arm-none-eabi.cmake  -S ./ -B Debug -G"Unix Makefiles" -DCMAKE_BUILD_TYPE=Debug
cmake --build Debug