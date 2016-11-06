PROJECT_FOLDER=/home/pi/surveillance-v2
CLIENT_FOLDER=$PROJECT_FOLDER/app/camclient
IMAGE_BASEFOLDER=/mnt/usb/images

#create folders
mkdir $IMAGE_BASEFOLDER
mkdir $IMAGE_BASEFOLDER/history

#make scripts executable
sudo chmod +x $PROJECT_FOLDER/install-scripts/*
sudo chmod +x $CLIENT_FOLDER/*

#install graphicsmagick
sudo apt-get install graphicsmagick