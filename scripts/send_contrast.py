#!/usr/bin/env python3

import argparse
import serial
import time
import sys

PORT = '/dev/ttyUSB0'
BAUD = 115200

def build_uart_contrast_command(contrast: int) -> bytes:
    if not (0 <= contrast <= 100):
        raise ValueError("Contrast must be between 0 and 100")

    xx = contrast
    yy = (xx + 0x07) & 0xFF
    return bytes([0xFF, 0x00, 0x00, 0x07, 0x00, xx, yy])

def send_uart_contrast(contrast: int):
    cmd = build_uart_contrast_command(contrast)

    try:
        with serial.Serial(PORT, baudrate=BAUD, timeout=1) as ser:
            ser.setDTR(True)
            ser.setRTS(True)
            time.sleep(0.1)
            ser.write(cmd)
            ser.flush()
            time.sleep(0.1)
            print(f"[UART] Sent contrast command: {cmd.hex().upper()}")
    except serial.SerialException as e:
        print(f"[UART ERROR] Serial error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Send UART contrast command")
    parser.add_argument('--value', type=int, required=True, help='Contrast value (0–100)')
    args = parser.parse_args()

    try:
        send_uart_contrast(args.value)
    except ValueError as e:
        print(f"[ERROR] {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

