/** An error whose message is safe to send to the client with the given HTTP status. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}
