interface KernelEventRecord {
  id: string;
  userId: string;
  type: string;
  message: string;
  createdAt: string;
  level: 'info' | 'warning' | 'error';
}

const kernelEvents: KernelEventRecord[] = [];

export function auditKernelEvent(userId: string, type: string, message: string, level: KernelEventRecord['level'] = 'info') {
  kernelEvents.unshift({
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    userId,
    type,
    message,
    createdAt: new Date().toISOString(),
    level,
  });

  if (kernelEvents.length > 200) {
    kernelEvents.length = 200;
  }
}

export function listKernelEvents(userId: string) {
  return kernelEvents.filter((event) => event.userId === userId).slice(0, 50);
}
