/**
 * WebSocket Manager
 * Real-time communication for test monitoring and notifications
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient();

/**
 * Socket authentication middleware
 */
interface AuthenticatedSocket extends Socket {
  userId?: string;
  userType?: 'CUSTOMER' | 'TESTER' | 'ADMIN';
  user?: any;
}

/**
 * WebSocket Manager Class
 */
export class SocketManager {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private testRooms: Map<string, Set<string>> = new Map(); // testId -> Set of socketIds

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.cors.allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    logger.info('🔌 WebSocket server initialized');
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware() {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, config.jwt.secret) as any;
        
        // Fetch user from database
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            name: true,
            userType: true,
            status: true,
          },
        });

        if (!user || user.status !== 'ACTIVE') {
          return next(new Error('Invalid or inactive user'));
        }

        // Attach user to socket
        socket.userId = user.id;
        socket.userType = user.userType;
        socket.user = user;

        next();
      } catch (error) {
        logger.warn('WebSocket authentication failed', { error: error.message });
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info('User connected via WebSocket', {
        userId: socket.userId,
        userType: socket.userType,
        socketId: socket.id,
      });

      // Store connection
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
      }

      // Setup event handlers
      this.setupUserEvents(socket);
      this.setupTestEvents(socket);
      this.setupSessionEvents(socket);
      this.setupNotificationEvents(socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });
    });
  }

  /**
   * Setup user-specific events
   */
  private setupUserEvents(socket: AuthenticatedSocket) {
    // User status updates
    socket.on('user:status', (data) => {
      logger.info('User status update', {
        userId: socket.userId,
        status: data.status,
      });

      // Broadcast to relevant users
      this.broadcastToUser(socket.userId!, 'user:status_updated', {
        status: data.status,
        timestamp: new Date(),
      });
    });

    // User typing indicators (for chat features)
    socket.on('user:typing', (data) => {
      socket.to(data.room).emit('user:typing', {
        userId: socket.userId,
        userName: socket.user?.name,
        isTyping: data.isTyping,
      });
    });
  }

  /**
   * Setup test-related events
   */
  private setupTestEvents(socket: AuthenticatedSocket) {
    // Join test room for real-time updates
    socket.on('test:join', async (data) => {
      const { testId } = data;
      
      try {
        // Verify user has access to this test
        const hasAccess = await this.verifyTestAccess(socket.userId!, testId, socket.userType!);
        
        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied to test' });
          return;
        }

        // Join test room
        socket.join(`test:${testId}`);
        
        // Track room membership
        if (!this.testRooms.has(testId)) {
          this.testRooms.set(testId, new Set());
        }
        this.testRooms.get(testId)!.add(socket.id);

        logger.info('User joined test room', {
          userId: socket.userId,
          testId,
          userType: socket.userType,
        });

        // Send current test status
        const testStatus = await this.getTestStatus(testId);
        socket.emit('test:status', testStatus);

      } catch (error) {
        logger.error('Failed to join test room', { error, userId: socket.userId, testId });
        socket.emit('error', { message: 'Failed to join test room' });
      }
    });

    // Leave test room
    socket.on('test:leave', (data) => {
      const { testId } = data;
      socket.leave(`test:${testId}`);
      
      if (this.testRooms.has(testId)) {
        this.testRooms.get(testId)!.delete(socket.id);
      }

      logger.info('User left test room', {
        userId: socket.userId,
        testId,
      });
    });

    // Test status updates (for customers)
    socket.on('test:update_status', async (data) => {
      if (socket.userType !== 'CUSTOMER') {
        socket.emit('error', { message: 'Only customers can update test status' });
        return;
      }

      const { testId, status } = data;
      
      try {
        // Verify ownership
        const test = await prisma.test.findFirst({
          where: { id: testId, createdById: socket.userId },
        });

        if (!test) {
          socket.emit('error', { message: 'Test not found or access denied' });
          return;
        }

        // Update test status
        await prisma.test.update({
          where: { id: testId },
          data: { status },
        });

        // Broadcast to all users in test room
        this.io.to(`test:${testId}`).emit('test:status_updated', {
          testId,
          status,
          updatedBy: socket.user?.name,
          timestamp: new Date(),
        });

        logger.info('Test status updated via WebSocket', {
          testId,
          status,
          updatedBy: socket.userId,
        });

      } catch (error) {
        logger.error('Failed to update test status', { error, testId, userId: socket.userId });
        socket.emit('error', { message: 'Failed to update test status' });
      }
    });
  }

  /**
   * Setup session-related events
   */
  private setupSessionEvents(socket: AuthenticatedSocket) {
    // Session progress updates
    socket.on('session:progress', async (data) => {
      if (socket.userType !== 'TESTER') {
        socket.emit('error', { message: 'Only testers can update session progress' });
        return;
      }

      const { sessionId, progress, currentTask } = data;

      try {
        // Verify session ownership
        const session = await prisma.testerSession.findFirst({
          where: { id: sessionId, testerId: socket.userId },
          include: { test: true },
        });

        if (!session) {
          socket.emit('error', { message: 'Session not found or access denied' });
          return;
        }

        // Broadcast progress to test room
        this.io.to(`test:${session.testId}`).emit('session:progress_updated', {
          sessionId,
          testerId: socket.userId,
          testerName: socket.user?.name,
          progress,
          currentTask,
          timestamp: new Date(),
        });

        // Store progress in analytics
        await prisma.analytics.create({
          data: {
            testId: session.testId,
            userId: socket.userId,
            event: 'session_progress',
            data: { sessionId, progress, currentTask },
          },
        });

        logger.info('Session progress updated', {
          sessionId,
          testerId: socket.userId,
          progress,
        });

      } catch (error) {
        logger.error('Failed to update session progress', { error, sessionId });
        socket.emit('error', { message: 'Failed to update progress' });
      }
    });

    // Live session monitoring (screen sharing events)
    socket.on('session:screen_event', async (data) => {
      if (socket.userType !== 'TESTER') return;

      const { sessionId, eventType, eventData } = data;

      try {
        const session = await prisma.testerSession.findFirst({
          where: { id: sessionId, testerId: socket.userId },
        });

        if (!session) return;

        // Broadcast screen event to test room (for live monitoring)
        this.io.to(`test:${session.testId}`).emit('session:screen_event', {
          sessionId,
          testerId: socket.userId,
          eventType,
          eventData,
          timestamp: new Date(),
        });

        // Store significant events
        if (['click', 'scroll', 'navigation'].includes(eventType)) {
          await prisma.analytics.create({
            data: {
              testId: session.testId,
              userId: socket.userId,
              event: `screen_${eventType}`,
              data: { sessionId, ...eventData },
            },
          });
        }

      } catch (error) {
        logger.error('Failed to process screen event', { error, sessionId });
      }
    });

    // Session completion
    socket.on('session:completed', async (data) => {
      if (socket.userType !== 'TESTER') return;

      const { sessionId, feedback, rating } = data;

      try {
        const session = await prisma.testerSession.findFirst({
          where: { id: sessionId, testerId: socket.userId },
          include: { test: true },
        });

        if (!session) return;

        // Update session
        await prisma.testerSession.update({
          where: { id: sessionId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            feedback,
            rating,
          },
        });

        // Broadcast completion to test room
        this.io.to(`test:${session.testId}`).emit('session:completed', {
          sessionId,
          testerId: socket.userId,
          testerName: socket.user?.name,
          feedback,
          rating,
          timestamp: new Date(),
        });

        // Notify customer
        const customer = await prisma.user.findUnique({
          where: { id: session.test.createdById },
        });

        if (customer) {
          this.sendNotificationToUser(customer.id, {
            type: 'session_completed',
            title: 'Test Session Completed',
            message: `${socket.user?.name} completed testing "${session.test.title}"`,
            data: { sessionId, testId: session.testId },
          });
        }

        logger.info('Session completed via WebSocket', {
          sessionId,
          testerId: socket.userId,
          rating,
        });

      } catch (error) {
        logger.error('Failed to complete session', { error, sessionId });
      }
    });
  }

  /**
   * Setup notification events
   */
  private setupNotificationEvents(socket: AuthenticatedSocket) {
    // Mark notification as read
    socket.on('notification:read', async (data) => {
      const { notificationId } = data;

      try {
        await prisma.notification.updateMany({
          where: { id: notificationId, userId: socket.userId },
          data: { read: true, readAt: new Date() },
        });

        socket.emit('notification:read_confirmed', { notificationId });

      } catch (error) {
        logger.error('Failed to mark notification as read', { error, notificationId });
      }
    });

    // Get unread notification count
    socket.on('notification:get_count', async () => {
      try {
        const count = await prisma.notification.count({
          where: { userId: socket.userId, read: false },
        });

        socket.emit('notification:count', { count });

      } catch (error) {
        logger.error('Failed to get notification count', { error, userId: socket.userId });
      }
    });
  }

  /**
   * Handle user disconnection
   */
  private handleDisconnection(socket: AuthenticatedSocket) {
    logger.info('User disconnected from WebSocket', {
      userId: socket.userId,
      socketId: socket.id,
    });

    // Remove from connected users
    if (socket.userId) {
      this.connectedUsers.delete(socket.userId);
    }

    // Remove from test rooms
    this.testRooms.forEach((sockets, testId) => {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        
        // Notify other users in the room
        socket.to(`test:${testId}`).emit('user:left', {
          userId: socket.userId,
          userName: socket.user?.name,
          timestamp: new Date(),
        });
      }
    });
  }

  /**
   * Public methods for external use
   */

  /**
   * Send notification to specific user
   */
  public async sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    
    if (socketId) {
      this.io.to(socketId).emit('notification:new', notification);
    }

    // Store notification in database
    await prisma.notification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
      },
    });

    logger.info('Notification sent to user', { userId, type: notification.type });
  }

  /**
   * Broadcast to all users in a test
   */
  public broadcastToTest(testId: string, event: string, data: any) {
    this.io.to(`test:${testId}`).emit(event, data);
    logger.info('Broadcast to test room', { testId, event });
  }

  /**
   * Broadcast to specific user
   */
  public broadcastToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  /**
   * Get connected users count
   */
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get test room participants
   */
  public getTestRoomParticipants(testId: string): number {
    return this.testRooms.get(testId)?.size || 0;
  }

  /**
   * Helper methods
   */

  private async verifyTestAccess(userId: string, testId: string, userType: string): Promise<boolean> {
    if (userType === 'CUSTOMER') {
      const test = await prisma.test.findFirst({
        where: { id: testId, createdById: userId },
      });
      return !!test;
    }

    if (userType === 'TESTER') {
      const test = await prisma.test.findFirst({
        where: { id: testId, status: { in: ['PUBLISHED', 'RUNNING'] } },
      });
      return !!test;
    }

    return userType === 'ADMIN';
  }

  private async getTestStatus(testId: string) {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        testerSessions: {
          select: {
            id: true,
            status: true,
            tester: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: { testerSessions: true },
        },
      },
    });

    return {
      id: test?.id,
      title: test?.title,
      status: test?.status,
      currentTesters: test?.currentTesters,
      maxTesters: test?.maxTesters,
      activeSessions: test?.testerSessions.filter(s => s.status === 'IN_PROGRESS').length,
      completedSessions: test?.testerSessions.filter(s => s.status === 'COMPLETED').length,
      participants: test?.testerSessions.map(s => ({
        id: s.tester.id,
        name: s.tester.name,
        status: s.status,
      })),
    };
  }
}

export default SocketManager;