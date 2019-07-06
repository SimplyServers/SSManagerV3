export class Logger {
    public info = (data: string) => {
        console.log("[inf]", data)
    };

    public verbose = (data: string) => {
        console.log("[ver]", data)
    };

    public error = (data: any) => {
        console.log("[err]", data)
    }
}
