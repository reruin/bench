(function(){

var els = Array.prototype.slice.call($('#note').find('[label="港澳台"]').prevAll()).reverse();

var i = -1 , ret = [] , group_index = -1, group_title = '' , id;

var retry = 3;
function process(){

	var url = "/traceroute.php?as=1&a=get&n=1&id="+id+"&ip=114.114.114.114";

	$.ajax({
		type:'get' , 
		url : url , 
		success : function(resp){
			retry = 3;
			exec(resp);
		},
		error:function(){
			if(retry--){
				process()
			}else{
				retry = 3;
				next();
			}
		}
	});
}

function exec(j){
	var scr = j
		.replace(/(parent\.resp_ip|parent\.resp_complete|parent\.set_map_data)/g,'noop')
		.replace(/parent\.resp_once/g,'p')
		.replace(/<\/?script>/g,';');
	scr = 'var d = [];var noop=function(){};var p=function(a,b){d.push(b[0])};'+scr + ';return d;';
	var fn = new Function(scr)
	var d = fn();
	for(var k = 0;k<d.length;k++){

		var ip = d[k].ip;
		var area = d[k].area.replace(/\s/g,'');
		if(ip) ip = ip.replace(/(<\/?a[^>]*?>|\*)/g,'');
		console.log(d[k].area,ip);

		if(
			ip && area != '局域网' && 
			!/(172\.1[6-9]|172\.2[0-9]|172\.3[0-1]|192\.168\.|127\.0\.0\.1|localhost|0\.0\.0\.0)/.test(ip)
		){
			ret.push({id:id,ip:ip,title:title,group:group_title});
			console.log(ret.length,JSON.stringify(ret))
			next()
			return;
		}
	}
	next()
	return;
}

function next(){
	i++;
	if(i>=els.length) return;
	if( els[i].tagName == 'OPTGROUP'){
		group_index++;
		group_title = $(els[i]).text();
		next();
	}
	else{
		id = $(els[i]).val();
		title = $(els[i]).text();
		process(id)
	}
}

function format(a){
	a.forEach(function(b) {
	    var c = b.title;
	    if(/(阿里云|腾讯云|青云|景安|BGP)/.test(c)) b.isp='多线';
	    else if (c.indexOf('电信') >= 0) { b.isp = '电信' } 
		else if (c.indexOf('联通' >= 0)) { b.isp = '联通' } 
		else if (c.indexOf('移动' >= 0)) { b.isp = '移动' } 
		else if (c.indexOf('铁通' >= 0)) { b.isp = '铁通' } 
		else { b.isp = "多线" };
		b.title = b.title.replace(/\(/g,'_').replace(/\)/g,'');
	});
}

next();


}());