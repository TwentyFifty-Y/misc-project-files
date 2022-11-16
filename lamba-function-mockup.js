// const AWS = require("aws-sdk");
// const dbb = new AWS.DynamoDB.DocumentClient({ region: "eu-central-1" });

handler = async (event, context, callback) => {
    const view1GlobalMonthly = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.global.monthly.csv", ",");
    const view1GlobalAnnual = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.global.annual.csv", ",");
    const view1NorthMonthly = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.northern_hemisphere.monthly.csv", ",");
    const view1NorthAnnual = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.northern_hemisphere.annual.csv", ",");
    const view1SouthMonthly = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.southern_hemisphere.monthly.csv", ",");
    const view1SouthAnnual = await saveData("https://www.metoffice.gov.uk/hadobs/hadcrut5/data/current/analysis/diagnostics/HadCRUT.5.0.1.0.analysis.summary_series.southern_hemisphere.annual.csv", ",");
    const view2Main = await saveData("https://www.ncei.noaa.gov/pub/data/paleo/contributions_by_author/moberg2005/nhtemp-moberg2005.txt", "   ", 92)
    
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
    ];
    console.log(dataArray);
    // await sendInfo(dataArray).then(() => {
    //     callback(null, {
    //         statusCode: 201,
    //         body: "",
    //         headers: {
    //             'Access-Control-Allow-Origin': "*"
    //         }
    //     }).catch((err) => {
    //         console.log(err);
    //     });
    // });
}

function dsvJSON(ssv, delimiter, firstLine) {

    if (!firstLine) {
        firstLine = 0;
    }

    var lines = ssv.split("\n");

    var result = [];

    var headers = ['time', 'anomaly'];

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
function saveData(link, delimiter, firstLine) {

    const LINK = link;

    return new Promise((resolve, reject) => {

        //Add dependencies
        const fs = require('fs');
        const https = require('https');

        const request = https.get(LINK, function (response) {
            const file = fs.createWriteStream("data.txt");
            response.pipe(file);

            // after download completed close filestream
            file.on("finish", () => {
                file.close();
                console.log("Download Completed");

                // Read local csv file
                var localFile = fs.readFileSync('data.txt', 'utf8');

                // Transform dsv to JSON
                var json = dsvJSON(localFile, delimiter, firstLine)

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

handler()