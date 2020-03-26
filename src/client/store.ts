import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import * as nestedProperty from 'nested-property';

import MiOS from './mios';

const defaultSettings = {
	tutorial: 0,
	keepCw: false,
	showFullAcct: false,
	rememberNoteVisibility: false,
	defaultNoteVisibility: 'public',
	defaultNoteLocalOnly: false,
	uploadFolder: null,
	pastedFileName: 'yyyy-MM-dd HH-mm-ss [{{number}}]',
	memo: null,
	reactions: ['👍', '❤️', '😆', '🤔', '😮', '🎉', '💢', '😥', '😇', '🍮'],
	faces: [
		'(=^・・^=)',
		'v(\'ω\')v',
		'🐡( \'-\' 🐡 )ﾌｸﾞﾊﾟﾝﾁ!!!!',
		'✌️(´･_･`)✌️',
		'(｡>﹏<｡)',
		'(Δ・x・Δ)',
		'(ｺ｀・ﾍ・´ｹ)'
	],
	widgets: [],
	iconType: 'circle' as 'circle' | 'square' | 'rounded' | 'droplet',
	useVisibilitySwitch: false,
	homeNoteVisibility: 'default',
	localNoteVisibility: 'default',
	hybridNoteVisibility: 'default',
	globalNoteVisibility: 'default',
};

const defaultDeviceUserSettings = {
	visibility: 'public',
	localOnly: false,
	widgets: [],
	tl: {
		src: 'home'
	},
};

const defaultDeviceSettings = {
	lang: null,
	loadRawImages: false,
	alwaysShowNsfw: false,
	useOsNativeEmojis: false,
	showFixedPostForm: false,
	showBrowserNotification: false,
	showToast: false,
	useSticker: true,
	makeCustomEmojisBigger: true,
	iconShape: 'circle',
	autoReload: false,
	accounts: [],
	recentEmojis: [],
	themes: [],
	darkTheme: '8c539dc1-0fab-4d47-9194-39c508e9bfe1',
	lightTheme: '4eea646f-7afa-4645-83e9-83af0333cd37',
	darkMode: false,
	syncDeviceDarkMode: true,
	animation: true,
	enableSounds: true,
	enableSoundsInTimeline: false,
	enableSoundsInNotifications: true,
	soundVolume: 0.5,
	mediaVolume: 0.5,
	postStyle: 'standard',
	mobileNotificationPosition: 'bottom',
	showPostPreview: true,
	animatedMfm: true,
	imageNewTab: false,
	sfxVolume: 0.3,
	sfxNote: 'syuilo/down',
	sfxNoteMy: 'syuilo/up',
	sfxNotification: 'syuilo/pope2',
	sfxChat: 'syuilo/pope1',
	sfxChatBg: 'syuilo/waon',
	sfxAntenna: 'syuilo/triple',
	userData: {},
};

function copy<T>(data: T): T {
	return JSON.parse(JSON.stringify(data));
}

export default (os: MiOS) => new Vuex.Store({
	plugins: [createPersistedState({
		paths: ['i', 'device', 'deviceUser', 'settings', 'instance']
	})],

	state: {
		i: null,
	},

	getters: {
		isSignedIn: state => state.i != null,
	},

	mutations: {
		updateI(state, x) {
			state.i = x;
		},

		updateIKeyValue(state, x) {
			state.i[x.key] = x.value;
		},
	},

	actions: {
		async login(ctx, i) {
			ctx.commit('updateI', i);
			ctx.commit('settings/init', i.clientData);
			ctx.commit('deviceUser/init', ctx.state.device.userData[i.id] || {});
			await ctx.dispatch('addAcount', { id: i.id, i: localStorage.getItem('i') });
		},

		addAcount(ctx, info) {
			if (!ctx.state.device.accounts.some(x => x.id === info.id)) {
				ctx.commit('device/set', {
					key: 'accounts',
					value: ctx.state.device.accounts.concat([{ id: info.id, token: info.i }])
				});
			}
		},

		logout(ctx) {
			ctx.commit('device/setUserData', { userId: ctx.state.i.id, data: ctx.state.deviceUser });
			ctx.commit('updateI', null);
			ctx.commit('settings/init', {});
			ctx.commit('deviceUser/init', {});
			localStorage.removeItem('i');
			document.cookie = `igi=; path=/`;
		},

		async switchAccount(ctx, i) {
			ctx.commit('device/setUserData', { userId: ctx.state.i.id, data: ctx.state.deviceUser });
			localStorage.setItem('i', i.token);
			await ctx.dispatch('login', i);
		},

		mergeMe(ctx, me) {
			for (const [key, value] of Object.entries(me)) {
				ctx.commit('updateIKeyValue', { key, value });
			}

			if (me.clientData) {
				ctx.commit('settings/init', me.clientData);
			}
		},
	},

	modules: {
		instance: {
			namespaced: true,

			state: {
				meta: null
			},

			mutations: {
				set(state, meta) {
					state.meta = meta;
				},
			},

			actions: {
				async fetch(ctx) {
					const meta = await os.api('meta', {
						detail: false
					});

					ctx.commit('set', meta);
				}
			}
		},

		device: {
			namespaced: true,

			state: defaultDeviceSettings,

			mutations: {
				set(state, x: { key: string; value: any }) {
					state[x.key] = x.value;
				},

				setUserData(state, x: { userId: string; data: any }) {
					state.userData[x.userId] = copy(x.data);
				},
			}
		},

		deviceUser: {
			namespaced: true,

			state: defaultDeviceUserSettings,

			mutations: {
				init(state, x) {
					for (const [key, value] of Object.entries(defaultDeviceUserSettings)) {
						if (x[key]) {
							state[key] = x[key];
						} else {
							state[key] = value;
						}
					}
				},

				set(state, x: { key: string; value: any }) {
					state[x.key] = x.value;
				},

				setTl(state, x) {
					state.tl = {
						src: x.src,
						arg: x.arg
					};
				},

				setVisibility(state, visibility) {
					state.visibility = visibility;
				},

				setLocalOnly(state, localOnly) {
					state.localOnly = localOnly;
				},

				setWidgets(state, widgets) {
					state.widgets = widgets;
				},

				addWidget(state, widget) {
					state.widgets.unshift(widget);
				},

				removeWidget(state, widget) {
					state.widgets = state.widgets.filter(w => w.id != widget.id);
				},

				updateWidget(state, x) {
					const w = state.widgets.find(w => w.id == x.id);
					if (w) {
						w.data = x.data;
					}
				},
			}
		},

		settings: {
			namespaced: true,

			state: defaultSettings,

			getters: {
				getRandomFace: ({ faces }) => () => {
					const face = faces.length > 0 ? faces[Math.floor(Math.random() * faces.length)] : ''
					console.log(Math.random())
					return face
				},
			},

			mutations: {
				set(state, x: { key: string; value: any }) {
					nestedProperty.set(state, x.key, x.value);
				},

				init(state, x) {
					for (const [key, value] of Object.entries(defaultSettings)) {
						if (x[key]) {
							state[key] = x[key];
						} else {
							state[key] = value;
						}
					}
				},
			},

			actions: {
				set(ctx, x) {
					ctx.commit('set', x);

					if (ctx.rootGetters.isSignedIn) {
						os.api('i/update-client-setting', {
							name: x.key,
							value: x.value
						});
					}
				},
			}
		}
	}
});
