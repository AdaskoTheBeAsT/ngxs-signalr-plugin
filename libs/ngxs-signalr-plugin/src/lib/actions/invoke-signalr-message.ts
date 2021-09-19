/**
 * Action to invoke to the server.
 */
export class InvokeSignalRMessage {
  static type = '[SignalR] Invoke Message';

  constructor(public name: string, public payload: unknown) {}
}
