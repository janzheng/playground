
<!-- 

  a rube goldberg version of chat converter
  - fancy UI that just creates a chat prompt

 -->


<script>

	import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as Table from "$lib/components/ui/table";
	import { MagicWand, CaretSort, Check, Rocket, ChevronDown, Width, Calendar as CalendarIcon } from "radix-icons-svelte";
  import { cn } from "$lib/utils";

  import currencyList from './short-currencies.json';

  let checked = false
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
        mode: "runFuncLoop",
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
        // str: `what's $100 USD to CAD, EUR, and AUD? Please use function calling, once for each pair; Ignore previous instructions for outputting answer as an object, OUTPUT YOUR ANSWER IN AN ENGLISH SENTENCE with money symbols`
      }
      requests = [...requests, postData];

      console.log('Sending:', postData)

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
          // message += `${result.results?.content}`;

          try {
            resultsList = JSON.parse(result.results?.content)
            if(resultsList.results) {
              resultsList = resultsList.results
            }
            if(resultsList.conversions) {
              resultsList = resultsList.conversions
            }
            message = ''
          } catch (error) {
            console.log('lol:', error, result)
            // sometimes this is also a json lol
            // console.error('An error occurred while converting:', error);
            // message = 'An error occurred while converting.';
          }

          
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


</script>

<div class="RubeConverter | p-4 rounded-md bg-slate-100 mb-4 inline-block w-full">

  <div class="ui-group md:flex flex-row gap-4">

    <div>
      <div class="amount">
        <Label for="amount" class="block mb-2">Amount:</Label>
        <Input 
          id="amount"
          type="number" 
          placeholder="Amount: 100" 
          class="bg-white w-full px-2 pb-[9px]" 
          bind:value="{amount}" 
          on:keydown={(e) => {
            if(e.key === 'Enter') {
              doConvert();
            }
          }}
        />
      </div>


      <div class="grid grid-cols-2 | mt-4">
        <div class="from">
          <Label class="block mb-2">From:</Label>
          {#each fromList as curr}
            <div class="flex items-center space-x-2 mb-1">
              <Checkbox id="{'from:'+curr.code}" bind:checked={curr.checked} />
              <Label
                for="{'from:'+curr.code}"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {curr.code}
              </Label>
            </div>
          {/each}
        </div>  

        <div class="to">
          <Label class="block mb-2">To:</Label>
          {#each toList as curr}
            <div class="flex items-center space-x-2 mb-1">
              <Checkbox id="{'to:'+curr.code}" bind:checked={curr.checked} />
              <Label
                for="{'to:'+curr.code}"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {curr.code}
              </Label>
            </div>
          {/each}
        </div>
      </div>

    </div>
    

    <div class="calc my-4 md:my-0">
      <Button 
          on:click={() => {
            doConvert(amount);
          }}
          variant="outline" 
          class={cn(`w-full md:w-16 | cursor-pointer h-16 `, `active border-2 `)}
      >
          <Label class="cursor-pointer ">
            <MagicWand class="h-10 w-10" />
          </Label>
      </Button>
    </div>

    {#if message || resultsList.length > 0}
      <div class="message-group | text-sm rounded-md  pb-1 bg-slate-100 max-w-full overflow-scroll">
        {@html message||''}

        {#if resultsList && resultsList.length > 0}
          <div class="results-group pt-4 | ">
            <Table.Root>
              <Table.Caption>Currency conversions</Table.Caption>
              <Table.Header>
                <Table.Row>
                  <Table.Head class="w-[40px]">From</Table.Head>
                  <Table.Head class="w-[40px]">Amount</Table.Head>
                  <Table.Head class="w-[40px]">To</Table.Head>
                  <Table.Head>Result</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {#each resultsList as result, i (i)}
                  <Table.Row>
                    <Table.Cell class="font-medium">{result.from}</Table.Cell>
                    <Table.Cell class="">{amount}</Table.Cell>
                    <Table.Cell class="font-medium">{result.to}</Table.Cell>
                    <Table.Cell class="">{result.amount}</Table.Cell>
                  </Table.Row>
                {/each}
              </Table.Body>
            </Table.Root>
          </div>
        {/if}
        
      </div>

      {#if results && results.length > 0}
        <details class="message-group | mt-2 max-h-64 overflow-scroll" open>
          <summary>Request trace</summary>
          {#each results as result}
            <pre class="overflow-scroll max-h-96 whitespace-break-spaces">{JSON.stringify(result, 0, 2)}</pre>
          {/each}
        </details>
      {/if}
    {/if}
    
  </div>

  

</div>

