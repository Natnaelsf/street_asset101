import { Injectable } from "@nestjs/common";
import * as dotenv from "dotenv";
import * as path from "path";

@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    dotenv.config({ path: path.resolve(__dirname, "../../.env") });
    this.envConfig = process.env as any;
  }

  get(key: string, defaultValue?: string): string {
    return this.envConfig[key] || defaultValue || "";
  }

  getNumber(key: string, defaultValue?: number): number {
    return (
      (this.envConfig[key]
        ? parseInt(this.envConfig[key], 10)
        : defaultValue) || 0
    );
  }

  getBoolean(key: string, defaultValue = false): boolean {
    return this.envConfig[key] === "true" || defaultValue;
  }
}
