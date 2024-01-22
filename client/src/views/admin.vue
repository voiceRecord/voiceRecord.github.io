<template>
    <div class="admin center">
        <h1>admin</h1>
        <div><button @click="gologin"> go login</button></div>
    </div>
</template>
<script setup>
import router from '@/router'
const gologin = () =>{
  router.push('/')
}
</script>
<style>
    
</style>