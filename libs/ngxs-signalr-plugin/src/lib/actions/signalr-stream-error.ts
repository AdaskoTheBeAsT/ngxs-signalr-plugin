/**
 * Action triggered when a error ocurrs
 */
export class SignalRStreamError {
  static type = '[SignalR] Stream Error';
  constructor(public payload?: Error | undefined) {}
}
