#!/bin/bash

CONFIG="/home/jetson/rpos/rposConfig.json"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --ip)
      NEW_IP="$2"
      shift 2
      ;;
    --user)
      NEW_USER="$2"
      shift 2
      ;;
    --pass)
      NEW_PASS="$2"
      shift 2
      ;;
    *)
      echo "[ERROR] Unknown argument: $1"
      echo "Usage: $0 [--ip NEW_IP] [--user USERNAME] [--pass PASSWORD]"
      exit 1
      ;;
  esac
done

# Make sure the file exists
if [ ! -f "$CONFIG" ]; then
  echo "[ERROR] Config file not found: $CONFIG"
  exit 1
fi

# Strip UTF-8 BOM if it exists
tail --bytes=+4 "$CONFIG" > tmp_config && mv tmp_config "$CONFIG"

# Apply changes
if [ -n "$NEW_IP" ]; then
  sed -i "s/\"IpAddress\" *: *\"[^\"]*\"/\"IpAddress\" : \"$NEW_IP\"/" "$CONFIG"
  echo "[✓] IP updated to $NEW_IP"
fi

if [ -n "$NEW_USER" ]; then
  sed -i "s/\"Username\" *: *\"[^\"]*\"/\"Username\" : \"$NEW_USER\"/" "$CONFIG"
  echo "[✓] Username updated to $NEW_USER"
fi

if [ -n "$NEW_PASS" ]; then
  sed -i "s/\"Password\" *: *\"[^\"]*\"/\"Password\" : \"$NEW_PASS\"/" "$CONFIG"
  echo "[✓] Password updated to $NEW_PASS"
fi

echo "[✓] Done."
