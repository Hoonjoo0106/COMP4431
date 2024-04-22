(function(imageproc) {
    "use strict";

    /*
     * Apply blur to the input data
     */
    imageproc.blur = function(inputData, outputData, kernelSize) {
        console.log("Applying blur...");

        // You are given a 3x3 kernel but you need to create a proper kernel
        // using the given kernel size
        var shift_size = (kernelSize - 1) / 2;
        var kernel = [];
        for (var i = 0; i < kernelSize; i++) {
            var in_kernel = [];
            for (var j = 0; j < kernelSize; j++) in_kernel.push(1);
            kernel.push(in_kernel);
        }
        /**
         * TODO: You need to extend the blur effect to include different
         * kernel sizes and then apply the kernel to the entire image
         */

        // Apply the kernel to the whole image
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                // Use imageproc.getPixel() to get the pixel values
                // over the kernel
                //imageproc.getPixel(inputData, x, y)
                var r = 0;
                var g = 0;
                var b = 0;
                for (var j = -shift_size; j <= shift_size; j++) {
                    for (var i = -shift_size; i <= shift_size; i++) {
                        var pixel = imageproc.getPixel(inputData, x + i, y + j);
                        r += pixel.r * kernel[j + shift_size][i + shift_size];
                        g += pixel.g * kernel[j + shift_size][i + shift_size];
                        b += pixel.b * kernel[j + shift_size][i + shift_size];
                    }
                }

                // Then set the blurred result to the output data
                var i = (x + y * outputData.width) * 4;
                outputData.data[i]     = r / (kernelSize * kernelSize);
                outputData.data[i + 1] = g / (kernelSize * kernelSize);
                outputData.data[i + 2] = b / (kernelSize * kernelSize);
            }
        }
    } 

}(window.imageproc = window.imageproc || {}));
