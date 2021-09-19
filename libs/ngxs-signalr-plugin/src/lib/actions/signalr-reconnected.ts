/**
 * Action triggered when SignalR is connected
 */
export class SignalRReconnected {
  static type = '[SignalR] Reconnected';
  constructor(public connectionId?: string | undefined) {}
}
