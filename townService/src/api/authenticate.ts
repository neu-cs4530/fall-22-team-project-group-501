export class AuthError extends Error {
  status: number;

  constructor(message?: string | undefined, status?: number) {
    super(message);
    this.status = status || 401;
  }
}
