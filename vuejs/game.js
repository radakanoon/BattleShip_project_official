var socket = io('');

var opponame = ""
var idpy = 0
var nameop = ""
var scoreyou = 0
var scoreopp = 0
var taketurn = 0
var allonline = ""
var keepscore = []
var namename = ""
var keepwin = []
var keeplose = []
var winwinwin = ""
var loseloselose = ""
var keepwinscore = []
var keeplosescore = []

// var scorewinwin = "<script></script>"
// var scoreloselose = "<script></script>"

//my history
var youyou = "<tr><td></td><td></td></tr>"
var youyou2 = "<tr><td></td><td></td></tr>"

//for ask name !!need browser to finish loading first and wait a little for server to load
//, browser needs to have already loaded background when prompt pops up
socket.on('connect',function(){
	setTimeout(funcfunc, 1)
	function funcfunc(){
		myFunction()
	}
	
})

// found enemy
socket.on('enemyIsFound', function(){
	if(lang == 2){
		vm.statusMessage = 'พบศัตรูในระยะใกล้เคียง รีบวางเรือเร็ว!';
	}else{
		vm.statusMessage = 'Enemy has been spotted on the radar. Quick place your ships!';
	}
	// vm.statusMessage = 'Enemy has been spotted on the radar. Quick, place your ships!';
	socket.emit('init');
});

socket.on('init', function(obj){
	vm.player = obj;
});

// check your turn
socket.on('permissionFire', function(obj){
	if(vm.player.id == obj.id){
		clearInterval(id);
		clearInterval(timee);
		seconds = 10;
		setTheTimer(); //set timer for 10 sec
		moveTimer(); //set graphic for timer
		setTimeout(permfiretoo, 10)
		function permfiretoo(){
			vm.player.permissionToFire = true;
			if(lang == 2){
				vm.statusMessage = 'ตาคุณแล้ว';
			}else{
				vm.statusMessage = 'Your turn';
			}
			// vm.statusMessage = 'Your turn';
		}	
	}else{
		vm.permissionToFire = false;
		if(lang == 2){
			vm.statusMessage = 'ตาคู่ต่อสู้ของคุณ';
		}else{
			vm.statusMessage = 'Enemy\'s turn';
		}
		// vm.statusMessage = 'Enemy\'s turn';
        document.getElementById("the-timer").innerHTML = "&nbsp";
        document.getElementById("myBar").style.width = '0%'; 
	}
});

//not your turn
socket.on('nono',function(){
	vm.player.permissionToFire = false
	vm.statusMessage = 'Enemy\'s turn';
});

//your turn
socket.on('nonono',function(){
	vm.statusMessage = 'Your turn';
	clearInterval(id);
	clearInterval(timee)
	seconds = 10;
	setTheTimer();
	moveTimer();
	setTimeout(permfire, 10)
	function permfire(){
		vm.player.permissionToFire = true	
	}	
});

// show emoji
socket.on('showemoji',function(emooo){
	if(emooo=="thinkk"){
		emoji1()
	}
	if(emooo=="cryy"){
		emoji2()
	}
	if(emooo=="haa"){
		emoji3()
	}
})

//new reset
socket.on('resetSend',function(obj){
	if(obj){
		onclick =  window.location.reload();
		alert('reset game');
	}
})

//new back
socket.on('backSend',function(obj){
	if(obj){
		onclick =  window.location.reload();
		alert('Enemy have left the game. Let\'s start the game again');
	}
})


//player join but not ready
socket.on('PlayerJoined', function(){
	if(lang == 2){
		vm.statusMessage = 'ไม่พร้อม';
	}else{
		vm.statusMessage = 'Not ready';
	}
	// vm.statusMessage = 'Not ready';
	myFunction()  
});

//enemy already place the ship
socket.on('enemyIsReady', function(){
	vm.enemyReady = true;
	if(lang == 2){
		vm.statusMessage = 'พร้อม';
		console.log('คู่ต่อสู้ของคุณพร้อมแล้ว!');
	}else{
		vm.statusMessage = 'Enemy is ready! Quick!';
		console.log('Enemy is ready');
	}
	// vm.statusMessage = 'Enemy is ready! Quick!';
	// console.log('Enemy is ready');
});

// when shoot the ship
socket.on('hit', function(obj){
	if(obj.hit) document.querySelector('[data-enemyCoordination="'+ obj.coordination +'"]').style.backgroundColor = "red";
	
	//sound effect feature
	var snd = new Audio("/audio/Cannon.mp3");
	snd.play();

	//if hit, score increase.
	scoreyou++
	if(lang == 2){
		//document.getElementById("your-score").innerHTML = "Your score : "+scoreyou;//can use
		document.getElementById("score-bar").innerHTML = "คะแนนของ"+nameop+": "+scoreopp+" | "+"คะแนนของคุณ: "+scoreyou
	}else{
		document.getElementById("score-bar").innerHTML = nameop+"'s score : "+scoreopp+" | "+"Your score : "+scoreyou
	}
	// document.getElementById("score-bar").innerHTML = nameop+"'s score : "+scoreopp+" | "+"Your score : "+scoreyou
	
	//1.emit score to server
	socket.emit('scores',scoreyou)
});

//4.opponent listens to score
socket.on('scoreee',function(oppscore){
	scoreopp = oppscore
	if(lang == 2){
		//document.getElementById("opp-score").innerHTML = nameop+oppscore
		document.getElementById("score-bar").innerHTML = "คะแนนของ"+nameop+": "+scoreopp+" | "+"คะแนนของคุณ: "+scoreyou
	}else{
		document.getElementById("score-bar").innerHTML = nameop+"'s score : "+scoreopp+" | "+"Your score : "+scoreyou
	}
	// document.getElementById("score-bar").innerHTML = nameop+"'s score : "+scoreopp+" | "+"Your score : "+scoreyou
})

//get opponent name
socket.on('getnamenowtoo',function(opname){
	opponame = opname
})

//opponent listens to message
socket.on('getmsg',function(themsg){
	allmsg = allmsg+'<br>'+nameop+": "+themsg
	document.getElementById("messages").innerHTML=allmsg
})

socket.on('hey',function(othername){
	alert(othername+" is playing with you.")
	nameop = othername
	if(lang == 2){
		document.getElementById("score-bar").innerHTML = "คะแนนของ"+nameop+": "+scoreopp+" | "+"คะแนนของคุณ: "+scoreyou
	}else{
		document.getElementById("score-bar").innerHTML = nameop+"'s score : "+scoreopp+" | "+"Your score : "+scoreyou
	}
	// document.getElementById("score-bar").innerHTML = nameop+"'s score : "+scoreopp+" | "+"Your score : "+scoreyou
})

// say who is online and who is left
socket.on('getnamelist',function(names){
	allonline = ""
	var temptemp = 0
	for(var i=0;i<names.length;i++){
		if(names[i]=="skip"){
			temptemp = i
			break;
		}
		allonline = allonline+'<br>'+names[i]+" is online"	
	}
	for(var pq = i+1;pq<names.length;pq++){
		allonline = allonline+'<br>'+names[pq]+" has left"
	}
	document.getElementById("client-names").innerHTML=allonline
})

//who close window or leave the game
socket.on('leaver',function(leavename){
	allonline = allonline+'<br>'+leavename+" has left"
	clearInterval(id);
	clearInterval(timee)
	vm.player.permissionToFire == false
	document.getElementById("the-timer").innerHTML = "&nbsp";
	document.getElementById("myBar").style.width = '0%'; 
	document.getElementById("client-names").innerHTML=allonline
	vm.statusMessage = "Opponent has left the game."
})

//say who is first player
socket.on('getfirstplayer',function(namefirst){
	document.getElementById('first-player').innerHTML = namefirst+" is the first player."
})

//update grid
socket.on('updateBoards', function(obj){
	var tile = document.querySelector('[data-coordination="' + obj.coordination +'"]');
	if(tile.getAttribute('class') == 'placed-tile'){
		tile.style.backgroundColor = 'red';
		if(lang == 2){
			vm.statusMessage = 'ตาคู่ต่อสู้ของคุณ';
		}else{
			vm.statusMessage = 'enemy turn';
		}
		// vm.statusMessage = 'enemy turn';
	}else{
		tile.style.backgroundColor = 'cornflowerblue';
		if(lang == 2){
			vm.statusMessage = 'ตาคุณ';
		}else{
			vm.statusMessage = 'your turn';
		}
		// vm.statusMessage = 'your turn';
	}
});

socket.on('myname',function(thename){
	namename = thename
})

//check winner
socket.on('win', function(obj){
	if(vm.player.id != obj.id){
		//my history
		onclick = window.location.href = 'result.html';		
		youyou = localStorage.getItem('youscoreja');
		youyou = youyou+"<tr><td><script>document.write(\""+namename+"\")</script></td><td><script>document.write(\""+"win"+"\")</script></td></tr>";
		localStorage.setItem('youscoreja',youyou);

		//win
		// keepwin.push(namename)
		// keepwinscore.push(scoreyou)
		// winwinwin = localStorage.getItem('winwinlist')
		// scorewinwin = localStorage.getItem('winwinscorelist')
		// for(var ab = 0;ab<keepwin.length;ab++){
		// 	winwinwin = winwinwin + "<tr><td><script>document.write(\""+keepwin[ab]+"\")</script></td><td><script>document.write(\""+keepwinscore[ab]+"\")</script></td></tr>"
		// }
		// localStorage.setItem('winwinlist',winwinwin)
		// localStorage.setItem('winwinscorelist',scorewinwin)
		alert('you win');
	}else{
		//my history
		onclick = window.location.href = 'result.html';			
		youyou2 = localStorage.getItem('youscoreja2')
		youyou2 = youyou2+"<tr><td><script>document.write(\"" + namename + "\")</script></td><td><script>document.write(\""+"lose"+"\")</script></td></tr>"
		localStorage.setItem('youscoreja',youyou2)

		//lose
		// keeplose.push(namename)	
		// keeplosescore.push(scoreyou)
		// loseloselose = localStorage.getItem('loseloselist')
		// scoreloselose = localStorage.getItem('loselosescorelist')
		// for(var bc = 0;bc<keeplose.length;bc++){
		// 	loseloselose =loseloselose + "<tr><td><script>document.write(\""+keeplose[bc]+"\")</script></td><td><script>document.write(\""+keeplosescore[bc]+"\")</script></td></tr>"
		// }
		// localStorage.setItem('loseloselist',loseloselose)
		// localStorage.setItem('loselosescorelist',scoreloselose)
		alert('you lose')	
	}
});

//draw grid
Vue.component('board', {
	props:['columns', 'rows'],
	template: '#board-template',

	methods: {
		placeTheShip: function(el){
			if(vm.statusMessage==='Waiting for enemy....'){
				alert("Enemy is not here yet. Please wait.")
				return;
			}

			// console.log(this.$root.chosenShip);

			if(this.$root.chosenShip == null || this.$root.chosenShip.available == 0) return;
			var setCoordination = el.currentTarget.getAttribute('data-coordination');
			var size = this.$root.chosenShip.size;
			var hoveredTile = document.querySelectorAll('.tile-hover');
			var overlap = false; //check for placing colission 

			for (var i = size - 1; i >= 0; i--) {
				if(this.$root.rotated){
					if(parseInt(setCoordination.split("").reverse().join("")[0]) + size <= this.columns){
						var e = document.querySelector('[data-coordination="'+(parseInt(setCoordination) + (i))+'"]');
						if (e.className == 'placed-tile') overlap = true;
					}else{
						var e = document.querySelector('[data-coordination="' + (parseInt(setCoordination) - (i))+'"]'); 
						if (e.className == 'placed-tile') overlap = true;
					}
				}
				if(!this.$root.rotated){
					if(document.querySelector('[data-coordination="' + (parseInt(setCoordination) + (i * 10)) + '"]') != null){
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 10)) +'"]');
						if(e.className == 'placed-tile') overlap = true;
					}else{
						// console.log('no');
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) - ((size - i) *10)) + '"]');
						if(e.className == 'placed-tile') overlap = true;
					}
				}
			}

			if(!overlap){
				// console.log(this.$root.chosenShip);
				for (var i = hoveredTile.length - 1; i >= 0; i--) {
					hoveredTile[i].className = 'placed-tile';
					this.$root.chosenShip.location.push(parseInt(hoveredTile[i].getAttribute('data-coordination')));
				}
				this.$root.chosenShip.available--;
				console.log(socket.emit('place', this.$root.chosenShip));
			}
		},
		changeStyle: function(el) {

			if(this.$root.chosenShip == null || this.$root.chosenShip.available == 0)return;
			var setCoordination = el.currentTarget.getAttribute('data-coordination');
			var size = this.$root.chosenShip.size;

			for (var i = 0; i < size; i++) {
				var e = document.querySelector('[data-coordination="'+ setCoordination + (i)+'"]');

				if(this.$root.rotated) {
					if (parseInt(setCoordination.split("").reverse().join("")[0]) + size <= this.columns) {
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i)) +'"]');
						e.className = e.className == 'placed-tile' ? 'placed-tile' : 'tile-hover';
					}else{
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) - (i)) +'"]');
						e.className = e.className == 'placed-tile' ? 'placed-tile' : 'tile-hover';
					}
				} else if (!this.$root.rotated) {
					if (document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 10)) +'"]') != null) {
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 10)) +'"]');
						e.className = e.className == 'placed-tile' ? 'placed-tile' : 'tile-hover';
					}else{
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) - ((size - i) * 10)) +'"]');
						e.className = e.className == 'placed-tile' ? 'placed-tile' : 'tile-hover';
					}
				}
			}
		},
		setDef: function(el) {
			if(this.$root.chosenShip == null) return;
			var setCoordination = el.currentTarget.getAttribute('data-coordination');
			var size = this.$root.chosenShip.size;

			for (var i = 0; i < size; i++)
				if(this.$root.rotated) {
					if (parseInt(setCoordination.split("").reverse().join("")[0]) + size <= this.columns) {
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 1)) +'"]');
						e.className  = e.className == 'placed-tile' ? 'placed-tile' : 'tile';
					}else {
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) - ((i) * 1)) +'"]');
						e.className  = e.className == 'placed-tile' ? 'placed-tile' : 'tile';
					}
				} else if (!this.$root.rotated) {
					if (document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 10)) +'"]') != null) {
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 10)) +'"]');
						e.className  = e.className == 'placed-tile' ? 'placed-tile' : 'tile';
					}else {
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) - ((size - i) * 10)) +'"]');
						e.className  = e.className == 'placed-tile' ? 'placed-tile' : 'tile';
					}
				}
		}
	}
});

//enemy grid
Vue.component('enemy-board', {
	template: "#enemyBoard-template", 
	props: ['columns', 'rows'], 

	methods: {
		fire: function(el){
			if(el.currentTarget.getAttribute('data-hittable') == 'true'){
				if(!vm.player || vm.player.permissionToFire == false) return;
				if(vm.enemyReady != true) return alert('Your enemy is not ready yet');
				// console.log(parseInt(el.currentTarget.getAttribute('data-enemyCoordination')));
				socket.emit('fire', {'player':vm.player, 'coordination' : parseInt(el.currentTarget.getAttribute('data-enemyCoordination'))});
				el.currentTarget.className = 'missed-tile';
				el.currentTarget.setAttribute('data-hittable', 'false');
				vm.player.permissionToFire = false; vm.statusMessage = 'Enemy\'s turn';
			}
		}
	}
});

var hi
if(lang == 2){
	hi = 'กำลังรอคู่ต่อสู้'
}else{
	hi = 'Waiting for enemy....'
}

//ship
var vm = new Vue({
	el: '#battleship',

	data: {
		ships: [
		{'type': '(✿◠‿◠)', 'size': 4, 'rekt': false, 'available': 1, 'location' : []},
		{'type': '(▰˘◡˘▰)', 'size': 4, 'rekt': false, 'available': 1, 'location' : []},
		{'type': '(°∀°)b', 'size': 4, 'rekt': false, 'available': 1, 'location' : []},
		{'type': '(ᗒᗊᗕ)', 'size': 4, 'rekt': false, 'available': 1, 'location' : []},
	],

	chosenShip: null,
	// statusMessage: 'Waiting for enemy....',
	statusMessage: hi,
	rotated: false,
	enemyReady: false,
	ready: false
	}, 

	methods: {
		setChosenShip: function(ship){
			this.chosenShip = ship;
			console.log(this.chosenShip = ship);
		}
	}, 

	computed: {
		isReady: function(){
			var ready = true;
			for (var i = 0; i < this.ships.length; i++) {
				if(this.ships[i].available > 0) ready = false;
			}
			if(ready == true){
				socket.emit('ready');
				vm.statusMessage = "You are ready. Waiting for opponent."
				socket.emit('getready')
			}
			return ready;
		}
	}
}); 

//timer
var timee = 0
var seconds = 10
var id = 0
var elem = document.getElementById("myBar");

//set interval function
function setTheTimer(){ 
	document.getElementById("the-timer").innerHTML = "0:10"; //set initial interval
	
    function incrementSeconds() { 
		seconds -= 1; //decrease time by 1 sec
		if(vm.player.permissionToFire == false){ //if timeout or being pressed --> clear timeout, set info back to original
			document.getElementById("the-timer").innerHTML = "&nbsp";
			clearInterval(timee)
			taketurn = 1	

		}else if(seconds<0){
			document.getElementById("the-timer").innerHTML = "&nbsp";
			clearInterval(timee)
			taketurn = 1
			changepy()
		}
		else{ //if still have time
			document.getElementById("the-timer").innerHTML = "0:0"+seconds;
		}
	}
	timee = setInterval(incrementSeconds, 1000);
}

function moveTimer() {
    elem.style.width = '100%'; //make a style full of time slot area
    var elwidth = 100;
    
    id = setInterval(frame, 1000);
    function frame() {
		if (elwidth === 0 || vm.player.permissionToFire == false) { //if timeout or being pressed --> clear interval
			clearInterval(id);
			elem.style.width = '0%';
		} else {
			elwidth = elwidth-10; //decrease every 10 sec
			elem.style.width = elwidth + '%'; 
		}
    }
}

//swap turn when timesout
function changepy(){
	if(taketurn==1){
		socket.emit('swappy')
	}
}