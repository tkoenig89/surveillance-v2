#add user to run the image receiving mqtt client
sudo adduser imagereceiver

#set common paths
MQTT_IMAGES=/mnt/usb/mqtt-images
MQTT_FOLDER=/home/imagereceiver/mqtt
GIT_REPO="https://github.com/tkoenig89/surveillance-v2.git"
MQTT_CONFIG=$MQTT_FOLDER/config.json
MQTT_CLIENT_SCRIPT=$MQTT_FOLDER/surveillance-v2/app/server/mqttSubscriber.js
PATH_TO_NODE=$(which node)

#load script and config from git
sudo -u imagereceiver mkdir $MQTT_FOLDER
cd $MQTT_FOLDER
sudo -u imagereceiver git clone $GIT_REPO
sudo -u imagereceiver cp $MQTT_FOLDER/surveillance-v2/config.json $MQTT_CONFIG

#install modules
cd $MQTT_FOLDER/surveillance-v2
sudo -u imagereceiver npm install

#create a cronjob to run the server on startup
sudo -u imagereceiver bash -c "(crontab -l 2>/dev/null; echo \"@reboot $PATH_TO_NODE $MQTT_CLIENT_SCRIPT $MQTT_CONFIG\") | crontab -"

#create folder to store the images
sudo mkdir $MQTT_IMAGES
sudo chown imagereceiver:imagereceiver $MQTT_IMAGES -R