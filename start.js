const datafetcher = require("./datafetcher.js");
const ndjsonParser = require('ndjson-parse');
const ndjson = require('ndjson')
const fs = require('fs');

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//EXAMPLE DATA
//{ conveyance: 'Lance',
//   expedition: 'ICE-BAR 1996',
//   programs: [ 'ICE-BAR' ],
//   utc_date: '1996-07-27T18:10:00Z' }

//By using just one HTTP request for each program execution, create a
//list of all unique expeditions as newline separated JSON (ndjson), sorted by
//date of first sampling.

//Each line should contain the expedition code, the first and last sampling dates
//(iso-formatted), the programs connected with the expedition, and the expedition
//vessel/conveyance. (You may assume that programs and vessels are constant for
//each expedition).

module.exports.start = async function () {
  var jsondata = await datafetcher.fetchdata()
  var allforexp = Array.from(jsondata);

  const uniqueresults = Array.from(new Set(jsondata.map(s => s.expedition))).map(expedition => {

    var filteredallexp = allforexp.filter(res => res.expedition === expedition);

    var dates = filteredallexp.map(res => Date.parse(res.utc_date));
    var min = new Date(dates.reduce(function (a, b) { return a < b ? a : b; })).toISOString();
    var max = new Date(dates.reduce(function (a, b) { return a > b ? a : b; })).toISOString();

    var programs = filteredallexp.map(res => res.programs);
    var uniquePrograms = programs.flat().filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
    var programsConsts = uniquePrograms.map(res => {
      return { const : res }
    });

    var conveyance = filteredallexp.map(res => res.conveyance);
    var uniqueConveyance = conveyance.flat().filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
    var conveyanceConsts = uniqueConveyance.map(res => {
      return { const : res };
    })

    return {
      expedition: expedition,
      min_date: min,
      max_date: max,
      programs: programsConsts,
      conveyance: conveyanceConsts
    }
  })

  // sort by min date
  var sorteduniqueexpeditions = uniqueresults.sort((a, b) => {
     return (new Date(a.min_date) - new Date(b.min_date));
  })

  var myFile = fs.createWriteStream("./data.json");
  var serialize = ndjson.stringify();
  //serialize.pipe(process.stdout);
  serialize.pipe(myFile);
  serialize.write(sorteduniqueexpeditions)
  serialize.end();
  console.log("Finished. See ./data.json for results");



  //const parsedNdjson = ndjsonParser(JSON.stringify(sorteduniqueexpeditions));
  //console.log(JSON.stringify(parsedNdjson, null, 2))

}
this.start();
