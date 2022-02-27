<template>
	<XSearch v-model:value="query" class="_panel" :fixed="true" @search="search"/>
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
	},

	inject: {
		navHook: {
			default: null
		},
		sideViewHook: {
			default: null
		}
	},

	data() {
		return {
			query: ''
		};
	},

	methods: {
		search() {
			this.push(`/search/notes/${encodeURIComponent(this.query)}`);
		},

		push(path: string) {
			if (this.navHook) {
				this.navHook(path);
			} else {
				if (this.$store.state.defaultSideView && this.sideViewHook && path !== '/') {
					return this.sideViewHook(path);
				}

				if (this.$router.currentRoute.value.path === path) {
					window.scroll({ top: 0, behavior: 'smooth' });
				} else {
					this.$router.push(path);
				}
			}
		},
	},
});
</script>
