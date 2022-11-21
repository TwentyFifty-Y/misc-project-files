const AWS = require("aws-sdk");
const dbb = new AWS.DynamoDB.DocumentClient({ region: "eu-central-1" });

exports.handler = async (event, context, callback) => {
    //The saveData function has the following parameters:
    // saveData(link, delimiter, headers, firstLine)    firstLine is optional
    const view1GlobalMonthly = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.global.monthly.csv", ",", ["time", "anomaly"]);
    const view1GlobalAnnual = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.global.annual.csv", ",", ["time", "anomaly"]);
    const view1NorthMonthly = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.northern_hemisphere.monthly.csv", ",", ["time", "anomaly"]);
    const view1NorthAnnual = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.northern_hemisphere.annual.csv", ",", ["time", "anomaly"]);
    const view1SouthMonthly = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.southern_hemisphere.monthly.csv", ",", ["time", "anomaly"]);
    const view1SouthAnnual = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.southern_hemisphere.annual.csv", ",", ["time", "anomaly"]);
    const view2Main = await saveData("https://www.ncei.noaa.gov/pub/data/paleo/contributions_by_author/moberg2005/nhtemp-moberg2005.txt", "   ", ["time", "anomaly"], 92);
    const view3Monthly = await saveData("https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv", ",", ["year", "month", "decimalDate", "mean"], 52);
    const view3Annual = await saveData("https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.csv", ",", ["year", "mean"], 55);

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
        {
            PutRequest: {
                Item: {
                    view_id: "view2Main",
                    info: view2Main
                },
            },
        },
        {
            PutRequest: {
                Item: {
                    view_id: "view3Monthly",
                    info: view3Monthly
                },
            },
        },
        {
            PutRequest: {
                Item: {
                    view_id: "view3Annual",
                    info: view3Annual
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

function dsvJSON(ssv, delimiter, headers, firstLine) {

    if (!firstLine) {
        firstLine = 0;
    }

    var lines = ssv.split("\n");

    var result = [];

    for (var i = (firstLine + 1); i < lines.length; i++) {

        var obj = {};
        var currentline = lines[i].trim().split(delimiter);

        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }

    //return result; //JavaScript object
    return JSON.stringify(result); //JSON
}

//Read file from link and save it locally
function saveData(link, delimiter, headers, firstLine) {

    const LINK = link;

    return new Promise((resolve, reject) => {

        //Add dependencies
        const fs = require('fs');
        const https = require('https');

        const request = https.get(LINK, function (response) {
            const file = fs.createWriteStream("/tmp/data.txt");
            response.pipe(file);

            // after download completed close filestream
            file.on("finish", () => {
                file.close();
                console.log("Download Completed");

                // Read local csv file
                var localFile = fs.readFileSync('/tmp/data.txt', 'utf8');

                // Transform dsv to JSON
                var json = dsvJSON(localFile, delimiter, headers, firstLine);

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