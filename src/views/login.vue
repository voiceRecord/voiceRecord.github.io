<template>
    <div id="login">
      <div class="center pad"><h2>User Login</h2></div>
      <div class="center pad">
        <input type="text" placeholder="neptun ID" v-model="id"/>
      </div>
      <div class="center pad" ><input type="password" placeholder="password" v-model="password"/></div>

      <div class="center pad"><button @click="login">login</button></div>

      <div class="center pad" v-if="wrongpassword"><p>wrong password please try again</p></div>
      <div class="center pad"  v-if="wrongpassword"><p>(make sure neptun code is in capital letter)</p></div>
    </div>
</template>

<script setup>
import router from "@/router";
import db from "@/firebase/firebase";

import { ref ,onMounted , defineModel, reactive} from "vue";

import { doc,collection, query, where, getDocs } from "firebase/firestore";

const wrongpassword = ref(false)
const user = ref(null)
const id = defineModel("id")
const password = defineModel("password")


const login = async () => {
  const q = query(collection(db,"user"),where("neptun","==",id.value),where("password","==",password.value));
  await getDocs(q).then(res =>{
    console.log(res)
    if (res.empty) {
      // res.empty() is true
      console.log("No such document!");
      wrongpassword.value = true;
    } else {
      user.value = res.docs[0].data();
      console.log("Document data:", res.docs[0].data());
      router.push("/audio");
    }
  })
};

</script>
<style scoped>
</style>