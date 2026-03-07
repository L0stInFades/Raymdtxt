<template>
  <section class="pref-compound-item">
    <div class="pref-compound-head">
      <slot name="head"/>
    </div>
    <div class="pref-compound-body">
      <slot name="children"/>
    </div>
    <div v-if="notes" class="notes">
      {{notes}}
    </div>
  </section>
</template>

<script>
export default {
  props: {
    notes: String,
  },
}
</script>

<style>
  .pref-compound-item {
    font-size: 14px;
    user-select: none;
    margin: 22px 0;
    padding: 24px 24px 10px;
    color: var(--editorColor);
    border-radius: 24px;
    border: 1px solid var(--panelSubtleBorderColor);
    background: rgba(255, 255, 255, 0.48);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.76);

    & .pref-compound-head h6.title {
      margin: 0;
      font-weight: 600;
      font-size: 1rem;
      letter-spacing: 0.01em;
      color: var(--sideBarTitleColor);
      padding-bottom: 2px;
    }

    & .pref-compound-body {
      padding: 8px 0 2px;
      margin-top: 4px;
    }

    & .description {
      margin-bottom: 10px;
      color: var(--editorBodyColor);
      & i {
        cursor: pointer;
        opacity: .7;
        color: var(--iconColor);
      }
      & i:hover {
        color: var(--themeColor);
      }
    }

    & .notes {
      margin-top: 10px;
      font-size: 12px;
      line-height: 1.6;
      color: var(--panelMutedColor);
    }
  }
</style>
