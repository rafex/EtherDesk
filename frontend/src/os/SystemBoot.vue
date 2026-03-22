<template>
  <section class="system-boot">
    <div class="system-boot__panel">
      <div class="system-boot__loader" aria-hidden="true">
        <div class="honeycomb">
          <div v-for="cell in 7" :key="cell"></div>
        </div>
      </div>

      <p class="system-boot__eyebrow">EtherDesk OS</p>
      <h1>Iniciando escritorio</h1>
      <p class="system-boot__copy">
        Cargando sesion, dock, ventanas y servicios visuales del sistema.
      </p>
    </div>
  </section>
</template>
