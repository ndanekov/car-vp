var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var http = require('http');
var WebSocket = require('ws');
var app = express();

var events = require('events');
var eventEmitter = new events.EventEmitter();


var CarAttribute = require('./models/CarAttribute')
var Cluster = require('./models/Cluster')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/', function(req, res) {
	console.log(__dirname)
	var index_path = path.join(__dirname, './public/index/index.html')
	console.log(index_path)
  	res.sendFile(index_path);
});
app.get('/debug', function(req, res) {
	console.log(__dirname)
	var debug_path = path.join(__dirname, './public/debug/debug.html')

  	res.sendFile(debug_path);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//add
var tmp_arr = [new CarAttribute('speed',0,eventEmitter),new CarAttribute('temperature',70,eventEmitter),new CarAttribute('rpm',1000,eventEmitter)]

var val_arr = []
tmp_arr.forEach(element =>{
	val_arr.push({name:element.name,obj:element})
})

var cluster = new Cluster(val_arr)


eventEmitter.on("property_changed",function(name){
	console.log("default " + name + "changed");
})


var rand_speed = 0
var rand_temp = 0
var rand_rpm = 0

var getRandomValue = function(min,max){
	min = Math.ceil(min);
  	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
}

start = function(){
	
	var obj = null;
	//speed
	cluster.array.forEach(element =>{
		if(element.name == "speed"){
			obj = element.obj;
		}
	})
	if(obj.value == rand_speed){
		rand_speed = getRandomValue(0,180)
	}

	if(obj.value > rand_speed){
		obj.setValue(obj.value-1)
	}else{
		obj.setValue(obj.value+1)
	}

	//temperature
	cluster.array.forEach(element =>{
		if(element.name == "temperature"){
			obj = element.obj;
		}
	})
	if(obj.value == rand_temp){
		rand_temp = getRandomValue(70,100)
	}

	if(obj.value > rand_temp){
		obj.setValue(obj.value-1)
	}else{
		obj.setValue(obj.value+1)
	}
	
	//rpm
	cluster.array.forEach(element =>{
		if(element.name == "rpm"){
			obj = element.obj;
		}
	})
	if(obj.value == rand_rpm){
		rand_rpm = getRandomValue(0,600)*10
	}

	if(obj.value > rand_rpm){
		obj.setValue(obj.value-10)
	}else{
		obj.setValue(obj.value+10)
	}
	
	console.log("new speed is " + obj.value)
}

setup = function(){
	rand_speed = getRandomValue(0,180)
	rand_temp = getRandomValue(70,90)
	rand_rpm = getRandomValue(0,600)*10
}

realistic_simulation = function(){
	var rpm_koef = 6000/30;
	var obj = null;
	//speed
	cluster.array.forEach(element =>{
		if(element.name == "speed"){
			obj = element.obj;
		}
	})
	if(obj.value == rand_speed){
		rand_speed = getRandomValue(0,180)
	}
	var rpm = null;
	//rpm
	cluster.array.forEach(element =>{
		if(element.name == "rpm"){
			rpm = element.obj;
		}
	})
	if(obj.value > rand_speed){
		obj.setValue(obj.value-1)
		rpm.setValue(rpm.value-rpm_koef)
		if(rpm.value<=1000){
			rpm.setValue(6000)
		}

	}else{
		obj.setValue(obj.value+1)
		rpm.setValue(rpm.value+rpm_koef)
		if(rpm.value>=6000){
			rpm.setValue(1000)
		}
	}

	//temperature
	cluster.array.forEach(element =>{
		if(element.name == "temperature"){
			obj = element.obj;
		}
	})
	if(obj.value == rand_temp){
		rand_temp = getRandomValue(70,100)
	}

	if(obj.value > rand_temp){
		obj.setValue(obj.value-1)
	}else{
		obj.setValue(obj.value+1)
	}
}
var wss_config = new WebSocket.Server({port:8082});



wss_config.on('connection', function (ws) {
	var id = -1,id_real = -1;
	ws.on('message', function (message) {
		console.log('received: %s', message)
		var msg = JSON.parse(message)
		if(msg.action == "increment"){
				
			var obj = null;
			cluster.array.forEach(element =>{
				if(element.name == "speed"){
					obj = element.obj;
				}
			})
			obj.setValue(obj.value+15)
			console.log("incremented value is " + obj.value)
		}
		if(msg.action == "start_auto"){
			setup()
			id = setInterval(start,100)
		}
		if(msg.action == "stop_auto"){
			clearInterval(id);
		}

		if(msg.action == "start_realistic"){
			setup()
			id_real = setInterval(realistic_simulation,100)
		}
		if(msg.action == "stop_realistic"){
			clearInterval(id_real);
		}
		

	})

})


var wss_debug = new WebSocket.Server({port:8083});
wss_debug.on('connection', function (ws) {
	console.log("connected to display port")
	console.log("connected to ")
	var clusterJSON = {
		action:"update_all",
		data:cluster.getClusterJSON()
	};
	

	ws.send(JSON.stringify(clusterJSON))
	eventEmitter.on("property_changed",function(name){
		console.log("speed changed sending to second socket")
		var obj = null;
		cluster.array.forEach(element =>{
			if(element.name == name){
				obj = element.obj;
			}
		})
		var speedJSON ={
			action:"update_"+name,
			data:obj.getObjJSON()
		}
		ws.send(JSON.stringify(speedJSON))
	})

})




module.exports = app;
