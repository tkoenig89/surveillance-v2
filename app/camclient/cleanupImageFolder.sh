#deletes images older than 4000 minutes ~ 3 days
sudo find $1/* -mmin +$2 -delete