import { Inject, Injectable, OnDestroy } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  IStreamResult,
  ISubscription,
} from '@microsoft/signalr';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { Subscription } from 'rxjs/internal/Subscription';

import { ConnectSignalR } from './actions/connect-signalr';
import { DisconnectSignalR } from './actions/disconnect-signalr';
import { InvokeSignalRMessage } from './actions/invoke-signalr-message';
import { SendSignalRMessage } from './actions/send-signalr-message';
import { SignalRConnected } from './actions/signalr-connected';
import { SignalRConnectionUpdated } from './actions/signalr-connection-updated';
import { SignalRDisconnected } from './actions/signalr-disconnected';
import { SignalRMessageError } from './actions/signalr-message-error';
import { SignalRReconnected } from './actions/signalr-reconnected';
import { SignalRReconnecting } from './actions/signalr-reconnecting';
import { SignalRStreamCompleted } from './actions/signalr-stream-completed';
import { SignalRStreamError } from './actions/signalr-stream-error';
import { StreamSignalRMessage } from './actions/stream-signalr-message';
import { NGXS_SIGNALR_OPTIONS, SignalROptions } from './signalr-options';
import { TypeKeyPropertyMissingError } from './type-key-property-missing-error';

@Injectable()
export class SignalRHandler implements OnDestroy {
  private connection: HubConnection | null = null;
  private subscription = new Subscription();
  private streamSubscriptions: ISubscription<unknown>[] = [];
  private typeKey = 'type';
  constructor(
    private store: Store,
    private actions$: Actions,
    @Inject(NGXS_SIGNALR_OPTIONS)
    private options: SignalROptions
  ) {
    this.setupActionsListeners();
    if (this.options.typeKey) {
      this.typeKey = this.options.typeKey;
    }
  }

  ngOnDestroy(): void {
    this.closeConnection();
    this.subscription.unsubscribe();
  }

  private setupActionsListeners(): void {
    this.subscription.add(
      this.actions$
        .pipe(ofActionDispatched(ConnectSignalR))
        .subscribe(async ({ payload }: ConnectSignalR) => {
          await this.connect(payload);
        })
    );

    this.subscription.add(
      this.actions$
        .pipe(ofActionDispatched(DisconnectSignalR))
        .subscribe(() => {
          this.disconnect();
        })
    );

    this.subscription.add(
      this.actions$
        .pipe(ofActionDispatched(SendSignalRMessage))
        .subscribe(async ({ name, payload }: SendSignalRMessage) => {
          await this.send(name, payload);
        })
    );

    this.subscription.add(
      this.actions$
        .pipe(ofActionDispatched(InvokeSignalRMessage))
        .subscribe(async ({ name, payload }: InvokeSignalRMessage) => {
          await this.invoke(name, payload);
        })
    );

    this.subscription.add(
      this.actions$
        .pipe(ofActionDispatched(StreamSignalRMessage))
        .subscribe(async ({ name, payload }: StreamSignalRMessage) => {
          const resultStream = await this.stream(name, payload);
          this.streamSubscriptions.push(
            resultStream.subscribe({
              next: (item) => {
                const type = item[this.typeKey];
                if (!type) {
                  throw new TypeKeyPropertyMissingError(this.typeKey);
                }
                this.store.dispatch({ ...item, type });
              },
              complete: () => {
                this.store.dispatch(new SignalRStreamCompleted());
              },
              error: (err) => {
                this.store.dispatch(new SignalRStreamError(err));
              },
            })
          );
        })
    );
  }

  private setupConnection(): void {
    let builder = new HubConnectionBuilder();
    if (this.options.url) {
      if (this.options.httpConnectionOptions) {
        builder = builder.withUrl(
          this.options.url,
          this.options.httpConnectionOptions
        );
      } else if (this.options.transportType) {
        builder = builder.withUrl(this.options.url, this.options.transportType);
      } else {
        builder = builder.withUrl(this.options.url);
      }
    }

    if (this.options.reconnectPolicy) {
      builder = builder.withAutomaticReconnect(this.options.reconnectPolicy);
    } else if (this.options.retryDelays) {
      builder = builder.withAutomaticReconnect(this.options.retryDelays);
    } else if (this.options.automaticReconnect) {
      builder = builder.withAutomaticReconnect();
    }

    if (this.options.protocol) {
      builder = builder.withHubProtocol(this.options.protocol);
    }

    if (this.options.logging) {
      builder = builder.configureLogging(this.options.logging);
    }

    this.connection = builder.build();
    if (this.options.baseUrl) {
      this.connection.baseUrl = this.options.baseUrl;
    }

    if (this.options.keepAliveIntervalInMilliseconds) {
      this.connection.keepAliveIntervalInMilliseconds =
        this.options.keepAliveIntervalInMilliseconds;
    }

    if (this.options.serverTimeoutInMilliseconds) {
      this.connection.serverTimeoutInMilliseconds =
        this.options.serverTimeoutInMilliseconds;
    }

    this.connection.onclose((error?: Error | undefined) => {
      this.store.dispatch(new SignalRDisconnected(error));
    });
    this.connection.onreconnecting((error?: Error | undefined) => {
      this.store.dispatch(new SignalRReconnecting(error));
    });
    this.connection.onreconnected((connectionId?: string | undefined) => {
      this.store.dispatch(new SignalRReconnected(connectionId));
    });
  }

  private setupHandlers(): void {
    this.connection?.on('send', (message: Record<string, unknown>) => {
      const type = message[this.typeKey];
      if (!type) {
        throw new TypeKeyPropertyMissingError(this.typeKey);
      }
      this.store.dispatch({ ...message, type });
    });
  }

  private async connect(options?: SignalROptions): Promise<void> {
    this.updateConnection();

    // Users can pass the options in the connect method so
    // if options aren't available at DI bootstrap they have access
    // to pass them here
    if (options) {
      this.options = { ...this.options, ...options };
    }

    this.setupConnection();
    this.setupHandlers();

    try {
      await this.connection?.start();
      this.store.dispatch(new SignalRConnected());
    } catch (err) {
      this.store.dispatch(new SignalRMessageError(err));
    }
  }

  private disconnect(): void {
    if (this.connection) {
      this.closeConnection();
    }
  }

  private async send(name: string, data: unknown): Promise<void> {
    if (this.connection?.state !== HubConnectionState.Connected) {
      throw new Error(
        'You must connect to the SignalR before sending any data'
      );
    }

    await this.connection.send(name, data);
  }

  private async invoke(name: string, data: unknown): Promise<void> {
    if (this.connection?.state !== HubConnectionState.Connected) {
      throw new Error(
        'You must connect to the SignalR before sending any data'
      );
    }

    await this.connection.invoke(name, data);
  }

  private async stream(
    name: string,
    data: unknown
  ): Promise<IStreamResult<Record<string, unknown>>> {
    if (this.connection?.state !== HubConnectionState.Connected) {
      throw new Error(
        'You must connect to the SignalR before sending any data'
      );
    }

    return this.connection.stream<Record<string, unknown>>(name, data);
  }

  /**
   * To ensure we don't have any memory leaks
   * e.g. if the user occasionally dispatched `ConnectWebSocket` twice
   * then the previous subscription will still live in the memory
   * to prevent such behavior - we close the previous connection if it exists
   */
  private updateConnection(): void {
    if (this.connection) {
      this.closeConnection();
      this.store.dispatch(new SignalRConnectionUpdated());
    }
  }

  private async closeConnection(): Promise<void> {
    this.streamSubscriptions.forEach((s) => {
      s.dispose();
    });
    this.streamSubscriptions = [];
    if (this.connection !== null) {
      await this.connection.stop();
      this.connection = null;
    }
  }
}
