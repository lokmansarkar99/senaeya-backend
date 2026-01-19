import { createAdapter } from '@socket.io/redis-adapter';
import colors from 'colors';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
// import { setupCluster } from './DB/cluster';
import { validateConfig } from './DB/configValidation';
import { connectToDatabase } from './DB/db';
import { setupProcessHandlers } from './DB/processHandlers';
import { setupSecurity } from './DB/security';
import app from './app';
import config from './config';
import { startScheduleWorker } from './helpers/redis/queues';
import { redisClient } from './helpers/redis/redis';
import { socketHelper } from './helpers/socketHelper';
import { logger } from './shared/logger';
import setupTimeManagement from './utils/cronJobs';

// Define the types for the servers
let httpServer: HttpServer;
let socketServer: SocketServer;

// Function to start the server
export async function startServer() {
     try {
          // Validate config
          validateConfig();
          // Connect to the database
          await connectToDatabase();
          // Create HTTP server
          httpServer = createServer(app);
          const httpPort = Number(config.port);
          const ipAddress = config.ip_address as string;

          // Set timeouts
          httpServer.timeout = 120000;
          httpServer.keepAliveTimeout = 5000;
          httpServer.headersTimeout = 60000;

          // Start HTTP server
          // httpServer.listen(httpPort, ipAddress, () => {
          //      logger.info(colors.bgCyan(`♻️  Application listening on http://${ipAddress}:${httpPort}`));
          // });
          // httpServer.listen(httpPort, `${ipAddress}`, () => {
          //      logger.info(colors.bgCyan(`♻️  Application listening on http://${ipAddress}:${httpPort}`));
          // });
          httpServer.listen(httpPort, `0.0.0.0`, () => {
               logger.info(colors.bgCyan(`♻️  Application listening on http://${ipAddress}:${httpPort}`));
          });

          // Set up Socket.io server on same port as HTTP server
          socketServer = new SocketServer(httpServer, {
               pingTimeout: 60000,
               transports: ['polling', 'websocket'], // @@
               cors: {
                    origin: [
                         'http://158.252.71.185:3000',
                         'http://localhost:3000',
                         'http://localhost:3001',
                         'http://localhost:3002',
                         'http://10.10.7.37:3000',
                         'api.senaeya.net',
                         'dashboard.senaeya.net',
                         'http://api.senaeya.net',
                         'http://dashboard.senaeya.net',
                         'https://api.senaeya.net',
                         'https://dashboard.senaeya.net',
                         'https://sanaiya-new.vercel.app',
                    ],
                    credentials: true, // @@
               },
          });

          const pubClient = redisClient;
          const subClient = pubClient.duplicate();

          logger.info(colors.green('🍁 Redis connected successfully'));

          socketServer.adapter(createAdapter(pubClient, subClient));
          socketHelper.socket(socketServer);
          //@ts-ignore
          global.io = socketServer;
          logger.info(colors.yellow(`♻️  Socket is listening on same port ${httpPort}`));

          // 🔥 Start BullMQ Worker (listens for schedule jobs)
          startScheduleWorker();
          // cron jobs
          setupTimeManagement();
     } catch (error) {
          logger.error(colors.red('Failed to start server'), error);
          process.exit(1);
     }
}
// Set up error handlers
setupProcessHandlers();
// Set up security middleware
setupSecurity();
// if (config.node_env === 'production') {
//      setupCluster();
// } else {
//      startServer();
// }
startServer();
// Export server instances
export { httpServer, socketServer };
