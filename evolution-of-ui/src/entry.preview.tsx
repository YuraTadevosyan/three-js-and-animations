/** Entry for `npm run preview`: serves the production build through Vite. */
import { createQwikCity } from '@builder.io/qwik-city/middleware/node'
import qwikCityPlan from '@qwik-city-plan'
// Import the plan before the render entry.
import render from './entry.ssr'

export default createQwikCity({ render, qwikCityPlan })
