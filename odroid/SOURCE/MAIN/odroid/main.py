#!/usr/bin/env python3
# -*- coding: utf8 -*-

#-------------------------------------------------------------------------------------
# Main program. Needs to be executed with python3 after having changed the parameters file as desired.
#
# Author: Jorge David Iranzo
#-------------------------------------------------------------------------------------

import sys
import time
import os
import queue
import threading
from TappingThread import TappingThread
from ControlThread import ControlThread
from API_request import API_request 
from parameters import *
from MPR121 import MPR121
import wiringpi as wpi
import numpy as np


def main():
    """Main program where all the initializations are done and the threads are created and executed. This is the script which needs to be initialized with 
    the command "python3 main.py". If this command is not called first, and is instead imported, this main function will not execute.
    It can also be called as an executable by itself thanks to the sheebang from first line. However, it is recommended to use the command
    aforemention if possible."""
    
    if (DEBUG == 1):
        print('initializing main program')

    ##set up: this first variables were originally selected in a menu by the user. Now all the variables need to be changed from the parameters.py file##
    paint_mode = DEFAULT_PAINT
    init_audio_mode = DEFAULT_INITIAL_AUDIO_MODE
    effects_mode = DEFAULT_EFFECT_MODE
    language_code = DEFAULT_LANGUAGE
    interrupt_pin = INTERRUPT_PIN
    power_button = POWER_BUTTON
    location_type_matrix = LOCATION_TYPE_MATRIX
    path_type_matrix = PATH_TYPE_MATRIX
    url = URL
    port = PORT
    end_point_location = END_POINT_LOCATION
    
    ## define the matrixes for the map
    type_matrix = np.array(location_type_matrix, dtype = object)
    path_matrix = np.array(path_type_matrix)
    position_matrix = np.zeros((FILES,COLUMNS))
    
    #setup de API-requester
    api_requester = API_request(url, port, end_point_location)
    #poner aqui un codigo que mande algo al server para comprobar que esta vivo

    #setup wiringPi for the interruption pin from MPR121
    wpi.wiringPiSetup()
    wpi.pinMode(interrupt_pin, 0)
    wpi.pinMode(power_button, 0)
    wpi.pullUpDnControl(power_button, 2) 

    # Create MPR121 instance.
    cap = MPR121()

    # Initialize communication with MPR121 using default I2C bus of device, and
    # default I2C address (0x5A). 
    if not cap.begin(wpi, interrupt_pin):
        print('Error initializing MPR121.  Check your wiring!') 
        sys.exit(1)
    
    # wait for user hand to be placed in the artwork for starting the main audio of the program
    while (not cap.touch_status_changed()):
        time.sleep(0.1)
        if (wpi.digitalRead(power_button) == 0):
            if (DEBUG == 1):
                print('closing main program')
            # sys.executable gives the path the the program that executed the current program is found (in this case: /usr/bin/env)
            os.execv(sys.executable, ['python3', os.path.abspath(os.path.join(os.path.dirname(__file__),'button_main.py'))])
    

    # Create new threads and shareable threadLock. In this case we will only use one thread (tapping thread which will also send the requests)
    # NOTA: CONSIDER USING A THREAD FOR TAPPING AND OTHER ONE OF REQUESTS, MAYBE ITS BETTER.
    q_tap_api = queue.Queue()
    q_control = queue.Queue()   
    threads = []
    threadLock = threading.Lock()
    tapping_thread = TappingThread("tapping-thread",threadLock, cap, q_tap_api, position_matrix, path_matrix, api_requester)
    control_thread = ControlThread("control-thread", q_control, q_tap_api, type_matrix, path_matrix)
    #threads.append(control_thread)
    threads.append(tapping_thread)

    # Start new Threads
    tapping_thread.start()
    # Since we have the bixby server in AWS we dont need this probably. In case we need it I just comment this line. 
    #control_thread.start()

    # check for threads termination every 100 ms while the main thread is also running (and checking for the keyboard interrupt (CTL+C).
    # Therefore, once the threads have started running, the program can be stopped by clicking CTL+C. 
    try:
        while (wpi.digitalRead(power_button) == 1):
            time.sleep(0.2)
            if not (q_control.empty()):
                paint_mode = q_control.get()
                api_requester.post_paint(paint_mode)
                
        mp3player.stop()
        if (DEBUG == 1):
            print('closing main program')
        # sys.executable gives the path the the program that executed the current program is found (in this case: /usr/bin/env)
        os.execv(sys.executable, ['python3', os.path.abspath(os.path.join(os.path.dirname(__file__),'button_main.py'))])


    except KeyboardInterrupt:
        # kill whole program
        #os.system('kill %d' % os.getpid())
        sys.exit()

        
if __name__ == '__main__':
    """ if __name__ == '__main__' will also be true if the initial script is this one. The main() will only
    inititates if this program is the one called first with the command "python3 main.py" """
    main()

