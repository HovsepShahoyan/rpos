#!/bin/bash

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root."
   exit 1
fi

# Arguments
INTERFACE=$1
NEW_IP=$2
NEW_NETMASK=$3
NEW_BROADCAST=$4

# Usage
if [[ $# -ne 4 ]]; then
    echo "Usage: $0 <interface> <ip-address> <netmask> <broadcast>"
    echo "Example: $0 eth0 192.168.1.100 255.255.255.0 192.168.1.255"
    exit 1
fi

echo "🔧 Configuring network interface $INTERFACE..."
echo "➡️ IP Address: $NEW_IP"
echo "➡️ Netmask: $NEW_NETMASK"
echo "➡️ Broadcast: $NEW_BROADCAST"

# Bring the interface down
ip link set dev "$INTERFACE" down

# Remove old IP addresses
ip addr flush dev "$INTERFACE"

# Add the new IP, netmask, and broadcast
ip addr add "$NEW_IP"/"$NEW_NETMASK" brd "$NEW_BROADCAST" dev "$INTERFACE"

# Bring the interface up
ip link set dev "$INTERFACE" up

echo "✅ Network configuration updated successfully."

