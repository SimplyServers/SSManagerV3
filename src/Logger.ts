export class Logger {

    private _verbose;

    constructor(verbose: boolean) {
        this._verbose = verbose;
        this.verbose("logger init... verbose set to " + verbose);
    }

    public info = (data: string) => {
        console.info("[info]", data)
    };

    public verbose = (data: string) => {
        if (!this._verbose) { // Check if we're running in verbose mode
            return;
        }

        console.info("[verbose]", data)
    };

    public error = (data: any) => {
        console.error("[error]", data)
    }
}
