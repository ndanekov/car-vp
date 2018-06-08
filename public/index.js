var app = angular.module('RSAI', []);
app.controller("indexController",function($scope,$http){
	alert("found");
	var ws = new WebSocket('ws://localhost:8082');
	    // event emmited when connected
    ws.onopen = function () {
        console.log('websocket is connected ...')
        // sending a send event to websocket server
       	var msg = {
			action:"none"
		}
        ws.send(JSON.stringify(msg))
    }
	ws.onmessage = function (ev) {
	    console.log(ev);
	}
	
	$scope.incrementClick = function(){
		var msg = {
			action:"increment"
		}
 
	    ws.send(JSON.stringify(msg))
	}
	$scope.startAutoClick = function(){
		var msg = {
			action:"start_auto"
		}
 
	    ws.send(JSON.stringify(msg))
	}

	$scope.stopAutoClick = function(){

		var msg = {
			action:"stop_auto"
		}
 
	    ws.send(JSON.stringify(msg))
	}
})
