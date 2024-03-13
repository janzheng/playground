// place files you want to import through the `$lib` alias in this folder.

// import sheet, { Sheet } from '@yawnxyz/sheetlog';
// import { z } from 'zod';
import { PUBLIC_SHEET_URL } from '$env/static/public';
import sheet, { Sheet } from '$lib/sheetlog';

import { WellSchema } from './schemas'

function processData(data) {
  try {
    if(!data) return null
    if (Array.isArray(data)) {
      return data.map(item => {
        if (item.Data) {
          item.Data = JSON.parse(item.Data);
        }
        console.log('item:', item)
        return item;
      });
    } else {
      return {
        ...data, 
        Data: JSON.parse(data.Data)
      }
    }
  } catch(e) {
    console.error('[[processData error]]', e)
    // there's a chance the cell is just empty,
    return data
  }
}

function setup() {
  sheet.setup({
    sheetUrl: PUBLIC_SHEET_URL,
    sheet: "Plates"
  });
}



export const createPlate = async (id, data) => {
  setup();
  try {
    // this is set to overwrite whatever's already there w/o checks
    let result = await sheet.update({ Id: id, Data: JSON.stringify(data) }, {
      "id": id,
      "idColumn": "Id",
    });
    
    return result
  } catch (e) {
    console.error('[[createPlate error]]', e)
  }
}

export const getPlates = async (id) => {
  let result
  setup();
  if(!id) {
    // if no id, list all plates
    result = await sheet.list()
  } else {
    result = await sheet.find("Id", id);
  }
  return processData(result?.data)
}


// sets plate + validates data
export const setPlate = async (id, data) => {
  setup();
  let plate = await getPlates(id);

  // upsert instead for faster usage; create a new item
  // if(!plate)
  //   throw new Error('plate not found');
  if(!plate) {
    plate = {
      Id: id,
      wells: {},
      meta: {
        id,
        name: id,
        size: "96"
      }
    }
  }

  if (!data.wells)
    throw new Error('well data needs to be in data.wells: {}');

  Object.values(data?.wells).forEach(value => {
    const result = WellSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid data: ${JSON.stringify(result.error)}`);
    }
  });

  return await sheet.update({ ...plate, Data: JSON.stringify(data) }, {
    "id": id,
    "idColumn": "Id",
  });
}


export const deletePlate = async (id) => {
  setup();
  try {
    let result = await sheet.find("Id", id);
    let plate = processData(result.data)
    if (plate) {
      result = await sheet.update({ ...plate, isDeleted: true }, {
        "id": id,
        "idColumn": "Id",
      });
      return result
    }
  } catch(e) {
    console.error('[[deletePlate error]]', e)
  }
}


export const getWell = async (id, wellId) => {
  setup();
  let plate = await getPlates(id);
  let well
  if(!plate)
    throw new Error('plate not found');

  well = plate.Data?.wells?.[wellId]

  if(!well)
    throw new Error('well not found');

  return well
}

export const setWell = async (id, wellId, data) => {
  setup();
  let plate = await getPlates(id);

  let result = WellSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid data: ${JSON.stringify(result.error)}`);
  }

  if (!plate)
    throw new Error('plate not found');

  plate.Data.wells[wellId] = data;

  result = await sheet.update({ ...plate, Data: JSON.stringify(plate.Data) }, {
    "id": id,
    "idColumn": "Id",
  });

  return result
}