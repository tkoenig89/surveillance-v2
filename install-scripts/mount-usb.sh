#prepare usb mount
mkdir /mnt/usb
sudo chown -R pi:pi /mnt/usb
sudo chmod -R 775 /mnt/usb
sudo setfacl -Rdm g:pi:rwx /mnt/usb
sudo setfacl -Rm g:pi:rwx /mnt/usb

#testmount:
sudo mount -o uid=pi,gid=pi /dev/sda1 /mnt/usb

#get UUID of usb stick
#>sudo  ls -l /dev/disk/by-uuid/ | grep /sda1

#edit /fstab file:
#>sudo nano /etc/fstab

#add line:
#UUID=XXXX-XXXX  /mnt/usb vfat   nofail,uid=pi,gid=pi   0   0
#oder:
#UUID=XXXX-XXXX /mnt/usb vfat utf8,uid=pi,gid=pi,noatime 0