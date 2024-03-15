<script>

	import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { MagicWand, Rocket, ChevronDown, Width, Calendar as CalendarIcon } from "radix-icons-svelte";
  import { cn } from "$lib/utils";

  let errorMessages, message, requests=[], results=[], result;
  export let promptStr = "what's $100 USD to AUD?"

  async function doConvert(promptStr) {
    message='Getting an answer...';
    
    try {
      let postData = {
        str: promptStr
      }
      requests = [...requests, postData];
      const response = await fetch('currencies/api/chat', {
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
        message = ''
        result = await response.json()
        results = [...results, result];
        console.log('result', result)
        if(result?.reply?.json) {
          message = `Thought process: ${result?.reply?.json?.thinking} <br><b>Answer: ${result?.reply?.json?.answer}<b>`;
        }
        else if(result.results?.content) {
          message += `${result.results?.content}`;
        }
      }
    } catch (error) {
      console.error('An error occurred while converting:', error);
      message = 'An error occurred while converting.';
    }
  }


</script>


<div class="ChatConverter | p-4 rounded-md bg-slate-100 mb-4 ">

  <div class="ui-group flex flex-row items-center gap-1">

    <Input 
        type="text" 
        placeholder="ex: Convert $100 AUD to USD" 
        class="bg-white w-full px-2 pb-[9px]" 
        bind:value="{promptStr}" 
        on:keydown={(e) => {
          if(e.key === 'Enter') {
            doConvert(promptStr);
          }
        }}
    />

    <Button 
        on:click={() => {
          doConvert(promptStr);
        }}
        variant="outline" 
        class={cn(`cursor-pointer w-10 h-10 `, `active border-2 `)}
    >
        <Label class="cursor-pointer ">
          <MagicWand class="h-4 w-4" />
          <!-- <span class="">✨</span>-->
        </Label>
    </Button>
  </div>

  {#if message}
    <div class="message-group | text-sm rounded-md pt-4 pb-1 bg-slate-100">
      {@html message||''}
      {#if results && results.length > 0}
        <details class="message-group | mt-2">
          <summary>Request trace</summary>
          {#each results as result}
            <pre class="overflow-scroll max-h-96 mb-4">{JSON.stringify(result, 0, 2)}</pre>
          {/each}
        </details>
      {/if}
    </div>
  {/if}

</div>

