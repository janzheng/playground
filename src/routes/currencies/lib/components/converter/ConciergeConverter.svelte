
<script>

	import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as Table from "$lib/components/ui/table";
	import { MagicWand, CaretSort, Check, Rocket, ChevronDown, Width, Calendar as CalendarIcon } from "radix-icons-svelte";
  import { cn } from "$lib/utils";

  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  let showPrompt = false, showPromptDone = false;
  

  import { CalendarDate, today, DateFormatter, getLocalTimeZone } from "@internationalized/date";
	import { immerStore, History } from 'svelte-immer-store';  
  
  import Calendar from "$lib/components/ui/calendar/calendar.svelte";
  import * as Popover from "$lib/components/ui/popover";
  import * as Command from "$lib/components/ui/command";


  import currencyList from './short-currencies.json';


  let checked = false
  let promptStr = "what's $100 USD to AUD?"
  let fromList = Object.values(currencyList).map(cur => ({...cur, checked: false}));
  let toList = Object.values(currencyList).map(cur => ({...cur, checked: false}));
  let resultsList = [
    {
        "from": "USD",
        "to": "CAD",
        "amount": 116.92
    },
    {
        "from": "EUR",
        "to": "AUD",
        "amount": 161.28
    },
    {
        "from": "AUD",
        "to": "USD",
        "amount": 65.35
    },
    {
        "from": "CAD",
        "to": "EUD",
        "amount": 73.22
    }
  ]; // conversion results
  resultsList = [] // reset the examples

  // prepopulate for testing
  fromList[0].checked = true
  fromList[1].checked = true
  toList[2].checked = true
  toList[3].checked = true


  let errorMessages, message=' ', requests=[], results=[], result;
  export let amount = 100

  async function doConvert() {
    message='Getting an answer...';
    
    try {
      let postData = {
        str: `Please help me convert this amount: {${amount}} 
        from each of currencies: ${fromList.map(cur => cur.checked && cur.code || '').filter(a=>a).join(',')} to each of following currencies: ${toList.map(cur => cur.checked && cur.code || '').filter(a=>a).join(',')}.
        for each element in the FROM list, please run a function call w/ each element in the TO list.
        Only do conversions in the FROM list to another in the TO list.
        Please output your answers in a JSON array, for each conversion as follows:
        [{
          from: "USD",
          to: "EUR",
          amount: 100
        } ...]

        Please use one function call for each pair as it only does ONE CURRENCY PAIR at a time, so please call it multiple times.
        Here's an example: If you're asked to convert FROM TWO (2) currencies TO TWO (2) currencies, you should have 2x2 = 4 results in your JSON array. Ex: $100 From USD, CAD to EUR, CAD should yield results for: USD>EUR, USD,AUD, CAD>EUR, CAD>AUD
        Please review your answers after function calling. 
        Your answer should have ${fromList.map(cur => cur.checked && cur.code || '').filter(a=>a).length * toList.map(cur => cur.checked && cur.code || '').filter(a=>a).length} results.
        If you don't know or if the function call is unable to give you the answer GENERATE YOUR BEST GUESS ANSWER, but add (guess) to the To column, like CAD (guess) or USD (guess).
        `
      }
      requests = [...requests, postData];

      console.log('Sending:', postData.str)

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

        if(result?.reply?.json?.thinking) {
          message = `Thought process: ${result?.reply?.json?.thinking}`;
        }
        else if(result.results?.content) {
          message += `${result.results?.content}`;
        }

        // so annoying
        if(result?.reply?.json?.answer) {
          resultsList = result?.reply?.json?.answer
          // resultsList = JSON.parse(result.results?.content)
          // console.log('result>????', result.results?.content, resultsList)
          // message = ''
        }

        if(result?.reply?.json?.results) {
          resultsList = result?.reply?.json?.results
        }

        resultsList=resultsList // reflexive update just in case
        
      }
    } catch (error) {
      console.error('An error occurred while converting:', error);
      message = 'An error occurred while converting.';
    }
  }





  let fromOpen, toOpen, calOpen;
  export let currencyData$ = immerStore({
    from: 'AUD',
    to: 'USD',
    amount: 100,
    date: today(getLocalTimeZone()),
  });

  const df = new DateFormatter("en-US", {
    dateStyle: "long"
  });
  const dfs = new DateFormatter("en-US", {
    dateStyle: "short"
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
  
  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger(triggerId) {
    fromOpen = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }


  async function doDataConvert(currencyData) {
    message='Converting...';
    
    try {
      let postData = {
        ...currencyData,
        date: currencyData.date.toString()
      }
      console.log('Sending data...', postData);
      requests = [...requests, postData];
      const response = await fetch('/currencies/api/convert', {
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










<div class="ConciergeConverter | p-1 md:p-4 rounded-md bg-slate-100 mb-4 ">

  <div class="concierge-group-test">
    <div class="ui-group flex flex-row items-center gap-1 | p-1 bg-white/50 rounded-md overflow-hidden">
  
      <!-- <div class="switcher | relative  flex flex-row gap-2 items-center flex-1 {!showPromptDone && 'overflow-hidden'}"> -->
      <div class="switcher | relative  flex flex-row gap-2 items-center flex-1 ">
      <!-- <div class="switcher | relative  flex flex-row gap-2 items-center flex-1 | overflow-hidden"> -->
        <div class="trad-ui flex flex-row items-center gap-1 | flex-1 shrink">
          
          <span class="hidden md:inline pr-1 md:w-8 text-right text-sm text-gray-500">{currencies.filter(cur => cur.value === $from$)[0].symbol}</span>
          <Input type="number" placeholder="Amount" class="bg-white w-12 md:w-14 px-2 pb-[9px]" bind:value="{$amount$}" />
        
          <Popover.Root bind:open={fromOpen} let:ids>
            <Popover.Trigger asChild let:builder>
              <Button
                builders={[builder]}
                variant="outline"
                role="combobox"
                aria-expanded={fromOpen}
                class="px-2 justify-between"
              >
                <!-- {currencies.filter(cur => cur.value === $from$)[0].symbol} -->
                <span>{$from$}</span>
                <!-- <span class="text-sm text-gray-500 baseline">
                  {currencies.filter(cur => cur.value === $from$)[0].name}
                </span> -->
                <ChevronDown class="hidden md:inline h-4 w-4" />
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
            class="hidden md:inline-flex px-0 cursor-pointer w-10 h-10"
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
                class="px-2 justify-between"
              >
                <span>{$to$}</span>
                <ChevronDown class="hidden md:inline h-4 w-4" />
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
                  "flex-1 px-1 md:px-4 justify-start text-left font-normal shrink",
                  !$date$ && "text-muted-foreground"
                )}
                builders={[builder]}
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                <!-- <span class="hidden md:inline"> -->
                  {$date$ && $date$?.toDate ? dfs.format($date$?.toDate(getLocalTimeZone())) : "Pick a date"}
                <!-- </span> -->
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
        </div>


        {#if showPrompt}
          <div class="prompt-ui | mb-4 w-full flex flex-row gap-0 | z-40 absolute top-0 left-0 "
            transition:fly="{{ x: 1000, opacity: 1, duration: 500, easing: cubicOut }}"
            on:introend={() => {
              showPromptDone = true;
            }}
            on:outroend={() => {
              showPromptDone = false;
            }}
          >
            <Button 
              on:click={() => {
                showPromptDone = false;
                showPrompt = !showPrompt;
              }}
              variant="outline" 
              class="flex-2 shrink-0 cursor-pointer w-8 h-10 border rounded-md rounded-r-none border-input border-r-0 bg-white | pl-4 flex flex-row items-center"
                >
              <Label class="cursor-pointer">
                <MagicWand class="h-4 w-4" />
              </Label>
            </Button>
            <Input 
              type="text" 
              placeholder="ex: Convert $100 AUD to USD" 
              class="flex-1 bg-white px-2 border-l-0 pb-[9px] rounded-none border-r-0 focus-visible:ring-offset-0 " 
              bind:value="{promptStr}" 
              on:keydown={(e) => {
                if(e.key === 'Enter') {
                  doConvert(promptStr);
                }
              }}
            />
          </div>
        {/if}

        <div class="btn-group | absolute right-0 ">

          <Button 
            on:click={() => {
              // doDataConvert($currencyData$);
  
              showPromptDone = false;
              showPrompt = !showPrompt;
            }}
            variant="outline" 
            class="cursor-pointer w-12 h-10 rounded-l-none rounded-r-none "
              >
            <Label class="cursor-pointer">
              <MagicWand class="h-4 w-4 relative -left-[2px]" />
            </Label>
          </Button>
          <Button 
            on:click={() => {
              doDataConvert($currencyData$);
            }}
            variant="outline" 
            class="cursor-pointer w-12 h-10 -ml-2 rounded-l-none relative z-50"
              >
            <Label class="cursor-pointer">
              <Rocket class="h-4 w-4" />
              <!-- <span class="">🚀</span> -->
            </Label>
          </Button>
        </div>
      
        
        </div>

    </div>

    <div class="chit-group | mt-3 md:mt-1">

      <Button 
          on:click={() => {
            doConvert(prompt);
          }}
          variant="outline" 
          class="bg-white/50 py-0 px-2 h-20 cursor-pointer h-[25px] active"
      >
          <Label class="cursor-pointer ">
            USD → CAD, EUR, AUD
          </Label>
      </Button>

      <Button 
          on:click={() => {
            doConvert(prompt);
          }}
          variant="outline" 
          class="bg-white/50 py-0 px-2 h-20 cursor-pointer h-[25px] active"
      >
          <Label class="py-0 cursor-pointer ">
            Is the USD getting stronger than CAD?
          </Label>
      </Button>

    </div>

  </div>









</div>

