(function() {
  var audioCtx = new AudioContext();
  var gainNode = audioCtx.createGain();
  gainNode.connect(audioCtx.destination);

  // playback object, will contain all sequenced sounds
  var playback = [];

  var voiceSet = {
    'drum01'   : '../sounds/drum03.mp3',
    'drum02'  : '../sounds/drum01.mp3',
    'g'       : '../sounds/Gstrum.mp3',
    'a'       : '../sounds/Astrum.mp3',
    'd'       : '../sounds/Dstrum.mp3',
    'm'      : '../sounds/click.mp3'
  };

  // set up the defaults
  var freestyle    = false,
      context      = new webkitAudioContext(),
      source,
      sequencer;

  var bar = 16,                 //  beats in the bar
      tempo = 120,              // bpm
      beat = 60 / tempo * 1000, // beat duration
      curBeat = 0;

  var button = document.getElementById('stop');

  button.addEventListener('click', function() {
    clearInterval(sequencer);
  });

  // load all of the sounds and then when ready kick off the sounds setup and bindings
  var assets = new AbbeyLoad([voiceSet], function (buffers) {
    setupSounds(buffers)
  });

  
  function getData() {
    var c = document.getElementById('canvas');
    var ctx = c.getContext('2d');

    //  load the sound file in question
    var request = new XMLHttpRequest();
    request.open('GET', '/sounds/closing-doors.WAV', true);
    request.responseType = 'arraybuffer';

    // when it loads sound file
    request.onload = function() {
      var audioData = request.response;
      // decode audio!
      audioCtx.decodeAudioData(audioData, function(buffer) {
        var data = buffer.getChannelData(0);
        var l = data.length;
        console.log('data length:', l);

        var average = 0;

        // how many samples should we average together in chunks to create enough seats?
        var modulo = Math.ceil(l / bar);

        for (var i = 0; i < l; i += 1) {

          // calculate rolling average
          average = (average + data[i]) / 2;

          // if we're at a 'beat', create a seat!
          if (i % modulo === 0) {
            var r, g, b;
            var colour;
            var sound = undefined;
            var strum = undefined;

            // console.log('average', average);

            if (average > 0.2) {
              strum = 'g';
            }

            if (average < -0.2) {
              strum = 'a';
            }

            if (average > 0.3) {
              strum = 'd';
            }

            if (average < 0) {
              // yellow
              colour = '#FFC51B';
              sound = 'drum01';
            } else {
              // orange
              colour = '#FF7302';
              sound = 'drum02';
            }

            var block = (i / modulo);
            var size = 40;
            var posX = 1 + block * size * 1.15;
            var posY = 10;

            // console.log('i:', i, 'posX:', posX, 'posY:', posY)

            ctx.fillStyle = colour;
            ctx.strokeStyle = '#000';
            ctx.strokeRect(posX, posY, size, size);
            ctx.fillRect(posX, posY, size, size);

            if (sound) { playback.push({position: block, sound: sound}) }
            if (strum) { playback.push({position: block, sound: strum}) }

            average = 0;
          }
        }

        // #FF7302 - orange r255 g115 b2
        // #FFC51B - yellow r255 g192 b27

        console.log('done gud:', l);
      },

      function(e) {
        console.log("Error with decoding audio data" + e.err);
      });
    }

    request.send();
  }


  // this will push a short sound for each beat to the playback object
  function createMetronome() {
    for (i = 0; i < bar; i++) {
      playback.push({position: i, sound: 'm'});
    }
  }

  // play that sound
  function playSound(buffer, time) {
    source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(time);
  }


  // set up the shoes
  function setupSounds(buffers) {

    // Loop every n milliseconds, executing a task each time
    // the most primitive form of a loop sequencer as a simple example
    sequencer = setInterval(function() {

      playback.forEach(function(note){

        if (note.position === curBeat) {
          // play the sound
          playSound(buffers[note.sound], 0);
        }

      });
      // reset beat back to 0
      curBeat = (curBeat === bar - 1) ? 0 : curBeat += 1;

    }, beat);

  }; // end setupSounds



  getData();
})();
