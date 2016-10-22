SYS_STAT_FILE=/mnt/usb/systemstats
echo $(date), $(df -h | awk '/mnt\/usb/ {print $6,$3,$4,$5}')>$SYS_STAT_FILE