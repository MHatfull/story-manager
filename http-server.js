var http = require('http');
var AWS = require('aws-sdk')
const JSON = require('circular-json');

http.createServer(function(req, res) {
	if (req.url == '/sign') {
		req.on('data', (data) => {
			res.write(signUrl(data));
			res.end();
		})
	} else if (req.url == '/stories') {
		getStories((data) => {
			res.write(presentStories(data));
			res.end();
		})
	} else {
		res.end();
	}
}).listen(8080);

function signUrl(name) {
	var s3 = new AWS.S3();
	var params = JSON.parse(name);
	var s3Params = {
		Bucket: 'stories.underlunchers.co.uk',
		Key:  params.name,
		ContentType: 'application/octet-stream',
		ACL: 'public-read',
	};

  return s3.getSignedUrl('putObject', s3Params);
}

function getStories(cb) {
	AWS.config.update({region: "us-east-1"});
	var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
	var params = { TableName:"stories", ProjectionExpression: "story" };
	ddb.scan(params,function(err,result) {
		if(err) { console.log(err); }
		else {
			cb(result.Items);
		}
	});
}

function presentStories(data) {
	console.log(data)
	var stories = {stories: []}
	data.forEach(s => { stories.stories.push(s.story.S) });
	return JSON.stringify(stories);
}
