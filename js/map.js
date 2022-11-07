// Global variables
let map;
let markers = L.featureGroup()
let markers2 = []
let jsonObject;


var ctlEasyButton;
var ctlSidebarLeft;
var ctlSidebarRight;

// initialize
$(document).ready(function () {
	createMap();
	readJSON('../data/BH.json'); // wrong name but lets just proceed with it
	jsonObject = $.getJSON('../data/BH.json');
	

	// plugins

	ctlSidebarRight = L.control.sidebar('sidebar-right',{
		position: "right"
	}).addTo(map);
	
	ctlSidebarLeft = L.control.sidebar('sidebar').addTo(map);

	ctlEasyButton = L.easyButton('fa-exchange', function(){
		ctlSidebarLeft.toggle();

	}).addTo(map);




});


// create the map
function createMap() {
	map = L.map('map').setView([0, 0], 3);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

}




// function to read csv data
function readJSON(path) {
	// circle options
	let circleOptions = {
		radius: 5,
		weight: 1,
		color: 'white',
		fillColor: 'dodgerblue',
		fillOpacity: 1
	}
	$.getJSON(path, function (data) {
		// console.log(data.BHSurvey); //this is ok, data is received
		data.BHSurvey.features.forEach(function (item) {
			console.log(item);

			// '<img src="scenario/images/' + myVariable + '" />'
			let popUpTemplate = '<h4 style="display:table;text-align:center;margin:auto;padding-bottom:5px;text-decoration: underline;text-decoration: underline;">'+ item.properties.BHNo+
								'</h4> <ul style="list-style-type:none;"><li>Ground level:' +item.properties.GL+
								'</li><li>Location:' +item.properties.location+
								'</li><li>Order No:' +item.properties.jobOrderNo+
								'</li><li>Date:' +item.properties.startDate.substring(0, item.properties.startDate.indexOf('T')) +
								'</li><li>Ground level:' +item.properties.GL+
								'</li><li>Length(m) :' +item.properties.GL+
								'</li><li>Latitude:' + item.geometry.coordinates[0]+
								'</li><li>Longitude:' + item.geometry.coordinates[1]+
								'</li><li>Report: <a href="../pdf/'+item.properties.BHNo+'.pdf" target="_blank" rel="noopener noreferrer">Scan</a></li>'
			// <ul style="list-style-type:none;">
			// 	<li>Coffee: bla bla</li>
			// 	<li>Tea: ble ble</li>
			// 	<li>Milk: go go</li>
			//   </ul> 

			let marker = L.circleMarker(item.geometry.coordinates,{title:`${item.properties.BHNo}`,BHGeology:`${item.properties.BoreholeGeology}`,GL:`${item.properties.GL}`}, circleOptions)
				.on('mouseover', function () {
					this.bindPopup(popUpTemplate).openPopup()

				})
				.on('click', onClick);
			// add marker to featuregroup		
			markers.addLayer(marker)
			markers2.push(marker)
			// lets add the corresponding borehole to the left side bar
			$('.sidebar').append("<div class = 'sidebar-item'  style='font-weight:normal'>" + item.properties.BHNo + "</div>")

			// Set the selected marker to the current Marker, and get the corresponding borhole profile
	
		})
		markers.addTo(map)
		// fit markers to map
		// console.log(markers.getBounds())
		map.fitBounds(markers.getBounds())

		// TOC event listener + zoom center to the selected BHno
		$('.sidebar-item').click('click', function(e) {  

			markers2.forEach(function(item){

				if(item.options.title == e.target.innerHTML){

					// console.log(item.options.title)
					map.fitBounds(markers.getBounds())
					map.setView(item.getLatLng());
					drawBoreholeProfile(item);
					map.invalidateSize()

				}
			})


			
		});



	})

}

function getSelectedBHGeology(data,BHNo){
	// data.BHSurvey.features.forEach(function (item) {
	// 	if(item.options.title == BHNo){
	// 		console.log(item.properties.BHNo)
	// 	}

	// })

};

function drawBoreholeProfile(selectedBH){
	console.log(selectedBH.sourceTarget.options.GL)
	
	const ctx = document.getElementById('myChart');
	const selectedBHGeology = [];
	x = selectedBH.sourceTarget.options.BHGeology.split(",").map(Number);


	
	x.forEach(function(idx){

		jsonObject.responseJSON.BHGeology.forEach(function(item){

			if(idx == item.pk){

				selectedBHGeology.push(item)
			}
		})
		// selectedBHGeology.push(jsonObject.responseJSON.BHGeology.pk)
	})

	console.log(selectedBHGeology)
// let data_strct = {[
// 					 {% for lyr in selectedBHGeology %}
// 						{label: '{{lyr.SCIS}}',
// 						data: [{{lyr.depthEnd - lyr.depthStart}}],
// 						backgroundColor: '#994499'}
// 					{% endfor %}]}

	console.log(selectedBHGeology[0].fields.depthEnd - selectedBHGeology[0].fields.depthStart)

	const myChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: [selectedBH.sourceTarget.options.title],
			datasets: [{
				label: selectedBHGeology[0].fields.USCS,
				data: [3],
				backgroundColor: '#22aa99'
			 }, {
				label: selectedBHGeology[1].fields.USCS,
				data: [2],
				backgroundColor: '#994499'
			 }]
			}
		,
		options: {
			type: "invertedLinear",
			scales: {
				xAxes: [{
					// stacked: true // this should be set to make the bars stacked
				 }],
				
				yAxes: [{
					beginAtZero: true,
					stacked: true
				}]
			}
		}
	});
}

// callback marker click event
function onClick(e) {
 
	// console here the selected marker.bhno
	// console.log("onClickEvent - this: ")
	// console.log(this)
	drawBoreholeProfile(e)
	ctlSidebarRight.show();
}

// function drawCanvas(){
// 	var c = document.getElementById("myCanvas");
// 	var ctx = c.getContext("2d");

// 	// Create gradient
// 	var grd = ctx.createLinearGradient(0, 0, 200, 0);
// 	grd.addColorStop(0, "red");
// 	grd.addColorStop(1, "white");

// 	// Fill with gradient
// 	ctx.fillStyle = grd;
// 	ctx.fillRect(10, 10, 150, 80);
// }
// function drawBarChart(marker){
// 	childLabels= 
// 		['depthStart','depthEnd','SCIS']
	

// 	childDatasets = [{
// 		label:'BHNo',
// 		backgroundColor:["#002b80","#002b80"],
// 		data:['sc','ma','sc']
// 	}]

// 	optionsChild = {
// 		title: {
// 			display: true,
// 			text: 'Data'
// 		}
// 	}


// 	let optionsRoot = {
// 		type:'bar',
// 		data: { 
// 			labels:childLabels,
// 			datasets: childDatasets,
// 			options:optionsChild

// 	}
// 	new Chart(document.getElementById("myCanvas"),optionsRoot);
// }
	




