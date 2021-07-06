#!/usr/bin/env python3
# -*- coding: utf8 -*-

#-------------------------------------------------------------------------------------
# Main program. Needs to be executed with python3 after having changed the parameters file as desired.
#-------------------------------------------------------------------------------------

import sys
import time
import os
import wiringpi as wpi
from parameters import *


def main():
    """Main program where all the initializations are done and the threads are created and executed. This is the script which needs to be initialized with 
    the command "python3 main.py". If this command is not called first, and is instead imported, this main function will not execute.
    It can also be called as an executable by itself thanks to the sheebang from first line. However, it is recommended to use the command
    aforemention if possible."""
    
    #wait a second so if we keep the button pressed for turning it off, it does not turn it off/on several times
    time.sleep(1)   
    
    if (DEBUG == 1):
        print('initializing button main')
    power_button = POWER_BUTTON

    #setup wiringPi for the interruption pin from MPR121
    wpi.wiringPiSetup()
    wpi.pinMode(power_button, 0)
    wpi.pullUpDnControl(power_button, 2)

    while (wpi.digitalRead(power_button) == 1):
        time.sleep(0.1)
    if (DEBUG == 1):
        print('closing button main')
    # sys.executable gives the path the the program that executed the current program is found (in this case: /usr/bin/env)
    os.execv(sys.executable, ['python3', os.path.abspath(os.path.join(os.path.dirname(__file__),'main.py'))])    


        
if __name__ == '__main__':
    """ if __name__ == '__main__' will also be true if the initial script is this one. The main() will only
    inititates if this program is the one called first with the command "python3 main.py" """
    main()

