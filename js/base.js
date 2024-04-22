(function(imageproc) {
    "use strict";

    /*
     * Apply negation to the input data
     */
    imageproc.negation = function(inputData, outputData) {
        console.log("Applying negation...");

        for (var i = 0; i < inputData.data.length; i += 4) {
            outputData.data[i]     = 255 - inputData.data[i];
            outputData.data[i + 1] = 255 - inputData.data[i + 1];
            outputData.data[i + 2] = 255 - inputData.data[i + 2];
        }
    }

    /*
     * Convert the input data to grayscale
     */
    imageproc.grayscale = function(inputData, outputData) {
        console.log("Applying grayscale...");

        /**
         * TODO: You need to create the grayscale operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Find the grayscale value using simple averaging
            let grayscale = (inputData.data[i] + inputData.data[i + 1] + inputData.data[i + 2]) / 3;
            // Change the RGB components to the resulting value
            outputData.data[i]     = grayscale;
            outputData.data[i + 1] = grayscale;
            outputData.data[i + 2] = grayscale;
        }
    }

    /*
     * Applying brightness to the input data
     */
    imageproc.brightness = function(inputData, outputData, offset) {
        console.log("Applying brightness...");

        /**
         * TODO: You need to create the brightness operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Change the RGB components by adding an offset
            let new_R = inputData.data[i] + offset;
            if(new_R > 255) new_R = 255;
            else if(new_R < 0) new_R = 0;

            let new_G = inputData.data[i + 1] + offset;
            if(new_G > 255) new_G = 255;
            else if(new_G < 0) new_G = 0;

            let new_B = inputData.data[i + 2] + offset;
            if(new_B > 255) new_B = 255;
            else if(new_B < 0) new_B = 0;

            outputData.data[i]     = new_R;
            outputData.data[i + 1] = new_G;
            outputData.data[i + 2] = new_B;

            // Handle clipping of the RGB components
        }
    }

    /*
     * Applying contrast to the input data
     */
    imageproc.contrast = function(inputData, outputData, factor) {
        console.log("Applying contrast...");

        /**
         * TODO: You need to create the brightness operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Change the RGB components by multiplying a factor
            let new_R = inputData.data[i] * factor;
            if(new_R > 255) new_R = 255;
            else if(new_R < 0) new_R = 0;

            let new_G = inputData.data[i + 1] * factor;
            if(new_G > 255) new_G = 255;
            else if(new_G < 0) new_G = 0;

            let new_B = inputData.data[i + 2] * factor;
            if(new_B > 255) new_B = 255;
            else if(new_B < 0) new_B = 0;

            outputData.data[i]     = new_R;
            outputData.data[i + 1] = new_G;
            outputData.data[i + 2] = new_B;

            // Handle clipping of the RGB components
        }
    }

    /*
     * Make a bit mask based on the number of MSB required
     */
    function makeBitMask(bits) {
        var mask = 0;
        for (var i = 0; i < bits; i++) {
            mask >>= 1;
            mask |= 128;
        }
        return mask;
    }

    /*
     * Apply posterization to the input data
     */
    imageproc.posterization = function(inputData, outputData,
                                       redBits, greenBits, blueBits) {
        console.log("Applying posterization...");

        /**
         * TODO: You need to create the posterization operation here
         */

        // Create the red, green and blue masks
        // A function makeBitMask() is already given

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Apply the bitmasks onto the RGB channels

            outputData.data[i]     = inputData.data[i] & makeBitMask(redBits);
            outputData.data[i + 1] = inputData.data[i + 1] & makeBitMask(greenBits);
            outputData.data[i + 2] = inputData.data[i + 2] & makeBitMask(blueBits);
        }
    }

    /*
     * Apply threshold to the input data
     */
    imageproc.threshold = function(inputData, outputData, thresholdValue) {
        console.log("Applying thresholding...");

        /**
         * TODO: You need to create the thresholding operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Find the grayscale value using simple averaging
            // You will apply thresholding on the grayscale value
            let grayscale = (inputData.data[i] + inputData.data[i + 1] + inputData.data[i + 2]) / 3;
            // Change the colour to black or white based on the given threshold
            if(grayscale < thresholdValue) grayscale = 0;
            else grayscale = 255;
            outputData.data[i]     = grayscale;
            outputData.data[i + 1] = grayscale;
            outputData.data[i + 2] = grayscale;
        }
    }

    /*
     * Build the histogram of the image for a channel
     */
    function buildHistogram(inputData, channel) {
        var histogram = [];
        for (var i = 0; i < 256; i++)
            histogram[i] = 0;
        /**
         * TODO: You need to build the histogram here
         */
        // Accumulate the histogram based on the input channel
        // The input channel can be:
        // "red"   - building a histogram for the red component
        // "green" - building a histogram for the green component
        // "blue"  - building a histogram for the blue component
        // "gray"  - building a histogram for the intensity
        //           (using simple averaging)
        for(let i = 0; i < inputData.data.length; i += 4){
            if(channel == "gray") histogram[Math. ceil((inputData.data[i] + inputData.data[i+1] + inputData.data[i+2])/3)] += 1;
            if(channel == "red") histogram[inputData.data[i]] += 1;
            if(channel == "green") histogram[inputData.data[i+1]] += 1;
            if(channel == "blue") histogram[inputData.data[i+2]] += 1;
        }
        //console.log(histogram.slice(0, 10).join(","));
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
        for (let i = 0; i < 256; i++){
            if(histogram[i] > 0){
                if(min_ignored == true){
                    min = i;
                    break;
                }
                else{
                    min_ignored = true;
                    let j = 0;
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
        for (let i = 255; i >= 0; i--){
            if(histogram[i] > 0){
                if(max_ignored == true){
                    max = i;
                    break;
                }
                else{
                    max_ignored = true;
                    let j = 0;
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

    /*
     * Apply automatic contrast to the input data
     */
    imageproc.autoContrast = function(inputData, outputData, type, percentage) {
        console.log("Applying automatic contrast...");

        // Find the number of pixels to ignore from the percentage
        var pixelsToIgnore = (inputData.data.length / 4) * percentage;

        var histogram, minMax;
        if (type == "gray") {
            // Build the grayscale histogram
            histogram = buildHistogram(inputData, "gray");

            // Find the minimum and maximum grayscale values with non-zero pixels
            minMax = findMinMax(histogram, pixelsToIgnore);

            var min = minMax.min, max = minMax.max, range = max - min;

            /**
             * TODO: You need to apply the correct adjustment to each pixel
             */

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
        else {

            /**
             * TODO: You need to apply the same procedure for each RGB channel
             *       based on what you have done for the grayscale version
             */
            // Build the grayscale histogram
            let red_histogram = buildHistogram(inputData, "red");
            // Find the minimum and maximum grayscale values with non-zero pixels
            let red_minMax = findMinMax(red_histogram, pixelsToIgnore);
            var red_min = red_minMax.min, red_max = red_minMax.max, red_range = red_max - red_min;

            // Build the grayscale histogram
            let green_histogram = buildHistogram(inputData, "green");
            // Find the minimum and maximum grayscale values with non-zero pixels
            let green_minMax = findMinMax(green_histogram, pixelsToIgnore);
            var green_min = green_minMax.min, green_max = green_minMax.max, green_range = green_max - green_min;

            // Build the grayscale histogram
            let blue_histogram = buildHistogram(inputData, "blue");
            // Find the minimum and maximum grayscale values with non-zero pixels
            let blue_minMax = findMinMax(blue_histogram, pixelsToIgnore);
            var blue_min = blue_minMax.min, blue_max = blue_minMax.max, blue_range = blue_max - blue_min;

            for (var i = 0; i < inputData.data.length; i += 4) {
                // Adjust each channel based on the histogram of each one
                if((inputData.data[i] - red_min) / red_range * 255 > 255) outputData.data[i] = 255;
                else if((inputData.data[i] - red_min) / red_range * 255 < 0) outputData.data[i] = 0;
                else outputData.data[i] = (inputData.data[i] - red_min) / red_range * 255;

                if((inputData.data[i + 1] - green_min) / green_range * 255 > 255) outputData.data[i + 1] = 255;
                else if((inputData.data[i + 1] - green_min) / green_range * 255 < 0) outputData.data[i + 1] = 0;
                else outputData.data[i + 1] = (inputData.data[i + 1] - green_min) / green_range * 255;

                if((inputData.data[i + 2] - blue_min) / blue_range * 255 > 255) outputData.data[i + 2] = 255;
                else if((inputData.data[i + 2] - blue_min) / blue_range * 255 < 0) outputData.data[i + 2] = 0;
                else outputData.data[i + 2] = (inputData.data[i + 2] - blue_min) / blue_range * 255;
            }
        }
    }

}(window.imageproc = window.imageproc || {}));
