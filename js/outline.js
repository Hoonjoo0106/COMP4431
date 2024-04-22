(function(imageproc) {
    "use strict";

    /*
     * Apply sobel edge to the input data
     */
    imageproc.sobelEdge = function(inputData, outputData, threshold) {
        console.log("Applying Sobel edge detection...");

        /* Initialize the two edge kernel Gx and Gy */
        var Gx = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        var Gy = [
            [-1,-2,-1],
            [ 0, 0, 0],
            [ 1, 2, 1]
        ];

        /**
         * TODO: You need to write the code to apply
         * the two edge kernels appropriately
         */
        
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                let val_x = 0;
                let val_y = 0;
                for (var j = -1; j <= 1; j++) {
                    for (var i = -1; i <= 1; i++) {
                        var pixel = imageproc.getPixel(inputData, x + i, y + j);
                        val_x += Gx[j + 1][i + 1] * (pixel.r + pixel.g + pixel.b) / 3;
                        val_y += Gy[j + 1][i + 1] * (pixel.r + pixel.g + pixel.b) / 3;
                    }
                }
                val_x = Math.pow(val_x, 2);
                val_y = Math.pow(val_y, 2);
                let val = Math.pow(val_x + val_y, 0.5);
                if(val >= threshold) val = 255;
                else val = 0;

                var i = (x + y * outputData.width) * 4;
                outputData.data[i]     = val;
                outputData.data[i + 1] = val;
                outputData.data[i + 2] = val;
            }
        }
    } 

}(window.imageproc = window.imageproc || {}));
