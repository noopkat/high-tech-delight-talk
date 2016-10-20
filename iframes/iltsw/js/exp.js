(function() {
  var button = document.querySelector('button');
  var audioCtx = new AudioContext();
  var frameCount = audioCtx.sampleRate * 2.0;
  var gainNode = audioCtx.createGain();
  gainNode.connect(audioCtx.destination);

  var buffer = audioCtx.createBuffer(1, 22050, 22050);

  console.log('framecount:', frameCount, 'sampleRate:', audioCtx.sampleRate);

  button.onclick = function() {
    for (var channel = 0; channel < 1; channel++) {
       // This gives us the actual ArrayBuffer that contains the data
       var nowBuffering = buffer.getChannelData(channel);
       console.log(nowBuffering);
       for (var i = 0; i < frameCount; i++) {
         // Math.random() is in [0; 1.0]
         // audio needs to be in [-1.0; 1.0]
         // 0 = -1 and 255 = 1 and 128 = 0;
         // var val = (0 / 255) * 2 -1;
         // val = val.toFixed(1);
         var val = i % 2 ? -1.0 : 1.0;
         nowBuffering[i] = val;
        //nowBuffering[i] = Math.random() * 2 - 1;
         //console.log(val);
       }
       console.log(nowBuffering);
    }

    // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer
    var source = audioCtx.createBufferSource();
    // set the buffer in the AudioBufferSourceNode
    source.buffer = buffer;
    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
    gainNode.gain.value = 0.5;
    source.connect(gainNode);
    // start the source playing
    source.start();
  }
})();
