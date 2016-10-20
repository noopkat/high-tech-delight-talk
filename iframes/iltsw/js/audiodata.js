(function() {
  var audioCtx = new AudioContext();
  var gainNode = audioCtx.createGain();
  gainNode.connect(audioCtx.destination);

  /**
   * Converts an HSL color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes h, s, and l are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   *
   * @param   Number  h       The hue
   * @param   Number  s       The saturation
   * @param   Number  l       The lightness
   * @return  Array           The RGB representation
   */
  function hslToRgb(h, s, l){
    var r, g, b;

    h = h / 255;
    s = s / 255;
    l = l / 255;

    function hue2rgb(p, q, t){
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255, 255];
  }

  // gut check
  //console.log('rgb', hslToRgb(128, 70, 60));

  function getData() {
    var c = document.getElementById('canvas');
    var ctx = c.getContext('2d');
    // create imgdata object ready for packing with pixels
    var imgData = ctx.createImageData(300, 1000);

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

        // convert -1.0 -> 1.0 data range to 0 -> 255
        // then pass through rgb to hsl converter and set the pixels appropriately
        for (var i = 0; i < l; i += 1) {
          // convert val to clamped scale
          var val = Math.ceil((data[i] + 1) * 255 / 2);
          var rgb = hslToRgb(val / 0.7, 200, 150);
          imgData.data[i*4] = rgb[0];
          imgData.data[i*4+1] = rgb[1];
          imgData.data[i*4+2] = rgb[2];
          imgData.data[i*4+3] = rgb[3];
        }

        // put the pixels on the canvas
        ctx.putImageData(imgData, 0, 0);

        // ctx.fillStyle = "black";
        // ctx.fillRect(10, 10, 100, 100);
        // ctx.fillStyle = "white";
        // ctx.fillRect(10, 400, 100, 100);
        // ctx.fillStyle = "green";
        // ctx.fillRect(100, 700, 100, 100);
        // ctx.fillStyle = "blue";
        // ctx.fillRect(100, 900, 100, 100);

        var newImgData = ctx.getImageData(0, 0, 300, 1000);

        // create new autio buffer to put new sound into
        var newBuffer = audioCtx.createBuffer(1, data.length, audioCtx.sampleRate);
        // get channel data for mutating
        var nowBuffering = newBuffer.getChannelData(0);

        console.log(data.length, imgData.data);
        for (var i = 0; i < data.length; i++) {
          // audio needs to be in -1.0 - 1.0
          // 0 = -1, 255 = 1
          nowBuffering[i] = ((newImgData.data[i*4] / 255)  * 2 - 1);
        }

        // comparison check
        //console.log(nowBuffering.length, nowBuffering, data.length, data)

        var source = audioCtx.createBufferSource();
        // set the buffer in the AudioBufferSourceNode
        source.buffer = newBuffer;
        // set volume
        gainNode.gain.value = 0.3;
        // source.buffer = buffer;
        // connect the AudioBufferSourceNode to the
        // destination so we can hear the sound
        source.connect(gainNode);
        // start the source playing
        //source.start();
        // sendWaveToPost(source.buffer);
      },

      function(e) {
        console.log("Error with decoding audio data" + e.err);
      });
    }

    request.send();
  }

  getData();
})();
