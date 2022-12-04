function view8Handler(json) {
    let newJson = [];

    json.map((item) => {
        for (var key in item) {
            //make newJson be an array of country: key, except if country: key is already there, except for Year
            if (key !== 'Year' && newJson.filter((i) => { return i.country === key }).length === 0) {
                newJson.push({
                    country: key, data: json.map((i) => {
                        //make data be an array of objects with year: i.Year and value: i[key]
                        return { year: i.Year, value: i[key] }
                    })
                });
            }
        }
    })

    return newJson;
}