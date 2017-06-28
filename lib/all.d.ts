/// <reference types="node" />
import { Run } from './run-transpile';
import Timer = NodeJS.Timer;
export interface MapToTargetDirResult {
    originalPath: string;
    targetPath: string;
}
export interface INearestRunAndTransformRet {
    run: string;
    transform: string;
}
export declare const weAreDebugging: any;
export declare const isStream: any;
export declare const isObservable: any;
export declare const isSubscriber: any;
export declare const runTranspile: Run;
export declare const vgt: (val: number) => boolean;
export declare const vlt: (val: number) => boolean;
export declare const checkStatsIsFile: (item: string) => boolean | null;
export declare const mapToTargetDir: (item: string) => MapToTargetDirResult;
export declare const findApplicablePathsGivenTransform: (sumanConfig: Object, transformPath: string, cb: Function) => void;
export declare const isSumanSingleProcess: () => boolean;
export declare const isSumanDebug: () => boolean;
export declare const runAssertionToCheckForSerialization: (val: Object) => void;
export declare const buildDirsWithMkDirp: (paths: string[], cb: Function) => void;
export declare const getArrayOfDirsToBuild: (testTargetPath: string, p: string) => string | undefined;
export declare const checkIfPathAlreadyExistsInList: (paths: string[], p: string, index: number) => boolean;
export declare const buildDirs: (dirs: string[], cb: Function) => void;
export declare const padWithFourSpaces: () => string;
export declare const padWithXSpaces: (x: number) => string;
export declare const removePath: (p1: string, p2: string) => string;
export declare const findSharedPath: (p1: string, p2: string) => string;
export declare const removeSharedRootPath: (paths: string[]) => string[][];
export declare const checkForValInStr: (str: string, regex: RegExp, count: number) => boolean;
export declare const isGeneratorFn2: (fn: Function) => boolean;
export declare const isGeneratorFn: (fn: Function) => boolean;
export declare const isArrowFunction: (fn: Function) => boolean;
export declare const isAsyncFn: (fn: Function) => boolean;
export declare const defaultSumanHomeDir: () => string;
export declare const defaultSumanResultsDir: () => string;
export declare const getHomeDir: () => string;
export declare const findProjectRoot: (p: string) => string;
export declare const findProjRoot: (p: string) => string;
export declare const once: (ctx: Object, fn: Function) => Function;
export declare const onceTO: (ctx: Object, to: Timer, fn: Function) => Function;
export declare const onceAsync: (ctx: Object, fn: Function) => Function;
export declare const makePathExecutable: (runPath: string, cb: Function) => void;
export declare const checkForEquality: (arr1: string[], arr2: string[]) => boolean;
export declare const arrayHasDuplicates: (a: any[]) => boolean;
export declare const findNearestRunAndTransform: (root: string, pth: string, cb: Function) => any;
export interface IMapValue {
    [key: string]: boolean;
    '@transform.sh?': boolean;
    '@run.sh?': boolean;
    '@target?': boolean;
    '@src?': boolean;
}
export interface IMap {
    [key: string]: IMapValue;
}
export interface IMapCallback {
    (err: Error | null, map?: IMap): void;
}
export declare const findSumanMarkers: (types: string[], root: string, files: string[], cb: IMapCallback) => void;
export declare const makeResultsDir: (bool: boolean, cb: Function) => void;
export declare const isObject: (v: any) => boolean;
declare let $exports: any;
export default $exports;
