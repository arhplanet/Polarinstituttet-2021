const fetch = require('node-fetch');
const https = require('https');

module.exports.fetchdata = async function() {

  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  var agentJson = {
    agent: agent,
  };

  var url = 'https://api.npolar.no/marine/biology/sample/?q=&fields=expedition,utc_date,programs,conveyance&limit=all&format=json&variant=array';
  var res = await fetch(url, agentJson)
  return res.json();
}
