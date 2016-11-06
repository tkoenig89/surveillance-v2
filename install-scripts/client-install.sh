SOURCE_ROOT=../
TARGET_LOCATION=/usr/surveilance
TARGET_CFG_LOCATION=/etc/surveilance
IMAGE_BASEFOLDER=/mnt/usb/images
CURRENT_DIR=$PWD

#install node and imagemagic
./prerequisits.sh

#create image folders
mkdir $IMAGE_BASEFOLDER
mkdir $IMAGE_BASEFOLDER/history

#install configuration file
sudo mkdir $TARGET_CFG_LOCATION
sudo chown -R pi:root $TARGET_CFG_LOCATION
sudo chmod -R 775 $TARGET_CFG_LOCATION

cp -r $SOURCE_ROOT/config.json $SOURCE_ROOT/cronconf.json $TARGET_CFG_LOCATION

#install application
sudo mkdir $TARGET_LOCATION
sudo chown -R pi:root $TARGET_LOCATION
sudo chmod -R 775 $TARGET_LOCATION

cp -r $SOURCE_ROOT/app/camclient $SOURCE_ROOT/app/core $SOURCE_ROOT/app/maintenance $SOURCE_ROOT/package.json $TARGET_LOCATION
cd $TARGET_LOCATION
npm install
cd $CURRENT_DIR