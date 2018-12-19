
module.exports = PokerManager;
/**
 * PokerManager constructor.
 *
 * @param
 */
function PokerManager(){
	//this.genAllPokers();
}

// 洗牌 返回 map
PokerManager.prototype.genAllPokers = function(){
	var pokerList = shuffleAdd();
	var map = {};
	for(var i=0;i<10;i++){
		var arr = new Array();
		for (var j = 0; j < 5; j++) {
			arr.push(pokerList[j*10 + i]);
		}
		map[i] = arr;
	}
	return map;
};

// 洗牌 12人
PokerManager.prototype.genAllPokers12 = function(){
	var pokerList = shuffleAdd12();
	var map = {};
	for(var i=0;i<12;i++){
		var arr = new Array();
		for (var j = 0; j < 5; j++) {
			arr.push(pokerList[j*12 + i]);
		}
		map[i] = arr;
	}
	return map;
};

//计算点数
PokerManager.prototype.cal= function(cards,conf){
	var s = 0;
	var t = 0;
	var dict = {};
	var dict2 = {};
	var than10 = 0;
	for (var i = 0; i < cards.length; i++) {
		var ci = cards[i].value;
		s += ci;
		t += ci;
		if(ci == 0){t += 10}
		dict[ci] = dict[ci] === undefined ? 1 : dict[ci] + 1;
		var si = cards[i].num;
		dict2[si] = dict2[si] === undefined ? 1 : dict2[si] + 1;
		if(cards[i].num > 10){
			than10 = than10 + 1
		}
	};
	var point = s % 10;
	var exists = false;
	for (var i in dict) {
		var other = (10 + point - i) % 10;
		if (dict[other]) {
			if ((other == i && dict[other] >= 2) || (other!=i&&dict[other] >= 1)) {
				exists = true;
				break;
			}
		}
	}
	if(point == 0){point = 10};//牛牛
	if(conf.wxn==1){
		if(t <= 10){
			point = 13;// 五小
			exists = true;
		}	
	}
	if(conf.whn==1){
		if(than10 == 5){
			point = 11 //五花
			exists = true;
		}	
	}
	if(conf.zdn==1){
		for(var k in dict2 ){
			if(dict2[k] >= 4 ){
				point = 12;	//炸弹
				exists = true;
			}
		}
	}
	return exists ? point : 0;
};

//单张版对比
function CompareSingle(poker1,poker2){
	poker1.sort(function(a, b){
		if(a.num==b.num){
			return a.sortValue - b.sortValue;
		}else{
			return a.num - b.num;
		}
	});
	poker2.sort(function(a, b){
		if(a.num==b.num){
			return a.sortValue - b.sortValue;
		}else{
			return a.num - b.num;
		}
	});
	var a = poker1[4];
	var b = poker2[4];
	if(a==undefined){
		return 0;
	}
	if(b==undefined){
		return 1;
	}
	if(a.num > b.num){
		return 1
	}else if(a.num < b.num){
		return 0
	}else if(a.num == b.num){
		if(a.sortValue > b.sortValue){
			return 1
		}else{
			return 0
		}
	}
	return 1
}

//玩家对比
function ComparePlayer(player1,player2,data,conf){
	var a = new PokerManager().cal(player1.getPokerList(),conf);
	var b = new PokerManager().cal(player2.getPokerList(),conf);
	var addScore = 0;
	var winScore = 0;	//赢的人的牌的，牛数
	var basrRate = 1;	
	var userRate = player2.getBaseRate();	//闲家下注的倍数
	var winNiu = 0;
	var winplayer = 0;
	if(a > b){winplayer = 1;winNiu = a};
	if(a < b){winplayer = 2;winNiu = b};
	if(a == b){
		var win = CompareSingle(player1.getPokerList(),player2.getPokerList())
		if(win == 1){
			winplayer = 1;
		}else{
			winplayer = 2;
		}
		winNiu = a
	}
	if(winNiu < 7){
		basrRate = 1
	}else if(winNiu >=  7 && winNiu<=10){
		if(conf.guize == "niuniu3"){
			if(winNiu == 7){
				basrRate = 1
			}else if(winNiu==10){
				basrRate = 3
			}else{
				basrRate = 2
			}
		}else{
			if(winNiu == 9){
				basrRate = 3
			}else if(winNiu==10){
				basrRate = 4
			}else{
				basrRate = 2
			}
		}
	}else if(winNiu > 10 ){
		if (conf.guize == "wuhuaniu,zhadnaniu,wuxiaoniu") {
			if(winNiu == 11){
				basrRate = 5 //五花   11  5倍
			}else if(winNiu == 13){
				basrRate = 8	// 五小  13  8倍
			}else if(winNiu == 12){
				basrRate = 6 //炸弹   12  6倍
			}
		}


		if (conf.special.indexOf("wuhuaniu")) {			
			if (conf.special.indexOf("zhadanniu")) {		
				if (conf.special.indexOf("wuxiaoniu")) {	//选择五花 炸弹 五小
					if(winNiu == 11){
						basrRate = 5 //五花   11  5倍
					}else if(winNiu == 13){
						basrRate = 8	// 五小  13  8倍
					}else if(winNiu == 12){
						basrRate = 6 //炸弹   12  6倍
					}
				}else{									//选择五花 炸弹
					if(winNiu == 11){
						basrRate = 5 //五花   11  5倍
					}else if(winNiu == 13){
						basrRate = 1	// 五小  13  8倍
					}else if(winNiu == 12){
						basrRate = 6 //炸弹   12  6倍
					}
				}
			}else{
				if(conf.special.indexOf("wuxiaoniu")){		//选择五花 五小
					if(winNiu == 11){
						basrRate = 5 //五花   11  5倍
					}else if(winNiu == 13){
						basrRate = 8	// 五小  13  8倍
					}else if(winNiu == 12){
						basrRate = 1 //炸弹   12  6倍
					}
				}else{										//选择五花
					if(winNiu == 11){
						basrRate = 5 //五花   11  5倍
					}else if(winNiu == 13){
						basrRate = 1	// 五小  13  8倍
					}else if(winNiu == 12){
						basrRate = 1 //炸弹   12  6倍
					}
				}

			}
		}else{
			if (conf.special.indexOf("zhadanniu")) {
				if (conf.special.indexOf("wuxiaoniu")) {		//选择炸弹 五小
					if(winNiu == 11){
						if (conf.special == "niuniu3") {
							basrRate = 3 //五花   11  3倍
						}else{
							basrRate = 4 //五花   11  4倍
						}
					}else if(winNiu == 13){
						basrRate = 8	// 五小  13  8倍
					}else if(winNiu == 12){
						basrRate = 6 //炸弹   12  6倍
					}
				}else{											//选择炸弹
					if(winNiu == 11){
						if (conf.special == "niuniu3") {
							basrRate = 3 //五花   11  3倍
						}else{
							basrRate = 4 //五花   11  4倍
						}
					}else if(winNiu == 13){
						basrRate = 1	// 五小  13  8倍
					}else if(winNiu == 12){
						basrRate = 6 //炸弹   12  6倍
					}
				}
			}else{
				if (conf.special == "wuxiaoniu") {						//选择五小
					if(winNiu == 11){
							if (conf.special == "niuniu3") {
								basrRate = 3 //五花   11  3倍
							}else{
								basrRate = 4 //五花   11  4倍
							}
						}else if(winNiu == 13){
							basrRate = 8	// 五小  13  8倍
						}else if(winNiu == 12){
							basrRate = 1 //炸弹   12  6倍
						}
				}else{													//都不选择
					if(winNiu == 11){
							if (conf.special == "niuniu3") {
								basrRate = 3 //五花   11  3倍
							}else{
								basrRate = 4 //五花   11  4倍
							}
						}else if(winNiu == 13){
							basrRate = 1	// 五小  13  8倍
						}else if(winNiu == 12){
							basrRate = 1 //炸弹   12  6倍
						}
				}
			}
		}
			
	}
	var difen = 1
	difen = parseInt(conf.difen);
	if(player1.QiangNum==0){
		player1.QiangNum = 1;
	}
	addScore = basrRate * userRate * difen*player1.QiangNum;
	if(winplayer == 1){
		data[player1.getUid()].score = data[player1.getUid()].score + addScore;
		data[player2.getUid()].score = data[player2.getUid()].score - addScore;
	}else if(winplayer == 2){
		data[player1.getUid()].score = data[player1.getUid()].score - addScore;
		data[player2.getUid()].score = data[player2.getUid()].score + addScore;
	}
	data[player1.getUid()].value = a;
	data[player2.getUid()].value = b;
}

PokerManager.prototype.ComparePoker = function(room,conf){
	var playerList = room.getPlayerList();
	var zhuanIndex = 0;
	var data = {};
	data.cards = new Array();
	data.uids = new Array();
	for(var i = 0; i < playerList.length; i++){
		if(playerList[i].getIsPlayCurrent()){
			if(playerList[i].getIsGrab()){
				zhuanIndex = i
			}
			data[playerList[i].getUid()] = {};
			data[playerList[i].getUid()].score = 0;
			data[playerList[i].getUid()].value = 0;
			data[playerList[i].getUid()].cards = playerList[i].getPokerList();
		}
	}
	for(var j = 0; j < playerList.length; j++){
		if(playerList[j].getIsPlayCurrent()){
			if(j !== zhuanIndex){
				ComparePlayer(playerList[zhuanIndex],playerList[j],data,conf)
				data.cards.push(playerList[j].getPokerList());
				data.uids.push(playerList[j].getUid());
			}
		}
	}
	data.cards.push(playerList[zhuanIndex].getPokerList());
	data.uids.push(playerList[zhuanIndex].getUid());
	return data
}

//牌面
var ColourType = {
	heitao:'heitao',
	hongtao:'hongtao',
	meihua:'meihua',
	fangkuai:'fangkuai',
	teshu:'teshu'
};

//牌
function Poker(colourType, num){
	this.colourType = colourType;
	this.num = num;
	this.name = colourType + '_' + num;
	/**
	 * 牌大小值
	 * @return
	 */
	this.value = this.num;
	if(this.num >= 10  || this.num < 0){
		this.value = 0;
	}
	/**
	* 排序大小
	*/
	var sortValue = 0;
	if(this.colourType == ColourType.heitao){
		sortValue = this.value + 0.4;	
	}
	else if(this.colourType == ColourType.hongtao){
		sortValue = this.value + 0.3;	
	}
	else if(this.colourType == ColourType.meihua){
		sortValue = this.value + 0.2;	
	}
	else{
		sortValue = this.value + 0.1;		
	}
	this.sortValue = sortValue;
}

// 洗牌
function shuffleAdd(){
	var list = new Array();
	for(var i = 1; i <= 4; i++){
		var type = '';
		if(i==1)
			type = ColourType.heitao;
		else if(i==2)
			type = ColourType.hongtao;
		else if(i==3)
			type = ColourType.meihua;
		else
			type = ColourType.fangkuai;

		for (var j = 1; j <= 13; j++) {
			list.push(new Poker(type, j));
		}
	}
	list.shuffle();
	return list;
}

// 洗牌
function shuffleAdd12(){
	var list = new Array();
	for(var i = 1; i <= 4; i++){
		var type = '';
		if(i==1)
			type = ColourType.heitao;
		else if(i==2)
			type = ColourType.hongtao;
		else if(i==3)
			type = ColourType.meihua;
		else
			type = ColourType.fangkuai;

		for (var j = 1; j <= 13; j++) {
			list.push(new Poker(type, j));
		}
	}
	// console.log("[manager/shuffleAdd12]list11:" + list)
	for (var m = 1; m <= 8; m++) {
		list.push(new Poker(ColourType.teshu, 0 - m ));
	}
	list.shuffle();
	// console.log("[manager/shuffleAdd12]list22:" + list)
	return list;
}


//数组洗牌
Array.prototype.shuffle = function() {
	var input = this;
	for (var i = input.length-1; i >=0; i--) {
		var randomIndex = Math.floor(Math.random()*(i+1));
		// console.log("randomIndex:--" + randomIndex +"--i--:"+ i)
		var itemAtIndex = input[randomIndex];
		// console.log("itemAtIndex:--" + itemAtIndex +"--itemAtIndex.name:--" + itemAtIndex.name) 
		input[randomIndex] = input[i]; 
		input[i] = itemAtIndex;
	}
	return input;
}



//  var pm = new PokerManager();
//  var pokerList = new Array();
// // var pokerList2 = new Array();

// var poker111 = new Poker(ColourType.fangkuai, 5);
// var poker222 = new Poker(ColourType.fangkuai, 3);
// var poker333 = new Poker(ColourType.hongtao, 1);
// var poker11 = new Poker(ColourType.hongtao, 5);
// var poker22 = new Poker(ColourType.teshu, -1);
// pokerList.push(poker111);
// pokerList.push(poker222);
// pokerList.push(poker333);
// pokerList.push(poker11);
// pokerList.push(poker22);
// pokerList2.push(poker33);

// try{
// 	var player1 = new Player("uid","userName","avatar");
// 	var player2 = new Player("uid2","userName2","avatar2");
// 	player1.setPokerList(pokerList);
// 	player2.setPokerList(pokerList2);
// 	var a = pm.ComparePoker(player1,player2,"123");
//	var a = new PokerManager().cal(pokerList);
// 	// var wb = new PokerPlayHelp().getPokerWraper(pokerList2);
// 	console.log("1");
// } catch(err){
// 	err;
// 	console.log(err);
// }
