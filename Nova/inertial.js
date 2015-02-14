/*
inertial.js
Handles any space object that moves with inertia



*/


function inertial(name) {
    object.call(this, name)
    
}

inertial.prototype = new object


inertial.prototype.updateStats = function(turning, accelerating) {
    inertial.prototype.render.call(this, turning, accelerating)

}


inertial.prototype.render = function(turning, accelerating) {
    if (this.renderReady == true) {
	
	this.turnback = false
	if (turning == 'back') {
	    var vAngle = Math.atan(this.yvelocity / this.xvelocity)
	    if (this.xvelocity < 0) {
		vAngle = vAngle + Math.PI
	    }
	    pointto = (vAngle + Math.PI) % (2*Math.PI)
	    //console.log(pointto)
	    var pointDiff = (pointto - this.pointing + 2*Math.PI) % (2*Math.PI)
	    //console.log(pointDiff)
	    if (pointDiff < Math.PI) {
		turning = "left"
	    }
	    else if(pointDiff >= Math.PI) {
		turning = "right"
	    }
	    this.turnback = true
	}
	if ((this.turnback == true) && ((turning == "left") || (turning == "right")) && (Math.min(Math.abs(Math.abs(this.pointing - pointto) - 2*Math.PI), Math.abs(this.pointing - pointto)) < (this.turnRate * (this.time - this.lastTime) / 1000))) {
	    this.pointing = pointto
	    turning = "back"
	}


	object.prototype.render.call(this, turning)


	//acceleration
	var xaccel = Math.cos(this.pointing) * this.meta.physics.acceleration
	var yaccel = Math.sin(this.pointing) * this.meta.physics.acceleration
	if (accelerating == true) {
	    if (typeof this.previousAccelTime != 'undefined') {
		//var aCoefficient = (this.meta.physics.max_speed - Math.pow(Math.pow(this.xvelocity, 2) + Math.pow(this.yvelocity, 2), .5)) / this.meta.physics.max_speed
		this.xvelocity += xaccel * (this.time - this.previousAccelTime)/1000
		this.yvelocity += yaccel * (this.time - this.previousAccelTime)/1000
		if (Math.pow(Math.pow(this.xvelocity, 2) + Math.pow(this.yvelocity, 2), .5) > this.meta.physics.max_speed) {
		    var tmpAngle = Math.atan(this.yvelocity / this.xvelocity)
		    if (this.xvelocity < 0) {
			tmpAngle = tmpAngle + Math.PI
		    }
		    //console.log(tmpAngle)
		    this.xvelocity = Math.cos(tmpAngle) * this.meta.physics.max_speed
		    this.yvelocity = Math.sin(tmpAngle) * this.meta.physics.max_speed
		}
	    }
	}
	this.previousAccelTime = this.time
	return true
    }
    else {
	return false
    }

}