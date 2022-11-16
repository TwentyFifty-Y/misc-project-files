const AWS = require("aws-sdk");
const dbb = new AWS.DynamoDB.DocumentClient({ region: "eu-central-1" });

exports.handler = async (event, context, callback) => {
    const view1GlobalMonthly = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.global.monthly.csv");
    const view1GlobalAnnual = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.global.annual.csv");
    const view1NorthMonthly = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.northern_hemisphere.monthly.csv");
    const view1NorthAnnual = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.northern_hemisphere.annual.csv");
    const view1SouthMonthly = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.southern_hemisphere.monthly.csv");
    const view1SouthAnnual = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.southern_hemisphere.annual.csv");
    
    const dataArray = [
        {
            PutRequest: {
                Item: {
                    view_id: "view1GlobalMonthly",
                    info: view1GlobalMonthly
                },
            },
        },
        {
            PutRequest: {
                Item: {
                    view_id: "view1GlobalAnnual",
                    info: view1GlobalAnnual
                },
            },
        },
        {
            PutRequest: {
                Item: {
                    view_id: "view1NorthMonthly",
                    info: view1NorthMonthly
                },
            },
        },
        {
            PutRequest: {
                Item: {
                    view_id: "view1NorthAnnual",
                    info: view1NorthAnnual
                },
            },
        },
        {
            PutRequest: {
                Item: {
                    view_id: "view1SouthMonthly",
                    info: view1SouthMonthly
                },
            },
        },
        {
            PutRequest: {
                Item: {
                    view_id: "view1SouthAnnual",
                    info: view1SouthAnnual
                },
            },
        },
    ];
    
    await sendInfo(dataArray).then(() => {
        callback(null, {
            statusCode: 201,
            body: "",
            headers: {
                'Access-Control-Allow-Origin': "*"
            }
        }).catch((err) => {
            console.log(err);
        });
    });
};

function csvJSON(csv, firstLine) {
    
    if (!firstLine) {
        firstLine = 0;
    }

    var lines = csv.split("\n");

    var result = [];

    var headers = ['time', 'anomaly'];

    for (var i = (firstLine + 1); i < lines.length; i++) {

        var obj = {};
        var currentline = lines[i].split(",");

        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }

    //return result; //JavaScript object
    return JSON.stringify(result); //JSON
}

//Read file from link and save it locally
function saveData(link) {

    const LINK = link;

    return new Promise((resolve, reject) => {

        //Add dependencies
        const fs = require('fs');
        const https = require('https');

        const request = https.get(LINK, function (response) {
            const file = fs.createWriteStream("/tmp/data.csv");
            response.pipe(file);

            // after download completed close filestream
            file.on("finish", () => {
                file.close();
                console.log("Download Completed");

                // Read local csv file
                var csv = fs.readFileSync('/tmp/data.csv', 'utf8');

                // Convert csv to json
                var json = csvJSON(csv);

                resolve(json);
            });
        });
    });
}

async function sendInfo(array) {

    const ARRAY = array;

    const params = {
        "RequestItems": {
            "ViewsInfo": ARRAY
        }
    };

    return dbb.batchWrite(params).promise();
}