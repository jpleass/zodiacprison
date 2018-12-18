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

let generationCount = 1;


function setupml5() {
  // Create the LSTM Generator passing it the model directory
  charRNN = ml5.charRNN('./models/prison3/', modelReady);

  $('#tempSlider').on('change', function(event) {
    console.log('Hey');
    showVal($(this).val());
  });

  function showVal(newVal){
    document.getElementById("temperature").innerHTML=newVal;
  }
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
    $('#text').removeClass('larger').text('Generating...');

    // Grab the original text
    let original = '@'+ starsign + '=';
    // Make it to lower case
    let txt = original.toUpperCase();
    console.log(txt);

    // Check if there's something to send
    if (txt.length > 0) {
      // This is what the LSTM generator needs
      // Seed text, temperature, length to outputs
      // TODO: What are the defaults?
      let data = {
        seed: txt,
        temperature: $('#tempSlider').val(),
        length: 50
      };


      // Generate text with the charRNN
      console.log(data.temperature);
      charRNN.generate(data, gotData);

      // When it's done
      function gotData(err, result) {
        
        // Update the status log
        var parseText = result.sample.split('<')[0];
        var starSign = txt.split('=')[0];
            starSign = starSign.substring(1);
        var location = parseText.split('>')[0];
        var tattoo = parseText.split('>')[1];
            
            if (tattoo && location) {
              generationCount = 1;
              $('#sliderWrapper').addClass('inactive');
              $('#svgWrapper').addClass('zoom');
              $('#text').hide(0);
              console.log('Everything is here.');
              $('#text').addClass('larger').html(
              `<p><span class="starsign">${starSign}</span></p>
               <p><span class="subtitle">location</span></p>
               <p id="tatooLocation">${location}</p>
               <p><span class="subtitle">Description</span></p>
               <p>${tattoo}</p>`
              ).delay(500).fadeIn(500, function(){
                $('#svgWrapper').addClass('back-state');
                $('#svgWrapper').one('click', function(){ 
                  $('#text').fadeOut(250, function(){
                    $(this).removeClass('larger');
                    $('#text').text(starsign).fadeIn(250);
                   $('#sliderWrapper').removeClass('inactive');
                  });
                   $('#svgWrapper').removeClass('zoom back-state');
                });
              });
            } else {
              var period = '.';
              console.log('Stuff Missing');

              $('#text').html('Generating' + period.repeat(generationCount));
              generationCount++;
              if (generationCount > 3) {
                generationCount = 1;
              }
              runningInference = false;
              charRNN.generate(data, gotData);
            }

        
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