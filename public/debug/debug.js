var app = angular.module('rsai', []);
app.controller("debugController",['$scope',function($scope){
	

	var ws1 = new WebSocket('ws://localhost:8083');
	    // event emmited when connected
    ws1.onopen = function () {
        console.log('websocket is connected ...')
        // sending a send event to websocket server
        //ws.send('connected')
    }
	ws1.onmessage = function (message) {

		var msg = JSON.parse(message.data)
	    console.log(msg);
	    if(msg.action=="update_all"){
	    	console.log(msg.data)
	    	$scope.entries = msg.data
	    	$scope.$digest()

			
		}
		if(msg.action == "update_speed"){
			var id = $scope.entries.findIndex(function(element){
				return element.name == "speed";
			})
			if(id=>0){
				$scope.entries[id] = msg.data
				$scope.$digest()
			}else{
				alert("an error occured!!")
			}
		}
		if(msg.action == "update_temperature"){
			var id = $scope.entries.findIndex(function(element){
				return element.name == "temperature";
			})
			if(id=>0){
				$scope.entries[id] = msg.data
				$scope.$dligest()
			}else{
				alert("an error occured!!")
			}
			
		}
		if(msg.action == "update_rpm"){
			var id = $scope.entries.findIndex(function(element){
				return element.name == "rpm";
			})
			if(id=>0){
				$scope.entries[id] = msg.data
				$scope.$dligest()
			}else{
				alert("an error occured!!")
			}
			
		}
	}

	// {
	// 	action: update_all
	// 	data: [
	// 		{
	// 			name:speed,
	// 			value:5
	// 		},
	// 		{
	// 			name:temp,
	// 			value:3
	// 		}
	// 	]
	// }
	// {
	// 	action:update_speed,
	// 	data : {
	// 		name:speed,
	// 		value:5
	// 	}
	// }
	$scope.$watch('entries',function(){
		console.log("entries changed")
	})

	$scope.click =function(){
		console.log($scope.entries)
	}
	console.log($scope.some)
}])