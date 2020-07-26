var population;
var lifespan = 200;
let mag = 0.6;
var lifeP;
var count;
var target;
var rx = 100;
var ry = 150;
var rw = 400;
var rh = 10;
function setup() {
  createCanvas(600,400);
  population = new Population();
  count =0;
  lifeP = createP();
  target = createVector(width/2,50);
}



function draw() {
  background(0);
  ellipse(target.x, target.y, 16,16);
  population.run();
  lifeP.html(count);
  if(count == lifespan){
    count = -1;
    //population = new Population();
    population.evaluate();
    population.selection();
  }
  count++;
  fill(255);
  rect(rx,ry,rw,rh);
}

function DNA(gene){
  if(gene){
    this.gene = gene;
  }
  else{
    this.gene =[];
    for(var i = 0;i<lifespan;i++){
      this.gene.push(p5.Vector.random2D());
      this.gene[i].setMag(mag);
    }
  }
  
  this.crossover = function(partner){
    var newgene = [];
    var mid = floor(random(this.gene.length));
    for(var i = 0; i<this.gene.length;i++){
      if(i>mid){
        newgene[i] = this.gene[i];
      }else{
        newgene[i] = partner.gene[i];
      }
    }
    return new DNA(newgene);
  };
  
  this.mutation = function(){
    for(var i = 0; i<this.gene.length;i++){
      if(random(1) < 0.01){
        this.gene[i] = p5.Vector.random2D();
        this.gene[i].setMag(mag);
      }
    }
  };
}

function Population(){
  this.rockets=[];
  this.rocket_num = 100;
  this.matingpool = [];
  
  for(var i =0; i<this.rocket_num; i++){
    this.rockets.push(new Rocket());
  }
  
  this.evaluate = function(){
    var maxFit = 0;
    for(var i =0; i<this.rocket_num; i++){
      this.rockets[i].calculateFitness();
      if(this.rockets[i].fitness > maxFit){
        maxFit = this.rockets[i].fitness;
      }
    }    
    for(i =0; i<this.rocket_num; i++){
      this.rockets[i].fitness /= maxFit;
    }
    
    this.matingpool = [];
    
    for(i =0; i<this.rocket_num; i++){
      var n = this.rockets[i].fitness * 100;
      for (var j =0; j<n;j++){
        this.matingpool.push(this.rockets[i]);
      }
    }    
  };
  
  this.selection = function(){
    var newrocket = [];
    for (var i = 0; i<this.rockets.length;i++){
      var parentA = random(this.matingpool).dna;
      var parentB = random(this.matingpool).dna;
      var child = parentA.crossover(parentB);
      child.mutation();
      newrocket[i] = new Rocket(child);
    }
    this.rockets = newrocket;
  };
  
  this.run = function(){
    for(var i =0; i<this.rocket_num; i++){
      this.rockets[i].update();
      this.rockets[i].show();
    }
  };
}

function Rocket(dna){
  this.pos = createVector(width/2,height);
  this.vel = createVector(0,0);
  //this.vel = p5.Vector.random2D();
  this.acc = createVector(0,0);
  this.completed = false;
  this.crash = false;
  
  if(dna){
    this.dna = dna;
  }else{
    this.dna = new DNA();
  }
  this.fitness = 0;
  
  this.calculateFitness= function(){
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    //this.fitness = 1/d;
    this.fitness = map(d, 0,width, width , 0);
    if(this.completed){
      this.fitness *=10;
    }
    if(this.crash){
      this.fitness /= 10;
    }
  };
  
  
  this.applyForce = function(force){
    this.acc.add(force);
  };
  this.update = function(){
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    if(d<10){
      this.completed = true;
      this.pos = target.copy();
    }
    
    if(this.pos.x>rx && this.pos.x < rx+rw && this.pos.y >ry && this.pos.y < ry +rh){
      this.crash = true;
    }
    if(this.pos.x < 0 || this.pos.x > width || this.pos.y<0 || this.pos.y > height){
      this.crash = true;
    }
    
    this.applyForce(this.dna.gene[count]);
    if(!this.completed && !this.crash){
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.vel.limit(4);
    }
  };
  
  this.show = function(){
    push();
    noStroke();
    fill(255,125);
    translate(this.pos.x,this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    rect(0,0,20,5);
    pop();
  };
}
