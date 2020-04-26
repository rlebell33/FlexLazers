import { Component,Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'
import { IpcRenderer, IpcMain} from 'electron';
import { readFileSync } from 'fs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'FlexLaserz-app';
  @ViewChild('canvas') public canvas: ElementRef;

  private cx: CanvasRenderingContext2D;
  private ipcrenderer: IpcRenderer;
  private ipcmain: IpcMain;

  toolModalShow = true;
  exitModalShow = true;
  windowModalShow = true;
  writingTool; 
  background='#00000000'

  tools =[{
    "name": "Pen",
    "lineWidth": 3,
    "lineCap": "round",
    "strokeStyle": "#000"
  },{
    "name": "Highlighter",
    "lineWidth": 30,
    "lineCap": "round",
    "strokeStyle": "rgba(255,255,0,0.05)"
  }]

  colors = [{
    "name": "Red",
    "strokeStyle": "#ff0000",
  },{
    "name": "Orange",
    "strokeStyle": "#ffa500"
  },{
    "name": "Yellow",
    "strokeStyle": "#ffff00"
  },{
    "name": "Green",
    "strokeStyle": "#008000"
  },{
    "name": "Blue",
    "strokeStyle": "#0000ff"
  },{
    "name": "Purple",
    "strokeStyle": "#800080"
  },{
    "name": "Black",
    "strokeStyle": "#000000"
  },{
    "name": "White",
    "strokeStyle": "#ffffff"
  }]

  windows =[{
    "name": "Chalk Board",
    "background": "#000000ff"
  },{
    "name": "Static",
    "background": '#00000000'
  }]

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');
    canvasEl.width = window.innerWidth;
    canvasEl.height = window.innerHeight;

    this.writingTool='Pen'
    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';

    this.captureEvents(canvasEl);
  }

  constructor(){
    if ((<any>window).require) {
      try {
        this.ipcrenderer = (<any>window).require('electron').ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  }

  selectedTool(tool){
    this.writingTool = tool.name
    this.cx.lineWidth = tool.lineWidth
    this.cx.lineCap = tool.lineCap
    this.cx.strokeStyle = tool.strokeStyle
    this.ipcrenderer.send('toolModal',tool.name)
  }

  selectedColor(color){
    if(this.writingTool=='Pen'){
      this.cx.strokeStyle = color.strokeStyle
    }
    else if (this.writingTool == 'Highlighter'){
      this.cx.strokeStyle = color.strokeStyle.concat('30')
    }
    this.ipcrenderer.send('toolModal',color.name)
  }

  windowStyle(windowStyle){
    this.background=windowStyle
    if (this.cx.strokeStyle = '#000000' || '#00000030') {
      if (this.writingTool == 'Pen') {
        this.cx.strokeStyle = this.colors[7].strokeStyle
      }
      else {
        this.cx.strokeStyle = this.colors[7].strokeStyle.concat('30')
      }
    }
  }
  
  screenCap(){
    this.ipcrenderer.send("screenCap");
  }

  exit(){
    this.ipcrenderer.send('exit');
  }

  clearScreen(){
    this.cx.clearRect(0,0,window.innerWidth,window.innerHeight)
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              // we'll stop (and unsubscribe) once the user releases the mouse
              // this will trigger a 'mouseup' event    
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              // pairwise lets us get the previous value to draw a line from
              // the previous point to the current point    
              pairwise()
            )
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();
        // python output
        const FILE = readFileSync(__dirname+'/data.txt','utf-8')
        // console.log('Hello'+FILE)
        console.log(__dirname+'/data.txt')
        const prevPos = {
          x: res[0].clientX - rect.left,  //x: res[0].clientX - python.x,
          y: res[0].clientY - rect.top
        };
  
        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };
        
        // console.log(prevPos)
        // console.log(currentPos)
        // this method we'll implement soon to do the actual drawing
        this.drawOnCanvas(prevPos, currentPos);
      });
  }

  private drawOnCanvas(prevPos: { x: number, y: number }, currentPos: { x: number, y: number }) {
    if (!this.cx) { return; }

    this.cx.beginPath();

    if (prevPos) {
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      this.cx.lineTo(currentPos.x, currentPos.y);
      this.cx.stroke();
    }
  }
}
