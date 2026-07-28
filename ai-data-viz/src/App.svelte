<script lang="ts">
  import Navbar from './components/Navbar.svelte'
  import Footer from './components/Footer.svelte'
  import { router } from './lib/router.svelte'
  import Home from './views/Home.svelte'
  import About from './views/About.svelte'
  import NotFound from './views/NotFound.svelte'
  import CompanyView from './views/CompanyView.svelte'
  import StocksView from './views/StocksView.svelte'
  import TelemetryView from './views/TelemetryView.svelte'
  import TrafficView from './views/TrafficView.svelte'
  import NetworkView from './views/NetworkView.svelte'
  import ClimateView from './views/ClimateView.svelte'

  const VIEWS = {
    company: CompanyView,
    stocks: StocksView,
    telemetry: TelemetryView,
    traffic: TrafficView,
    network: NetworkView,
    climate: ClimateView,
  } as const

  const DatasetView = $derived(
    router.route.name === 'dataset'
      ? VIEWS[router.route.id as keyof typeof VIEWS]
      : undefined,
  )
</script>

<a
  href="#main"
  class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50
         focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm"
>
  Skip to content
</a>

<Navbar />

<main id="main">
  {#if router.route.name === 'home'}
    <Home />
  {:else if router.route.name === 'about'}
    <About />
  {:else if DatasetView}
    {#key router.route.id}
      <DatasetView />
    {/key}
  {:else}
    <NotFound />
  {/if}
</main>

<Footer />
