sudo mkdir /certs; cd /certs;
sudo wget https://raw.githubusercontent.com/owntracks/tools/master/TLS/generate-CA.sh
sudo chmod +x generate-CA.sh
sudo ./generate-CA.sh

#add to /etc/mosquitto/mosquitto.conf:
#cafile /certs/ca.crt
#certfile /certs/raspitest.crt
#keyfile /certs/raspitest.key