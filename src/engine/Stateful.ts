
// See https://stackoverflow.com/questions/41980195/recursive-partialt-in-typescript-2-1


// Allows any subset of object properties all the way down
// through all subobjects.o
import * as t from "io-ts";
import { GameState } from "./GameState";
import { Either } from "fp-ts/lib/Either";
import { ShipState } from "./ShipState";

// Copied from https://github.com/gcanti/io-ts/blob/master/src/index.ts
// May break if io-ts changes. Probably a terrible idea!
function isTypeC(codec: t.Any): codec is t.TypeC<t.Props> {
    return (codec as any)._tag === 'InterfaceType';
}

function MakeOptional(T: t.Any) {
    return t.union([T, t.undefined]);
}

function MakeRecursivePartial<T extends t.Any>(T: T): t.Type<
    RecursivePartial<t.TypeOf<typeof T>>,
    RecursivePartial<t.TypeOf<typeof T>>,
    unknown
> {

    if (isTypeC(T)) {
        let optional: { [index: string]: t.Any } = {}
        for (let [key, value] of Object.entries(T.props)) {
            optional[key] = MakeOptional(MakeRecursivePartial(value));
        }
        return t.type(optional) as any;
    }
    else if (T instanceof t.DictionaryType) {
        return t.record(
            T.domain,
            MakeOptional(MakeRecursivePartial(T.codomain))) as any;

    }
    else if ((T instanceof t.IntersectionType)
        || (T instanceof t.UnionType)) {

        let newTypes: t.Any[] = [];
        for (let i in [...T.types]) {
            newTypes[i] = MakeRecursivePartial(T.types[i])
        }
        if (newTypes.length < 2) {
            throw Error("Intersection of less than 2 types");
        }
        // It complains about not having enough entries
        // if you don't cast to `any`, but we know
        // there are at least 2 in `newTypes`
        if (T instanceof t.IntersectionType) {
            return t.intersection(newTypes as any);
        }
        else {
            return t.union(newTypes as any);
        }
    }
    else {
        return T;
    }
}

function clearUndefined(v: unknown) {
    if (v instanceof Object) {
        for (let [key, value] of Object.entries(v)) {
            if (value === undefined) {
                delete (v as any)[key];
            }
            else {
                clearUndefined((v as any)[key]);
            }
        }
    }
}

function MakeRecursivePartialParser<T extends t.Any>(T: T): (v: unknown) => Either<t.Errors, RecursivePartial<t.TypeOf<typeof T>>> {
    const decoder = MakeRecursivePartial(T)
    return (v: unknown) => {
        const decoded = decoder.decode(v);
        if (decoded.isRight()) {
            const value = decoded.value;
            clearUndefined(value);
            return t.success(value);
        }
        else {
            return decoded;
        }
    }
}


function RecursivePartial<T extends t.Any>(T: T): t.Type<
    RecursivePartial<t.TypeOf<typeof T>>,
    RecursivePartial<t.TypeOf<typeof T>>,
    unknown> {

    const parser = MakeRecursivePartialParser(T);
    const io_ts_type = MakeRecursivePartial(T);
    type TStatic = RecursivePartial<t.TypeOf<typeof T>>;


    return new t.Type<
        TStatic,
        TStatic,
        unknown>(
            "RecursivePartial<" + T.name + ">",
            function(u: unknown): u is TStatic {
                return io_ts_type.is(u).valueOf();
            },
            function(input: unknown) {
                return parser(input)
            },
            t.identity
        );
}


type RecursivePartial<T> =
    T extends object ? {
        [P in keyof T]?: RecursivePartial<T[P]>
        //    T[P] extends (infer U)[] ? RecursivePartial<U>[] :
        //    T[P] extends object ? RecursivePartial<T[P]> :
    } :
    T;





// type RecursivePartial<T> =
//     T extends any[] ? T :
//     T extends object ? {
//         [P in keyof T]?: RecursivePartial<T[P]>
//     } :
//     T;

// see https://stackoverflow.com/questions/41476063/typescript-remove-key-from-type-subtraction-type
// Gets the union of keys of T that are strings
type GetStringKeys<T> = {
    [P in keyof T]:
    P extends string ? P : never
}[keyof T];

// Recursively includes only the string keys in the object
type OnlyStringKeys<T> =
    T extends object ? Pick<{
        [P in keyof T]: OnlyStringKeys<T[P]>
    }, GetStringKeys<T>> :
    T;


//type test = OnlyStringKeys<{ "a": 4, 123: 5, "c": { "x": 3, "y": 5, 42: "hi" } }>;
//const t: test = { "a": 4, c: { x: 3, y: 5 } };

// TODO: Recursively require that T not use symbols
// A tree of the form of T but with each
// non-object value replaced with {}

// Totally a hack but we don't have exact types yet.
// Note that EmptyObject =/= {} since {} only requires 
// that all the keys it specifies have the corresponding
// values, and it specifies no keys, so it is the any object.
type EmptyObject = { [index: string]: never };
type ReplaceWithEmptyObjects<T> =
    T extends object ? {
        [P in keyof T]: ReplaceWithEmptyObjects<T[P]>
    } : EmptyObject;


// Indexes a subtree of the state tree
type StateIndexer<T> = RecursivePartial<ReplaceWithEmptyObjects<T>>;
type PartialState<StateType> = RecursivePartial<StateType>;


interface Stateful<T> {
    getState(toGet?: StateIndexer<T>): PartialState<T>
    setState(state: PartialState<T>): StateIndexer<T>
}

const PartialGameState = RecursivePartial(GameState);


export { Stateful, StateIndexer, RecursivePartial, PartialGameState, ReplaceWithEmptyObjects, PartialState, OnlyStringKeys }
