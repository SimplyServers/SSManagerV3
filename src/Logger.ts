export class Logger {

    private _verbose;

    constructor(verbose: boolean) {
        this._verbose = verbose;
    }

    public info = (data: string) => {
        console.log("[inf]", data)
    };

    public verbose = (data: string) => {
        if (!this._verbose) { // Check if we're running in verbose mode
            return;
        }

        console.log("[ver]", data)
    };

    public error = (data: any) => {
        console.log("[err]", data)
    }
}
