
let coords = [];
let graph;
let expression;
let mode = "left"
let inf = false
const math = window.math


function setup() {
  frameRate(10)
  createCanvas(900, 800);
  graph = new Graph();
  graph.calibrateSkipX();
  graph.calibrateScaleX();
  graph.fillRange();
  graph.calibrateSkipY();
  graph.calibrateScaleY();
  graph.drawGraph();
  graph.executeFunction();
}

function draw() {
  background(256);
  graph.drawGraph();
  graph.drawFunction();
  graph.setArea();
  if(inf){
    if(parseInt(document.getElementById('n').value) == 999){
      inf = !inf
    }
    document.getElementById('n').value = parseInt(document.getElementById('n').value)+1
    myScript();
  }
  switch(mode){
    case "left":
      graph.leftRiemann();
      break;
    case "right":
      graph.rightRiemann();
      break;
    case "mid":
      graph.midRiemann();
      break;
    default:
      graph.trapRiemann();
  }
  //testing feature
  //text(mouseX+ ' , '+mouseY, mouseX, mouseY);
}
let toInfinity = () => {
  inf = !inf
}
let myScript = () => {
  coords = [];
  graph.range = [];
  expression = document.getElementById('function').value;
  graph.leftBoundary = parseFloat(document.getElementById('lb').value); graph.rightBoundary = parseFloat(document.getElementById('rb').value);
  graph.n = parseInt(document.getElementById('n').value);
  for(let i=0;i<4;i++){
    if(document.getElementsByName("mode")[i].checked){ mode=document.getElementsByName("mode")[i].value; break;}
  }
  
  graph.rectWidth = (graph.rightBoundary-graph.leftBoundary)/graph.n;
  graph.calibrateSkipX();
  graph.calibrateScaleX();
  graph.fillRange();
  graph.calibrateSkipY();
  graph.calibrateScaleY();
  graph.drawGraph();
  graph.executeFunction();
  
}


function Graph() {

  this.xAxisPos;
  expression = document.getElementById('function').value;
  this.range = [];
  this.leftBoundary = -10;
  this.rightBoundary = 10;
  this.n = 10;
  this.rectWidth = (this.rightBoundary-this.leftBoundary)/this.n;
  
  
  // scale is the ratio of pixels to units in the function
  this.scale = createVector(64, 64);
  // refers to the intervals for the labels on the x and y axis
  this.skip = createVector(1, 1);

  this.drawGraph = () => {
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
      textAlign(RIGHT);
      if(math.abs(this.rMin()) > math.abs(this.rMax())){
      currY = i*this.skip.y+this.rMin()
      text(currY.toFixed(1),175, 720- i * 64)
      if(currY == 0){
        //Meant to accentuate X axis
        strokeWeight(3);
        line(180, 720- i * 64, 820, 720- i * 64);
        strokeWeight(1)
        
        text('x-axis',825, 720- i * 64)
  
        this.xAxisPos = 720- i * 64;
      }
    }else{
      currY = this.rMax()-i*this.skip.y
      text(currY.toFixed(1),175, 80+ i * 64)
      if(currY == 0){
        //Meant to accentuate X axis
        strokeWeight(3);
        line(180, 80+ i * 64, 820, 80+ i * 64);
        strokeWeight(1)
        
        text('x-axis',825, 80+ i * 64)
        this.xAxisPos = 80+ i * 64;
    }
    }
    
    // draw the label lines on the x
    textAlign(CENTER);
    strokeWeight(1)
    for (let i = 0; i <= 10; i++) {
      //short lines that create axis labels
      line(i * 64 + 180, 725, i * 64 + 180, 715);
      //long lines that create grid
      line(i * 64 + 180, 725, i * 64 + 180, 80);
      text((this.leftBoundary+ i * this.skip.x).toFixed(1), i * 64 + 180, 745);
    }

  }
    
  };


  //draws a bunch of small lines jumping by 1 pixel which generate the function
  //This is why functions which are non-continuous look wonky, especially those with a jump discontinuity or a
  this.drawFunction = () => {
    strokeWeight(2)
    fill(0);
    for(let i = 0; i<coords.length-1;i++){
      line(coords[i].x, coords[i].y,coords[i+1].x, coords[i+1].y);
      
    }
  }


  this.leftRiemann = () => {
    fill(40, 40, 40, 150);
    for(let i = 0; i< this.n; i++){
      rect(180+i*this.rectWidth*this.scale.x,
        this.determineY(i),
        this.rectWidth * this.scale.x,
        math.abs(evaluateAt(this.leftBoundary+(i)*this.rectWidth)) * this.scale.y
        )
    
    };
    };
  this.rightRiemann = () => {
    fill(40, 40, 40, 150);
    for(let i = 0; i< this.n; i++){
      rect(180+i*this.rectWidth*this.scale.x,
      this.determineY(i+1),
      this.rectWidth * this.scale.x,
      math.abs(evaluateAt(this.leftBoundary+(i+1)*this.rectWidth)) * this.scale.y
      )
    };
    };
  this.midRiemann = () => {
    fill(40,40,40,150);
    for(let i = 0; i< this.n; i++){
      rect(180+i*this.rectWidth*this.scale.x,
        this.determineY(i+0.5),
        this.rectWidth * this.scale.x,
        math.abs(evaluateAt(this.leftBoundary+(i+0.5)*this.rectWidth)) * this.scale.y)
  }
  };
//creates the trapezoids using p5js quad method and drawing the points in counter clockwise order
//trapezoidal rule is wonky when the shape has heights that are not in the same direction
  this.trapRiemann = () => {
    fill(40,40,40,150);
    for(let i = 0;i<this.n;i++){
      quad(180+i*this.rectWidth*this.scale.x, this.determineY(i),
      180+i*this.rectWidth*this.scale.x, this.determineNotY(i),
      180+(i+1)*this.rectWidth*this.scale.x, this.determineNotY(i+1),
      180+(i+1)*this.rectWidth*this.scale.x, this.determineY(i+1))
    }
  }

  this.executeFunction = () => {
      //replaces the x in this.function and evaluates it then assigns the result to y which is pushed to coords
      //coords are an array of vectors x,y which have the final positions at which the lines are to be drawn
      
      for(let i = 0; i<=640; i++){
        coords.push(createVector(180 + i, this.xAxisPos - this.scale.y * evaluateAt(this.leftBoundary+ i/this.scale.x)));
      }
  }

  this.calibrateSkipX = () =>{
      this.skip.x = (this.rightBoundary-this.leftBoundary)/10;
      
  }
  this.calibrateSkipY = () =>{
    bigger = max([math.abs(this.rMax()), math.abs(this.rMin())])

    this.skip.y = bigger/5;
}

  this.calibrateScaleX = () => {
      this.scale.x = 64/this.skip.x;

  }
  this.calibrateScaleY = () =>{

    this.scale.y = 64/this.skip.y;
}
  
  this.fillRange = () => {
    
      for(let i = 0; i < 641; i++){
        this.range.push(evaluateAt(this.leftBoundary + i/this.scale.x));
      }

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
    maximum = max([0, evaluateAt(this.leftBoundary+i*this.rectWidth)]);
    return 400-maximum*this.scale.y;
  }
  // this function returns the y value that determineY() does not
  this.determineNotY = (i) => {
    minimum = min([0, evaluateAt(this.leftBoundary+i*this.rectWidth)]);
    return 400-minimum*this.scale.y;
  }
  this.rMax = () => {
    maximum = max(this.range)
    if(maximum < 0){
      return 0;
    }
    return maximum;
  }
  this.rMin = () => {
    minimum = min(this.range)
    if(minimum > 0){
      return 0;
    }
    return minimum;
  }

  this.setArea = () => {
    label = document.getElementById('area')
    sum = 0;
    switch(mode){
      case "left":
        for(let i = 0; i<this.n; i++){
          sum+=this.rectWidth*evaluateAt(this.leftBoundary+(i)*this.rectWidth)
        } 
        break;
      case "right":
        for(let i = 0; i<this.n; i++){
          sum+=this.rectWidth*evaluateAt(this.leftBoundary+(i+1)*this.rectWidth)
        } 
        break;
      case "mid":
        for(let i = 0; i<this.n; i++){
          sum+=this.rectWidth*evaluateAt(this.leftBoundary+(i+0.5)*this.rectWidth)
        } 
        break;
      default:
        for(let i = 0; i<this.n; i++){
          sum+=this.rectWidth*(evaluateAt(this.leftBoundary+(i)*this.rectWidth)+evaluateAt(this.leftBoundary+(i+1)*this.rectWidth))/2
        } 
    }
    label.innerHTML = "Approximate Area: " + sum;
  }
}
