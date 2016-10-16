PROJECT_FOLDER=/home/pi/surveillance-v2
CLIENTSCRIPTS_FOLDER=$PROJECT_FOLDER/app/camclient
IMAGE_BASEFOLDER=/mnt/usb/images
PATH_TO_NODE=$(which node)

#send image to server each 5 minutes
(2>/dev/null; echo "*/5 * * * * $PATH_TO_NODE $CLIENTSCRIPTS_FOLDER/client.js $PROJECT_FOLDER/config.json") | crontab -

#remove old images after ~7 days(10000 min) 
(crontab -l 2>/dev/null; echo "1 1 * * * $CLIENTSCRIPTS_FOLDER/cleanupImageFolder.sh $IMAGE_BASEFOLDER 10000") | crontab -

#append jobs to shoot images
(crontab -l 2>/dev/null; echo "* * * * * $CLIENTSCRIPTS_FOLDER/shootImage.sh $IMAGE_BASEFOLDER/history") | crontab -
(crontab -l 2>/dev/null; echo "* * * * * sleep 15; $CLIENTSCRIPTS_FOLDER/shootImage.sh $IMAGE_BASEFOLDER") | crontab -
(crontab -l 2>/dev/null; echo "* * * * * sleep 30; $CLIENTSCRIPTS_FOLDER/shootImage.sh $IMAGE_BASEFOLDER") | crontab -
(crontab -l 2>/dev/null; echo "* * * * * sleep 45; $CLIENTSCRIPTS_FOLDER/shootImage.sh $IMAGE_BASEFOLDER") | crontab -
