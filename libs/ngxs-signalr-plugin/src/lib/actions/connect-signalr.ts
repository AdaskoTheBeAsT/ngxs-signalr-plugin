import { SignalROptions } from '../signalr-options';
/**
 * Action to connect to the websocket. Optionally pass a URL.
 */
export class ConnectSignalR {
  static readonly type = '[SignalR] Connect';
  constructor(public payload?: SignalROptions) {}
}
