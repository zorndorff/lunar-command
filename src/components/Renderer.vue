<template>
  <div class="container">
    <canvas id="game"></canvas>
    <button @click="run()">RUN</button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import * as PIXI from 'pixi.js';
import { Entity, ENTITY_TYPE, SimOptions, WORKER_COMMANDS } from '@/sim.worker';
import { useStore } from 'vuex';


interface RenderData {
  canvas: HTMLCanvasElement,
  graphics: PIXI.Graphics,
  app: PIXI.Application,
  entities: Entity[],
  canvasWidth: number,
  canvasHeight: number,
}

const Renderer = defineComponent({
  setup() {
    const store = useStore();
    const entities = computed(() => store.getters.entities)

    return {
      entities,
    }
  },
  data() {
    return {
      entities: [{
        position: {
          x: 300,
          y: 180
        },
        type: ENTITY_TYPE.SHELL
      }]
    } as RenderData
  },
  methods:{
    init() {
      const matterOptions = {

      }
      const canvas: any | HTMLCanvasElement = document.querySelector('canvas#game');

      if(!canvas) {
        console.log('NO CANVAS');
        return;
      }
    
      const canvasWidth = canvas.offsetWidth;
      const canvasHeight = canvas.offsetHeight;

      const app = new PIXI.Application({
        transparent: true,
        resizeTo: canvas,
        antialias: true,
        view: canvas
      });

      this.canvas = canvas;
      this.graphics = new PIXI.Graphics();
      this.app = app;
      this.app.stage.addChild(this.graphics);
      this.app.ticker.add(() => {
        this.renderPixi();
      });
    },
    run () {
      this.$store.dispatch('message',{
        message: WORKER_COMMANDS.SETUP,
        data: {
          entities: this.entities,
          canvasWidth: this.canvasWidth,
          canvasHeight: this.canvasHeight
        } as SimOptions
      });
      this.$store.dispatch('message', {
        message: WORKER_COMMANDS.START,
      });
    },
    renderPixi () {
      this.graphics.lineStyle(4, 0xFF3300, 1);
      this.entities.forEach(({matterBody, type}) => {
        if(matterBody && this.graphics) {
          const vertices = matterBody.vertices;
          this.graphics.moveTo(vertices[0].x, vertices[0].y);

          for (var j = 1; j < vertices.length; j += 1) {
              this.graphics.lineTo(vertices[j].x, vertices[j].y);
          }

          this.graphics.lineTo(vertices[0].x, vertices[0].y);
        }
      });
    },
    updateEntityState (entities : Entity[]) {
      this.entities = entities;
    }
  },
  mounted() {
    console.log('CREATED RENDERER');
    
    this.init();
  },
  created: function () {
    
  },
  beforeDestroy: function () {
  },
});

export default Renderer

</script>

<style>
/* Sample `apply` at-rules with Tailwind CSS

*/
.container {
  @apply min-h-screen flex justify-center items-center text-center mx-auto;
}
</style>
