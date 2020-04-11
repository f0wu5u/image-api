const app = require('http');
const url = require('url');

const imagemin = require('imagemin'),
imageminJpegtran = require('imagemin-jpegtran'),
imageminPngquant = require('imagemin-pngquant'),
imageminMozjpeg = require('imagemin-mozjpeg'),
imageminGifsicle = require('imagemin-gifsicle');

var got = require('got');
/**
 * Init node server
 * 
 * @param req http request
 * @param res http response
 */
function initServer(req, res) {
    var requestURL = url.parse(req.url, true);

    /**
     * Search exist?
     *  @return processReq
     */
    if (requestURL.search == "") return res.end('Nodejs Image API, by Code-FI');

    return processReq(requestURL.query, res);
}

/**
 * Process 
 */
async function processReq({ file, device, hd }, res) {

    if (!file) return res.end("Missing image file !");


    /**
     * Get device preset quality
     */
    var quality = hd ? 90 : getDeviceQuality(device),
        optimizationLevel = (hd || quality >= 60) ? 1 : 2;
 

    var imageFile = await got(file, { encoding: null, timeout: 10000 })
        .catch(error => console.log(error));

    if (!imageFile || !imageFile.body) return res.end("Couldn't load image from remote server");

   

    const compressedImage = await imagemin.buffer(imageFile.body, {
        plugins: [
            imageminGifsicle({ optimizationLevel, interlaced: true }),
            imageminMozjpeg({ quality }),
            imageminJpegtran({ progressive: true }),
            imageminPngquant({ quality: `${quality}-80` })
        ]
    }).catch(error => console.log(error));

    // imagemin = null;
    // imageminGifsicle=null;
    // imageminJpegtran=null;
    // imageminMozjpeg=null;
    // imageminPngquant=null;
    imageFile = null;
    quality= null;
    // got = null;

    return res.end(compressedImage || "Couldn't compress image");

}


/**
 * 
 * @param device type device rendering image to
 */
function getDeviceQuality(device) {
    var quality = 60;
    switch (device) {
        case "mobile-sm":
            quality = 20;
            break;
        case "mobile-md":
            quality = 35;
            break;
        case "tablet":
            quality = 50;
            break;
        case "computer-md":
            quality = 70;
            break;
        case "computer-xl":
            quality = 90;
            break;
        default:
            break;
    }
    return quality;
}

var server = app.createServer(initServer);
server.listen(42190, "localhost");