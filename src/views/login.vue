<template>
    <div id="login">
      <div class="center pad"><h2>User Login</h2></div>
      <div class="center pad">
        <input type="text" placeholder="neptun ID" v-model="id"/>
      </div>
      <div class="center pad"><input type="text" placeholder="password" v-model="password"/></div>
      <div class="center pad"><button @click="login">login</button></div>
      <div>{{ id }}</div>
      <div>{{ password }}</div>
    </div>
</template>

<script setup>
import router from "@/router";
import db from "@/firebase/firebase";

import { ref ,onMounted , defineModel} from "vue";

import { doc,collection, query, where, getDocs } from "firebase/firestore";

const q = query(collection(db, "cities"), where("capital", "==", true));

const user = ref(null)
const id = defineModel("id")
const password = defineModel("password")

const login = () => {
  const q = query(collection(db,"user"),where("neptun","==","S98PBH"),where("password","==","S98PBHS98PBH"));
  
  router.push("/home");
};


onMounted(async () =>{
  

  await getDocs(q).then(res =>{
    user.value = res.docs[0].data();
    console.log(res)
    if (res.empty) {
      // res.empty() is true
      console.log("No such document!");
    } else {
      console.log("Document data:", res.docs[0].data());
    }
  })
})

</script>
<style scoped>
</style>