/* exported trace */

// Logging utility function.
function trace(arg) {
	var now = (window.performance.now() / 1000).toFixed(3);
	console.log(now + ': ', arg);
}

/**
 * 设置cookie
 * 
 * @param name
 * @param value
 * @returns
 */
function setCookie(name, value) {
	var Days = 30;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + ";expires="
			+ exp.toGMTString();
}

/**
 * 从cookie中取值
 * 
 * @param name
 * @returns
 */
function getCookie(name) {
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

	if (arr = document.cookie.match(reg))

		return unescape(arr[2]);
	else
		return null;
}

/**
 * 删除cookie
 * 
 * @param name
 * @returns
 */
function delCookie(name) {
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval = getCookie(name);
	if (cval != null)
		document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}

/**
 * 从url中取参数
 * 
 * @param name
 * @param url
 * @returns
 */
function getParameterByName(name, url) {
	if (!url)
		url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");

	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"), results = regex
			.exec(url);

	if (!results)
		return null;
	if (!results[2])
		return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * 格式化时间
 * 
 * @param value
 * @returns
 */
function formatSeconds(value) {
	var theTime = parseInt(value);// s
	var theTime1 = 0;// m
	var theTime2 = 0;// h
	if (theTime >= 60) {
		theTime1 = parseInt(theTime / 60);
		theTime = parseInt(theTime % 60);
		if (theTime1 >= 60) {
			theTime2 = parseInt(theTime1 / 60);
			theTime1 = parseInt(theTime1 % 60);
		}
	}
	var result = "" + parseInt(theTime) < 10 ? "0" + theTime : theTime;
	// if (theTime1 > 0)
	{
		result = "" + (parseInt(theTime1) < 10 ? "0" + theTime1 : theTime1)
				+ ":" + result;
	}
	if (theTime2 > 0) {
		result = "" + (parseInt(theTime2) < 10 ? "0" + theTime2 : theTime2)
				+ ":" + result;
	}
	return result;
}

/**
 * guid
 * 
 * @returns
 */
function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16)
				.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4()
			+ s4() + s4();
}

/**
 * 取得现在时间的时分秒
 * 
 * @returns
 */
function getTime() {
	var date = new Date();
	var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
	var minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date
			.getMinutes();
	var second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date
			.getSeconds();
	return hour + ":" + minute + ":" + second;
}

/**
 * 设置footer位置
 * 
 */
$(function() {
	function footerPosition() {
		$("footer").removeClass("fixed-bottom");
		var contentHeight = document.body.scrollHeight, // 网页正文全文高度
		winHeight = window.innerHeight;// 可视窗口高度，不包括浏览器顶部工具栏
		if (!(contentHeight > winHeight)) {
			// 当网页正文高度小于可视窗口高度时，为footer添加类fixed-bottom
			$("footer").addClass("fixed-bottom");
		} else {
			$("footer").removeClass("fixed-bottom");
		}
	}
	footerPosition();
	$(window).resize(footerPosition);
});