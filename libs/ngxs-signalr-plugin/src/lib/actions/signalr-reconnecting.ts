/**
 * Action triggered when SignalR is connected
 */
export class SignalRReconnecting {
  static type = '[SignalR] Reconnecting';
  constructor(public payload?: Error | undefined) {}
}
