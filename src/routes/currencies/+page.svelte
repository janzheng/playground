<script lang="ts">
  import { marked } from 'marked';
  import { Button } from "$lib/components/ui/button";
  import Converter from '$routes/currencies/lib/components/converter/Converter.svx';

  import { page } from '$app/stores';


</script>
 
<div class="container | p-4">

  <div class="writeup ">
    <h1 class="text-4xl">Currency converter fun</h1>

    <Converter />
  </div>

</div>





<style lang="scss" global>
  h1 {
    @apply text-2xl font-bold mb-4 mt-4;
  }
  h2 {
    @apply text-xl font-bold mb-4 mt-8;
  }
  h3 {
    @apply text-lg font-bold mb-4;
  }
  p {
    @apply mb-4;
  }

  a {
    @apply text-blue-500 hover:underline;
  }

  pre {
    @apply bg-gray-200 rounded p-4;
  }
</style>
