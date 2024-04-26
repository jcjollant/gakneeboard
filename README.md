# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

While this project uses Vue.js, Vite supports many popular JS frameworks. [See all the supported frameworks](https://vitejs.dev/guide/#scaffolding-your-first-vite-project).

## Deploy Your Own

Deploy your own Vite project with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/vercel/tree/main/examples/vite&template=vite)

_Live Example: https://vite-vue-template.vercel.app_

### Deploying From Your Terminal

You can deploy your new Vite project with a single command from your terminal using [Vercel CLI](https://vercel.com/download):

```shell
$ vercel
```

## Pending
* Rename App to Kneeboard
* Add kb.jollant.net domain
* Save updated airport params

## TODO
* Edit mode allows to change existing widgets content
* Update Selector layout to not look like a widget (no borders, just buttons)
* Add blank widget, which could be the non edit state of Selector
* Reset feature sets all widget to Selector
* Page configuration is saved in browser
* User can create own airport data
* Users can override airport information
* Read airport data from external source
* Rearrange the layout with Input on top amd matching airport size
* Change favicon

# Done
## 4/24/2024
* Show traffic patterns using dashed line
* Rename KBVS to Demo 1 page.
## 4/22/2024
* Improved ATIS with Rwy number
## 4/21/2024
* I want a flexible solution to fly to KBVS or Seattle Skyline
## 4/20/2024
* Rearrange layout for optimal print on half letter format. Consider 2x2x3 layout to display 12 airports
* Add all airports for a full route to KBVS and KELN : KAWO, KELN, KESW
* Border should include airport name (airport information should be in the same visua block)
## 4/19/2024
* Remove airport(s) from the list
* Remove the dot
* Add arrow tip to TP
* Automatically parse airport codes
* Update Window title
