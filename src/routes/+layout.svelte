<script>

	import '$src/app.scss'

  import '@fontsource/inter/400.css';
  import '@fontsource/inter/500.css';
  import '@fontsource/inter/700.css';

</script>

<div class="layout container">
  <slot />
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
    @apply text-blue-500 hover:underline cursor-pointer hover:cursor-pointer;
  }

  pre {
    @apply bg-gray-200 rounded p-4;
  }
</style>
