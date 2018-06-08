var app = angular.module('RSAI', []);

function indexController($scope, $http){
	alert("found");
	$scope.btnClick = function(){
		var ws = new WebSocket('ws://localhost:8082');
	    // event emmited when connected
	    ws.onopen = function () {
	        console.log('websocket is connected ...')
	        // sending a send event to websocket server
	        ws.send('connected')
	    }
	    // event emmited when receiving message 
	    ws.onmessage = function (ev) {
	        console.log(ev);
	    }
	}
}