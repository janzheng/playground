

import { CURRENCY_API } from '$env/static/private';
import { json, error } from '@sveltejs/kit'
// import { getPlates, createPlate, setPlate, deletePlate, getWell, setWell } from '$lib';


async function getCurrencyData({from, to, amount, date}) {
  const url = `https://api.apilayer.com/exchangerates_data/convert?from=${from}&to=${to}&amount=${amount}&date=${date}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': CURRENCY_API
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}


export const POST = async ({ request }) => {
  try {
    let { command, from, to, amount, date } = await request.json()
    let results
    console.log('[POST]', `command: ${command}`, from, to, amount, date)
    let currencyData = {
      "status": "DUMMY DATA",
      "success": true,
      "query": {
        "from": "AUD",
        "to": "USD",
        "amount": 10
      },
      "info": {
        "timestamp": 1710339843,
        "rate": 0.66157
      },
      "date": "2024-03-13",
      "historical": true,
      "result": 6.6157
    }

    // THESE USE UP CREDITS!!
    // currencyData = await getCurrencyData({from, to, amount, date});

    return json(currencyData)
  } catch (e) {
    console.error('[POST]', e)
    error(500, e.message)
  }
}


