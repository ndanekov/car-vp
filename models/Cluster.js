function Cluster(array){
	this.array = array
}

Cluster.prototype.getClusterJSON = function(){
	var JSONarray = []
	this.array.forEach(element => {
		JSONarray.push(element.obj.getObjJSON())	
	});
	return JSONarray;
}
module.exports = Cluster;