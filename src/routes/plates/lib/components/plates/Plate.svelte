<script>
	import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	// import { Separator } from "$lib/components/ui/separator";
  
	// import { models, types } from "./(data)/models";
	// import { presets } from "./(data)/presets";
	import { plateSample } from "./(data)/plates";
  import { WellSchema } from '$routes/plates/lib/schemas'

  import * as Select from "$lib/components/ui/select";
 
  let plateErrors, message;

  const sizes = [
    { value: "96", label: "96-well plate (12 x 8)" },
    { value: "384", label: "384-well plate (24 x 16)" }
  ];

  let isEdited = true; // always show; figure this out later
  
  export let plateData = plateSample || { meta: null, wells: null } // for testing
  let selectedSize = plateData.meta?.size || sizes[0].value;

  // data fix for arbitrary data entry in excel lol — breaks stuff!


  $: if(!plateData || typeof plateData !== 'object' || Array.isArray(plateData)) {
    plateData = {
      meta: null,
      wells: null,
    }
  }

  $: if(plateData) {
    if(!plateData.meta) {
      plateData.meta = {}
    }
    if(!plateData.wells) {
      plateData.wells = {}
    }
  }

  $: console.log('selectedSize', selectedSize)

  // hard code some sizing
  // sizing assumes 384 is max; would usually probably do xx.yy coordinate naming to support infinite sizing
  // but this is to map it to Excel / Sheets

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  let rowSize, colSize, cols, rows;
  $: if(selectedSize) {
      if(selectedSize == "96") {
      // row: 12 = A - L
      // col: 8 = 1 - 8
      rowSize = 12;
      colSize = 8;
    } else if (selectedSize = "384") {
      // row: 24 = A - X
      // col: 16 = 1 - 16
      rowSize = 24;
      colSize = 16;
    }
    rows = Array.from({length: colSize}, (_, i) => i + 1);
    cols = alphabet.slice(0, rowSize);
  }





  let selectedWell = "A1"; // default for testing
  let selectedWellData;

  function updatePlateData(selectedWell, selectedWellData) {
    // if nothing to process, we just save the full data set
    if(!selectedWellData || Object.values(selectedWellData).length < 1)
      return

    // update plate data
    let updatedPlate = {...plateData};

    // make sure concentration is a number
    if(selectedWellData && selectedWellData.concentration) {
      if(typeof selectedWellData.concentration === 'string') {
        selectedWellData.concentration = Number(selectedWellData.concentration);
      }
    }

    plateErrors = ''
    const result = WellSchema.safeParse(selectedWellData);
    if (!result.success) {
      plateErrors = result.error
      message = "fix yer data"
    }

    updatedPlate.wells[selectedWell] = selectedWellData;
    plateData = updatedPlate || {meta: null, wells: null};

    console.log('updated plate data:', plateData)
    isEdited = true
  }

  // auto update?
  // $: if(selectedWellData) {
  //   updatePlateData(selectedWell, selectedWellData);
  // }




  async function savePlateData(id, plateData) {
    message='Saving...';
    // remove all empty objects
    plateData.wells = Object.fromEntries(Object.entries(plateData.wells).filter(([key, value]) => value && Object.keys(value).length > 0));
    
    // find and report all errored wells
    let errors = {};
    for (let wellId in plateData.wells) {
      const wellData = plateData.wells[wellId];
      const result = WellSchema.safeParse(wellData);
      if (!result.success) {
        errors[wellId] = result.error;
      }
    }

    if (Object.keys(errors).length > 0) {
      plateErrors = errors;
      return;
    }


    try {
      let postData = {
        command: "set-plate",
        id,
        data: plateData
      }
      console.log('Sending data...', postData);
      const response = await fetch('/plates/api/plates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        message = "Oops!"
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        message = 'Saved!';
        // isEdited = false; // this'll hide the save button / update design!
      }
    } catch (error) {
      console.error('An error occurred while saving the plate data:', error);
      message = 'An error occurred while saving the data.';
    }
  }



  async function deletePlate(id) {
    message='Deleting...';

    try {
      let postData = {
        command: "delete",
        id
      }
      const response = await fetch('/plates/api/plates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        message = "Oops!"
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        message = '(Soft) Deleted!';
      }
    } catch (error) {
      console.error('An error occurred while saving the plate data:', error);
      message = 'An error occurred while saving the data.';
    }
  }

</script>


<div class="Plate | ">

  <div class="Plate-well-combo | grid grid-cols-3-1 gap-2">
    <div class="Plate-wells | overflow-scroll bg-slate-50 border border-slate-100 rounded-md p-4">
      {#each rows as row (row)}
        <div class="row | flex items-center | -mx-1">
          {#each cols as col (col)}
            {#if plateData?.wells}
              {@const plate = plateData?.wells?.[`${col}${row}`] || {}}
              <div class="col" class:active={selectedWell === `${col}${row}`}>
                <Button 
                  on:click={() => {
                    console.log(`Clicked ${col}${row}`)
                    selectedWell = `${col}${row}`
                    selectedWellData = plateData.wells?.[selectedWell] || {}
                  }}
                  variant="outline" 
                  class="cursor-pointer w-12 h-12 m-1 {selectedWell === `${col}${row}` && 'active border-blue-500 border-2'}"
                  style="{`background-color: rgb(45 179 255 / ${plate?.concentration || 0})`}" >
                  <!-- make sure not to round these! -->

                  <!-- split up for readability/editability -->
                  {#if plate?.concentration}
                    <Label class="cursor-pointer">
                      <span>{`${String(plate?.concentration).substring(0, 5)}`}</span>
                      <span class="block text-xs text-sky-700">{`${col}${row}`}</span>
                    </Label>
                  {:else}
                    <Label class="cursor-pointer text-gray-400">{`${col}${row}`}</Label>
                  {/if}
                </Button>
              </div>
            {/if}
          {/each}
        </div>
      {/each}
    </div>
  
    <div class="Plate-well-details | h-full">

      <div class="Plate-sizes mb-4">
        <div class="grid w-full max-w-sm items-center gap-1.5 mb-4">
          <Label for="plate-name">Plate name</Label>
          <Input type="text" id="plate-name" placeholder="0.28" bind:value="{plateData.meta.name}" />
        </div>
        <div class="grid w-full max-w-sm items-center gap-1.5 mb-4">
          <Label for="plate-name">Plate name</Label>
          <Input type="text" id="plate-name" placeholder="0.28" bind:value="{plateData.meta.id}" />
        </div>
        <div class="grid w-full max-w-sm items-center gap-1.5 mb-4">
          <Label for="plate-name">Plate size</Label>
          <Select.Root
            selected={sizes.find(v=>v.value === plateData.meta.size) || sizes[0]}
            onSelectedChange={(v) => {
              selectedSize = v.value;
              if(!plateData.meta) plateData.meta = {} 
              plateData.meta.size = v.value;
              isEdited = true
            }}
          >
            <Select.Trigger class="w-[220px]">
              <Select.Value placeholder="Select a plate size" />
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Label>Plate Sizes</Select.Label>
                {#each sizes as size}
                  <Select.Item value={size.value} label={size.label}
                    >{size.label}</Select.Item
                  >
                {/each}
              </Select.Group>
            </Select.Content>
            <Select.Input name="favoriteFruit" />
          </Select.Root>
        </div>
      </div>
      
      {#if selectedWellData}
        <div class="Plate-well-info | border border-input rounded-md | p-4">
          <div class="inline-block text-xl p-2 rounded-md border-2 border-blue-200 p-4 w-12 h-12 flex items-center justify-center mb-4">{selectedWell}</div>
          <div class="text-sm mb-4">Normally I'd use a form w/ zod validation here, but for the demo, let's make it quicker</div>
          <div class="grid w-full max-w-sm items-center gap-1.5 mb-6">
            <Label for="reagent">Reagent</Label>
            <Input type="text" id="reagent" placeholder="R12345" bind:value="{selectedWellData.reagent}" on:blur="{updatePlateData(selectedWell, selectedWellData)}"/>
            <!-- <p class="text-sm text-muted-foreground">Enter your email address.</p> -->
          </div>
  
          <div class="grid w-full max-w-sm items-center gap-1.5 mb-6">
            <Label for="antibody">Antibody</Label>
            <Input type="text" id="antibody" placeholder="ABCDEFGHIJKLMNOPQRSTUVWXYZ" bind:value="{selectedWellData.antibody}" on:blur="{updatePlateData(selectedWell, selectedWellData)}"/>
            <!-- <p class="text-sm text-muted-foreground">Enter your email address.</p> -->
          </div>
  
          <div class="grid w-full max-w-sm items-center gap-1.5">
            <Label for="concentration">Concentration</Label>
            <Input type="text" id="concentration" placeholder="0.28" bind:value="{selectedWellData.concentration}" on:blur="{updatePlateData(selectedWell, selectedWellData)}"/>
            <!-- <p class="text-sm text-muted-foreground">Enter your email address.</p> -->
          </div>
        </div>
      {/if}

      {#if isEdited}
        <div class="flex justiify-center items-center gap-4 mt-4">
          <Button 
            on:click={async () => {
              updatePlateData(selectedWell, selectedWellData);
              await savePlateData(plateData.meta.id, plateData);
            }}
            class="cursor-pointer">
            <Label class="cursor-pointer">Save Plate</Label>
          </Button>
          <Button 
            variant="outline" 
            on:click={async () => {
              await deletePlate(plateData.meta.id,);
            }}
            class="cursor-pointer">
            <Label class="cursor-pointer">Delete Plate</Label>
          </Button>
          <div class="">{message||''}</div>
        </div>
      {/if}
    </div>

  </div>

  {#if plateErrors} 
    <div class="errors mt-4">
      <div class="text-xl text-red-500">Ugly error log</div>
      <div class="mb-2">Normally if we use proper form validation, we'd have "touched" but here we just want to see what's going on in real time</div>
      <pre class="error-log ">{JSON.stringify(plateErrors, null, 2)}</pre>
      <pre class="data ">{JSON.stringify(selectedWellData, null, 2)}</pre>
    </div>
  {/if}

</div>

