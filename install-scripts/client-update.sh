SOURCE_ROOT=../
TARGET_LOCATION=/usr/surveillance
CURRENT_DIR=$PWD

#update application
cp -r $SOURCE_ROOT/app/camclient $SOURCE_ROOT/app/core $SOURCE_ROOT/app/maintenance $SOURCE_ROOT/package.json $TARGET_LOCATION
cd $TARGET_LOCATION
npm install
cd $CURRENT_DIR