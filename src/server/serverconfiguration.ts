export default class ServerConfiguration {
    // defaults to true, set to false to only log failing HTTP calls.
    public log_traffic: string = process.env.LOG_TRAFFIC ? process.env.LOG_TRAFFIC.trim().toLowerCase() : 'true';
    // We could take this from environment variable as well
    public port = 2081

    get logActions(): boolean {
        return this.log_traffic === 'actions';
    }
}
