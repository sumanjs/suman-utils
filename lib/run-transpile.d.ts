export interface Run {
    (paths: Array<string>, opts: IOpts, cb: Function): void;
    default?: Run;
}
export interface IOpts {
    babelExec?: string;
    all?: boolean;
}
export declare const $runTranspile: Run;
declare let $exports: any;
export default $exports;
