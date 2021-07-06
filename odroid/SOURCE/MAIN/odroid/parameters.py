#!/usr/bin/env python3
# -*- coding: utf8 -*-

#-------------------------------------------------------------------------------------
# All parameters which the user might want to change for the system are defined here.
# They are all defined in capital letters, which represents that they 
# are constant parameters during execution time and help differentiate them while reading the code. 
#-------------------------------------------------------------------------------------
# [START Set_Prameters]

# variables which define the amount of console output from the program. DEBUG variable defines general information which can help debugging the system.
# VOICE_FEEDBACK is used for activating of deactivating the real-time feedback related to the words google voice API is listening to. It can also be
# useful for debugging. Similarly, TAPPING_FEEDBACK is used to activate feedback related to the tapping recognition. 

import os

#back end parameters
URL = 'http://3.15.44.91'
PORT = '3000'
END_POINT_LOCATION = '/current_location'

#dimension of the map-matrix, needs to be changed for each map. With this a matrix NxMx3 will be defined.  
FILES = 2
COLUMNS = 5

#definition of the Matrixes (needs to be defined for each map)
####################################################################
LOCATION_TYPE_MATRIX = [["Office,Luis Cavazos", "Men Bathroom, Null", "Null,Null", "Women Bathroom, Null", "Office,Jorge Iranzo"], 
                  ["Corridor, Null","Corridor, Null", "Hall, Null", "Corridor, Null", "Corridor, Null"]]
                  
PATH_TYPE_MATRIX = [[0, 0, 0, 0, 0, 1, 0, 0, 0, 0], 
                    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0], 
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
                    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0], 
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
                    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0], 
                    [0, 1, 0, 0, 0, 1, 0, 1, 0, 0], 
                    [0, 0, 0, 0, 0, 0, 1, 0, 1, 0], 
                    [0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0]]              


#Parameters to define which debug messages to activate
DEBUG = 1
TAPPING_FEEDBACK = 1
VOICE_FEEDBACK = 1

#I2C bus from Odroid to use for commuicating with the MPR121. The I2C_BUS 1 seems to have some errors according to forums and experience so by default the 5 will be used. 
#To check whether the MPR121 is being detected connect it to the bus and run: "sudo i2cdetect -y 5"
I2C_BUS = 1

# Menu setable Default values
DEFAULT_PAINT = 2                    # 0: starry night, 1: cezanne's still life, 2: Bird
DEFAULT_INITIAL_AUDIO_MODE = 0       # 0: no audio, 1: instructions and general info about the painting (long), 2: only instructions
DEFAULT_EFFECT_MODE = 0              # 0: off, 1: on
DEFAULT_LANGUAGE = 'ko-KR'           # 'ko-KR': Korean, 'en-US': English, 'es-ES': Spanish

# Audio recording parameters
RATE = 16000
CHUNK = int(RATE / 10)  # 100ms

# WiringPi Interrput Pin
INTERRUPT_PIN = 7 # GPIO 7 in wiringPI library but pin 7(GPIO#18) in Shifter Shield
POWER_BUTTON = 23 # gpio_23 en wiringPi library but pin 33 (GPIO#31) in Shifter Shield

# UART parameters
SERIAL_DEV = "/dev/ttySAC0"  #Odroid shifter shield pins 10 (Rx) and 8 (Tx) and 12 (CTS)
BAUDS = 115200 

# Name of the input and output devices
# For finding out the name of your device, plug it in and do: 

#     for input device: $ pacmd list-sources | grep -e 'index:' -e device.string -e 'name:'
#     for output device: $ pacmd "set-default-source alsa_output.pci-0000_04_01.0.analog-stereo.monitor"

# A list with all the input and output devices and their string name will appear. 
#
# If the microphone is listed when doing "$ lsusb" and "arecord -l", but not in the output devices of pulse audio run the bash script "recognizing_mic.sh". (TO DO)
#input and output device for old microphone and the sound card with earphones:
#INPUT_DEVICE = "alsa_input.usb-0c76_USB_Audio_Device-00.analog-mono"
#OUTPUT_DEVICE = "alsa_output.usb-C-Media_Electronics_Inc._USB_PnP_Sound_Device-00.analog-stereo"
#input and output device for our Logitech Headset
#INPUT_DEVICE = "alsa_input.usb-Logitech_Logitech_USB_Headset-00.analog-mono"
#OUTPUT_DEVICE= "alsa_output.usb-Logitech_Logitech_USB_Headset-00.analog-stereo"
OUTPUT_DEVICE = "alsa_output.usb-C-Media_Electronics_Inc._USB_PnP_Sound_Device-00.analog-stereo"
# Output device volume level (50 ==> 50% of level. Max is 100, min is 0)
OUTPUT_VOLUME = 50

# MPR121 parameters. Defines the intervals which are consider acceptable for a fast and slow tapping,
# and the threshold of the touch sensor. 
SLOWEST_TAPPING_INTERVAL = 0.4
FASTEST_TAPPING_INTERVAL = 0.1
MPR121_TOUCH_THRESHOLD = 40
MPR121_RELEASE_THRESHOLD = 20

# Path of the main audio folder root. 
# Uncomment next line for writing the absolute path by yourself
# AUDIOS_PATH = "/home/odroid/art_project_global/art_project_global/"
# Uncomment next line for using relative path (read README_PROJECT_FOLDER file for info on how the folder tree needs to be arranged)
AUDIOS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__),"../../../AUDIOS"))

# [END Set_Parameters]
