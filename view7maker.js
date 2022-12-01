const json = require("./v7raw.json");
//map trough json and create a new array with the values we need
const array = json.map((item) => {
    return {
        time: item.time,
        anomaly: item.anomaly
    };
    });

    //save array to local file as a json
    const fs = require("fs");
    fs.writeFile("v7.json", JSON.stringify(array), function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
    });