export interface Context {
  userId: number | undefined;
}

export interface AuthTokenPayload {
  userId: number;
}

export interface MessageOutput {
  message: string;
}
