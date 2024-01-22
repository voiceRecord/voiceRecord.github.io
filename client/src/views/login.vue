<template>
  <div id="login">
    <div class="center pad"><h2>User Login</h2></div>
    <div class="center pad"><input type="text" placeholder="neptun ID"></div>
    <div class="center pad"><input type="text" placeholder="password"></div>
    <div class="center pad"><button @click="gohome">login</button></div>
  </div>
</template>
<script setup>
import router from '@/router'

const gohome = () =>{
  router.push('/home')
}

</script>
<style scoped>
</style>