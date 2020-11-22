import {Engine, World, Bodies} from 'matter-js';

const ctx: Worker = self as any;

export enum SIM_STATE {
  'LOADING' = 'Loading',
  'RUNNING' = 'Running',
  'PAUSED' = 'Paused'
};

export enum WORKER_COMMANDS {
  'SETUP' = 'SETUP',
  'RESET' = 'RESET',
  'START' = 'START',
  'PAUSE' = 'PAUSE'
};

export enum ENTITY_TYPE {
  'ASTEROID' = 'ASTEROID',
  'SHELL' = 'SHELL'
}

export interface Entity {
  position: {
    x: number;
    y: number;
  }
  type: ENTITY_TYPE;
  matterBody?: any;
}

export interface SimOptions {
  canvasWidth: number;
  canvasHeight: number;
  entities: Entity[]
}

export class SimWorker {
  state: SIM_STATE;
  engine: Engine;
  interval: any;
  entities: Entity[];
  constructor() {
    this.state = SIM_STATE.LOADING;
    this.engine = Engine.create();
    this.entities = [];
    this.interval = setInterval(() => {
      this.run();
    }, 1000 / 60);
  }
  setup (options: SimOptions) {
    const {canvasHeight, canvasWidth, entities} = options;

    const wallTop = Bodies.rectangle(canvasWidth / 2, 0, canvasWidth, 10, {
      isStatic: true
    });
    const wallBottom = Bodies.rectangle(
      canvasWidth / 2,
      canvasHeight,
      canvasWidth,
      10,
      {
        isStatic: true
      }
    );

    const wallRight = Bodies.rectangle(
      canvasWidth,
      canvasHeight / 2,
      10,
      canvasHeight,
      {
        isStatic: true
      }
    );

    const wallLeft = Bodies.rectangle(0, canvasHeight / 2, 10, canvasHeight, {
      isStatic: true
    });

    // Add Matter walls to the world. This will keep the bodies within certain parameters.
    World.add(this.engine.world, [wallBottom, wallTop, wallLeft, wallRight]);
    // create a rectangular body for each object.

    for (const entity of entities){

      entity.matterBody = Bodies.rectangle(
        entity.position.x,
        entity.position.y,
        10,
        10,
        {
          restitution: 0.8,
        }
      );

      World.addBody(this.engine.world, entity.matterBody);
    }
    this.entities = entities;

  }
  run ():void {
    switch(this.state){
      case SIM_STATE.RUNNING:
        Engine.update(this.engine, 1000 / 60);
        self.postMessage({
          message: 'SIM_UPDATE',
          data: this.entities
        }, '*');
      break;
      case SIM_STATE.PAUSED:
      break;
    }
    
  }
  start ():void {
    this.setState(SIM_STATE.RUNNING)
  }
  pause ():void {
    this.setState(SIM_STATE.PAUSED)
  }
  setState(state: SIM_STATE){
    this.state = state;
    self.postMessage({state: this.state}, '*');
  }
  handleMessage({data}: any) {
    
    switch(data.message){
      case WORKER_COMMANDS.START:
        this.start();
      break;
      case WORKER_COMMANDS.PAUSE:
        this.pause();
      break;
      case WORKER_COMMANDS.SETUP:
        this.setup(data.data);
      default:
      break;
    }
  }
}

const sw = new SimWorker();
sw.start();

// Respond to message from parent thread
ctx.addEventListener('message', (event) => sw.handleMessage(event));
