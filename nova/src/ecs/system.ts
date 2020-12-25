import { ArgsToData, ArgTypes } from "./arg_types";
import { Component } from "./component";
import { Query } from "./query";
import { Resource } from "./resource";
import { subset, WithComponents } from "./utils";


type ResourcesOnly<T extends readonly [...unknown[]]> =
    Extract<T[number], Resource<any, any>>;

type QueriesOnly<T extends readonly [...unknown[]]> =
    Extract<T[number], Query<any>>;

export type ComponentsOnly<T extends readonly [...unknown[]]> =
    Exclude<Extract<T[number], Component<any, any>>, Resource<any, any>>;

type QueryComponents<T> =
    T extends Query<infer Components> ? Components[number] : never;

type AllComponents<T extends readonly [...unknown[]]> =
    ComponentsOnly<T> | QueryComponents<T[number]>

interface SystemArgs<StepArgTypes extends readonly ArgTypes[]> {
    name: string;
    readonly args: StepArgTypes;
    step: (...args: ArgsToData<StepArgTypes>) => void;
    before?: Set<System>; // Systems that this system runs before
    after?: Set<System>; // Systems that this system runs after
}

export class System<StepArgTypes extends readonly ArgTypes[] = readonly ArgTypes[]> {
    readonly name: string;
    readonly args: StepArgTypes;
    readonly components: Set<ComponentsOnly<StepArgTypes>>;
    readonly resources: Set<ResourcesOnly<StepArgTypes>>;
    readonly queries: Set<QueriesOnly<StepArgTypes>>;
    readonly allComponents: Set<AllComponents<StepArgTypes>>;
    readonly step: (...args: ArgsToData<StepArgTypes>) => void;
    readonly before: Set<System>;
    readonly after: Set<System>;

    constructor({ name, args, step, before, after }: SystemArgs<StepArgTypes>) {
        this.name = name;
        this.args = args;
        this.step = step;
        this.before = before ?? new Set();
        this.after = after ?? new Set();

        this.components = new Set(this.args.filter(
            a => (a instanceof Component) && !(a instanceof Resource))
        ) as Set<ComponentsOnly<StepArgTypes>>;

        this.resources = new Set(this.args.filter(
            a => (a instanceof Resource))
        ) as Set<ResourcesOnly<StepArgTypes>>;

        this.queries = new Set(this.args.filter(
            a => (a instanceof Query))
        ) as Set<QueriesOnly<StepArgTypes>>;

        this.allComponents = new Set([
            ...this.components,
            ...[...this.queries].reduce(
                (components: Component<unknown, unknown>[], query) =>
                    [...components, ...query.components], []
            ),
        ]) as Set<AllComponents<StepArgTypes>>;
    }

    supportsEntity(entity: WithComponents) {
        return subset(this.allComponents, new Set(entity.components.keys()));
    }

    toString() {
        return `System(${this.name ?? this.args.map(a => a.toString())})`;
    }
}