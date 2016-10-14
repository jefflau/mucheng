//@flow

export function a () {
  return 7
}

import { Meteor } from 'meteor/meteor';
import 'fetch-everywhere'

Meteor.startup(() => {
  // code to run on server at startup
});

function getRawData() {
    
    testUrl = 'https://www.cryptocompare.com/api/data/histoday/?e=CCCAGG&fsym=BTC&limit=93&tsym=USD';

    return fetch(testUrl, {method: 'GET'}).then(res => console.dir(res.json().then(console.log))).catch(console.log);
    
}

getRawData()

