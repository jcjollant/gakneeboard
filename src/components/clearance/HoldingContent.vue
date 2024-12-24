<template>
    <div class="hold tileContent">
        <div class="params">&nbsp;
            <div class="label labelTopLeft">
                <div class="direction">
                    <div>&#x25AB;</div>
                    <div>N</div>
                    <div>&#x25AB;</div>
                    <div>W</div>
                    <div>&nbsp;</div>
                    <div>E</div>
                    <div>&#x25AB;</div>
                    <div>S</div>
                    <div>&#x25AB;</div>
                </div>
            </div>
            <div class="label labelTopRight">RAD/CRS</div>
            <div class="label labelBottomLeft">Established</div>
            <div class="turns">&#x021B6 &#x021B7</div>
            <div class="label labelBottomRight">EFC</div>
        </div>
        <div class="row brg">CRS</div>
        <!-- <div class="">Left</div> -->
        <div class="row wca">WCA</div>
        <div class="row heading">
            <div class="box">&nbsp;</div>
            <div class="name">HDG</div>
            <div class="box">&nbsp;</div>
        </div>
        <div class="row time">Time</div>
    </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.direction {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    align-items: center;
    justify-items: center;
    gap: 2px;
}
.hold {
    display: flex;
    flex-flow: column;
}
.hold .bottom {
    grid-column: 2;
    border: 2px dashed darkgrey;
    border-top: none;
    border-bottom-left-radius: 24px;
    border-bottom-right-radius: 24px;
    margin-bottom: 36px;
}
.hold .box {
    border: 2px solid black;
    margin: 2px;
}
.hold .params {
    position: relative;
    height: 110px;
    display: flex;
    justify-content: center;
    align-items: flex-end;
}
.hold .row {
    line-height: 30px;
    border-top: 1px dashed grey;
}
.hold .sep {
    position: relative;
    border-bottom: 1px dashed grey;
}
.hold .time {
    position: relative;
}
.hold .top {
    padding-top: 16px;
    border-top: 2px solid black;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
}
.heading {
    border-top: 1px dashed grey;
    display: grid;
    grid-template-columns: auto 50px auto;
    align-items: center;
}
.label {
  position: absolute;
  font-size: 10px;
}
.labelBottomLeft {
  left: 3px;
  bottom: 0;
}
.labelBottomRight {
  right: 3px;
  bottom: 0;
}
.labelTopLeft {
  left: 5px;
  top: 2px;
}
.labelTopRight {
  right: 3px;
  top: 0;
}
</style>
