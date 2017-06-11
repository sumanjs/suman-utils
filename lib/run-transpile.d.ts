declare var _default: any;
export default _default;
export interface Run {
    (paths: Array<string>, opts: IOpts, cb: Function): void;
    default?: Run;
}
export interface IOpts {
    babelExec?: string;
    all?: boolean;
}
export declare const $runTranspile: Run;
