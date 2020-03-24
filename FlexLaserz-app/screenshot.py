import pyautogui
from datetime import datetime
import os.path

def screenshot():
    time = datetime.now().strftime("(%Y-%m-%d)%H-%M-%S")
    fileName = 'Flexlaserz'+time+'.png'
    screenshot = pyautogui.screenshot()
    dir_path = os.path.dirname(os.path.realpath(__file__))+'/screenshots/'+fileName
    screenshot.save(dir_path)
    
screenshot()
