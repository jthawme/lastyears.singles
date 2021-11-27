<template>
  <div :class="{ 'toast-item': true, [`toast-item-${type}`]: true }">
    <div class="left">
      <Markdown :content="message" />

      <div v-if="action" class="action">
        <component
          :is="actionComponent"
          v-bind="actionProps"
          class="action-item"
          @click.native="onClickAction"
        >
          {{ action.label }}
        </component>
      </div>
    </div>

    <div class="right">
      <button @click="onRemove" class="close"><Icon name="x" /></button>
    </div>
  </div>
</template>

<script>
import { listenCb } from "~/assets/js/utils";
import { TOAST_TYPE } from "~/store/toast";

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 6000,
    },
    type: {
      type: String,
      default: TOAST_TYPE.GENERAL,
      validator(val) {
        return Object.values(TOAST_TYPE).includes(val);
      },
    },
    action: {
      type: Object,
      required: false,
      validator(val) {
        return !val || (val && val.to && val.label);
      },
    },
  },
  computed: {
    actionComponent() {
      return this.action && !this.action.to.startsWith("http")
        ? "nuxt-link"
        : "a";
    },
    actionProps() {
      if (!this.action) {
        return {};
      }

      return this.actionComponent === "nuxt-link"
        ? {
            to: this.action.to,
          }
        : {
            href: this.action.to,
            target: "_blank",
          };
    },
  },
  async mounted() {
    if (this.duration > 0) {
      this.timer = setTimeout(() => {
        this.onRemove();
      }, this.duration);
    }

    listenCb(document, "keyup", (e) => {
      if (e.key === "Escape") {
        this.onRemove();
      }
    });
  },
  methods: {
    onRemove() {
      this.$emit("remove", this.id);
    },
    onClickAction() {
      if (this.action && this.action.callback) {
        this.action.callback();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.toast-item {
  display: flex;
}

.left {
  display: flex;

  flex-direction: column;
  align-items: flex-start;

  font-size: var(--font-size-small);

  flex-grow: 1;

  color: var(--color-bg);
}

.right {
  flex-basis: 40px;
}

.action {
  display: block;

  margin-top: 1em;

  &-item {
    display: block;

    background-color: var(--color-bg);

    color: var(--color-text);

    padding: 10px 15px;

    cursor: pointer;
    text-decoration: none;

    &:hover,
    &:focus-visible {
      background-color: var(--color-text);
      color: var(--color-bg);
    }
  }
}

.close {
  padding: 0;
  margin: 0;

  border: none;
  background-color: transparent;

  cursor: pointer;

  &:hover,
  &:focus-visible {
    opacity: 0.5;
  }
}
</style>
