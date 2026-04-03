<template>
  <div class="center-guide"></div>
</template>

<style scoped>
.center-guide {
    position: absolute;
    left: calc(var(--page-width) + var(--pages-gap) / 2);
    top: 0;
    bottom: 0;
    width: 2px;
    /* Phantom line pattern via SVG (Long dash, gap, short dash, gap, short dash, gap) */
    /* Pattern: Dash(20), Gap(6), Dash(2), Gap(6), Dash(2), Gap(4) = Total height 40 */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='40'%3E%3Cline x1='1' y1='0' x2='1' y2='20' stroke='%23ccc' stroke-width='2'/%3E%3Cline x1='1' y1='26' x2='1' y2='28' stroke='%23ccc' stroke-width='2'/%3E%3Cline x1='1' y1='34' x2='1' y2='36' stroke='%23ccc' stroke-width='2'/%3E%3C/svg%3E");
    background-repeat: repeat-y;
    pointer-events: none;
    z-index: 100;
}
</style>
