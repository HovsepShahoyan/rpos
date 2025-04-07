#!/usr/bin/env python3

import argparse
import serial
import time
import sys

PORT = '/dev/ttyUSB0'
BAUD = 115200

def build_zoom_command(level: int) -> bytes:
    # Map allowed zoom levels to XX values
    zoom_map = {1: 0x00, 2: 0x01, 4: 0x02, 8: 0x03}
    if level not in zoom_map:
        raise ValueError("Zoom level must be one of: 1, 2, 4, 8")

    xx = zoom_map[level]
    yy = (xx + 0x0F) & 0xFF
    return bytes([0xFF, 0x00, 0x00, 0x0F, 0x00, xx, yy])

def send_uart_zoom(level: int):
    cmd = build_zoom_command(level)
    hex_cmd = ' '.join(format(b, '02X') for b in cmd)
    print(f"[INFO] Sending UART zoom {level}x command: {hex_cmd}")

    try:
        with serial.Serial(PORT, baudrate=BAUD, timeout=1) as ser:
            ser.setDTR(True)
            ser.setRTS(True)
            time.sleep(0.1)
            ser.write(cmd)
            ser.flush()
            time.sleep(0.1)
    except serial.SerialException as e:
        print(f"[UART ERROR] Serial error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Send UART digital zoom command")
    parser.add_argument('--level', type=int, required=True, help='Zoom level (1, 2, 4, or 8)')
    args = parser.parse_args()

    try:
        send_uart_zoom(args.level)
    except ValueError as e:
        print(f"[ERROR] {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

