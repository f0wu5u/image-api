var app = require('http'),
    url = require('url'),

    //IMAGE COMPRESION DEPENDENCIES

    imagemin = require('imagemin'),
    imageminJpegtran = require('imagemin-jpegtran'),
    imageminPngquant = require('imagemin-pngquant'),
    imageminMozjpeg = require('imagemin-mozjpeg'),
    imageminGifsicle = require('imagemin-gifsicle'),

    //Remote image loader
    got = require('got')





const initServer = async (request, response) => {

    var requestURL = url.parse(request.url, true);
    if (requestURL.search != "") {
        const { file, device, hd } = requestURL.query;

        if (file) {

            var quality = hd ? 90 : getDeviceQuality(device),
                optimizationLevel = (hd || quality >= 60) ? 1 : 2;

            const imageResponse = await got.get(file, { encoding: null });

            if (imageResponse && imageResponse.body) {
                const compressedImage = await imagemin.buffer(imageResponse.body, {
                    plugins: [
                        imageminGifsicle({ optimizationLevel, interlaced: true }),
                        imageminMozjpeg({ quality }),
                        imageminJpegtran({ progressive: true }),
                        imageminPngquant({ quality: `${quality}-80` })
                    ]
                })
                    .catch(error => response.end(`Couldn't compress image\n\n${error}`));

                if (compressedImage) return response.end(compressedImage)
            }
            return response.end("Couldn't load image from remote resource!");
        }
        return response.end("Missing image file !");
    }
    return response.end("Node.js image API");
}


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