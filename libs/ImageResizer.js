"use strict";

const ImageData   = require("./ImageData");
const gm = require("gm").subClass({ imageMagick: true });

const cropSpec = /(\d+)x(\d+)([+-]\d+)?([+-]\d+)?(%)?/;

class ImageResizer {

    /**
     * Image Resizer
     * resize image with ImageMagick
     *
     * @constructor
     * @param Number width
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * Execute resize
     *
     * @public
     * @param ImageData image
     * @return Promise
     */
    exec(image) {
        const acl = this.options.acl;

        return new Promise((resolve, reject) => {
            var img = gm(image.data).geometry(this.options.size.toString());
            var fileName = image.fileName;

            if ( "gravity" in this.options ) {
                img = img.gravity(this.options.gravity);
            }
            if ( "background" in this.options ) {
              img = img.background(this.options.background).flatten();
            }
            if ( "crop" in this.options ) {
                var cropArgs = this.options.crop.match(cropSpec);
                const cropWidth = cropArgs[1];
                const cropHeight = cropArgs[2];
                const cropX = cropArgs[3];
                const cropY = cropArgs[4];
                const cropPercent = cropArgs[5];
                img = img.crop(cropWidth, cropHeight, cropX, cropY, cropPercent === "%");
            }

            if ( "suffix" in this.options ) {
                fileName = fileName.substr(0, fileName.lastIndexOf("."))
                    + this.options.suffix
                    + fileName.substr(fileName.lastIndexOf("."));
            }

            function toBufferHandler(err, buffer) {
                if (err) {
                    reject(err);
                } else {
                    resolve(new ImageData(
                        fileName,
                        image.bucketName,
                        buffer,
                        image.headers,
                        acl
                    ));
                }
            }

            if ( "format" in this.options ) {
                img.toBuffer(this.options.format, toBufferHandler);
            } else {
                img.toBuffer(toBufferHandler);
            }
        });
    }
}

module.exports = ImageResizer;
