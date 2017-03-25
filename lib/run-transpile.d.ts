export interface IOpts {
    babelExec?: string;
    all?: boolean;
}
export default function run(paths: Array<string>, opts: IOpts, cb: Function): void;
