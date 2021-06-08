
#!/bin/bash

#NOTE: Install by doing "sudo ./install.sh"

# ------------------- TO DO ------------------------------------------------------
#-- Remember to change the ownership of the /dev/i2c-1 and the /dev/gpiomem files and creating the group gpio and making the file 
#   gpiomem and i2c-1 owned by root and the group gpio and i2c (respectively) and adding odroid user to both grpups
#   and then doing the chmod 666 /dev/i2c-1 (y con gpiomem).  (TO DO)

## - Create the service file for starting in unit (see steps. add service file and user and group things)

##- Remember to make Odroid not need password for sudo adding in a sudoers.d/ file "Odroid ALL=(ALL) NOPASSWD: ALL" and saving it 
##  and setting its sudo chmod 0440 "file"

## Add options to be able to install everything without upgrading (TO DO)
# ------------------- TO DO ------------------------------------------------------

# updating and upgrading the system
sudo apt-get update
sudo apt-get upgrade

# checking whether python3 is installed and installing it if not.
command -v python3 >/dev/null 2>&1 || sudo apt-get install -y python3

# checking whether pip3 is installed and installing it if not.
command -v pip3 >/dev/null 2>&1 || sudo apt-get install -y python3-pipy


# installing i2c dependencies.
command -v python-smbus >/dev/null 2>&1 || sudo apt-get install -y python-smbus
command -v i2c-tools >/dev/null 2>&1 || sudo apt-get install -y i2c-tools

# installing MPG321 for playing audio and the mp3info program for knowing audios length
command -v mpg321 >/dev/null 2>&1 || sudo apt-get install mpg321
command -v mp3info >/dev/null 2>&1 || sudo apt-get install mp3info

##For doing this sudo -H is needed#######
# installing Adafruit_GPIO for python3 maybe not necessary because I do it later too.
#pip3 install --user Adafruit_GPIO

#Not sure these two are needed
#pip3 install RPI.GPIO
#pip3 install adafruit-blinka

# installation of Google Speech API 
pip3 install --upgrade google-cloud-storage
pip3 install google-cloud-speech

# installation of flask-restful
pip3 install fasl-restful

# instalation of pyserial
pip3 install pyserial
#############################################################

# installing pyaudio and libasound
apt-get install libasound-dev
apt-get install python-pyaudio python3-pyaudio
############################################

#installing 

#install the wiringPi python wrapper for Odroid
sudo apt-get install git python-dev python-setuptools python3-dev python3-setuptools swig
git clone --recursive https://github.com/hardkernel/WiringPi2-Python
cd WiringPi2-Python
python3 setup.py install

#installing Adafruit_python
sudo apt-get install build-essential python3-pip python3-dev python3-smbus git
#si da errores o no funciona instala tambien los de python sin el numero 3, just in case
git clone https://github.com/adafruit/Adafruit_Python_GPIO.git
cd Adafruit_Python_GPIO
python3 setup.py install

#installing Adafruit_PureIO module (sometimes if this is not done, the module is not found even 
#though if it was installed in the last step)
git clone https://github.com/adafruit/Adafruit_Python_PureIO.git
cd Adafruit_Python_PureIO
python3 setup.py install

##If Adafruit still do not work



#add permissions for i2c and gpiomem
addgroup gpio
adduser odroid i2c
adduser odroid gpio
touch /etc/udev/rules.d/90-gpiomem.rules 
tee -a /etc/udev/rules.d/90-gpiomem.rules << 'EOF'
SUBSYSTEM=="exynos-gpiomem", GROUP="gpio", MODE="0660"
EOF





  
