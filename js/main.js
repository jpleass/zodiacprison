const $ = require('jquery');
const loadsvg = require('load-svg');
const CircleSlider = require("circle-slider");
const ml5 = require("ml5");
const sliderOptions = {
  snap: 30,
  clockwise: false,
  startPos: "top",
};
const cs = new CircleSlider("slider", sliderOptions);


let charRNN;
let textInput;
let lengthSlider;
let tempSlider;
let button;
let runningInference = false;


function setupml5() {
  // Create the LSTM Generator passing it the model directory
  charRNN = ml5.charRNN('./models/prison2/', modelReady);
}


function modelReady() {
  console.log('Model Loaded');
}

// Generate new text
function generateTatoo(starsign) {
  // prevent starting inference if we've already started another instance
  // TODO: is there better JS way of doing this?
 if(!runningInference) {
    runningInference = true;

    // Update the status log
    $('#text').text('Generating...');

    // Grab the original text
    let original = '@'+ starsign + '=';
    // Make it to lower case
    let txt = original.toUpperCase();

    // Check if there's something to send
    if (txt.length > 0) {
      // This is what the LSTM generator needs
      // Seed text, temperature, length to outputs
      // TODO: What are the defaults?
      let data = {
        seed: txt,
        temperature: 0.5,
        length: 50
      };


      // Generate text with the charRNN
      charRNN.generate(data, gotData);

      // When it's done
      function gotData(err, result) {
        // Update the status log
        var parseText = result.sample.split('<')[0];
        var starSign = txt.split('=')[0];
            starSign = starSign.substring(1);
        var location = parseText.split('>')[0];
        var tattoo = parseText.split('>')[1];
            // console.log(parseText);
            console.log(starSign);
            console.log(location);
            console.log(tattoo);
            console.log(result.sample);
            // console.log(result.sample);
        $('#text').html(
          `<p>${starSign}</p>
          <p>${location}</p>
          <p>${tattoo}</p>`
          );
        // console.log(txt, result, result.sample);
        runningInference = false;
      }
    }
  }
}



function circleSlider(){

  cs.on("sliderMove", (angle) => {
    var $svg = $('svg g').eq(11-Math.round(angle/30));
  	var starsign = $svg.attr('id');

      $svg.addClass('active').siblings('g').removeClass('active');
      $('#text').text(starsign);
  });

  cs.on("sliderUp", (angle) => {
    var $svg = $('svg g').eq(11-Math.round(angle/30));
    var starsign = $svg.attr('id');
    generateTatoo(starsign);
  })

}


$(document).ready(function() {
  circleSlider();
  setupml5();

	var svgWrapper = document.getElementById('svg');
	
	loadsvg('images/ZodiacPrison_2.svg', function (err, svg) {
		svgWrapper.appendChild(svg);
		cs.setAngle(0);
	});



});