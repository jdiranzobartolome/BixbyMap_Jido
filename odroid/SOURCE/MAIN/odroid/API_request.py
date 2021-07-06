#!/usr/bin/env python3
# -*- coding: utf8 -*-

# [START import_libraries]
import os
import subprocess
import time
from parameters import *
import requests
from requests.exceptions import HTTPError
# [END import_libraries]

class API_request:
    """ mp3 sound player class"""

    def __init__(self, url, port, end_point_location):
        """ initialization of the sound server. The sound server used is the standard linux sound server: pulseaudio."""    
        self.url = url
        self.port = port
        self.end_point_location = end_point_location
        
    # change this so we can send any number of parameters in a dictionary with the string name and the value
    def post_location(self, location):
        for url in [str(self.url) + ':' + str(self.port) + str(self.end_point_location)]:
            try:
                response = requests.post(url, json={'zone':str(location)})
                # If the response was successful, no Exception will be raised
                response.raise_for_status()
                
                json_response = response.json()
                print(json_response['message'] + ': ' + json_response['location'])

            except HTTPError as http_err:
                print(f'HTTP error occurred: {http_err}')  # Python 3.6
                return 1
            except Exception as err:
                print(f'Other error occurred: {err}')  # Python 3.6
                return 1
            else:
                print('Success!')
                return 0
                
