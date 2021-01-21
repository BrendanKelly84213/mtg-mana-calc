// GLOBAL DATA

// For readability when getting colors from array
const red=0, blue=1, green=2, black=3, white=4;
// Color inputs
const elements = document.getElementsByClassName("color"); 
// Most common magic the gathering deck size
// For when user doesn't input deck size
const standardDeckSize = 60;

// Helper function
// Check if user inputs bad data and handle accordingly
function handle(data) {
	const handled = Math.round(Number(data)); // Make data integer
	return (isNaN(handled) || handled < 0) ? 0 : handled;
}

// The user inputted number of spells
function totalSpells() {
	const totalElem = document.getElementById("total-spells"); 
	let total = totalElem.value;

	return handle(total);
}

// User inputted colors
function colorsArr() {
	let colors = [];
	for(let i=0; i<elements.length; ++i) {
		colors[i] = handle(elements[i].value);
	}

	return colors;	
}

// Return the sum of the elements of an array
function sum(arr) {
	let total = 0;
	for(let i=0; i<arr.length; ++i) {
		total += arr[i];
	}
	return total;
}

// Assumes 60 card format if no input or 0 is given
// Returns the number of lands suggested 
function numLands() {
	let deckSize = handle(document.getElementById('deck-size').value);
	
	return deckSize ? deckSize - totalSpells() 
			: standardDeckSize  - totalSpells();
}

// Get the number of mana per color 
function numColors() {
	const colors = colorsArr();
	// Compute scaler 
	// c(x1 + x2 + ... + xn) = m
	// c = m / (x1 + x2 + ... xn)
	const c = sum(colors) ? numLands() / sum(colors) : 0;
	// Get colors scaled and handled
	const scaledColors = colors.map(x => handle(x * c));
		
	return scaledColors;
}

// The main function, handles IO
function show() {
	const data = numColors();
	// Initialize data object for use in d3 donut chart
	let dataObj = new Object;

	// For mapping on line 85
	const indices = ['red','blue','green','black', 'white'];

	// Get the html for the lands for later use
	let landsHtml = document
	.getElementById('total-lands')
	.children[1];
	
	let totalLands = numLands();

	//Ensure negative land number can't happen
	if(totalLands < 0) {
		landsHtml.innerText = "More than the size of the deck";
	} else {
		landsHtml.innerText = totalLands;
	}
	
	for(let i=0; i<indices.length; ++i) {
		// Build Data object from array
		dataObj[indices[i]] = data[i];

		// Put resulting data into each respective <td>
		// id=red gets data[red] and so on
		document
		.getElementById(indices[i] + '-result')
		.children[1]
		.innerText = data[i];	
	}	
	
	// Donut chart copied directly from d3 example 
	// https://www.d3-graph-gallery.com/graph/donut_basic.html
	function printChart(id) {
		// set the dimensions and margins of the graph
		let width = 200,
		    height = 200,
		    margin = 25;

		// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
		let radius = Math.min(width, height) / 2 - margin;

		// append the svg object to the div called 'my_dataviz'
		let svg = d3.select(id)
		  .append("svg")
		    .attr("width", width)
		    .attr("height", height)
		  .append("g")
		    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


		// set the color scale
		let color = d3.scaleOrdinal()
		  .domain(dataObj)
		  .range(["red", "blue", "green", "black", "white"]);


		// Compute the position of each group on the pie:
		let pie = d3.pie()
		  .value(d => d.value)
		let data_ready = pie(d3.entries(dataObj));

		// The arc generator
		let arc = d3.arc()
		  .innerRadius(radius * 0.5) // This is the size of the donut hole
		  .outerRadius(radius * 0.8);

		// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
		svg
		  .selectAll('whatever')
		  .data(data_ready)
		  .enter()
		  .append('path')
		  .attr('d', d3.arc()
		    .innerRadius(100) // This is the size of the donut hole
		    .outerRadius(radius)
		  )
		  .attr('fill', d => color(d.data.key))
		  .style("opacity", 0.6);
				
	}
	
	// Clear chart
	d3.select("#mana-spread" )
	  .selectAll("*")
	  .data([])
	  .exit()
	  .remove();

	printChart("#mana-spread");
};

// Update data on page load
window.onload = show();

// Update data on user input (typing into form)
(function update() {
	let deckSizeDom = document.getElementById('deck-size');
	let totalSpellsDom = document.getElementById('total-spells');
	let colorsDom = document.getElementsByClassName('color');

	totalSpellsDom.addEventListener('input', show);
	deckSizeDom.addEventListener('input', show);
	Array.from(colorsDom).forEach(x => x.addEventListener('input', show));
})();
