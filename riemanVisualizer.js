
let coords = [];
let graph;

const math = window.math


function setup() {
  createCanvas(900, 800);
  graph = new Graph();
  graph.calibrateSkipX();
  graph.calibrateScaleX();
  graph.fillRange();
  graph.fillDomain();
  graph.calibrateSkipY();
  graph.calibrateScaleY();
  graph.drawGraph();
  graph.executeFunction();
}

function draw() {
  background(256);
  graph.drawGraph();
  graph.drawFunction();
  //graph.leftRiemann();
  graph.rightRiemann();

  text(mouseX+ ' , '+mouseY, mouseX, mouseY);
}

function Graph() {

  this.xAxisPos;
  this.yAxisPos;
  let expression = "x";
  this.x = 0;
  this.y = 0;
  this.domain = [];
  this.range = [];
  this.leftBoundary = -9;
  this.rightBoundary = 10;
  this.n = 9;
  this.rectWidth = (this.rightBoundary-this.leftBoundary)/this.n;
  
  this.dMin = () => {
    if(this.leftBoundary < 0){
      return this.leftBoundary;
    }
    return 0;
  }
  
  this.dMax = () => {
    if(this.rightBoundary > 0){
      return this.rightBoundary;
    }
    return 0;
  }
  this.lbY = evaluateAt(this.leftBoundary);
  this.rbY = evaluateAt(this.rightBoundary);

  
  this.deltaX = (this.dMax() - this.dMin())/(this.n);
  // scale is the ratio of pixels to units in the function
  this.scale = createVector(64, 64);
  // refers to the intervals for the labels on the x and y axis
  this.skip = createVector(1, 1);

  this.drawGraph = function () {
    fill(0);
    textSize(20);
    //y axis
    strokeWeight(3);
    line(180, 80, 180, 720);
    strokeWeight(1);
    text('y-axis', 180, 40);
    
    
    fill(0);
    textAlign(RIGHT);
    // draw the label lines on the y
 
    for (let i = 0; i <= 10; i++) {
      //short lines that create axis labels
      line(175, i * 64+80, 185, i * 64+80);
      //long lines that create grid
      line(175, i * 64+80, 820, i * 64+80);
      //Currently on:
      
      if(math.abs(this.rMin()) > math.abs(this.rMax())){
      currY = i*this.skip.y+this.rMin()
      text(currY.toFixed(2),175, 720- i * 64)
      if(currY == 0){
        //Meant to accentuate X axis
        strokeWeight(3);
        line(180, 720- i * 64, 820, 720- i * 64);
        strokeWeight(1)
        textAlign(LEFT);
        text('x-axis',825, 720- i * 64)
        textAlign(RIGHT);
        this.xAxisPos = 720- i * 64;
      }
    }else{
      currY = this.rMax()-i*this.skip.y
      text(currY.toFixed(2),175, 80+ i * 64)
      if(currY == 0){
        //Meant to accentuate X axis
        strokeWeight(3);
        line(180, 80+ i * 64, 820, 80+ i * 64);
        strokeWeight(1)
        textAlign(LEFT);
        text('x-axis',825, 80+ i * 64)
        textAlign(RIGHT);
        this.xAxisPos = 80+ i * 64;
    }
    }
    
    let linesLeft = math.ceil((this.dMin()*-1)/this.skip.x);
    // draw the label lines on the x
    textAlign(CENTER);
    for (let i = 0; i <= 10; i++) {
      //short lines that create axis labels
      line(i * 64 + 180, 725, i * 64 + 180, 715);
      //long lines that create grid
      line(i * 64 + 180, 725, i * 64 + 180, 80);
      text((this.dMin()+ i * this.skip.x).toFixed(1), i * 64 + 180, 745);
      if(this.skip.x*linesLeft-(i)*this.skip.x == 0){
        this.yAxisPos = i * 64 + 180;
      }
    }

  }
    
  };
  //draws a bunch of small lines jumping by 1 pixel which generate the function
  //NEEDS TO BE UPDATED

  this.drawFunction = function(){
    fill(0);
    for(let i = 0; i<coords.length;i++){
      try {
        line(coords[i].x, coords[i].y,coords[i+1].x, coords[i+1].y);
      } catch (TypeError) {
      }
    }
  }
  
  this.leftRiemann = () => {
    fill(40, 40, 40, 150);
    for(let i = 0; i< this.n; i++){
      rect(this.yAxisPos + this.scale.x * (this.leftBoundary+i*this.rectWidth),
        this.determineY(i),
        this.rectWidth * this.scale.x,
        this.determineHeight(i)
        )
    
    };
    }
    this.rightRiemann = () => {
      fill(40, 40, 40, 150);
      for(let i = 0; i< this.n; i++){
        rect(this.yAxisPos + this.scale.x * (this.leftBoundary+(i)*this.rectWidth),
          this.determineY(i+1),
          this.rectWidth * this.scale.x,
          this.determineHeight(i+1)
          )
      };
      }

  

  this.executeFunction = function(){
      //replaces the x in this.function and evaluates it then assigns the result to y which is pushed to coords
      //coords are an array of vectors x,y which have the final positions at which the lines are to be drawn
      
      for(let i = 0; i<640; i++){
        coords.push(createVector(180 + i, this.xAxisPos - this.scale.y * evaluateAt(this.leftBoundary+ i/this.scale.x)));
      }
  }

  this.calibrateSkipX = () =>{
      this.skip.x = (this.rightBoundary-this.leftBoundary)/10;
      //rounds up the skip in the y axis to ensure that 0 is able to be shown
      //this.skip.y = math.ceil(this.skip.y/math.pow(10, this.numDigits(this.skip.y) - 1))*math.pow(10, this.numDigits(this.skip.y) - 1);
      //this.skip.x = math.ceil(this.skip.x/math.pow(10, this.numDigits(this.skip.x) - 1))*math.pow(10, this.numDigits(this.skip.x) - 1);
      
  }
  this.calibrateSkipY = () =>{
    bigger = max([math.abs(this.rMax()), math.abs(this.rMin())])

    this.skip.y = bigger/5;
}

  this.calibrateScaleX = function(){
      this.scale.x = 64/this.skip.x;

  }
  this.calibrateScaleY = function(){

    this.scale.y = 64/this.skip.y;
}
  
  this.fillDomain = () => {
    for(let i = 0; i<= 640; i++){
      this.domain.push(this.dMin()+i/this.scale.x);
    }
  }
  this.fillRange = () => {
    
      for(let i = 0; i < 641; i++){
        this.range.push(evaluateAt(this.leftBoundary + i/this.scale.x));
      }
      console.log(this.range)
      console.log(this.rMax())
      console.log(this.rMin())
  };
  function evaluateAt(x){
    let j;
    j = math.eval(expression.replace(/x/g, `(${x})`));
    if(Number.isNaN(j)){
      return 0;
    }else if(j == Infinity){
      return 0;
    }
    return j;
  }
  this.determineY = (i) => {
    if(evaluateAt(this.leftBoundary+i*this.rectWidth) >= 0){
      return min([this.xAxisPos, (this.xAxisPos-this.scale.y*evaluateAt(this.leftBoundary+i*this.rectWidth))])
    }else{
      return max([this.xAxisPos, (this.xAxisPos-this.scale.y*evaluateAt(this.leftBoundary+i*this.rectWidth))])
    }
  }
  this.determineHeight = (i) => {
    if(evaluateAt(this.leftBoundary+i*this.rectWidth) >= 0){
      return this.xAxisPos - min([this.xAxisPos, (this.xAxisPos-this.scale.y*evaluateAt(this.leftBoundary+i*this.rectWidth))])
    }else{
      return this.xAxisPos - max([this.xAxisPos, (this.xAxisPos-this.scale.y*evaluateAt(this.leftBoundary+i*this.rectWidth))])
    }
  }
  this.rMax = function(){
    maximum = max(this.range)
    if(maximum < 0){
      return 0;
    }
    return maximum;
  }
  this.rMin = function(){
    minimum = min(this.range)
    if(minimum > 0){
      return 0;
    }
    return minimum;
  }
  this.numDigits = (x) => {
    return (Math.log10((x ^ (x >> 31)) - (x >> 31)) | 0) + 1;
  }

}
