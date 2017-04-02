declare namespace run {
    interface Run {
        (paths: Array<string>, opts: run.IOpts, cb: Function): void;
        default: Run;
    }
    interface IOpts {
        babelExec?: string;
        all?: boolean;
    }
}
declare const run: run.Run;
export = run;
