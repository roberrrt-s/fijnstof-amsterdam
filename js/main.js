/* Functie om een willkeurig getal in een range te genereren */
var calculate = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Globala variablen declareren */
var stofdata = getStof,
	zoomdata = getZoom(),
	datedata = getDates(),
	weatherdata = getWeather(),
	zoom = 12,
	day = 0,
	soort = "fijnstof";

/* Verberg de grafiek standaard */
$('#grafiek').hide();

/* Declareer leaflet map en zet de view op Amsterdam */
var map = L.map('map').setView([52.370216, 4.895168], zoom);

/* Genereer een map op de kaart */
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoicm9iZXJ0c3BpZXIiLCJhIjoiY2lqeGU5ZzRiMHZob3YybTUxYnhtdmZ3eCJ9.w9zbm8h1PwES8y-vN12X7w', {
	maxZoom: 17,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,' +
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="http://mapbox.com">Mapbox</a>',
	id: 'mapbox.light'
}).addTo(map);

/* Roep de functies aan waarmee de content gegenereert wordt */
updateDay(day);
updateWeather(day);
createGraph(day)

/* Plaats de svg's met stofdeeltjes en de meetstations op de kaart */
for (var i = 0; i < stofdata.length; i++) {
	var information = L.marker([stofdata[i].coordinates.lat, stofdata[i].coordinates.lon], {icon: L.icon({ iconUrl: "images/marker-icon.png", className: "location-icon"})}).addTo(map).bindPopup("Dit meetstation bevindt zich op:<br> <span class='popup-info'>" + stofdata[i].name + "</span>");;
}
for (var i = 0; i < stofdata.length; i++) {
		L.marker([stofdata[i].coordinates.lat, stofdata[i].coordinates.lon], {icon: L.divIcon({iconSize: new L.Point("100%", "100%"), className: "id-" + stofdata[i].id })}).addTo(map);
		document.getElementsByClassName("id-" + stofdata[i].id)[0].id = "point-" + stofdata[i].id;
		createForce(stofdata[i].id, zoom, day)
}

/* Geef de cirkels een mooie fade mee */
TweenMax.staggerFrom(".stofcirkel", 1.5, {
	opacity: 0,
	delay: 0
}, 0.005)

/* Creeër de cirkels in de svg's om de stofdeeltjes te visualiseren */
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

/* Zet de huidige dag neer */
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

	$("#metadata").html(weatherdata[day].richting + " richting en " + weatherdata[day].wind + " km/h");

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

$("#continue").click(function() {

	day++
	if(day > 30) {
		day = 0;
	}

	updateDay(day)
	updateWeather(day)
	createGraph(day)

	var currentzoom = map.getZoom();

	for (var i = 0; i < stofdata.length; i++) {
		createForce(stofdata[i].id, currentzoom, day)
	}

	TweenMax.staggerFrom(".stofcirkel", 0.5, {
		opacity: 0,
		delay: 0
	}, 0.001)

});

$("#previous").click(function() {

	day--
	if(day < 0) {
		day = 30;
	}

	updateDay(day)
	updateWeather(day)
	createGraph(day)

	var currentzoom = map.getZoom();

	for (var i = 0; i < stofdata.length; i++) {
		createForce(stofdata[i].id, currentzoom, day)
	}

	TweenMax.staggerFrom(".stofcirkel", 0.5, {
		opacity: 0,
		delay: 0
	}, 0.001)

});

$("#stofsoort").click(function() {

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

	createGraph(day)

	TweenMax.staggerFrom(".stofcirkel", 0.5, {
		opacity: 0,
		delay: 0
	}, 0.001)

});

$('#video').click(function(){
  $('#video').hide()
})

$('#displaygraph').click(function() {
	$('#grafiek').toggle();
})

function createGraph(day) {

	var margin = {top: 20, right: 20, bottom: 20, left: 40},
	width = 400 - margin.left - margin.right,
	height = 400 - margin.top - margin.bottom;

	var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

	var y = d3.scale.linear().range([height, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(10);

		d3.select("#grafiek svg").remove()

	var svg = d3.select("#grafiek").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", 
			  "translate(" + margin.left + "," + margin.top + ")");

	d3.json("data/data.json", function(error, data) {

	    data.forEach(function(d) {
	        console.log(Math.round(d.fijnstof[day]))
	        console.log(d.name)
	    });

		
	x.domain(data.map(function(d) { return d.name; }));
	y.domain([0, d3.max(data, function(d) { if(soort === "fijnstof") {return d.fijnstof[day] } else {return d.ultrafijnstof[day] }; })]);

	  svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")

	  svg.selectAll("bar")
		.data(data)
		.enter().append("rect")
		.style("fill", function() { 
			if(soort === "fijnstof") {
				return "F68E2F";
			}
			else {
				return "EB4040";
			}
		})
		.attr("x", function(d) { return x(d.name); })
		.attr("width", x.rangeBand())
		.attr("y", function(d) { 
			if(soort === "fijnstof") {
				return  y(d.fijnstof[day]); 
			}
			else {
				return  y(d.ultrafijnstof[day]); 
			}		
		})
		.attr("height", function(d) {
			if(soort === "fijnstof") {
				return height - y(d.fijnstof[day]); 
			}
			else {
				return height - y(d.ultrafijnstof[day]); 
			}
		});

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.selectAll("text")
			.style("text-anchor", "start")
			.style("font-size", "0.8em")
			.style("z-index", "10000")
			.style("fill", "#000000")
			.attr("dx", "0.2em")
			.attr("dy", "-.55em")
			.attr("transform", "rotate(-90)" );
	});
}
