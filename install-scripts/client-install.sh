#create folders
mkdir /mnt/usb/images
mkdir /mnt/usb/images/history

#create cronjobs:
(2>/dev/null; echo "*/5 * * * * /home/pi/surveillance-v2/app/camclient/client.js /home/pi/surveillance-v2/config.json") | crontab -

#append jobs to shoot images
(crontab -l 2>/dev/null; echo "* * * * * /home/pi/surveillance-v2/app/camclient/shootImage.sh /mnt/usb/images") | crontab -
(crontab -l 2>/dev/null; echo "* * * * * sleep 15; /home/pi/surveillance-v2/app/camclient/shootImage.sh /mnt/usb/images") | crontab -
(crontab -l 2>/dev/null; echo "* * * * * sleep 30; /home/pi/surveillance-v2/app/camclient/shootImage.sh /mnt/usb/images") | crontab -
(crontab -l 2>/dev/null; echo "* * * * * sleep 45; /home/pi/surveillance-v2/app/camclient/shootImage.sh /mnt/usb/images") | crontab -