import { faUpload, faCloud, faLink } from '@fortawesome/free-solid-svg-icons';
import * as os from '@/os';
import { i18n } from '@/i18n';

export function selectFile(src: any, label: string | null, multiple = false) {
	return new Promise((res, rej) => {
		const chooseFileFromDevice = () => {
			const input = document.createElement('input');
			input.type = 'file';
			input.multiple = multiple;
			input.onchange = () => {
				if (!input.files) return;
				const promises = Array.from(input.files).map(file => os.upload(file));

				Promise.all(promises).then(driveFiles => {
					res(multiple ? driveFiles : driveFiles[0]);
				}).catch(e => {
					os.dialog({
						type: 'error',
						text: e
					});
				});

				// 一応廃棄
				(window as any).__misskey_input_ref__ = null;
			};

			// https://qiita.com/fukasawah/items/b9dc732d95d99551013d
			// iOS Safari で正常に動かす為のおまじない
			(window as any).__misskey_input_ref__ = input;

			input.click();
		};

		const chooseFileFromDrive = () => {
			os.selectDriveFile(multiple).then((files) => {
				res(files);
			});
		};


		os.modalMenu([label ? {
			text: label,
			type: 'label'
		} : undefined, {
			text: i18n.locale.upload,
			icon: faUpload,
			action: chooseFileFromDevice
		}, {
			text: i18n.locale.fromDrive,
			icon: faCloud,
			action: chooseFileFromDrive
		}], src);
	});
}
