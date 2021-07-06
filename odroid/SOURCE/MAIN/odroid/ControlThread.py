#!/usr/bin/env python3
# -*- coding: utf8 -*-

#-------------------------------------------------------------------------------------
# Main thread of the tapping mode (touch recognition thread). Due to the need to be constantly listening to the wake-up-word
# even during tapping mode, there is the need of running both threads (voice thread and tapping thread) in parallel
# for most of the system usage time. A threadLock is used in order to execute only one of the threads when needed (for
# example, the tapping thread will not run when the user enters the VUI and the microphone thread will not run when the user 
# is listening to an on-going audio in tapping mode).  
#-------------------------------------------------------------------------------------

from flask import Flask
from flask_restful import Api, Resource, reqparse
import threading
import time
import os
from parameters import *

exitFlag = 0

class ControlThread (threading.Thread):
   """Representation of the Restful API control function thread"""

   def __init__(self, name, q_control, q_tap_api, type_matrix, path_matrix):
      """Create an instance of the thread."""
      threading.Thread.__init__(self)
      self.name = name
      self.q_control = q_control
      self.q_tap_api = q_tap_api
      self.type_matrix = type_matrix
      self.path_matrix = path_matrix
      
   def run(self):
      """Starts execution of the thread"""
      print ("Starting " + str(self.name))
      control_thread_main( self.q_control, self.q_tap_api, self.type_matrix, self.path_matrix)
      print ("Exiting " + str(self.name))


def control_thread_main(q_control, q_tap_api, type_matrix, path_matrix):
    """ Ex"""
    # I like defining this kind of things in main (even if I have to send them to the thread class afterwards
    # but since the API is not always on and I need to use (if API=0n)... I will try to polute the original code as little as possible
    app = Flask(__name__)  
    api = Api(app)
    print("configurando API")

    #I create the only resource and the only instance possible. Every value received will be automatically sent to the neighbour threads, so 
    #no need for database nor anything like that. 
    location = {"location_type": "", "location_owner": "" }
    
    class Location(Resource):
        
        # there is no option for 404 error, there is only an instance, it will always be found
        def get(self):
            location["location_type"] = ""
            location["location_owner"] = ""
            if (q_tap_api.empty()):
                position_index = -1
            else:
              while not (q_tap_api.empty()):
                position_index = q_tap_api.get()
                if (position_index != -1):
                    print(type_matrix)
                    print(position_index)
                    data = type_matrix[0, position_index].split(",")
                    if (len(data) == 1): 
                        location["location_type"] = data[0]
                    elif (len(data) == 2):
                        location["location_type"] = data[0]
                        location["location_owner"] = data[1]
            return location, 200
        
        #a "default" gives the default values of that parameter
        def put(self): 
            parser = reqparse.RequestParser()
            parser.add_argument("piece")
            args = parser.parse_args()
            print(args)
                
            return configuration, 200
            
    api.add_resource(Location, "/location_concept")
    print(" iniciando API")
    #listen in 0.0.0.0 (all interfaces) and in a port highet than 2014 (non-high priviledged ports, so sudo is not needed to listen on those)
    app.run(host= '0.0.0.0', port="80", debug=False)        
    #Only use the version with debug=True when there are errors and never in production setting
    #app.run(host= '0.0.0.0', port="5000", debug=True, use_reloader = False)
 
