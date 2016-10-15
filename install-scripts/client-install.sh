PROJECT_FOLDER=/home/pi/surveillance-v2
CLIENT_FOLDER=$PROJECT_FOLDER/app/camclient
IMAGE_BASEFOLDER=/mnt/usb/images
#create folders
mkdir $IMAGE_BASEFOLDER
mkdir $IMAGE_BASEFOLDER/history

#create cronjobs:
(2>/dev/null; echo "*/5 * * * * $CLIENT_FOLDER/client.js $PROJECT_FOLDER/config.json") | crontab -

#append jobs to shoot images
(crontab -l 2>/dev/null; echo "* * * * * $CLIENT_FOLDER/shootImage.sh $IMAGE_BASEFOLDER") | crontab -
(crontab -l 2>/dev/null; echo "* * * * * sleep 15; $CLIENT_FOLDER/shootImage.sh $IMAGE_BASEFOLDER") | crontab -
(crontab -l 2>/dev/null; echo "* * * * * sleep 30; $CLIENT_FOLDER/shootImage.sh $IMAGE_BASEFOLDER") | crontab -
(crontab -l 2>/dev/null; echo "* * * * * sleep 45; $CLIENT_FOLDER/shootImage.sh $IMAGE_BASEFOLDER") | crontab -

sudo chmod +x $CLIENT_FOLDER/*