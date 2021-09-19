/**
 * Action to send to the server.
 */
export class SendSignalRMessage {
  static type = '[SignalR] Send Message';

  constructor(public name: string, public payload: unknown) {}
}
