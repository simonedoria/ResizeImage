'use strict'


const AWS = require('aws-sdk')
const S3 = new AWS.S3({ signatureVersion: 'v4' });
const PathPattern = new RegExp("(.*/)?(.*)/(.*)");

// parameters
const BUCKET = "infooggi";
const URL = "http://infooggi.s3-website.eu-central-1.amazonaws.com";

exports.handler = function (event, _context, callback) {
    var path = event.queryStringParameters.key;
    var parts = PathPattern.exec(path);
    console.log(parts);
    var dir = parts[1] || '';
    var options = parts[2];
    var filename = parts[3];


    var sizes = options[0].split("x");

    var contentType;
    S3.getObject({ Bucket: BUCKET, Key: dir + filename })
        .promise()
        .then(data => {
            console.log(size[0]);
            console.log(size[1]);
            contentType = data.ContentType;
            var img = Sharp(data.Body)
                .resize(
                sizes[0] === 'AUTO' ? null : parseInt(sizes[0]),
                sizes[1] === 'AUTO' ? null : parseInt(sizes[1]));
            return img.withoutEnlargement().toBuffer();
        })
        .then(result => {
            console.log("result");
            console.log(result);
            console.log("bucket");
            console.log(BUCKET);
            console.log("content type");
            console.log(contentType);
            console.log("key");
            console.log(path);
            S3.putObject({
                Body: result,
                Bucket: BUCKET,
                ContentType: contentType,
                Key: path
            }).promise()
        })
        .then(() =>
            callback(null, {
                statusCode: 301,
                headers: { "Location": `${URL}/${path}` }
            })
        )
        .catch(e => {
            callback(null, {
                statusCode: e.statusCode || 400,
                body: 'Exception: ' + e.message,
                headers: { "Content-Type": "text/plain" }
            })
        });
}
