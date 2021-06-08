#!/bin/sh
# This file set up the environmental variables needed by pulseaudio. It is needed when using pulseaudio in user mode though a systemd service since the 
# environtal variables are not exported when using that method. This file works together with the service user_art.service (check the 
# readme file "systemd-user-specfic-unit".

#Since pulseaudio need the environment variables DISPLAY and XAUTHORITATION to work, and environment variables in systemd user environment are not
#inheritated by the global environment, an bash script for setting up the variables is needed. This is the first script 
#which is executed by the service. Place it somewhere and copy the path into [absolute path].

file="/home/odroid/50-systemd-user--script-check.txt"

if [ -f $file ] ; then
    rm $file
fi

systemctl --user import-environment DISPLAY XAUTHORITY

if which dbus-update-activation-environment >/dev/null 2>&1; then
        dbus-update-activation-environment DISPLAY XAUTHORITY
fi

echo "50-systemd-user.sh script completed" > $file
