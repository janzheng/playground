<script>

	import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { MagicWand, Rocket, ChevronDown, Width, Calendar as CalendarIcon } from "radix-icons-svelte";
  import { cn } from "$lib/utils";

  let message = ''
  let errorMessages, requests=[], results=[], result;
  export let cta = "USD → AUD", prompt = "what's $100 USD to AUD?"

  async function doConvert(prompt) {
    message='🤔';
    
    try {
      let postData = {
        str: prompt,
        mode: "loopPrompt"
      }
      requests = [...requests, postData];
      const response = await fetch('/currencies/api/chat', {
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
          message = `${result?.reply?.json?.answer}`;
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


<div class="ChatConverter | mb-2 ">

  <div class="ui-group md:flex flex-row items-center gap-1">

    <Button 
        on:click={() => {
          doConvert(prompt);
        }}
        variant="outline" 
        class={cn(`cursor-pointer h-10 `, `active border-2 `)}
    >
        <Label class="cursor-pointer ">
          {cta}
          <MagicWand class="inline h-4 w-4" />
        </Label>
    </Button>

    {#if message}
      <div class="">{@html message||''}</div>
    {/if}
  </div>


</div>

