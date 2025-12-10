// Cloudflare Pages Functions 타입 정의
export interface EventContext<Env, P extends string, Data> {
  request: Request;
  env: Env;
  params: Record<P, string>;
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Data;
  plugin: any;
}

