<template>
	<XSearch class="_panel" :fixed="true" :autofocus="false"/>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import XSearch from "@/components/search.vue";
import define from "./define";

const widget = define({
	name: 'search',
	props: () => ({
	})
});

export default defineComponent({
	extends: widget,

	components: {
		XSearch,
	}
});
</script>
