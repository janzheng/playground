# Plate Assay Experiment & Fun!

This is prototype of what a Plate Assay editor might look and work like. This is a prototype, which means many of the proper data and UX guardrails haven't been built-in yet!

This project works by reading data from the [Plates sheet on this Google Sheet](https://docs.google.com/spreadsheets/d/1z_g_BINVA7XzE-qriC-pjcL8pGvj1AOCq-xBB9a8GSw/edit?usp=sharingyeah), and populating the component. Whenever you save, you save the details back to the Google Sheet. Note that I chose to represent the grid as a JSON string, and NOT as individual Google Sheets... but that would also be very possible to do.

<!-- Find the working sample here: https://assay-plate.vercel.app -->
<!-- And the code here: https://github.com/janzheng/plate-assay -->

All the data is written to and read from: https://docs.google.com/spreadsheets/d/1z_g_BINVA7XzE-qriC-pjcL8pGvj1AOCq-xBB9a8GSw/edit?usp=sharingyeah 

# API Documentation

This document provides examples of how to interact with the Plate Assay API.

<!-- The base URL for all requests is: https://assay-plate.vercel.app -->

## Get All Plates

To get all plates, send a GET request to`/api/plates`.

```javascript
fetch('https://assay-plate.vercel.app/api/plates', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

## Get Plate(s) by ID

To get a specific plate by ID, send a POST request to `/api/plates` with the following body:

```javascript
fetch('https://assay-plate.vercel.app/api/plates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    command: 'get',
    id: 'phageyphage'
  })
});
```

## Delete a Plate

To delete a specific plate by ID, send a POST request to `/api/plates` with the following body:

```javascript
fetch('https://assay-plate.vercel.app/api/plates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    command: 'delete',
    id: 'phageyphage'
  })
});
```

## Create a Plate

To create a new plate, send a POST request to `/api/plates` with the following body. These are NOT checked for inputs:

```javascript
fetch('https://assay-plate.vercel.app/api/plates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    command: 'create',
    id: 'phageyphage',
    data: {
      banana: 'yes'
    }
  })
});
```

## Init / Reset Plate Data

To initialize or reset plate data, send a POST request to `/api/plates` with the following body:

```javascript
fetch('https://assay-plate.vercel.app/api/plates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    command: 'set-plate',
    id: 'test',
    data: {
      some: 'rawrrr'
    }
  })
});
```

## Set Plate

To set plate data, send a POST request to `/api/plates` with the following body. If an Id doesn't exist, it'll upsert a new plate:

```javascript
fetch('https://assay-plate.vercel.app/api/plates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "command": "set-plate",
    "id": "phageyphage",
    "data": {
        "meta": {
            "name": "somephageytest",
            "id": "phageyphage",
            "size": "96"
        },
        "wells": {
            "A1": {
                "reagent": "R1234",
                "antibody": "ACDEFGHIKLMNPQRSTVWYACDEFGHACDEFDFDF",
                "concentration": 0.4
            },
            "B2": {
                "reagent": "R1234",
                "antibody": "ACDEFGHIKLMNPQRSTVWYACDEFGHACDEFDFDF",
                "concentration": 0.4
            }
        }
    }
})
});
```

## Get Plate / Well

To get data for a specific well in a plate, send a POST request to `/api/plates` with the following body:

```javascript
fetch('https://assay-plate.vercel.app/api/plates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    command: 'get-well',
    id: 'test',
    wellId: 'B2'
  })
});
```

## Add or Edit Plate / Well

To add or edit data for a specific well in a plate, send a POST request to `/api/plates` with the following body:

```javascript
fetch('https://assay-plate.vercel.app/api/plates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    command: 'set-well',
    id: 'test',
    wellId: 'A1',
    data: {
      reagent: 'R1111',
      antibody: 'YYYAFAFFDGHIKLMNPQRSTVWYACDEFGHACDEFDFDF',
      concentration: 0.999
    }
  })
});
```