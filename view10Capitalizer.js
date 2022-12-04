const json = require("./v10lowercase.json");

const data = json.map((item) => {
    return {
        ...item,
        description: item.description.charAt(0).toUpperCase() + item.description.slice(1)
    }
})

const fs = require("fs");
fs.writeFile("v10capitalized.json", JSON.stringify(data), function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});