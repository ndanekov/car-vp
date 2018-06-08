var express = require('express');


function Value(name,value,eventEmitter){
	this.name = name
	this.value = value
	this.eventEmitter = eventEmitter
}

Value.prototype.setValue = function(val){
		this.value = val
		this.eventEmitter.emit("property_changed",this.name)
}

Value.prototype.getObjJSON = function(){
	return {
		name:this.name,
		value:this.value,

	}
}

module.exports = Value;