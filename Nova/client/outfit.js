if (typeof(module) !== 'undefined') {
    module.exports = outfit;
    var _ = require("underscore");
    var Promise = require("bluebird");
    var weapon = require("../server/weaponServer.js");
}


function outfit(buildInfo) {
    // source is a ship / object the outfit is equipped to
    this.buildInfo = buildInfo;
    this.ready = false;
    this.url = 'objects/outfits/';
    if (typeof(buildInfo) !== 'undefined') {
	this.name = buildInfo.name;
	this.count = buildInfo.count || 1;
    }
    this.weapons = [];
}


outfit.prototype.build = function(source) {
    this.source = source
    return this.loadResources()
	.then(_.bind(this.buildWeapons, this))
	.then(_.bind(this.applyEffects, this))
	.then(_.bind(function() {
	    this.ready = true;
	    
	}, this));

}

outfit.prototype.loadResources = function() {

    return new Promise( function(fulfill, reject) {

	$.getJSON(this.url + this.name + ".json", _.bind(function(data) {
	    this.meta = data;

	    if ((typeof(this.meta) !== 'undefined') && (this.meta !== null)) {
		fulfill();
	    }
	    else {
		reject();
	    }
	    
	    
	}, this));

    }.bind(this));


}

outfit.prototype.buildWeapons = function() {

    this.weapons = _.map( this.meta.functions.weapon, function(weaponName) {
	var buildInfo = {
	    "name": weaponName,
	    "source": this.source.UUID,
	    "count": this.count,
	};
	if (typeof this.buildInfo.UUIDS !== 'undefined') {
	    buildInfo.UUID = this.buildInfo.UUIDS[buildInfo.name];
	}
	if (typeof this.buildInfo.socket !== 'undefined') {
	    buildInfo.socket = this.buildInfo.socket;
	}
	return new weapon(buildInfo, this.source);
    }.bind(this));

    
    if (this.meta.functions.weapon) {
	return Promise.all(_.map( this.weapons, function(weapon) {return weapon.build()}));
    }
    else {
	return
    }

    
}

outfit.prototype.applyEffects = function() {


    if (this.meta.functions["speed increase"]) {
	this.source.properties.maxSpeed += this.meta.functions["speed increase"] * this.count
    }

}
