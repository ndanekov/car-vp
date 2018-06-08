var express = require('express');


function CarAttribute(name,value,eventEmitter){
	this.name = name
	this.value = value
	this.eventEmitter = eventEmitter
}

CarAttribute.prototype.setValue = function(val){
		this.value = val
		this.eventEmitter.emit("property_changed",this.name)
}

CarAttribute.prototype.getObjJSON = function(){
	return {
		name:this.name,
		value:this.value,

	}
}

module.exports = CarAttribute;