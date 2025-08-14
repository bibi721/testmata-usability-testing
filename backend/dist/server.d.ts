declare class MasadaServer {
    private app;
    private port;
    private httpServer?;
    private socketManager?;
    constructor();
    private initializeMiddleware;
    private initializeRoutes;
    private initializeErrorHandling;
    private initializeWebsocket;
    start(): void;
    private gracefulShutdown;
}
declare const server: MasadaServer;
export default server;
//# sourceMappingURL=server.d.ts.map