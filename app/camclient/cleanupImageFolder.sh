#deletes images older than 4000 minutes ~ 3 days
sudo find $1/* -type d -mmin +$2 -exec rm -rf {} \;