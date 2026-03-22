export interface AppShortcut {
  id: string;
  name: string;
  description: string;
  icon: string;
  route?: string;
  url?: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DesktopKernelState {
  apps: AppShortcut[];
  user: SessionUser;
  kernel: {
    name: string;
    version: string;
    operations: string[];
  };
  preferences: {
    satisfaction: number;
  };
}

export interface ServiceAlert {
  id: number;
  service: string;
  title: string;
  message: string;
  createdAt: string;
}
