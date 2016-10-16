MOSQUITTO_FOLDER=/mnt/usb/mosquitto
MOSQUITTO_SERVER_HOSTNAME=raspinobody.ddns.net
MOSQUITTO_PORT=1337
#add user for the mosquitto server
adduser mosquitto

#create a folder for the storage and provide access for the mosquitto user
sudo mkdir $MOSQUITTO_FOLDER/
sudo chown mosquitto:mosquitto $MOSQUITTO_FOLDER/ -R

##install dependencies
apt-get update
apt-get install build-essential libwrap0-dev libssl-dev libc-ares-dev uuid-dev xsltproc

#download mosquitto
cd /home/mosquitto
sudo -u mosquitto wget http://mosquitto.org/files/source/mosquitto-1.4.8.tar.gz
sudo -u mosquitto tar xvzf mosquitto-1.4.8.tar.gz
sudo -u mosquitto cd mosquitto-1.4.8

#make and install
sudo -u mosquitto make
sudo make install

#add a user to the pwfile
sudo -u mosquitto mosquitto_passwd -c $MOSQUITTO_FOLDER/pwfile stalluser

#copy the example config
sudo -u mosquitto cp /etc/mosquitto/mosquitto.conf.example $MOSQUITTO_FOLDER/mosquitto.conf

#add configuration
sudo -u mosquitto bash -c "echo \"listener $MOSQUITTO_PORT\" >> $MOSQUITTO_FOLDER/mosquitto.conf"
sudo -u mosquitto bash -c "echo \"persistence true\" >> $MOSQUITTO_FOLDER/mosquitto.conf" 
sudo -u mosquitto bash -c "echo \"persistence_location $MOSQUITTO_FOLDER/\" >> $MOSQUITTO_FOLDER/mosquitto.conf" 
sudo -u mosquitto bash -c "echo \"persistence_file mosquitto.db\" >> $MOSQUITTO_FOLDER/mosquitto.conf" 
sudo -u mosquitto bash -c "echo \"log_dest syslog\" >> $MOSQUITTO_FOLDER/mosquitto.conf" 
sudo -u mosquitto bash -c "echo \"log_dest stdout\" >> $MOSQUITTO_FOLDER/mosquitto.conf" 
sudo -u mosquitto bash -c "echo \"log_dest topic\" >> $MOSQUITTO_FOLDER/mosquitto.conf" 
sudo -u mosquitto bash -c "echo \"log_type error\" >> $MOSQUITTO_FOLDER/mosquitto.conf" 
sudo -u mosquitto bash -c "echo \"log_type warning\" >> $MOSQUITTO_FOLDER/mosquitto.conf" 
sudo -u mosquitto bash -c "echo \"log_type notice\" >> $MOSQUITTO_FOLDER/mosquitto.conf" 
sudo -u mosquitto bash -c "echo \"log_type information\" >> $MOSQUITTO_FOLDER/mosquitto.conf" 
sudo -u mosquitto bash -c "echo \"connection_messages true\" >> $MOSQUITTO_FOLDER/mosquitto.conf" 
sudo -u mosquitto bash -c "echo \"log_timestamp true\" >> $MOSQUITTO_FOLDER/mosquitto.conf" 
sudo -u mosquitto bash -c "echo \"allow_anonymous false\" >> $MOSQUITTO_FOLDER/mosquitto.conf" 
sudo -u mosquitto bash -c "echo \"password_file $MOSQUITTO_FOLDER/pwfile\" >> $MOSQUITTO_FOLDER/mosquitto.conf"

#create folder for certificates
sudo -u mosquitto mkdir $MOSQUITTO_FOLDER/certs/
cd $MOSQUITTO_FOLDER/certs/

#generate certificates
sudo -u mosquitto wget https://raw.githubusercontent.com/owntracks/tools/master/TLS/generate-CA.sh
sudo -u mosquitto chmod +x generate-CA.sh
sudo -u mosquitto ./generate-CA.sh $MOSQUITTO_SERVER_HOSTNAME

#find the apropiate files
HOST_CERT=$(ls | awk '/.crt/ && !/ca./')
HOST_KEY=$(ls | awk '/.key/ && !/ca./')
CA_CERT="ca.crt"

#add the certificates to the mosquitto configuration
sudo -u mosquitto bash -c "echo \"cafile $MOSQUITTO_FOLDER/certs/$CA_CERT\" >> $MOSQUITTO_FOLDER/mosquitto.conf"
sudo -u mosquitto bash -c "echo \"certfile $MOSQUITTO_FOLDER/certs/$HOST_CERT\" >> $MOSQUITTO_FOLDER/mosquitto.conf"
sudo -u mosquitto bash -c "echo \"keyfile $MOSQUITTO_FOLDER/certs/$HOST_KEY\" >> $MOSQUITTO_FOLDER/mosquitto.conf"

#Attention
#don't forget to distribute the ca.crt to the clients that should connect!!

#finally add a cronjob to start the mosquitto server at boot
sudo -u mosquitto bash -c "(crontab -l 2>/dev/null; echo \"@reboot mosquitto -c $MOSQUITTO_FOLDER/mosquitto.conf\") | crontab -"

#run mosquitto
#>sudo -u mosquitto mosquitto -c /mnt/usb/mosquitto/mosquitto.conf