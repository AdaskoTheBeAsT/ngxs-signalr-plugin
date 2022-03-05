import { InjectionToken } from '@angular/core';
import {
  HttpTransportType,
  IHttpConnectionOptions,
  IHubProtocol,
  ILogger,
  IRetryPolicy,
  LogLevel,
} from '@microsoft/signalr';

export const NGXS_SIGNALR_OPTIONS = new InjectionToken('NGXS_SIGNALR_OPTIONS');

export interface SignalROptions {
  /**
   * URL of the SignalR endpoint.
   */
  baseUrl?: string;

  /**
   * URL of the SignalR endpoint.
   */
  url?: string;

  /**
   * Specifies a specific HTTP transport type.
   */
  transportType?: HttpTransportType;

  /**
   * Http connection options.
   */
  httpConnectionOptions?: IHttpConnectionOptions;

  /**
   * Retry policy implementation
   */
  reconnectPolicy?: IRetryPolicy;

  /**
   * Retry delays
   */
  retryDelays?: number[];

  /**
   * Automatic reconnect
   */
  automaticReconnect?: boolean;

  /**
   * Hub protocol options.
   */
  protocol?: IHubProtocol;

  /**
   * The property name to distinguish this type for the store.
   * Default: 'type'
   */
  typeKey?: string;

  /**
   * Logging options
   */
  logging?: string | LogLevel | ILogger;

  /**
   * Keep alive interval in milliseconds.
   */
  keepAliveIntervalInMilliseconds?: number;

  /**
   * Server timeout in milliseconds.
   */
  serverTimeoutInMilliseconds?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function noop(..._args: unknown[]) {
  return function () {
    // noop
  };
}
