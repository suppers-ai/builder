export const PORTS = {
  STORE: 8000,
  PROFILE: 8001,
  DOCS: 8002,
  CDN: 8003,
} as const;

export type PackagePort = typeof PORTS[keyof typeof PORTS];

export const getPackageUrl = (packageName: keyof typeof PORTS, path = ""): string => {
  const port = PORTS[packageName];
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `http://localhost:${port}${cleanPath}`;
};

export const getPortForPackage = (packageName: keyof typeof PORTS): number => {
  return PORTS[packageName];
};
