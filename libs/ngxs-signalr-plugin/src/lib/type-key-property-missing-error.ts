/**
 * This error is thrown where there is no `type` (or custom `typeKey`) property
 * on the message that came from the server side socket
 */
export class TypeKeyPropertyMissingError extends Error {
  constructor(typeKey: string) {
    super(`Property ${typeKey} is missing on the socket message`);
  }
}
