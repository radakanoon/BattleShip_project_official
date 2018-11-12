//import Express
var app = require('express')();
var express = require('express');
//create a NodeJs http server
var http = require('http').Server(app);
var ipAddr = require('quick-local-ip');

var io = require('socket.io')(http);
app.use(express.static(__dirname + '/vuejs'));
app.use(express.static(__dirname + '/socket.io'));

var pyname = [] //player name
var pyid = [] //player id
var readykeeper = [0,0]

var players = [], turns = 0;
var rndPlayer
var leftplayer = []
var nowplayer = []

var ship1 = [
		{'type': '(✿◠‿◠)', 'size': 4, 'rekt': false, 'available': 1, 'location' : []},
		{'type': '(▰˘◡˘▰)', 'size': 4, 'rekt': false, 'available': 1, 'location' : []},
		{'type': '(°∀°)b', 'size': 4, 'rekt': false, 'available': 1, 'location' : []},
		{'type': '(ᗒᗊᗕ)', 'size': 4, 'rekt': false, 'available': 1, 'location' : []},
	]; //takes 16 hits before all ships are sunk

var ships = ship1;

var updateShip = function(id, ship, callback){
	var player;
    // console.log('Ship', ship);

	for (var i = 0; i< players.length; i++) {
		if(players[i].id == id) player = players[i];
	}

	for (var i = 0; i< ships.length; i++) {
		if (ships[i].type == ship.type) {
				player.ships.push(ship);
		}
	}

    // console.log('player', player.id, 'ship', ship, 'ships', player.ships);
};

/**
 * Giving a player his turn to play.
 * socket.id  {[int]}   id   [network socketid]
 * @return {[boolean]}       [sets pemission to true]
 */
var permissionToFire = function(id, callback){
	players.map(function(enemy){
		if(enemy.id == id) callback(enemy.permissionToFire = true);
	});
}

//connect
io.on('connection', function(socket){
	var id = socket.id;

	//only 2 players allowed to play
	if (players.length >= 2){ 
		socket.emit('RoomIsFull', true);
		console.log('Room is full');
		return;
	}


	//new reset
	socket.on('reset', function(obj){
		if(obj){
			console.log('reset game');
			players = [];
			turns = 0;
			pyname = [];
			pyid = [];
			leftplayer = [];
		}
		// onclick =  window.location.reload();
		var ret=true;
		socket.broadcast.emit('resetSend', ret);
		// alert('reset game');
	});

	//new back
	socket.on('back', function(obj){
		if(obj){
			console.log('Left the game (by click go back)');
			players = [];
			turns = 0;
			pyname = [];
			pyid = [];
			leftplayer = [];
		}
		var ret=true;
		socket.broadcast.emit('backSend', ret);
	});


	socket.on('place', function(ship){
		updateShip(socket.id, ship, function(){
		});
	});

	//server listens to message
	socket.on('chat message', function(msg){
		console.log('message from '+socket.id+': '+ msg);
		//emit message to opponent
		socket.broadcast.emit('getmsg',msg)
	});

	//2.server listens to score
	socket.on('scores',function(data){
		console.log("new score: "+data);
		//3.emit score to opponent
		socket.broadcast.emit('scoreee',data)
	});

	// send emoji
	socket.on('sendemoji',function(emoo){
		if(emoo=="thinkk"){
			console.log(socket.id+" sent thinking emoji")
			socket.broadcast.emit('showemoji',"thinkk")
		}
		if(emoo=="cryy"){
			console.log(socket.id+" sent crying emoji")
			socket.broadcast.emit('showemoji',"cryy")
		}
		if(emoo=="haa"){
			console.log(socket.id+" sent laughing emoji")
			socket.broadcast.emit('showemoji',"haa")
		}
	})

	//get name
	socket.on('getnamenow',function(infos){
		io.to(socket.id).emit('myname',infos)
		pyname.push(infos)
		pyid.push(socket.id)
		nowplayer.push(infos)
		//var numcount
		for(var i=0;i<nowplayer.length;i++){
			console.log("Current Player:"+nowplayer[i]+", id:"+pyid[i])
			//numcount++
		}
		console.log("Number of current players : "+nowplayer.length)
		var temp = []
		for(var q=0;q<pyname.length;q++){
			temp.push(pyname[q])
		}
		temp.push("skip")
		for(var p=0;p<leftplayer.length;p++){
			temp.push(leftplayer[p])
		}
		io.emit('getnamelist',temp)
		//handles only 2 players
		if(pyname.length==2){
			//or players.length
			//console.log("got two py")
			io.to(pyid[0]).emit('hey',pyname[1])
			io.to(pyid[1]).emit('hey',pyname[0])
			console.log("random first player: "+pyname[rndPlayer]+", id: "+pyid[rndPlayer]);
			io.emit('getfirstplayer',pyname[rndPlayer])
		}
	})

	socket.on('getready',function(){
		if(socket.id==pyid[0]){
			readykeeper[0] = 1
			console.log(socket.id+" has successfully placed all the ships.")
		}
		else if(socket.id==pyid[1]){
			readykeeper[1] = 1
			console.log(socket.id+" has successfully placed all the ships.")
		}
		if(readykeeper[0]==1&&readykeeper[1]==1){
			players[rndPlayer].permissionToFire = true;
			console.log("Both players are ready to play.")
			io.to(pyid[rndPlayer]).emit('nonono')
			
			if(rndPlayer==1){
				io.to(pyid[0]).emit('nono')
			}else{
				io.to(pyid[1]).emit('nono')
			}
		}
	})

	socket.on('swappy',function(){
		socket.emit('nono')
		socket.broadcast.emit('nonono')
	})

	/**
	 * check if enemy is ready & send
	 * @return {[boolean]}
	 */
	socket.on('ready', function(){
		socket.broadcast.emit('enemyIsReady')
	});

	//create player & push to players array with starting data.
	players.push({'id' : socket.id, 'ready': true, 'takenHits': 0, permissionToFire: false, 'ships': []});

	socket.on('init', function(player){
		var player;
		for (var i = players.length - 1; i >= 0; i--) {
			if(players[i].id == id) player = players[i]
		}

		//init with if statement to force the correct id.
		if (id == socket.id) socket.emit('init', player);
			console.log(id + 'is ready to play');
	});

	//message that 2 players are able to play
	if(players.length > 1){
		socket.emit('enemyIsFound', 'enemyIsFound');
		socket.broadcast.emit('enemyIsFound', 'enemyIsFound');
		
		//random first player
		rndPlayer = Math.round(Math.random()*(players.length-1));
		players[rndPlayer].permissionToFire = true;
		// console.log("random number: "+rndPlayer)
	};

	socket.on('fire', function(obj, id, ship){
		turns++;

		var enemy = [];
		//define enemy
		players.map(function(player){if(player.id != socket.id) return enemy = player});
		// console.log('enemy', enemy.id);

		/**
		 * check if fired shot matches any ship location.
		 * @boolean {[true]}
		 */
		var hit = enemy.ships
				.map(ship => ship.location)
				.some(coordinates => coordinates.some(coordinate => coordinate === obj.coordination ));

		//when hit
		if(hit){
			enemy.takenHits++;
			console.log('Hit!');
			socket.emit('hit', {'coordination' : obj.coordination, 'hit' : hit});

			/**
			 * if all ships are hit, send win/lose message
			 */
			if(enemy.takenHits >= 2) {
				io.sockets.emit('win', enemy);
				players = [];
				turns = 0;
				pyname = [];
				pyid = [];
				leftplayer = [];
			}

		}else{ //when miss
			console.log('missed');
			// console.log(obj.coordination);
		};

		/**
		 * updating the bord of the current enemy
		 * to show where the other play hit/missed.
		 */
		socket.broadcast.emit('updateBoards', { 'coordination': obj.coordination, 'enemy':enemy});

		/**
		 * give the turn to fire to the enemy who got shot.
		 * @return {[object]}  [send enemy object]
		 */
		permissionToFire(enemy.id, function(){
				io.sockets.connected[enemy.id].emit('permissionFire', enemy);
			});
		console.log(enemy);
	});

	socket.on('disconnect', function(){
			players.map(function(player, index){if(player.id == id) players.splice(index, 1)});
			console.log(id+" has left the game."+" Player remaining: "+ players.length);
			
			var indexleave = pyid.indexOf(id)
			io.emit('leaver',pyname[indexleave])
			leftplayer.push(pyname[indexleave])
			nowplayer.splice(nowplayer.indexOf(pyid[indexleave]), 1 )
	});
});

//let it listen on port
http.listen(1337, ipAddr.getLocalIP4(), function(){
	console.log('IP address is ' ,ipAddr.getLocalIP4() );
	console.log('listening on port 1337');
});