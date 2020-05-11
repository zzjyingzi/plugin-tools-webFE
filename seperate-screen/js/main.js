/**
 * Created by zhangzhijie on 2017/08/31.
 */
(function() {
  var lastTime = 0;
  var vendors = ['webkit', 'moz'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
      window[vendors[x] + 'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
      var id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}());

(function ($,window) {
  var hSlider = function (options) {
    this.options = {
      type: "",
      count:4,
      rate: 1  //0.6-1.2
    };
    jQuery.extend(this.options, options);
    this.isIE = isIE();
    this.init()
  };

  function isIE() {
    var ieVersion = eval("''+/*@cc_on" + " @_jscript_version@*/-0") * 1;
    if(ieVersion === 5.8 || ieVersion === 5.7 ||ieVersion === 5.6 || ieVersion === 5.5){
      var div = document.createElement("div");
      div.style.position = "absolute";
      div.style.left = "0";
      div.style.top = "0";
      div.style.width = "100%";
      div.style.height = "100%";
      div.style.zIndex = "9999";
      div.style.backgroundColor = "#ffffff";
      div.style.textAlign = "center";
      div.style.color = "#000000";
      div.style.fontSize = "16px";
      div.style.lineHeight = "50px";
      div.innerHTML = "请使用IE9及以上版本浏览器或非IE浏览器浏览本页！";
      document.querySelector("html").appendChild(div);
    }
    return ieVersion === 5.9
  }

  //取得移动均值
  function uniformity(startSize,endSize) {
    return (endSize - startSize)/10
  }

  function cancelBubble(e) {
    if(e.stopPropagation){
      e.stopPropagation()
    }else{
      window.cancelBubble = true
    }
  }

  hSlider.prototype = {
    init : function () {
      this.controlStatus();
    },
    fold: function ($ele) {//click，扩大，显示详细信息,右侧变化
      //判断哪个li的尺寸大于标准尺寸
      var _this = this;
      var screenWidth = $("body").width();
      var standardWidth = screenWidth / _this.options.count;
      var extendWidth = screenWidth * 0.34;
      var siblingWidth = (screenWidth - extendWidth)/(_this.options.count - 1);
      var $li = this.options.elements.find("li");
      var index = $li.index($ele);
      var step = uniformity(standardWidth,extendWidth);
      var opacity = 0;
      var $siblings = $ele.siblings("li");
      var n = 0;
      for(var i = 0 ; i < $siblings.length ; i++){
        if($li.index($siblings.eq(i)) > index){
          n = n + 1
        }
      }
      step = step * _this.options.rate^index;//速率

      var _trans = function () {
        opacity = opacity + 0.04 <= 1 ? opacity + 0.04 : 1 ;
        if(siblingWidth < step){
          siblingWidth = 0
        }else{
          siblingWidth = siblingWidth - step;
        }
        if(index !== 0){//不是第一个
          //判断当前元素的左侧有多少个，测定右侧info内容
          if(siblingWidth >= 0){
            $siblings.width(siblingWidth).css({opacity: 1 - opacity})
          }
          $ele.find(".hs_information").width(screenWidth - standardWidth - siblingWidth*n).show().css({opacity: opacity});
        }else{ //第一个
          if(opacity <=  1){
            $ele.find(".hs_information").width(screenWidth - standardWidth).show().css({opacity: opacity});
            $siblings.width(siblingWidth).css({opacity: 1 - opacity})
          }
        }
        if($ele.siblings("li").eq(0).width() <= 0){
          _this.loading = false;
          return;
        }

        window.requestAnimationFrame(_trans);
      };
      _trans();
    },
    unfold: function ($ele) { //click,缩小，隐藏信息，右侧变化
      var _this = this;
      var screenWidth = $("body").width();
      var standardWidth = 1 / _this.options.count;
      var step = uniformity(0,standardWidth);
      var $siblings = $ele.siblings();
      var unfoldWidth = 0;
      var process = 1;
      var $info = $ele.find(".hs_information");
      var _recover = function () {
        var a = true,b = true;
        process = parseInt((process - 0.1)*100)/100;
        //之前
        unfoldWidth = unfoldWidth + step;
        if(unfoldWidth <= standardWidth){
          $siblings.width(unfoldWidth*screenWidth).css({opacity: 1 - process});
        }else if( unfoldWidth > standardWidth && unfoldWidth - standardWidth <= step){
          unfoldWidth = standardWidth;
          $siblings.width(unfoldWidth*screenWidth).css({opacity: 1 - process});
        }else{
          a = false
        }
        if(process >= 0){
          //处理info
          $info.css({opacity: process});
        }else{
          $info.hide();
          b = false
        }
        if(a || b){
          window.requestAnimationFrame(_recover)
        }
      };
      _recover()
    },
    controlStatus: function (e) {
      var _this = this;
      window.onresize = function (e) {
        $("#hSlider").css({zoom:1});
        var screenWidth = $("body").width();
        if(!(_this.options.elements.hasClass("statusShow"))){
          _this.options.elements.find("li").width(screenWidth/_this.options.count)
        }
      };
      this.options.elements.find("li").mouseenter(function (e) {
        $(this).addClass("active")
      }).mouseleave(function (e) {
        $(this).removeClass("active")
      }).click(function (e) {
        var $this = $(this);
        var $elements = _this.options.elements;
        if($elements.hasClass("statusShow")) {
          $elements.removeClass("statusShow");
          $this.css({"z-index":1}).removeClass("present");
          _this.unfold($this);
        }else{
          $elements.addClass("statusShow");
          $this.css({"z-index":10}).addClass("present").siblings("li").css({"z-index":1});
          _this.fold($this);
        }
      });
      _this.options.elements.find(".hs_information").on("click",function(e){
        cancelBubble(e);
      })
    }
  };
  window.hSlider = hSlider;
}($, window));
