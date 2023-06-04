<template>
  <div class="logo-wrap">
    <div class="text">WAVE TALK</div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  const text = document.querySelector(".text");
  text.innerHTML = text.textContent.replace(/\S/g, "<span>$&</span>");
  const element = document.querySelectorAll("span");
  for (let i = 0; i < element.length; i++) {
    element[i].style.animationDelay = `${i * 0.4}s`;
  }
})
</script>

<style lang="scss" >

.logo-wrap {
  position: relative;

  .text {
    position: relative;
    span {
      position: relative;
      display: inline-block;
      animation: wave 7s ease-in-out infinite;
    }
  }
}


@keyframes wave {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
}

</style>