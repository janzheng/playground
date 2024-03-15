<script>

  import * as chrono from 'chrono-node';
	import { immerStore, History } from 'svelte-immer-store';

	import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Rocket, ChevronDown, Width, Calendar as CalendarIcon } from "radix-icons-svelte";
  
  import { tick } from "svelte";
  import { CalendarDate, today, DateFormatter, getLocalTimeZone } from "@internationalized/date";
  import { cn } from "$lib/utils";

  import Calendar from "$lib/components/ui/calendar/calendar.svelte";
  import * as Popover from "$lib/components/ui/popover";
  import * as Command from "$lib/components/ui/command";

  import currencyList from './short-currencies.json';


  let errorMessages, message, requests=[], results=[], resultString;

  export let currencyData$ = immerStore({
    from: 'AUD',
    to: 'USD',
    amount: 100,
    date: today(getLocalTimeZone()),
  });

  const df = new DateFormatter("en-US", {
    dateStyle: "long"
  });

	const from$ = currencyData$.select(state => state.to);
	const to$ = currencyData$.select(state => state.from);
	const amount$ = currencyData$.select(state => state.amount);
	const date$ = currencyData$.select(state => state.date);

  function currencySwap() {
    let temp = $from$;
    $from$ = $to$;
    $to$ = temp;
    console.log(`Clicked swap | currencyData`, $currencyData$);
  }

  const currencies = Object.values(currencyList).map(cur => ({
    ...cur,
    value: cur.code,
    label: cur.code
  }))
  
  let fromOpen, toOpen, calOpen;
 
  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger(triggerId) {
    fromOpen = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }


  async function doConvert(currencyData) {
    message='Converting...';
    
    try {
      let postData = {
        ...currencyData,
        date: currencyData.date.toString()
      }
      console.log('Sending data...', postData);
      requests = [...requests, postData];
      const response = await fetch('currencies/api/convert', {
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
        // results = [...results,await response.json()];
        console.log('results', results)
        let result = await response.json()
        message = `Total amount in ${$to$}: ${currencies.filter(cur => cur.value === $from$)[0].symbol}${result.result}`;
      }
    } catch (error) {
      console.error('An error occurred while converting:', error);
      message = 'An error occurred while converting.';
    }
  }


</script>


<div class="Converter | py-4 px-4 rounded-md bg-slate-100 mb-4 ">

  <div class="ui-group flex flex-row items-center gap-1">

    <span class="hidden md:inline | pr-1 md:w-8 text-right text-sm text-gray-500">{currencies.filter(cur => cur.value === $from$)[0].symbol}</span>
    <Input type="number" placeholder="Amount" class="bg-white w-12 md:w-14 px-2 pb-[9px]" bind:value="{$amount$}" />
  
    <Popover.Root bind:open={fromOpen} let:ids>
      <Popover.Trigger asChild let:builder>
        <Button
          builders={[builder]}
          variant="outline"
          role="combobox"
          aria-expanded={fromOpen}
          class="min-w-[70px] px-2 justify-between"
        >
          <!-- {currencies.filter(cur => cur.value === $from$)[0].symbol} -->
          <span>{$from$}</span>
          <!-- <span class="text-sm text-gray-500 baseline">
            {currencies.filter(cur => cur.value === $from$)[0].name}
          </span> -->
          <ChevronDown class="h-4 w-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Content class="w-[200px] p-0">
        <Command.Root>
          <Command.Input placeholder="Search currencies..." />
          <Command.Empty>No currency found.</Command.Empty>
          <Command.Group class="max-h-48 overflow-y-auto">
            {#each currencies as currency}
              <Command.Item
                value={currency.value}
                onSelect={(currentValue) => {
                  $from$ = currentValue;
                  closeAndFocusTrigger(ids.trigger);
                }}
              >
                <span>
                  {currency.label}
                </span>
                <span class="ml-2 text-sm text-gray-500 baseline">
                  {currency.name}
                </span>
              </Command.Item>
            {/each}
          </Command.Group>
        </Command.Root>
      </Popover.Content>
    </Popover.Root>
      
    <Button 
      on:click={() => {
        currencySwap();
      }}
      variant="outline" 
      class="hidden md:inline-flex px-0 cursor-pointer w-10 h-10 ` && 'active border-blue-500 border-2'}"
        >
      <Label class="cursor-pointer text-center">
        <Width class="h-4 w-4 text-center" />
      </Label>
    </Button>
  
    <Popover.Root bind:open={toOpen} let:ids>
      <Popover.Trigger asChild let:builder>
        <Button
          builders={[builder]}
          variant="outline"
          role="combobox"
          aria-expanded={toOpen}
          class="min-w-[70px] px-2 justify-between"
        >
          <span>{$to$}</span>
          <!-- <span class="text-sm text-gray-500 baseline">
            {currencies.filter(cur => cur.value === $to$)[0].name}
          </span> -->
          <ChevronDown class="h-4 w-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Content class="w-[200px] p-0">
        <Command.Root>
          <Command.Input placeholder="Search currencies..." />
          <Command.Empty>No currency found.</Command.Empty>
          <Command.Group class="max-h-48 overflow-y-auto">
            {#each currencies as currency}
              <Command.Item
                value={currency.value}
                onSelect={(currentValue) => {
                  $to$ = currentValue;
                  closeAndFocusTrigger(ids.trigger);
                }}
              >
                <span>
                  {currency.label}
                </span>
                <span class="ml-2 text-sm text-gray-500 baseline">
                  {currency.name}
                </span>
              </Command.Item>
            {/each}
          </Command.Group>
        </Command.Root>
      </Popover.Content>
    </Popover.Root>
    
    <Popover.Root bind:open={calOpen}>
      <Popover.Trigger asChild let:builder>
        <Button
          variant="outline"
          class={cn(
            "flex-1 px-1 md:px-4 md:w-[240px] justify-start text-left font-normal overflow-hidden",
            !$date$ && "text-muted-foreground"
          )}
          builders={[builder]}
        >
          <CalendarIcon class="mr-2 h-4 w-4" />
          {$date$ && $date$?.toDate ? df.format($date$?.toDate(getLocalTimeZone())) : "Pick a date"}
        </Button>
      </Popover.Trigger>
      <Popover.Content class="w-auto p-0" align="start">
        <Input type="text" placeholder="Enter a date (e.g. 1990 Jan 1)" class="w-full inline-block" 
          on:input={(e)=>{
          if(e.target.value) {
            let newdate = chrono.parseDate(e.target.value);
            if (newdate) {
              console.log('newDate:', newdate);
              let year = newdate.getUTCFullYear();
              let month = newdate.getUTCMonth() + 1; // getUTCMonth() returns a zero-based month, so we add 1
              let day = newdate.getUTCDate();
              $date$ = new CalendarDate(year, month, day, getLocalTimeZone());
            } else {
              console.error('Invalid date:', e.target.value);
            }
          }
          }}
          on:keydown={(e)=>{
            if(e.key === 'Enter') {
              let newdate = chrono.parseDate(e.target.value);
              if (newdate) {
                console.log('newDate:', newdate);
                let year = newdate.getUTCFullYear();
                let month = newdate.getUTCMonth() + 1; // getUTCMonth() returns a zero-based month, so we add 1
                let day = newdate.getUTCDate();
                $date$ = new CalendarDate(year, month, day, getLocalTimeZone());
                calOpen = false;
              } else {
                console.error('Invalid date:', e.target.value);
              }
            }
          }}
   />
        <Calendar bind:value="{$date$}" />
      </Popover.Content>
    </Popover.Root>
  
    <Button 
        on:click={() => {
          doConvert($currencyData$);
        }}
        variant="outline" 
        class="cursor-pointer w-10 h-10 ` && 'active border-blue-500 border-2'}"
         >
        <Label class="cursor-pointer">
          <Rocket class="h-4 w-4" />
          <!-- <span class="">🚀</span> -->
        </Label>
      </Button>
  </div>

  {#if message}
    <div class="message-group | text-sm rounded-md p-4 pb-1 bg-slate-100">
      {message||''}
    </div>
  {/if}

</div>

