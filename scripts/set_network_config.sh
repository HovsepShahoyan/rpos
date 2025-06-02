#!/bin/bash

IFACE="$1"
IP_ADDR="$2"
SUBNET_MASK="$3"
GATEWAY="$4"
DNS1="$5"
DNS2="$6"

if [[ $# -ne 6 ]]; then
    echo "Usage: $0 <interface> <ip-address> <subnet-mask> <gateway> <dns1> <dns2>"
    exit 1
fi

mask2cidr() {
    local i=0
    IFS=.
    read -r o1 o2 o3 o4 <<< "$1"
    unset IFS
    for octet in "$o1" "$o2" "$o3" "$o4"; do
        case $octet in
            255) i=$((i+8)) ;;
            254) i=$((i+7)) ;;
            252) i=$((i+6)) ;;
            248) i=$((i+5)) ;;
            240) i=$((i+4)) ;;
            224) i=$((i+3)) ;;
            192) i=$((i+2)) ;;
            128) i=$((i+1)) ;;
            0) ;;
            *) echo "Invalid subnet mask: $1"; exit 1 ;;
        esac
    done
    echo "$i"
}

PREFIX=$(mask2cidr "$SUBNET_MASK")
echo "==============================="
echo "DEBUG: Interface: $IFACE"
echo "DEBUG: Requested IP: $IP_ADDR"
echo "DEBUG: Requested Mask: $SUBNET_MASK → /$PREFIX"
echo "DEBUG: Requested Gateway: $GATEWAY"
echo "DEBUG: Requested DNS: $DNS1, $DNS2"
echo "==============================="

echo "1) ip link show $IFACE before changes:"
ip link show "$IFACE"

echo "2) ip addr show $IFACE before changes:"
ip addr show "$IFACE"

echo "3) ip route show before changes:"
ip route show

echo ""
echo "----- Bringing interface UP -----"
ip link set dev "$IFACE" up || { echo "ERROR: failed to bring up $IFACE"; exit 1; }

echo ""
echo "----- Flushing old addresses -----"
ip addr flush dev "$IFACE" || { echo "ERROR: failed to flush $IFACE"; exit 1; }

if command -v ipcalc >/dev/null 2>&1; then
    BROADCAST=$(ipcalc -b "$IP_ADDR" "$SUBNET_MASK" | awk '/Broadcast/ {print $2}')
    echo "DEBUG: Calculated broadcast: $BROADCAST"
else
    echo "WARNING: ipcalc not found; cannot calculate broadcast"
    BROADCAST=""
fi

echo ""
echo "----- Assigning new IP/Broadcast -----"
if [[ -n "$BROADCAST" ]]; then
    ip addr add "$IP_ADDR/$PREFIX" broadcast "$BROADCAST" dev "$IFACE" \
        || { echo "ERROR: failed to add $IP_ADDR/$PREFIX"; exit 1; }
else
    ip addr add "$IP_ADDR/$PREFIX" dev "$IFACE" \
        || { echo "ERROR: failed to add $IP_ADDR/$PREFIX"; exit 1; }
fi

echo ""
echo "----- Routes after IP assignment -----"
ip addr show "$IFACE"
ip route show

echo ""
echo "----- Reconfiguring default route -----"
ip route del default 2>/dev/null
ip route add default via "$GATEWAY" dev "$IFACE" \
    || { echo "ERROR: failed to add default via $GATEWAY"; exit 1; }

echo ""
echo "----- Routes after default route change -----"
ip route show

echo ""
echo "----- Writing /etc/resolv.conf -----"
{
    echo "nameserver $DNS1"
    echo "nameserver $DNS2"
} > /etc/resolv.conf || { echo "ERROR: failed to write resolv.conf"; exit 1; }

echo ""
echo "✅ SCRIPT DONE. Now test connectivity:"
echo "   → ping -c3 $GATEWAY"
echo "   → ping -c3 192.168.0.50   # (or your local-server IP)"
echo "   → ping -c3 8.8.8.8"
echo "   → ping -c3 google.com"
