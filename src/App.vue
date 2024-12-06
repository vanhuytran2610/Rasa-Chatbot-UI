<template>
  <div>
    <HeaderSide title="TEST-APP" />
    <router-view></router-view>
    <button @click="toggleModal" class="open-modal">
      <i class="fas fa-robot"></i>
    </button>
    <ChatBotModal :showPopover="showChatBot" @close="closeModal" />
  </div>
</template>

<script>
import HeaderSide from "./components/Header.vue";
import ChatBotModal from "./components/ChatBotModal.vue";

export default {
  name: "App",
  components: {
    HeaderSide,
    ChatBotModal,
  },
  data() {
    return {
      showChatBot: false
    };
  },
  methods: {
    toggleModal() {
      this.showChatBot = !this.showChatBot;
    },
    closeModal() {
      this.showChatBot = false;
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.open-modal {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #404142;
  color: white;
  padding: 10px 10px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  height: 60px;
  width: 60px;
  font-size: 150%;
}
</style>
