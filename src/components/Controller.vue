<style lang="scss" scoped>
  .controller-container {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
  }
</style>

<template>
  <v-toolbar class="controller-container">
    <v-btn icon class="hidden-xs-only">
      <v-icon>mdi-earth</v-icon>
    </v-btn>

    <v-toolbar-title>地球的公转与自转</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-menu offset-y class="hidden-xs-only">
      <template v-slot:activator="{ on }">
        <v-btn
          color="primary"
          dark
          icon
          v-on="on"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="toggleRevolution">
          <v-list-item-title>开始/停止公转</v-list-item-title>
        </v-list-item>
        <v-list-item @click="toggleRotation">
          <v-list-item-title>开始/停止自转</v-list-item-title>
        </v-list-item>
        <!-- <v-list-item @click="openSettings">
          <v-list-item-title>公转/自转设置</v-list-item-title>
        </v-list-item> -->
      </v-list>
    </v-menu>
  </v-toolbar>
</template>

<script>
export default {
  name: 'Controller',

  data () {
    return {
    }
  },

  methods: {
    toggleRevolution () {
      this.$emit('toggle-revolution')
    },
    toggleRotation () {
      this.$emit('toggle-rotation')
    },
    openSettings () {
      this.$emit('open-settings')
    }
  }
}
</script>
