const fs = require('fs');

// Function to read the JSON file and parse its content
function readHistoricalDataFile(filename) {
  const data = fs.readFileSync(filename);
  return JSON.parse(data);
}


// Function to simulate trades based on the "Close" data
function simulateTrades(data) {

  //when the days price goes above or below the moving average, buy or sell
  //first generate moving average, then compare to price
  const trades = [];
  let cashReserve = 10000;
  let cashForTrade = 90000
  let stockAmount = 0;
  let sum = 0;
  let movingAverage;
  let lookbackPeriod = 20; //20 day moving average

  for(let i = 0; i < 19; i++)
  {
    sum += data[i].Close;
  }
  movingAverage = sum/lookbackPeriod;
  sum = 0;
  stockAmount = cashForTrade/data[lookbackPeriod].Close;

  //all trades will be $10,000
  for (let i = lookbackPeriod; i < data.length - 1; i++) {


    previousMovingAverage = movingAverage;

    //Add past lookbackperiod number of days of prices
    for(let j = i - 19; j <= i; j++){
      sum += data[j].Close;
    }
    //Divide that by the lookbackperiod
    movingAverage = sum/lookbackPeriod;
    sum = 0;

    //movingAverage = (movingAverage*lookbackPeriod - data[i-lookbackPeriod].Close + data[i].Close)/20;
    console.log("Moving Average:");
    console.log(movingAverage);
    console.log("Close Price:");
    console.log(data[i].Close);

    console.log(data[i].Date);

    if(data[i].Close > movingAverage && data[i-1].Close < previousMovingAverage)
    {
      //buy
      const price = data[i].Close;
      const date = new Date(data[i].Date);
      if(cashReserve > 0)
      {
        stockAmount += 10000/price;
        cashReserve -= 10000;
      }
      else
      {
        console.log("Logic Problem! out of cash reserves");
      }

      trades.push({
        DateOfTrade: date.toISOString(),
        Price: price,
        TradeType: "Buy",
        CashReserve: cashReserve,
        StockAmount: stockAmount,
        MoneyInStock: (stockAmount*price),
        TotalInPortfolio: (cashReserve + stockAmount*price),
      });
    }
    else if (data[i].Close < movingAverage && data[i-1].Close > previousMovingAverage)
    {
      //sell
      const price = data[i].Close;
      const date = new Date(data[i].Date);
      if(stockAmount > 0)
      {
        stockAmount -= 10000/price;
        cashReserve += 10000;
      }
      else
      {
        console.log("Logic Problem! out of stock");
      }

      trades.push({
        DateOfTrade: date.toISOString(),
        Price: price,
        TradeType: "Sell",
        CashReserve: cashReserve,
        StockAmount: stockAmount,
        MoneyInStock: (stockAmount*price),
        TotalInPortfolio: (cashReserve + stockAmount*price),
      });
    }

  }
  return trades;
}
module.exports = {simulateTrades, readHistoricalDataFile};

// Main function to run the program
function main() {
  const filename = 'data/FNGD_historical_data.json';
  const data = readHistoricalDataFile(filename);
  const trades = simulateTrades(data);

  // Output the trades
  console.log('Trades:');
  console.log('------------------------------------------------');
  trades.forEach((trade) => {
    console.log(
      `On ${trade.DateOfTrade}--- ${trade.TradeType}ing: $10000 in stock. Portfolio: $${trade.TotalInPortfolio} Amount of Stock: ${trade.StockAmount} Cash Reserve: ${trade.CashReserve}`
    );
  });
  console.log('------------------------------------------------');

  // Write the trades to a JSON file
  JSON_Trades = JSON.stringify(trades, null, 2);
  fs.writeFile("MACO.json", JSON_Trades, function(err) { //writeFile requires a callback function (error handling) because it is asynchronous
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log('File "MACO.json" has been saved successfully.');
    }
  });
}
// Run the main function
if (require.main === module) {
  main();
}
