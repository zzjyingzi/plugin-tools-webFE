var quene = {
	list: [],
	stop: false,
	running: false,
	presentation: 0,

	add: function (fn, delay) {
		if( fn instanceof Array && delay instanceof Array){
			if(fn.length < delay.length){
				console.log("You have one or more fn haven't got delay time.");
				return
			}
			for(var i = 0; i < fn.length ; i++){
				this.list.push({fn: fn[i], delay: delay[i]})
			}
		}else if( typeof fn === "function"){
			this.list.push({fn: fn, delay: delay})
		}
	},

	clear: function () {
		this.list = [];
		this.reset();
	},

	run: function () {
		var _this = this;

		if (_this.running) {
			console.log("运行中...");
			return
		}
		_this.running = true;
		var list = _this.list;
		var presentation = _this.presentation;

		if (_this.presentation < list.length) {
			this.timeout = setTimeout(function () {
				if (!_this.stop) {
					list[presentation].fn();
					_this.running = false;
					_this.presentation++;
					_this.run();
				}
			}, list[presentation].delay)
		} else {
			_this.reset()
		}
	},

	reset: function () {
		this.presentation = 0;
		this.pause();
	},

	pause: function () {
		this.stop = true;
		this.running = false;
		clearTimeout(this.timeout);
	},
	continue: function () {
		if (this.running) {
			return
		}
		this.stop = false;
		this.run();
	}
};
