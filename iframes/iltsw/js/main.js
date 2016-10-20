(function() {
  var context = new AudioContext();
  var analyser = context.createAnalyser();
  var audioElement = document.getElementById('player');
  audioElement.addEventListener("canplay", function() {
    var source = context.createMediaElementSource(audioElement);

    source.connect(analyser);
    analyser.connect(context.destination);
    console.log(analyser.frequencyBinCount); // 1024 data points

    analyser.fftSize = 32; // 2048 by default
    console.log(analyser.frequencyBinCount); // fftSize/2 = 16 data points

    var frequencyData = new Uint8Array(analyser.frequencyBinCount);
    //analyser.getByteFrequencyData(frequencyData);
    downSample = [];

    //var timeDomain = new Uint8Array(analyser.frequencyBinCount);
    
//     for (var i = 0; i < analyser.frequencyBinCount; i++) {
//       var value = timeDomain[i];
//       var percent = value / 256;
//       var height = HEIGHT * percent;
//       var offset = HEIGHT - height - 1;
//       var barWidth = WIDTH/analyser.frequencyBinCount;
//       drawContext.fillStyle = 'black';
//       drawContext.fillRect(i * barWidth, offset, 1, 1);
// }

    var bars = Array.prototype.slice.call(document.querySelectorAll('.bar'));

    audioElement.volume = 1;
    audioElement.play();

    var barWidth = 1;
    var skipframes = 0;
    var counter = 0;

    function update() {
      if (!audioElement.ended) {
        if (counter < skipframes) {
          counter += 1;
          requestAnimationFrame(update);
          return;
        }

        counter = 0;
        requestAnimationFrame(update);
      }

      // Get the new frequency data
      analyser.getByteFrequencyData(frequencyData);
      //analyser.getByteTimeDomainData(frequencyData);

      // bars.forEach(function (bar, index) {
      //   console.log(frequencyData[index]);
      //     bar.style.height = frequencyData[index] + 'px';
      //     // bar.style.backgroundColor = `rgb(${frequencyData[index] / 1.5}, ${frequencyData[index] / .5}, ${frequencyData[index]})`;
      //     bar.style.backgroundColor = `hsl(${frequencyData[index]}, 60%, 70%)`;
      // });

      var barset = document.createElement('div');
      barset.className = 'barset';
      barset.style.width = `${barWidth}px`;

      //console.log(frequencyData);
      downSample.push(frequencyData);

      frequencyData.forEach(function(data, index) {
        //console.log(data)
        var bar = document.createElement('div');
        bar.style.height = data + 'px';
        bar.style.backgroundColor = `hsl(${data}, 60%, 70%)`;
        bar.className = 'tinybar';
        bar.style.width = `${barWidth}px`;
        barset.appendChild(bar);
      });

      document.getElementById('barbox').appendChild(barset);
    
    };

    update();
  });

})();
