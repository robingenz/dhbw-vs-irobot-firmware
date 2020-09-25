export class LogService {
    private static instance: LogService;

    constructor() {}

    public info(tagName: string, message?: any, ...optionalParams: any[]): void {
        console.info(`[${Date.now()}] [${tagName}]`, message, ...optionalParams);
    }

    public debug(tagName: string, message?: any, ...optionalParams: any[]): void {
        console.debug(`[${Date.now()}] [${tagName}]`, message, ...optionalParams);
    }

    public warn(tagName: string, message?: any, ...optionalParams: any[]): void {
        console.warn(`[${Date.now()}] [${tagName}]`, message, ...optionalParams);
    }

    public error(tagName: string, message?: any, ...optionalParams: any[]): void {
        console.error(`[${Date.now()}] [${tagName}]`, message, ...optionalParams);
    }

    public static getInstance(): LogService {
        if (!LogService.instance) {
            LogService.instance = new LogService();
        }

        return LogService.instance;
    }
}
