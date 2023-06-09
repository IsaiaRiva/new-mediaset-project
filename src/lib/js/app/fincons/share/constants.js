const CONSTANT = {
	dropDownData: {
		options: [
			{ label: 'UC1 - Smart ADV Insertion', value: 1 },
			{ label: 'UC2 - Brand recognition', value: 2 },
			{ label: 'UC3 - Live subtitling', value: 3 },
			{ label: 'UC4 - Celebrity recognition', value: 4 },
			{ label: 'UC8 - Autotag', value: 8 },
			{ label: 'UC9 - Content-tailored advertisement', value: 9 },
		],
	},
	serviceDropDown: {
		options: [
			{ label: 'Amazon', value: 1, classes: ['active'] },
			{ label: 'CTS', value: 2 },
			{ label: 'Amazon Simplify', value: 4 },
		],
	},
	useCaseExternal: {
		options: [
			{label: 'AWS - Live Demo', value: 0, link: 'https://ddiep5hcz5y57.cloudfront.net/'},
			{label: 'Cedat 85', value: 1, link: 'https://www.magnetofono.it/streaming/mediaset'},
		]
	}
};

export const C = Object.freeze(CONSTANT);
