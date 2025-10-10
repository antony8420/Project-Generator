export function logInfo(message: string, meta?: any) {
  if (meta) {
    console.log(`[INFO] ${message}`, meta);
  } else {
    console.log(`[INFO] ${message}`);
  }
}

export function logError(message: string, meta?: any) {
  if (meta) {
    console.error(`[ERROR] ${message}`, meta);
  } else {
    console.error(`[ERROR] ${message}`);
  }
}
