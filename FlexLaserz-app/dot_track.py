
#######################################
#Name: FlexLazers
#Time Period: Sprint 1
#By: Marcus Garner
#######################################
#Things Needed: Python 2.7 / OpenCV 4.2.0 (IF USED) / SimpleCV Version 1.3 Superpack / Python Pillow / PIP
#Make sure pyhton 2.7 is set to PATH in windows

import SimpleCV
#import pygame as pg
import sys
#import numpy as np
#import cv2

display = SimpleCV.Display()

#0 For built in Camera | 1 For USB Camera
cam = SimpleCV.Camera()

normaldisplay = True

######################################################################################################################################

#O = Nomral mode | 1 = Segmented Mode | 2 = Color Distance Mode
dispmode = 0

#RGB settings (currently tunned to best find RED on a PROJECTOR SCREEN)(NOT OTHER SURFACES)
r = 0
g = 200
bx = 150

# Set printDelay to X number of loops that should run between prints
printCounter = 0
printDelay = 0

# original values
#r = 0
#g = 200
#bx = 150

#Max and min area of squares found
area_upperbound = 130
area_lowerbound = 60

#Tolerance for isSquare (The higher the tolerance the more squares are detected (tested 0.5, 0.9, 1, and 5)
d = 0.5

######################################################################################################################################

#Keyboard binds to fine tune RGB and Tolerance when running Note: settings chnaged live are not saved.
while display.isNotDone():

        if display.mouseRight:

                dispmode = (dispmode + 1) % 3
                #print dispmode

        # pressed = pg.key.get_pressed()
        # if pressed[pg.K_q]:
        #     r += 1
        #     print r, g, bx
        # if pressed[pg.K_w]:
        #     r -= 1
        #     print r, g, bx
        # if pressed[pg.K_a]:
        #     g += 1
        #     print r, g, bx
        # if pressed[pg.K_s]:
        #     g -= 1
        #     print r, g, bx
        # if pressed[pg.K_z]:
        #     bx += 1
        #     print r, g, bx
        # if pressed[pg.K_x]:
        #     bx -= 1
        #     print r, g, bx
        # if pressed[pg.K_d]:
        #     d += 0.01
        #     print d
        # if pressed[pg.K_f]:
        #     d -= 0.01
        #     print d
                
######################################################################################################################################
            
        #Use this if using built in webcam
        img = cam.getImage().flipHorizontal()

        #Use this if using USB webcam
        #img = cam.getImage()

        #Could also try img.hueDistance. Uses HSV. Maybe better for diffrent lighting conditions of classrooms on muiltiple surfaces. 
        dist = img.colorDistance((r,g,bx)).dilate(2)

        #Strecth Filter for Segmented Mode 
        segmented = dist.stretch(200,255)
        
        blobs = segmented.findBlobs()
        
#######################################################################################################################################
        
        if blobs:
                #filters out squares that do not have the proper area 
                squares = blobs.filter([b.isSquare(d) and b.area() < area_upperbound and b.area() > area_lowerbound for b in blobs])

                #Debug: Prints area of the circles for the found sqaure objects
                for squ in squares:
                        
                        #print 'squre'+squ.area()
                        #print(pg.MOUSEBUTTONDOWN)
                        #print(pg.mouse.get_pos(img.drawCircle((squ.x, squ.y), squ.radius(),SimpleCV.Color.GREEN,3)))
                        
                        
                        img.drawCircle((squ.x, squ.y), squ.radius(),SimpleCV.Color.GREEN,3)
                        #print("squares: "+str(squ.x),str(squ.y))
                        #print(printCounter)
                        
                        # should we print this frame?
                        if(printCounter >= printDelay):
                                sys.stdout = open("data.txt", "w")
                                print squ.x,squ.y, display.resolution[0], display.resolution[1]
                        #print squ.x,squ.y
                        
                # reset print counter if just printed
                if(printCounter >= printDelay):
                    printCounter = 0
                    
                # increment print counter
                printCounter += 1
                        
########################################################################################################################################
        if dispmode == 0:

                img.show()
                
        elif dispmode == 1:
                
                segmented.show()
                
        else:
                
                dist.show()
