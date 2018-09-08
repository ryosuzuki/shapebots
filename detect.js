var cv = require('opencv');

cv.readImage("./mona.jpg", function(err, im){
    im.convertGrayscale();
    im.save('./out.jpg');
});
