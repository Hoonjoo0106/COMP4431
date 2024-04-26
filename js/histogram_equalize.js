//py -m http.server
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
            if(channel == "gray") histogram[Math.ceil((inputData.data[i] + inputData.data[i+1] + inputData.data[i+2])/3)] += 1;
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

    function equalizer(histogram){
        //find density
        let density = 0;
        for(let i = 0; i <= 255; i++) density += histogram[i] / 255;

        //new position vector to return
        var position_vector = [];
        for(let i = 0; i <= 255; i++) position_vector[i] = 0;

        let pos = 0;
        let prev_sum = 0;

        for(let i = 0; i <= 255; i++){
            //skip empty position
            if(histogram[i] == 0) continue;

            //put in the first value
            if(prev_sum == 0){
                if(i == 0){
                    prev_sum += histogram[i];
                    position_vector[i] = pos;
                    continue;
                }
                var relative_pos = histogram[i] / density;
                if((Math.abs(Math.floor(relative_pos) - relative_pos)) < (Math.ceil(relative_pos) - relative_pos)) pos += Math.floor(relative_pos);
                else pos += Math.ceil(relative_pos);
                prev_sum += histogram[i];
                position_vector[i] = pos;
                continue;
            }

            //compare density
            let min_density_diff = 9999999;
            prev_sum += histogram[i];
            for(let j = pos; j <= 255; j++){
                var temp_density = prev_sum / j;
                var density_diff = Math.abs(density - temp_density);
                if(min_density_diff > density_diff){
                    min_density_diff = density_diff;
                    pos = j;
                }
            }
            position_vector[i] = pos;
        }
        
        return position_vector;
    }

    function drawHistogramOnCanvas(histogram, canvasId) {
        //histogram div holder
        const his_div = document.createElement("div");
        his_div.className = "col-6";
        his_div.setAttribute("id", "his-div-"+canvasId);

        //create title of histogram
        const his_h5 = document.createElement("h5");
        his_h5.setAttribute("id", "h5-"+canvasId);
        his_h5.textContent = "Histogram Visualization ("+canvasId+")";

        //create canvas for histogram
        const his_canvas = document.createElement("canvas");
        his_canvas.setAttribute("id", "his-"+canvasId);
        his_canvas.setAttribute("width", "480");
        his_canvas.setAttribute("height", "250");

        //set up elements in div
        his_div.appendChild(his_h5);
        his_div.appendChild(his_canvas);

        //get histograms holder from the html
        const holder = document.getElementById("histogram-holder");

        var ctx = his_canvas.getContext('2d');

        // Clear the canvas
        ctx.clearRect(0, 0, his_canvas.width, his_canvas.height);

        // Find the maximum value in the histogram for normalization
        var maxHistogramValue = Math.max.apply(null, histogram);

        // Set the width of each bar and the scale based on the canvas height
        var barWidth = his_canvas.width / histogram.length;
        var scale = his_canvas.height / maxHistogramValue;

        // Set the fill style for the bars
        ctx.fillStyle = 'rgb(70, 130, 180)'; // A nice shade of steel blue

        // Draw the bars
        for (var i = 0; i < histogram.length; i++) {
            var barHeight = histogram[i] * scale;
            ctx.fillRect(i * barWidth, his_canvas.height - barHeight, barWidth, barHeight);
        }
        holder.appendChild(his_div)
    }

    function drawCDFOnCanvas(histogram, canvasId) {
        //get canvas
        const his_canvas = document.getElementById("his-"+canvasId);

        var ctx = his_canvas.getContext('2d');

        // Find the maximum value in the histogram for normalization
        var sumHistogramValue = histogram.reduce((a, b) => a + b, 0)

        // Set the width of each bar and the scale based on the canvas height
        var width = his_canvas.width / histogram.length;
        var scale = his_canvas.height / sumHistogramValue;
        var height = his_canvas.height;

        // Draw the bars
        for (var i = 0; i < histogram.length - 1; i++) {
            // add to cdf
            height -= histogram[i] * scale;

            // Start a new Path
            ctx.beginPath();
            ctx.moveTo(width * i, height + histogram[i] * scale);
            ctx.lineTo(width * (i + 1), height);

            // Draw the Path
            ctx.stroke();
        }
    }

    function findNearest(position_vector, pos){

        for(let i = 0; i <= 255; i++){
            if(pos - i >= 0 && position_vector[pos - i] > 0){
                pos -= i;
                return pos;
            }
            else if(pos + i < 256 && position_vector[pos + i] > 0){
                pos += i;
                return pos;
            }
        }
    }


    /*
    * Apply automatic contrast to the input data
    */
    imageproc.histogram_equalizer = function(inputData, outputData, type, percentage, show_hist, show_cdf, rand_hist) {
        console.log("Applying histogram equalizer...");
        // Find the number of pixels to ignore from the percentage
        var pixelsToIgnore = (inputData.data.length / 4) * percentage;
        var histogram = buildHistogram(inputData, type);
        if(show_hist) drawHistogramOnCanvas(histogram, "Input");
        if(show_cdf) drawCDFOnCanvas(histogram, "Input");
        var minMax = findMinMax(histogram, pixelsToIgnore);
        var min = minMax.min, max = minMax.max, range = max - min;
        
        //remove the outlier
        for (var i = 0; i < inputData.data.length; i += 4) {
            // Adjust each pixel based on the minimum and maximum values
            if((inputData.data[i] - min) / range * 255 > 255) inputData.data[i] = 255;
            else if((inputData.data[i] - min) / range * 255 < 0) inputData.data[i] = 0;
            else inputData.data[i] = (inputData.data[i] - min) / range * 255;

            if((inputData.data[i + 1] - min) / range * 255 > 255) inputData.data[i + 1] = 255;
            else if((inputData.data[i + 1] - min) / range * 255 < 0) inputData.data[i + 1] = 0;
            else inputData.data[i + 1] = (inputData.data[i + 1] - min) / range * 255;

            if((inputData.data[i + 2] - min) / range * 255 > 255) inputData.data[i + 2] = 255;
            else if((inputData.data[i + 2] - min) / range * 255 < 0) inputData.data[i + 2] = 0;
            else inputData.data[i + 2] = (inputData.data[i + 2] - min) / range * 255;
        }

        //build the histogram after removing the outliers
        histogram = buildHistogram(inputData, type);

        //histogram equalization
        var position_vector = equalizer(histogram);

        //apply equalization
        for (var i = 0; i < inputData.data.length; i += 4) {    
        // Adjust each pixel based on the minimum and maximum values
            if(type == "gray"){
                var gray_value = Math.ceil((inputData.data[i] + inputData.data[i+1] + inputData.data[i+2]) / 3);
                //find the nearest position vector
                if(gray_value != 0 && position_vector[gray_value] == 0){
                    gray_value = findNearest(position_vector, gray_value);
                }
                else if(gray_value < 0) gray_value = 0;
                else if(gray_value > 255) gray_value = 255;

                var diff_reference = position_vector[gray_value] - gray_value;

                if(inputData.data[i] + diff_reference < 0) outputData.data[i] = 0;
                else if(inputData.data[i] + diff_reference > 255) outputData.data[i] = 255;
                else outputData.data[i] = inputData.data[i] + diff_reference

                if(inputData.data[i + 1] + diff_reference < 0) outputData.data[i + 1] = 0;
                else if(inputData.data[i + 1] + diff_reference > 255) outputData.data[i + 1] = 255;
                else outputData.data[i + 1] = inputData.data[i + 1] + diff_reference

                if(inputData.data[i + 2] + diff_reference < 0) outputData.data[i + 2] = 0;
                else if(inputData.data[i + 2] + diff_reference > 255) outputData.data[i + 2] = 255;
                else outputData.data[i + 2] = inputData.data[i + 2] + diff_reference
            }
            else if(type == "red"){
                var red_value = inputData.data[i];
                if(red_value != 0 && position_vector[red_value] == 0){
                    red_value = findNearest(position_vector, red_value);
                }
                else if(red_value < 0) red_value = 0;
                else if(red_value > 255) red_value = 255;

                var diff_reference = position_vector[red_value] - red_value;

                if(inputData.data[i] + diff_reference < 0) outputData.data[i] = 0;
                else if(inputData.data[i] + diff_reference > 255) outputData.data[i] = 255;
                else outputData.data[i] = inputData.data[i] + diff_reference

                if(inputData.data[i + 1] + diff_reference < 0) outputData.data[i + 1] = 0;
                else if(inputData.data[i + 1] + diff_reference > 255) outputData.data[i + 1] = 255;
                else outputData.data[i + 1] = inputData.data[i + 1] + diff_reference

                if(inputData.data[i + 2] + diff_reference < 0) outputData.data[i + 2] = 0;
                else if(inputData.data[i + 2] + diff_reference > 255) outputData.data[i + 2] = 255;
                else outputData.data[i + 2] = inputData.data[i + 2] + diff_reference
            }
            else if(type == "green"){
                var green_value = inputData.data[i + 1];
                if(green_value != 0 && position_vector[green_value] == 0){
                    green_value = findNearest(position_vector, green_value);
                }
                else if(green_value < 0) green_value = 0;
                else if(green_value > 255) green_value = 255;
                
                var diff_reference = position_vector[green_value] - green_value;

                if(inputData.data[i] + diff_reference < 0) outputData.data[i] = 0;
                else if(inputData.data[i] + diff_reference > 255) outputData.data[i] = 255;
                else outputData.data[i] = inputData.data[i] + diff_reference

                if(inputData.data[i + 1] + diff_reference < 0) outputData.data[i + 1] = 0;
                else if(inputData.data[i + 1] + diff_reference > 255) outputData.data[i + 1] = 255;
                else outputData.data[i + 1] = inputData.data[i + 1] + diff_reference

                if(inputData.data[i + 2] + diff_reference < 0) outputData.data[i + 2] = 0;
                else if(inputData.data[i + 2] + diff_reference > 255) outputData.data[i + 2] = 255;
                else outputData.data[i + 2] = inputData.data[i + 2] + diff_reference
            }
            else if(type == "blue"){
                var blue_value = inputData.data[i + 2];
                if(blue_value != 0 && position_vector[blue_value] == 0){
                    blue_value = findNearest(position_vector, blue_value);
                }
                else if(blue_value < 0) blue_value = 0;
                else if(blue_value > 255) blue_value = 255;
                
                var diff_reference = position_vector[blue_value] - blue_value;

                if(inputData.data[i] + diff_reference < 0) outputData.data[i] = 0;
                else if(inputData.data[i] + diff_reference > 255) outputData.data[i] = 255;
                else outputData.data[i] = inputData.data[i] + diff_reference

                if(inputData.data[i + 1] + diff_reference < 0) outputData.data[i + 1] = 0;
                else if(inputData.data[i + 1] + diff_reference > 255) outputData.data[i + 1] = 255;
                else outputData.data[i + 1] = inputData.data[i + 1] + diff_reference

                if(inputData.data[i + 2] + diff_reference < 0) outputData.data[i + 2] = 0;
                else if(inputData.data[i + 2] + diff_reference > 255) outputData.data[i + 2] = 255;
                else outputData.data[i + 2] = inputData.data[i + 2] + diff_reference
            }
        }
        var histogram2 = buildHistogram(outputData, type);
        if(show_hist) drawHistogramOnCanvas(histogram2, "Output");
        if(show_cdf) drawCDFOnCanvas(histogram, "Output");
    }

}(window.imageproc = window.imageproc || {}));
