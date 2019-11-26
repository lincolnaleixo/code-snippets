/* eslint-disable no-unused-vars */
const fs = require('fs');

const rawdata = fs.readFileSync('database/countries.json');
const { countries } = JSON.parse(rawdata);

const countriesLowercase = countries.map((country) => country.toLowerCase());
const countriesReversedSorted = countries.reverse();
const countriesWithA = countries.filter((country) => country[0] === 'A');
console.log(countriesWithA);
