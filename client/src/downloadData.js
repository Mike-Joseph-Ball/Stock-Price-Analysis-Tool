// src/DataDownloadForm.js

import React from 'react';
import axios from 'axios';
import Chart from 'chart.js';

const DataDownloadForm = () => {
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const symbol = event.target.symbol.value;
    const startDate = event.target.startDate.value;
    const endDate = event.target.endDate.value;

    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v7/finance/chart/${symbol}?period1=${new Date(
          startDate
        ).getTime() / 1000}&period2=${new Date(endDate).getTime() / 1000}&interval=1d&events=history&includeAdjustedClose=true`
      );

      const data = response.data;
      const historicalData = processData(data);

      if (historicalData.length > 0) {
        generateGraph(historicalData);
        downloadDataAsJson(historicalData, symbol);
      } else {
        console.error('No data received from Yahoo Finance API.');
      }
    } catch (error) {
      console.error('Error occurred while downloading data:', error.message);
    }
  };

  const processData = (data) => {
    if (
      data.chart &&
      data.chart.result &&
      data.chart.result[0].timestamp &&
      data.chart.result[0].indicators &&
      data.chart.result[0].indicators.quote &&
      data.chart.result[0].indicators.quote[0]
    ) {
      const timestamps = data.chart.result[0].timestamp;
      const quotes = data.chart.result[0].indicators.quote[0];

      return timestamps.map((timestamp, index) => ({
        Date: new Date(timestamp * 1000).toISOString().split('T')[0],
        Open: quotes.open[index],
        High: quotes.high[index],
        Low: quotes.low[index],
        Close: quotes.close[index],
        Volume: quotes.volume[index],
      }));
    } else {
      console.error('No historical price data received from Yahoo Finance API.');
      return [];
    }
  };

  const generateGraph = (historicalData) => {
    const dates = historicalData.map((item) => item.Date);
    const prices = historicalData.map((item) => item.Close);

    const ctx = document.getElementById('priceChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Closing Price',
            data: prices,
            borderColor: 'blue',
            borderWidth: 1,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date',
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Closing Price',
            },
          },
        },
      },
    });
  };

  const downloadDataAsJson = (data, symbol) => {
    const jsonData = JSON.stringify(data, null, 2);
    const fileName = `${symbol}_historical_data.json`;

    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log(`Data for ${symbol} downloaded successfully to ${fileName}`);
  };

  return (
    <form id="dataForm" onSubmit={handleFormSubmit}>
       <label for="symbol">ETF Symbol</label>
       <input type="text" id="symbol" name="symbol" placeholder="FNGD" required />
       <label for="start-date">Start Date</label>
       <input type="date" id="start-date" name="start-date" required />
       <label for="end-date">End Date</label>
       <input type="date" id="end-date" name="end-date" required />
       <button type="submit">Download data</button>
       <canvas id="priceChart"></canvas>
    </form>
  );
};

export default DataDownloadForm;
