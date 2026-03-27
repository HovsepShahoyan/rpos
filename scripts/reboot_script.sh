#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<EOF
Usage: sudo $0 "TIME" /full/path/to/target-script.sh [user-to-run-as]
TIME:
  - "HH:MM"         (today at HH:MM, or tomorrow if that time already passed)
  - "YYYY-MM-DD HH:MM"
Example:
  sudo $0 "23:15" /home/user/myscript.sh
  sudo $0 "2025-08-26 03:00" /usr/local/bin/after_reboot.sh root
EOF
  exit 1
}

if [[ $# -lt 2 ]]; then usage; fi

TIME_ARG="$1"
TARGET_SCRIPT="$2"
RUN_AS="${3:-root}"   # user the target script should run as (default root)

if [[ ! -f "$TARGET_SCRIPT" ]]; then
  echo "Error: target script '$TARGET_SCRIPT' not found."
  exit 2
fi

# Make sure the target is executable
if [[ ! -x "$TARGET_SCRIPT" ]]; then
  echo "Warning: making target script executable: $TARGET_SCRIPT"
  chmod +x "$TARGET_SCRIPT"
fi

# parse TIME_ARG to epoch seconds (works on GNU date)
parse_time_to_epoch() {
  local t="$1"
  # try full datetime first
  if epoch=$(date -d "$t" +%s 2>/dev/null); then
    echo "$epoch"
    return 0
  fi
  # if only HH:MM, decide today or tomorrow
  if [[ "$t" =~ ^([0-1][0-9]|2[0-3]):([0-5][0-9])$ ]]; then
    local today_epoch
    local now_epoch
    today_epoch=$(date -d "today $t" +%s)
    now_epoch=$(date +%s)
    if (( today_epoch <= now_epoch )); then
      date -d "tomorrow $t" +%s
    else
      date -d "today $t" +%s
    fi
    return 0
  fi
  return 1
}

TARGET_EPOCH=$(parse_time_to_epoch "$TIME_ARG") || { echo "Invalid time format: $TIME_ARG"; exit 3; }
NOW=$(date +%s)
if (( TARGET_EPOCH <= NOW )); then
  echo "Computed target time is in the past. Aborting."
  exit 4
fi
SECONDS_UNTIL=$(( TARGET_EPOCH - NOW ))
MINUTES_UNTIL=$(( (SECONDS_UNTIL + 59) / 60 ))

# Unique id for this install
ID="runonce-$(date +%s)-$RANDOM"
HELPER="/usr/local/sbin/run_after_reboot_${ID}.sh"
LOG="/var/log/run_after_reboot_${ID}.log"
CRON_TAG="# RUN_ONCE_ID=${ID}"

# Create helper that will run after boot; it runs as specified user using su -c (for root it runs directly)
cat > "${HELPER}" <<EOF
#!/usr/bin/env bash
set -euo pipefail

TARGET="${TARGET_SCRIPT}"
LOG="${LOG}"
ID="${ID}"
CRON_TAG="${CRON_TAG}"
RUN_AS="${RUN_AS}"

# small delay to allow system services to come up
sleep 20

# run as target user
if [[ "\$RUN_AS" == "root" ]]; then
  if [[ -x "\$TARGET" ]]; then
    "\$TARGET" >> "\$LOG" 2>&1 || echo "Target returned non-zero" >> "\$LOG"
  else
    echo "Target not executable: \$TARGET" >> "\$LOG"
  fi
else
  # run under the specified user
  if id "\$RUN_AS" >/dev/null 2>&1; then
    su -s /bin/bash -c "'\$TARGET' >> '\$LOG' 2>&1" "\$RUN_AS" || echo "Target failed under user \$RUN_AS" >> "\$LOG"
  else
    echo "User '\$RUN_AS' does not exist; not running target." >> "\$LOG"
  fi
fi

# remove the cron entry that contains the tag (run as root)
existing=\$(crontab -l -u root 2>/dev/null || true)
if [[ -n "\$existing" ]]; then
  echo "\$existing" | grep -vF "\${CRON_TAG}" | crontab -u root -
fi

# remove helper itself
rm -f "\$0"
EOF

chmod +x "${HELPER}"
echo "Created helper: ${HELPER}"
echo "Log file: ${LOG}"

# Add an @reboot line to root's crontab (safe add, remove any previous lines with same tag)
CRON_ENTRY="@reboot sleep 10 && ${HELPER} >> ${LOG} 2>&1 ${CRON_TAG}"
# Write new crontab for root
( crontab -l -u root 2>/dev/null || true ) | grep -vF "${CRON_TAG}" || true
( (crontab -l -u root 2>/dev/null || true) | grep -vF "${CRON_TAG}" ; echo "${CRON_ENTRY}" ) | crontab -u root -

echo "Installed one-time @reboot job to run ${TARGET_SCRIPT} after next boot."

# Schedule reboot using shutdown -r +minutes (portable)
if command -v shutdown >/dev/null 2>&1; then
  echo "Scheduling reboot at: $(date -d "@${TARGET_EPOCH}" '+%F %T') (in ${MINUTES_UNTIL} minutes)."
  shutdown -r +"${MINUTES_UNTIL}" "Scheduled reboot to run ${TARGET_SCRIPT} after boot (ID=${ID})."
else
  echo "Error: 'shutdown' command not found. Remove crontab entry manually if needed. Aborting scheduling."
  # remove cron entry and helper in case of failure to avoid leftover
  ( crontab -l -u root 2>/dev/null || true ) | grep -vF "${CRON_TAG}" | crontab -u root -
  rm -f "${HELPER}"
  exit 5
fi

echo "Done. Reboot is scheduled."
echo "After reboot, ${TARGET_SCRIPT} will be run once (as user: ${RUN_AS})."
