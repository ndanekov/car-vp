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

  	res.sendfile(index_path);
});
app.get('/debug', function(req, res) {
	console.log(__dirname)
	var debug_path = path.join(__dirname, './public/debug/debug.html')

  	res.sendfile(debug_path);
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
var tmp_arr = [new CarAttribute('speed',0,eventEmitter),new CarAttribute('temperature',0,eventEmitter),new CarAttribute('rpm',0,eventEmitter)]

var val_arr = []
tmp_arr.forEach(element =>{
	val_arr.push({name:element.name,obj:element})
})

var cluster = new Cluster(val_arr)
console.log(cluster.array[0].obj.getObjJSON())
eventEmitter.on("property_changed",function(name){
	console.log("default " + name + "changed");
})


var wss = new WebSocket.Server({port:8082});

wss.on('connection', function (ws) {
	var id = -1;
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
			id = setInterval(function(){
				
				var obj = null;
				cluster.array.forEach(element =>{
					if(element.name == "speed"){
						obj = element.obj;
					}
				})
				obj.setValue(obj.value+1)
				console.log("incremented value is " + obj.value)
			},1000)
		}
		if(msg.action == "stop_auto"){
			clearInterval(id);
		}

	})

})


var wss1 = new WebSocket.Server({port:8083});
wss1.on('connection', function (ws) {
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
