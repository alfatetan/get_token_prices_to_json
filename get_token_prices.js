"use strict";

// A sample piece of code to show working with the API Moralis framework
// Code parses a price history of the ACR token from Ethereum's blockchain network


// Moralis Initial
const Moralis = require("moralis/node");
const moment = require("moment");
const FileSystem = require("fs");

// Keys and other shit
const serverUrl = "https://btezbpet4qai.usemoralis.com:2053/server";
const appId = "YourAppID";
const masterKey = "YourMasterKey";

// Change for your needs
const tokenAddress = "0x76306F029f8F99EFFE509534037Ba7030999E3CF"; //ACR Token

// Count of days from Now
const days = 20;

// Delay to avoid "Too many requests" error
const delay = 500;

async function mainApp() {
  //Moralis Initial
  await Moralis.start({ serverUrl, appId, masterKey });

  // Arrays of dates
  const dates = Array(Number(days))
    .fill()
    .map((e, i) => moment().subtract(i, "d").format("YYYY-MM-DD"))
    .reverse();

  // Blocks
  const blocks = await Promise.all(
    dates.map(
      async (e, i) => await Moralis.Web3API.native.getDateToBlock({ date: e })
    )
  );

  let prices = await Promise.all(
    blocks.map(
      async (e, i) =>
        await Moralis.Web3API.token.getTokenPrice({
          address: tokenAddress,
          to_block: e.block,
        })
    )
  );
  prices = prices.map((e) => e.usdPrice);

  const data = {
    labels: dates,
    data: prices,
  };

  // Save to JSON file
  FileSystem.writeFile("tokenPrices.json", JSON.stringify(data), (error) => {
    if (error) throw error;
  });
}

mainApp();
