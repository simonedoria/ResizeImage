'use strict'


const AWS = require('aws-sdk')
const S3 = new AWS.S3({ signatureVersion: 'v4' });
const Sharp = require('sharp');
const PathPattern = new RegExp("(.*/)?(.*)/(.*)");

// parameters
const BUCKET = "infooggi";
const URL = "http://infooggi.s3-website.eu-central-1.amazonaws.com";

exports.handler = function (event, _context, callback) {
    var path = event.queryStringParameters.key;
    var parts = PathPattern.exec(path);
    var filepath = part[2];
    var options = parts[1].replace("/", "");
    options = options.replace("/", "");
    var sizes = options.split("x");
    var contentType;
    S3.getObject({ Bucket: BUCKET, Key: filepath })
        .promise()
        .then(data => {
            contentType = data.ContentType;
            var img = Sharp(data.Body)
                .resize(
                sizes[0] === 'AUTO' ? null : parseInt(sizes[0]),
                sizes[1] === 'AUTO' ? null : parseInt(sizes[1]));
            return img.withoutEnlargement().toBuffer();
        })
        .then(result => {
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
