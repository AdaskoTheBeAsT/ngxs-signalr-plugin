/**
 * Action to stream from the server.
 */
export class StreamSignalRMessage {
  static type = '[SignalR] Stream Message';

  constructor(public name: string, public payload: unknown) {}
}
