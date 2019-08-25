import * as PIXI from "pixi.js";
import { PlanetState } from "../../engine/PlanetState";
import { ShipState } from "../../engine/ShipState";
import { SystemState } from "../../engine/SystemState";
import { Vector, VectorLike } from "../../engine/Vector";
import { GameData } from "../GameData";
import { ObjectDrawer } from "./ObjectDrawer";
import { PlanetGraphic } from "./PlanetGraphic";
import { ShipGraphic } from "./ShipGraphic";
import { StatusBar } from "./StatusBar";


class Display {
    readonly container: PIXI.Container;
    readonly systemContainer: PIXI.Container;
    private readonly gameData: GameData;
    private statusBar: StatusBar;
    readonly buildPromise: Promise<unknown>;
    //    private activeShip: string | undefined; // The uuid of the ship to render from.
    built: boolean;

    private readonly shipDrawer: ObjectDrawer<ShipState, ShipGraphic>;
    private readonly planetDrawer: ObjectDrawer<PlanetState, PlanetGraphic>;

    private _target!: string | Vector;
    private targetPosition: VectorLike;
    private dimensions: Vector;

    constructor({ container, gameData, target }: { container: PIXI.Container, gameData: GameData, target?: Vector | string }) {
        this.gameData = gameData;
        this.container = container;
        this.systemContainer = new PIXI.Container();
        this.container.addChild(this.systemContainer);

        this.statusBar = new StatusBar({
            gameData: this.gameData
        });
        this.container.addChild(this.statusBar);


        this.planetDrawer = new ObjectDrawer({
            gameData: this.gameData,
            graphicClass: PlanetGraphic
        });
        this.systemContainer.addChild(this.planetDrawer);

        this.shipDrawer = new ObjectDrawer({
            gameData: this.gameData,
            graphicClass: ShipGraphic
        });
        this.systemContainer.addChild(this.shipDrawer);


        this.dimensions = new Vector(10, 10);
        this.built = false;
        this.buildPromise = Promise.all([this.statusBar.buildPromise])
        this.buildPromise.then(() => { this.built = true });

        this.targetPosition = new Vector(0, 0);
        if (target !== undefined) {
            this.target = target;
        }
        else {
            this.target = new Vector(0, 0);
        }


    }

    draw(state: SystemState) {

        if (!(this.target instanceof Vector)) {
            let targetShip = state.ships[this.target];
            if (targetShip !== undefined) {
                this.targetPosition = targetShip.position;
            }
        }

        for (let shipID in state.ships) {
            let shipState = state.ships[shipID];
            this.shipDrawer.draw(shipState, shipID, this.targetPosition);
        }
        this.shipDrawer.cleanup();

        for (let planetID in state.planets) {
            let planetState = state.planets[planetID];
            this.planetDrawer.draw(planetState, planetID, this.targetPosition);
        }

        this.statusBar.draw(state, this.targetPosition)
    }

    set target(target: string | Vector) {
        if (target instanceof Vector) {
            this.targetPosition = target;
        }
        this._target = target;
    }

    get target() {
        return this._target;
    }

    resize(x: number, y: number) {
        this.dimensions = new Vector(x, y);
        this.statusBar.resize(x, y);
        this.systemContainer.position.x = (x - this.statusBar.width) / 2;
        this.systemContainer.position.y = y / 2;
    }
}

export { Display };
