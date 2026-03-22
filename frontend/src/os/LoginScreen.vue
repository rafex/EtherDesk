<template>
  <section class="login-screen">
    <div class="login-screen__panel">
      <p class="login-screen__eyebrow">EtherDesk OS</p>
      <h1>Iniciar sesion</h1>
      <p class="login-screen__copy">
        Punto de entrada a un escritorio web minimalista.
      </p>

      <form class="login-screen__form" @submit.prevent="submitLogin">
        <label class="login-screen__field">
          <span>Usuario</span>
          <input
            v-model="username"
            type="text"
            name="username"
            placeholder="ether"
            autocomplete="username"
          />
        </label>

        <label class="login-screen__field">
          <span>Clave</span>
          <input
            type="password"
            name="password"
            value="demo"
            disabled
          />
        </label>

        <button type="submit">Entrar al desktop</button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  login: [username: string];
}>();

const username = ref('ether');

function submitLogin() {
  emit('login', username.value);
}
</script>
