#!/usr/bin/env python3

import argparse
import serial
import time
import sys

PORT = '/dev/ttyUSB0'
BAUD = 115200

def build_uart_command(palette: int) -> bytes:
    if not (0 <= palette <= 14):
        raise ValueError("Palette must be between 0 and 14")
    xx = palette
    yy = (xx + 0x0e) & 0xFF
    return bytes([0xFF, 0x00, 0x00, 0x0e, 0x00, xx, yy])

def send_uart_palette(palette: int):
    cmd = build_uart_command(palette)
    try:
        with serial.Serial(PORT, baudrate=BAUD, timeout=1) as ser:
            ser.setDTR(True)
            ser.setRTS(True)
            time.sleep(0.1)
            ser.write(cmd)
            ser.flush()
            time.sleep(0.1)
    except Exception as e:
        print(f"[UART ERROR] {e}", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Send UART palette command")
    parser.add_argument('--value', type=int, required=True, help='Palette value (0–14)')
    args = parser.parse_args()

    try:
        send_uart_palette(args.value)
    except ValueError as e:
        print(f"[ERROR] {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

