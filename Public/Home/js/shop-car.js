$(function() {
//	var url="http://"+location.host+"/";
	var url="http://"+location.host+"/wanbaobao/";
//	判断是否有商品
	if($("#check-list").children().length==0){
		$("#check-list").html("<h1>购物车空空如也</h1>");
	}
	
//计算价格
	(function() {
		var n = 3;
		var price = 0;

//		默认全选
		totalcount();

//		全选
		$("#checks").on("touchstart", function(e) {
			e.preventDefault();
			totalcount();
		})

//		分别计算
		$("#check-list").children("li").on("touchstart", ".check", function(e) {
			e.preventDefault();
			if($(this).hasClass("active")) {
				n--;
			} else {
				n++;
			}
			if(n >= 3) {
				$("#checks>span:eq(0)").addClass("active");
			} else {
				$("#checks>span:eq(0)").removeClass("active");
			}
			if($(this).attr("check") == "true") {
				$(this).attr("check", "false").toggleClass("active");
				price -= parseFloat($(this).siblings("div").find(".price").text()) * parseFloat($(this).siblings("div").find(".counts").text())*100;
			} else {
				$(this).attr("check", "true").toggleClass("active");
				price += parseFloat($(this).siblings("div").find(".price").text()) * parseFloat($(this).siblings("div").find(".counts").text())*100;
			}
			$("#total").html(parseFloat(price)/100);
		})
		
//		数量更改
		$("#check-list").children("li").on("touchstart", ".add", function(e) {
			e.preventDefault();
			if($(this).parent().parent().siblings(".check").hasClass("active")) {
				$(this).siblings("span").text(parseFloat($(this).siblings("span").text()) + 1);
				count();
			}
		})
		$("#check-list").children("li").on("touchstart", ".less", function(e) {
			e.preventDefault();
			if($(this).parent().parent().siblings(".check").hasClass("active")) {
				if(parseFloat($(this).siblings("span").text()) <= 2) {
					$(this).siblings("span").text(1);
				} else {
					$(this).siblings("span").text(parseFloat($(this).siblings("span").text()) - 1);
				}
				count();
			}
		})
		
//		默认计算总价
		function totalcount() {
			if($("#checks>span:eq(0)").hasClass("active")) {
				$("#checks>span:eq(0)").removeClass("active");
				for(var i = 0; i < $(".check").length; i++) {
					$(".check").attr("check", "false");
					$(".check").removeClass("active");
					price = 0;
				}
			} else {
				for(var i = 0; i < $(".check").length; i++) {
					$("#checks>span:eq(0)").addClass("active");
					$(".check").attr("check", "true");
					$(".check").addClass("active");
					price += parseFloat($(".price").eq(i).html()) * parseFloat($(".counts").eq(i).html()*100); //算出每件商品的总价;
				}
			}
			$("#total").html(parseFloat(price)/100);
		}
//			数量更改时计算价格
		function count() {
			price = 0;
			for(var i = 0; i < $(".check").length; i++) {
				if($(".check").eq(i).hasClass("active")){
					price += parseFloat($(".price").eq(i).html()) * parseFloat($(".counts").eq(i).html())*100; //算出每件商品的总价;
				}
			}
			$("#total").html(parseFloat(price)/100);
		}

//			结算
		$("#accounts").on("click", function() {
			window.localStorage.flag=1;
			var arr = [];
			var arr2 = [];
			for(var i = 0; i < $(".check").length; i++) {
				if($(".check").eq(i).hasClass("active")) {
					arr.push($("#check-list").children("li").eq(i).attr("data-goods_id"));
					arr2.push(parseInt($(".counts").eq(i).text()));
				}
			}
			$.ajax({
				url:url+"index.php/Home/Buy/checkGoods",
				type: "post",
				dataType: "json",
				data: {
					"goods_keys": arr
				},
				success: function(e) {
					if(e.error == "0") {
						for(var i = 0; i < arr.length; i++) {
							$.ajax({
								url:url+"index.php/Home/Buy/cartUpdate",
								type: "post",
								dataType: "json",
								data: {
									"data": [{
										"key": arr[i],
										"quantity": arr2[i]
									}]
								},
								success: function(e) {
									window.location.href=e.url;
								}
							})
						}
					}
				}
			})
		})
		
//			滑动删除
		$("#check-list").on("touchstart","li", function(e) {
			e.preventDefault();
			startX = e.originalEvent.changedTouches[0].pageX,
			startY = e.originalEvent.changedTouches[0].pageY;
		});
		$("#check-list").on("touchmove","li", function(e) {
			e.preventDefault();
			moveEndX = e.originalEvent.changedTouches[0].pageX,
			moveEndY = e.originalEvent.changedTouches[0].pageY,
			X = moveEndX - startX,
			Y = moveEndY - startY;
			
			if(Math.abs(X) > Math.abs(Y) && X > 65) {
				if(parseFloat($(this).css("left")) >= 0){
					$(this).css({
						"left":0
					});
				}else{
					if(X>=parseInt($(".shop-del").width())){
						X=$(".shop-del").width();
						$(this).css({
							"left":0
						});
					}else {
						$(this).css({
							"left":(X-65)+"px"
						});
					}
				}
			} else if(Math.abs(X) > Math.abs(Y) && X < -65) {
				if(X<=-parseInt($(".shop-del").width())){
					X=-$(".shop-del").width();
					$(this).css({
						"left":X+"px"
					});
				}else{
					$(this).css({
						"left":X+"px"
					});
				}
			}
			
			$("#check-list").on("touchend","li", function(e) {
				if(Math.abs(X) > Math.abs(Y) && X > 65) {
					if(Math.abs(X)>=Math.abs($(".shop-del").width())/2){
						$(this).css({
							"left":0
						});
					}else{
						$(this).css({
							"left":-parseFloat($(".shop-del").width())
						});
					}
				} else if(Math.abs(X) > Math.abs(Y) && X < -65) {
					if(Math.abs(X)>=Math.abs($(".shop-del").width())/2){
						$(this).css({
							"left":-$(".shop-del").width()
						});
					}else{
						$(this).css({
							"left":0
						});
					}
				}
			})
		})
		
		$("#check-list").on("touchstart",".shop-del",function (e) {
			e.preventDefault();
			console.log($(this).parent().attr("data-goods_id"))
			var _this = $(this).closest("li");
			$.ajax({
				url:url+"index.php/Home/Buy/cartRemove",
				type:"post",
				dataType:"json",
				data:{"goods_id":$(this).parent().attr("data-goods_id")},
				success:function (e) {
					if(e.error=="0"){
						_this.remove();
						count();
					}
				}
			})
		})
	})()
})