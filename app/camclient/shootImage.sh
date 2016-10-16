#sudo raspistill -o /imgs/now.jpg -w 1300 -h 780 -tl 10000 -t 100000

#create a folder for each day
BASEFOLDER=$1
HISTORYFOLDER=$BASEFOLDER/history
FOLDER="$HISTORYFOLDER/$(date +%d%m%y)"

#create folder if it doesn't exist
if ! test -d $FOLDER ; then
	sudo mkdir $FOLDER 
fi

#archive old image
if test -f $BASEFOLDER/now.jpg ; then
	sudo cp $BASEFOLDER/now.jpg $FOLDER/img$(date +%H%M%S).jpg
fi

#shoot image: quality 10 seems to be the best result in quality and size
sudo raspistill -w 1280 -h 960 -o $BASEFOLDER/now.jpg -n -q 9 -e jpg -th none
gm convert -colorspace GRAY $BASEFOLDER/now.jpg $BASEFOLDER/now_sw.jpg