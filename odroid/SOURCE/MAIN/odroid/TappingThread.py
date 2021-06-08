#!/usr/bin/env python3
# -*- coding: utf8 -*-

#-------------------------------------------------------------------------------------
# Main thread of the tapping mode (touch recognition thread). Due to the need to be constantly listening to the wake-up-word
# even during tapping mode, there is the need of running both threads (voice thread and tapping thread) in parallel
# for most of the system usage time. A threadLock is used in order to execute only one of the threads when needed (for
# example, the tapping thread will not run when the user enters the VUI and the microphone thread will not run when the user 
# is listening to an on-going audio in tapping mode).  

# Author: Jorge David Iranzo
#-------------------------------------------------------------------------------------

import threading
import time
from MPR121 import MPR121
from parameters import *


exitFlag = 0

class TappingThread (threading.Thread):
   """Representation of the touch recognition functioning thread"""

   def __init__(self, name, threadLock, cap, q_tap_api, position_matrix, path_matrix, api_requester):
      """Create an instance of the thread."""
      threading.Thread.__init__(self)
      self.name = name
      self.threadLock = threadLock
      self.q_tap_api = q_tap_api
      self.MPR121 = cap
      self.position_matrix = position_matrix
      self.path_matrix = path_matrix
      self.api_requester = api_requester
   def run(self):
      """Starts execution of the thread"""
      print ("Starting " + str(self.name))
      tapping_thread_main(self.threadLock, self.MPR121, self.q_tap_api, self.position_matrix, self.path_matrix, self.api_requester)
      print ("Exiting " + str(self.name))


def tapping_thread_main(threadLock, MPR121, q_tap_api, position_matrix, path_matrix, api_requester):
    """ Execution function of the thread. It basically consists on different iterating through two steps which read the tapping events.
    In one of the steps the audio is started an in the other (when tapping_mode_bool = False, the audio is stopped if tapping event 
    takes place. """

    # When False, the tapping thread will not play audio according to double or triple tapping but it will just stop audio when tapping. 
    # Besides, the voice thread will not work. This variable is False anytime the user is listening to an audio after a tapping event.
    tapping_mode_bool = True
    length = 0
        
    while True:
            
        # Now we do not have the audios ourselves so we do not know how long they are and we do not change the tapping event according to whether an audio is on or no.
        # so the tapping event always work for allowing the user to talk to the speaker and activate another audio will cancel the ongoing one
        # SHOULD WE TRY TO ACKNOWLEDGE WHEN AN AUDIO IS BEING PLAYED TO CHANGE TAPPING EVENT RESULT?
        ## no time out, so the MPR121 will wait for a tapping event forever. 
        zone, numtap = MPR121.is_tapping_one_finger_zone()
                
   
        if (TAPPING_FEEDBACK == 1):
            print('zoned tapped = ' + str(zone))
            print('numbero f taps = ' + str(numtap))
    
        if (numtap == 2 ):
            q_tap_api.put(zone)
            api_requester.post_location(zone)
            print('last zone tapped: ' , str(zone))
            
