import * as Minio from "minio";
import { env } from "@/env";

const MINIO_ENDPOINT = env.MINIO_ENDPOINT;
const MINIO_SSL = env.MINIO_SSL;
const MINIO_PORT = parseInt(env.MINIO_PORT!);
const MINIO_ACCESS_KEY = env.MINIO_ACCESS_KEY;
const MINIO_SECRET_KEY = env.MINIO_SECRET_KEY;

export const MinioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT!,
  port: MINIO_PORT!,
  useSSL: MINIO_SSL === "true",
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});
