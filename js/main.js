var calculate = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var stofdata = getStof(),
	zoomdata = getZoom(),
	datedata = getDates(),
	weatherdata = getWeather(),
	zoom = 12,
	day = 0,
	soort = "fijnstof"

var map = L.map('map').setView([52.370216, 4.895168], zoom);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
	maxZoom: 17,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="http://mapbox.com">Mapbox</a>',
	id: 'mapbox.light'
}).addTo(map);

updateDay(day);
updateWeather(day);

for (var i = 0; i < stofdata.length; i++) {

		L.marker([stofdata[i].coordinates.lat, stofdata[i].coordinates.lon], {icon: L.divIcon({iconSize: new L.Point("100%", "100%"), className: "id-" + stofdata[i].id })}).addTo(map);

		document.getElementsByClassName("id-" + stofdata[i].id)[0].id = "point-" + stofdata[i].id;

		createForce(stofdata[i].id, zoom, day)

}

TweenMax.staggerFrom(".stofcirkel", 1.5, {
	opacity: 0,
	delay: 0
}, 0.005)

function createForce(location, zoom, day) {

	var width = zoomdata[0][zoom].d,
		height = zoomdata[0][zoom].d,
		nodes = [],
	    links = [],
	    margin = zoomdata[0][zoom].d / 2;

	d3.select("#force-" + location).remove()

	if(soort !== "fijnstof") {
		for(var i = 0; i < Math.round(stofdata[location].ultrafijnstof[day]); i++) {
			nodes.push({fill: "value"})
		}		
	}
	else {
		for(var i = 0; i < Math.round(stofdata[location].fijnstof[day]); i++) {
			nodes.push({fill: "value"})
		}
	}

	var svg = d3.select("#point-" + location).append("svg")
		.attr("class", "circle-container")
		.attr("id", "force-" + location)
	    .attr("width", width)
	    .attr("height", height)
	    .attr("left", margin)
	    .attr("top", margin)
	    .attr("position", "absolute");

	var force = d3.layout.force()
	    .linkDistance(10)	    
	    .nodes(function() {
	    	return nodes;
	    })
	    .links(function() {
	    	return links;
	    })
	    .start()

	var node = svg.selectAll(".node")
	    .data(nodes)
	    .enter().append("g")
	    .attr("class", "node")

	var box = node.append("circle")
	    .attr("cx", function(d) {
	    	return calculate(10, zoomdata[0][zoom].d - zoomdata[0][zoom].r);
	    })
	    .attr("cy", function(d) {
	    	return calculate(10, zoomdata[0][zoom].d - zoomdata[0][zoom].r);
	    })	    
	    .attr("r", function(d) {
	    	return zoomdata[0][zoom].r;
	    })
	    .attr("class", function(d) {
	    	return soort + " stofcirkel"
	    })	    


}

function updateDay(day) {
	document.getElementById("dag").innerHTML = datedata.datum[day]
}

function updateWeather(day) {

	var draai = 0;

	switch(weatherdata[day].richting) {
		case "W":
			draai = 0;
			break;
		case "NW":
			draai = 45;
			break;
		case "N":
			draai = 90;
			break;
		case "NO":
			draai = 135;
			break;		
		case "O":
			draai = 180;
			break;
		case "ZO":
			draai = 225;
			break;
		case "Z":
			draai = 270;
			break;
		case "ZW":
			draai = 315;
			break;	
	}

	TweenMax.to("#wijzer", 1, {
		transformOrigin: "50% 50%",
		scale: 0.6 + (weatherdata[day].wind / 5),
	}, 0.2)

	TweenMax.to("#pointer", 1, {
		transformOrigin: "65% 50%",
		rotation: draai
	}, 0.2)

	document.getElementById("metadata").innerHTML = weatherdata[day].richting + " richting en " + weatherdata[day].wind + " km/h";

}

map.on('zoomend', function() {

	var currentzoom = map.getZoom();

	d3.selectAll(".circle-container")
	    .attr("width", zoomdata[0][currentzoom].d)
	    .attr("height", zoomdata[0][currentzoom].d)
	    .attr("left", zoomdata[0][currentzoom].d / 2)
	    .attr("top", zoomdata[0][currentzoom].d / 2)

	d3.selectAll(".stofcirkel")
	    .attr("cx", function(d) {
	    	return calculate(10, zoomdata[0][currentzoom].d - zoomdata[0][currentzoom].r);
	    })
	    .attr("cy", function(d) {
	    	return calculate(10, zoomdata[0][currentzoom].d - zoomdata[0][currentzoom].r);
	    })	    
	    .attr("r", function(d) {
	    	return zoomdata[0][currentzoom].r;
	    })

	TweenMax.staggerFrom(".stofcirkel", 1, {
		opacity: 0,
		delay: 0
	}, 0.001)

});

document.getElementById("continue").addEventListener("click", function() {

	day++
	if(day > 30) {
		day = 0;
	}

	updateDay(day)
	updateWeather(day)

	var currentzoom = map.getZoom();

	for (var i = 0; i < stofdata.length; i++) {
		createForce(stofdata[i].id, currentzoom, day)
	}

	TweenMax.staggerFrom(".stofcirkel", 0.5, {
		opacity: 0,
		delay: 0
	}, 0.001)

});

document.getElementById("previous").addEventListener("click", function() {

	day--
	if(day < 0) {
		day = 30;
	}

	updateDay(day)
	updateWeather(day)

	var currentzoom = map.getZoom();

	for (var i = 0; i < stofdata.length; i++) {
		createForce(stofdata[i].id, currentzoom, day)
	}

	TweenMax.staggerFrom(".stofcirkel", 0.5, {
		opacity: 0,
		delay: 0
	}, 0.001)

});

document.getElementById("stofsoort").addEventListener("click", function() {

	if(soort !== "fijnstof") {
		soort = "fijnstof"
		$("#bolletje").css("background-color","#F68E2F");
	}
	else {
		soort = "ultrafijnstof"
		$("#bolletje").css("background-color","#EB4040");
	}

	var currentzoom = map.getZoom();

	for (var i = 0; i < stofdata.length; i++) {
		createForce(stofdata[i].id, currentzoom, day)
	}

	TweenMax.staggerFrom(".stofcirkel", 0.5, {
		opacity: 0,
		delay: 0
	}, 0.001)

});

$('#video').click(function(){
  $('#video').hide()
})

