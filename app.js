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


var server = app.createServer(initServer);

server.listen(42190, "localhost");


function initServer(request, response) {

    var requestURL = url.parse(request.url, true);

    if (requestURL.search != "") {

        const { file, device, hd } = requestURL.query;

        if (file) {

            var quality = hd ? 90 : getDeviceQuality(device),
                
                optimizationLevel = (hd || quality >= 60) ? 1 : 2;

                got.get(file,{encoding:null})
                .then(imageResponse=>{
                    imagemin.buffer(imageResponse.body,{
                        plugins:[
                            imageminGifsicle({optimizationLevel,interlaced:true}),
                            imageminMozjpeg({quality}),
                            imageminJpegtran({progressive:true}),
                            imageminPngquant({quality:`${quality}-80`})
                        ]
                    })
                    .then(compressedImage=>{
                        return response.end(compressedImage)
                    })
                    .catch(error=>{
                        return response.end("Couldn't compress image\n\n"+error)
                    })
                })
                .catch(error=>{
                    return response.end("Couldn't load image from remote source\n\n"+error)
                })

        } else {
            return response.end("Missing image file !")
        }
    }else{
        return response.end("Node.js image API")
    }
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
