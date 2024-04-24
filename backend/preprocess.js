const fs = require('fs');
const d3 = require('d3');
const moment = require('moment');
const { sliderBottom } = require("d3-simple-slider");


// Define a list of European country codes. You need to complete this list based on your data.
const europeanCountries = ['Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia_and_Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 
'Denmark', 'Estonia', 'Faroe_Islands', 'Finland', 'France', 'Georgia', 'Germany', 'Gibraltar', 'Greece', 'Guernsey', 'Holy_See', 'Hungary', 
'Iceland', 'Ireland', 'Isle_of_Man', 'Italy', 'Jersey', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 
'Monaco', 'Montenegro', 'Netherlands', 'North_Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San_Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United_Kingdom'];


fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
        console.error("Failed to read file:", err);
        return;
    }
    
    const jsonData = JSON.parse(data);
    const filteredAndProcessedData = jsonData
        .filter(d => europeanCountries.includes(d.countriesAndTerritories) && moment(d.dateRep, "DD/MM/YYYY").year() === 2020)
        .map(d => ({
            ...d,
            dateRep: moment(d.dateRep, "DD/MM/YYYY").format("YYYY-MM-DD"), // Normalize date format
            cases: +d.cases, // Ensure cases are numbers
            deaths: +d.deaths // Ensure deaths are numbers
        }));

    // Aggregate data by months
    const monthlyData = d3.rollups(filteredAndProcessedData, 
        v => ({
            cases: d3.sum(v, leaf => leaf.cases),
            deaths: d3.sum(v, leaf => leaf.deaths)
        }), 
        d => moment(d.dateRep).format('YYYY-MM')
    );

    console.log(monthlyData);

    // Save the processed data back to a new file
    fs.writeFile('processed_european_data.json', JSON.stringify(monthlyData, null, 2), err => {
        if (err) {
            console.error("Failed to write file:", err);
        } else {
            console.log("File written successfully.");
        }
    });
});