#!/bin/bash
# Server Bucket install.sh
# Sets up system for Server Bucket

apt-get install docker.io

mkdir /opt/ss-static

# Enable drive qutoa on /
drive=$(df -P /home/ | awk 'NR==2 {print $1}')
apt-get install quota
sed "s*$drive /               ext4    errors=remount-ro 0       1*$drive /               ext4    errors=remount-ro,usrquota 0       1*g" -i /etc/fstab
mount -vo remount /
quotacheck -cum /
quotaon -v /
