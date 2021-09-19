/**
 * Action triggered when SignalR is disconnected
 */
export class SignalRDisconnected {
  static type = '[SignalR] Disconnected';
  constructor(public payload?: Error | undefined) {}
}
