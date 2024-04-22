(function(imageproc) {
  "use strict";
  /*
   * Build the histogram of the image for a channel
   */
  function buildHistogram(inputData, channel) {
      var histogram = [];
      for (var i = 0; i < 256; i++)
          histogram[i] = 0;

      for(let i = 0; i < inputData.data.length; i += 4){
          if(channel == "gray") histogram[Math. ceil((inputData.data[i] + inputData.data[i+1] + inputData.data[i+2])/3)] += 1;
          if(channel == "red") histogram[inputData.data[i]] += 1;
          if(channel == "green") histogram[inputData.data[i+1]] += 1;
          if(channel == "blue") histogram[inputData.data[i+2]] += 1;
      }
      return histogram;
  }

  /*
   * Find the min and max of the histogram
   */
  function findMinMax(histogram, pixelsToIgnore) {
      var min = 0, max = 255;

      /**
       * TODO: You need to build the histogram here
       */
      // Find the minimum in the histogram with non-zero value by
      // ignoring the number of pixels given by pixelsToIgnore
      let min_ignored = false;
      let j = 0;
      for (let i = 0; i < 256; i++){
          if(histogram[i] > 0){
              if(min_ignored == true){
                  min = i;
                  break;
              }
              else{
                  min_ignored = true;
                  while(j < pixelsToIgnore){
                      j += histogram[i];
                      i += 1;
                  }
                  i -= 2;
              }
          } 
      }
      // Find the maximum in the histogram with non-zero value by
      // ignoring the number of pixels given by pixelsToIgnore
      let max_ignored = false;
      j = 0
      for (let i = 255; i >= 0; i--){
          if(histogram[i] > 0){
              if(max_ignored == true){
                  max = i;
                  break;
              }
              else{
                  max_ignored = true;
                  while(j < pixelsToIgnore){
                      j += histogram[i];
                      i -= 1;
                  }
                  i += 2;
              }
          } 
      }
      return {"min": min, "max": max};
  }

  function equalizer(histogram, min, max){
      let density = 0;
      for(let i = min; i <= max; i++) density += histogram[i] / (max - min);
      let low = 0;
      let high = 0;
      
  }

  /*
   * Apply automatic contrast to the input data
   */
  imageproc.histogram_equalizer = function(inputData, outputData, type, percentage, show_hist, show_cdf, rand_hist) {
      console.log("Applying histogram equalizer...");
      console.log(type, percentage, show_hist, show_cdf, rand_hist);

      // Find the number of pixels to ignore from the percentage
      var pixelsToIgnore = (inputData.data.length / 4) * percentage;
      var histogram = buildHistogram(inputData, type);
      var minMax = findMinMax(histogram, pixelsToIgnore);
      var min = minMax.min, max = minMax.max, range = max - min;
      
      for (var i = 0; i < inputData.data.length; i += 4) {
          // Adjust each pixel based on the minimum and maximum values
          if((inputData.data[i] - min) / range * 255 > 255) outputData.data[i] = 255;
          else if((inputData.data[i] - min) / range * 255 < 0) outputData.data[i] = 0;
          else outputData.data[i] = (inputData.data[i] - min) / range * 255;

          if((inputData.data[i + 1] - min) / range * 255 > 255) outputData.data[i + 1] = 255;
          else if((inputData.data[i + 1] - min) / range * 255 < 0) outputData.data[i + 1] = 0;
          else outputData.data[i + 1] = (inputData.data[i + 1] - min) / range * 255;

          if((inputData.data[i + 2] - min) / range * 255 > 255) outputData.data[i + 2] = 255;
          else if((inputData.data[i + 2] - min) / range * 255 < 0) outputData.data[i + 2] = 0;
          else outputData.data[i + 2] = (inputData.data[i + 2] - min) / range * 255;
      }
  }

}(window.imageproc = window.imageproc || {}));
