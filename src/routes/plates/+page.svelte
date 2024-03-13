<script lang="ts">
  import { marked } from 'marked';
  import docs from './docs.md?raw';
  import { Button } from "$lib/components/ui/button";
  import Plate from '$routes/plates/lib/components/plates/Plate.svelte';
	import { plateNew } from "$routes/plates/lib/components/plates/(data)/plates";

  import { page } from '$app/stores';

  let plates = $page.data.plates

  function createPlate() {
    console.log('new plate')
    plates.unshift({Data: plateNew});
    plates = plates; // reactivity
  }

</script>
 
<div class="container | p-4">

  <div class="writeup ">
    <h1 class="text-4xl">Plate Assay Fun</h1>
    <p>Scroll <a href="#docs">down</a> to see the docs to see what's going on</p>
  </div>

  <div class="plates-new | mb-12 ">
    <Button class="bg-blue-500 hover:bg-blue-700" on:click={()=>(createPlate())}>Create a New Plate</Button>
  </div>


  <div class="plates-list |">
    {#each plates as plate}
      {#if plate.isDeleted}
        <div class="plate-container | mb-8 border-2 bg-slate-100 p-4 rounded-md">
          Plate "{plate.Id}"" has been deleted!!
        </div>
      {:else}
        <div class="plate-container | mb-8">
          <Plate plateData={plate.Data}/>
        </div>
      {/if}
    {/each}
  </div>


  <div class="api-docs | mt-24" id="docs">
    {@html marked(docs||'not found')}
  </div>  
</div>
