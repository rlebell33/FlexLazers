import { Component,Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'
import { IpcRenderer, IpcMain} from 'electron';

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
  // private ipcmain: IpcMain;
  private fs = (<any>window).require('fs')

  toolModalShow = true;
  exitModalShow = true;
  drawing = false;
  windowModalShow = true;
  writingTool; 
  currentX=0;
  currentY=0;
  previousX=0;
  previousY=0;
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
    setInterval(()=>{
      this.captureEvents(canvasEl)},
      0
    )
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
    // fromEvent(canvasEl, 'mousedown')
    //   .pipe(
    //     switchMap((e) => {
    //       // after a mouse down, we'll record all mouse moves
    //       return fromEvent(canvasEl, 'mousemove')
    //         .pipe(
    //           // we'll stop (and unsubscribe) once the user releases the mouse
    //           // this will trigger a 'mouseup' event    
    //           takeUntil(fromEvent(canvasEl, 'mouseup')),
    //           // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
    //           takeUntil(fromEvent(canvasEl, 'mouseleave')),
    //           // pairwise lets us get the previous value to draw a line from
    //           // the previous point to the current point    
    //           pairwise()
    //         )
    //     })
    //   )
    //   .subscribe((res: [MouseEvent, MouseEvent]) => {
  const rect = canvasEl.getBoundingClientRect();
  this.fs.readFile('data.txt','utf8',(err,data)=>{
    var Data = data.split(' ',4)
    var deltaX = window.innerWidth/Data[2]
    var deltaY = window.innerHeight/Data[3]
    if (this.currentX==0 && this.currentY==0){
      this.currentX = Data[0]*deltaX
      this.currentY = Data[1]*deltaY
    }
    else{
      this.previousX = this.currentX
      this.previousY = this.currentY
      this.currentX = Data[0]*deltaX
      this.currentY = Data[1]*deltaY
    }
    const prevPos = {
      x: this.previousX - rect.left,
      y: this.previousY - rect.top
    };

    const currentPos = {
      x: this.currentX - rect.left,
      y: this.currentY - rect.top
    };
    // this method we'll implement soon to do the actual drawing
    if(this.drawing){
      this.drawOnCanvas(prevPos, currentPos);
    }
    
  })
      // });
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
