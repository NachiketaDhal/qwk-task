import { DataSource } from "typeorm";

export interface Context {
  conn: DataSource;
  userId: number | undefined;
}

export interface AuthTokenPayload {
  userId: number;
}

export interface MessageOutput {
  message: string;
}
