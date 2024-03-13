

import { json, error } from '@sveltejs/kit'
import { getPlates, createPlate, setPlate, deletePlate, getWell, setWell } from '$lib';


export const GET = async ({ url, params, setHeaders, locals }) => {
  try {
    console.log('[GET] Show all plates')
    let plates = await getPlates();
    return json(plates)
  } catch (e) {
    console.error('[GET all plates]', e)
  }
}






export const POST = async ({ request }) => {
  try {
    let { command, id, data, wellId } = await request.json()
    let results
    console.log('[POST]', `command: ${command}, id: ${id}`)

    if (command == 'get') {
      results = await getPlates(id);
    }

    else if(command == 'delete') {
      results = await deletePlate(id);
    }

    else if (command == 'create') {
      // resets the entire plate data w/ new data
      // creates a new plate if plate doesn't work
      results = await createPlate(id, data);
    }


    /*
        plate + well stuff

        - plates 
          - are an array of wells
          - treated as sparse
        
        - wells are treated as simple, sparse objects
          - x/y coordinates mirror Excel

    */
    else if (command == 'set-plate') {
      // resets the entire plate data w/ new data
      // ** errors if plate doesn't exist
      // ** needs to conform to welll schema
      results = await setPlate(id, data);
    }

    else if (command == 'get-well') {
      results = await getWell(id, wellId);
    }

    else if (command == 'set-well') {
      // acts as upsert
      results = await setWell(id, wellId, data);
    }

    else {
      throw new Error(`command: ${command} not found`)
    }


    return json(results)
  } catch(e) {
    console.error('[POST]', e)
    error(500, e.message)
  }
}


