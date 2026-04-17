import { Injectable, Logger as NestLogger } from '@nestjs/common';

/**
 * Servicio de logging estructurado para la aplicación
 * Encapsula el Logger de NestJS con métodos tipados
 */
@Injectable()
export class LoggerService extends NestLogger {
    /**
     * Log de información
     */
    logInfo(message: string, context?: string, metadata?: any) {
        const logMessage = metadata
            ? `${message} | ${JSON.stringify(metadata)}`
            : message;
        this.log(logMessage, context);
    }

    /**
     * Log de advertencia
     */
    logWarn(message: string, context?: string, metadata?: any) {
        const logMessage = metadata
            ? `${message} | ${JSON.stringify(metadata)}`
            : message;
        this.warn(logMessage, context);
    }

    /**
     * Log de error
     */
    logError(message: string, trace?: string, context?: string, metadata?: any) {
        const logMessage = metadata
            ? `${message} | ${JSON.stringify(metadata)}`
            : message;
        this.error(logMessage, trace, context);
    }

    /**
     * Log de debug (solo en development)
     */
    logDebug(message: string, context?: string, metadata?: any) {
        if (process.env.NODE_ENV !== 'production') {
            const logMessage = metadata
                ? `${message} | ${JSON.stringify(metadata)}`
                : message;
            this.debug(logMessage, context);
        }
    }
}
