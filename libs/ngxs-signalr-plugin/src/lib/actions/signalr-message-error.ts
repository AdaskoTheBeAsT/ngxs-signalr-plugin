/**
 * Action triggered when a error ocurrs
 */
export class SignalRMessageError {
  static type = '[SignalR] Message Error';
  constructor(public payload?: unknown) {}
}
