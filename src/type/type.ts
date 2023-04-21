import { DataSource } from "typeorm";

export interface Context {
  conn: DataSource;
}
