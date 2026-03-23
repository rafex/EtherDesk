<template>
  <svg v-if="icon === 'browser'" viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8" />
    <path d="M3.8 9.2h16.4M3.8 14.8h16.4M12 3.8c2.4 2.2 3.6 5 3.6 8.2S14.4 18 12 20.2M12 3.8c-2.4 2.2-3.6 5-3.6 8.2S9.6 18 12 20.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>

  <svg v-else-if="icon === 'notes'" viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <path d="M7 3.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
    <path d="M15 3.5V8h4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
    <path d="M9 11h6M9 14.5h6M9 18h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
  </svg>

  <svg v-else-if="icon === 'terminal'" viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <rect x="3.5" y="5" width="17" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.7" />
    <path d="M8 10l2.8 2.4L8 14.8M12.8 15h3.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

  <svg v-else-if="icon === 'ide'" viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <rect x="3.5" y="4.5" width="17" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.7" />
    <path d="M8 10.5 10.8 13 8 15.5M13.5 16h2.8M13.5 9.5h3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

  <svg v-else-if="icon === 'launcher'" viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <rect x="4" y="4" width="7" height="7" rx="2" fill="currentColor" />
    <rect x="13" y="4" width="7" height="7" rx="2" fill="currentColor" opacity="0.82" />
    <rect x="4" y="13" width="7" height="7" rx="2" fill="currentColor" opacity="0.82" />
    <rect x="13" y="13" width="7" height="7" rx="2" fill="currentColor" />
  </svg>

  <svg v-else-if="icon === 'settings'" viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" stroke-width="1.7" />
    <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a7 7 0 0 0-2.1-1.2L14 3h-4l-.4 2.7a7 7 0 0 0-2.1 1.2l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 2.1 1.2L10 21h4l.4-2.7a7 7 0 0 0 2.1-1.2l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round" />
  </svg>

  <svg v-else-if="icon === 'chat'" viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <path d="M6.5 18.5 4 20v-4.2A6.5 6.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v6A6 6 0 0 1 14 18.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
    <path d="M8.5 10.5h7M8.5 13.5h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
  </svg>

  <svg v-else-if="icon === 'files'" viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l2 2h5.5A2.5 2.5 0 0 1 20 9.5v8A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
  </svg>

  <svg v-else-if="icon === 'monitor'" viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <rect x="4" y="5" width="16" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.7" />
    <path d="M8 19h8M12 15v4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
  </svg>

  <svg v-else-if="icon === 'notifications'" viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
  </svg>

  <svg v-else-if="icon === 'account'" viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7" />
    <path d="M5.5 19c1.7-3 4-4.5 6.5-4.5s4.8 1.5 6.5 4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
  </svg>

  <svg v-else-if="icon === 'tasks'" viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <path d="M7 7.5h10M7 12h10M7 16.5h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
    <path d="M4.5 7.5h.01M4.5 12h.01M4.5 16.5h.01" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
  </svg>

  <svg v-else-if="icon === 'help'" viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.7" />
    <path d="M9.8 9.4a2.4 2.4 0 1 1 3.6 2.1c-.9.5-1.4 1-1.4 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12 16.8h.01" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
  </svg>

  <svg v-else-if="icon === 'system'" viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <rect x="4" y="5" width="16" height="11" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7" />
    <path d="M9.5 19h5M12 16v3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
  </svg>

  <svg v-else viewBox="0 0 24 24" aria-hidden="true">
    <title v-if="label">{{ label }}</title>
    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8" />
    <path d="M12 8v4l2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  label?: string;
}>();
</script>
