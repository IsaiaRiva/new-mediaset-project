import FsGraph from './fs-graph.js';

class FirstFsGraph extends FsGraph {
	makeFirstGraphOptions(data) {
		if (!data) console.log(`🧊 ~ data: `, data);
		const { pauseBreaks } = data;
		const shots = pauseBreaks.map(({ shots }) => shots);
		const breaks = shots
			.map(s => s.map(({ breakTimestamp }) => breakTimestamp))
			.flat();
		const _breaks = breaks.map(v => Math.round((v / 1000 / 60) * 100) / 100);
		const weights = shots.map(s => s.map(({ weight }) => weight)).flat();
		const _weight = weights.map(v => Math.round(v * 100 * 100) / 100);
		const combineData = _breaks.map((b, i) => [b, 1, _weight[i], breaks[i]]);
		console.log(`🧊 ~ weights: `, weights);
		console.log(`🧊 ~ breaks: `, breaks);
		console.log(`🧊 ~ combineData: `, combineData);

		const symbolSize = val => {
			return val[2];
		};
		const shareItemStyle = {
			shadowBlur: 10,
			shadowColor: 'rgba(120, 36, 50, 0.5)',
			shadowOffsetY: 5,
		};

		return {
			title: {
				text: 'Smart adv insertion',
			},
			legend: {
				top: 10,
				right: 20,
				data: ['All', '<15', '15<x<30', '>30'],
				textStyle: {
					fontSize: 16,
				},
			},
			dataset: [
				{
					source: [['Time', 'Y', 'Weight', 'BreakInMs'], ...combineData],
				},

				{
					transform: {
						type: 'filter',
						config: { dimension: 'Weight', '>': 0, '<=': 15 },
					},
				},
				{
					transform: {
						type: 'filter',
						config: { dimension: 'Weight', '>': 15, '<=': 30 },
					},
				},
				{
					transform: {
						type: 'filter',
						config: { dimension: 'Weight', '>': 30, '<=': 100 },
					},
				},
			],
			dataZoom: [
				{
					type: 'inside',
					start: 0,
					end: 50,
				},
				{
					type: 'slider',
				},
			],

			tooltip: {
				position: 'top',
				formatter: function ({ value }) {
					return `insert break point: ${value[0]}m<br> weight: ${value[2]}%<br>`;
				},
			},

			xAxis: {
				type: 'category',
				name: 'minutes',
				splitLine: {
					lineStyle: {
						type: 'dashed',
					},
				},
			},
			yAxis: {
				type: 'category',
				data: [0, 1, 2],
				axisLabel: {
					show: false,
				},
				splitLine: {
					lineStyle: {
						type: 'dashed',
					},
				},
			},
			series: [
				{ data: combineData, type: 'scatter', name: 'All', symbolSize },

				{
					name: '<15',
					type: 'scatter',
					datasetIndex: 1,
					symbolSize,
					itemStyle: {
						...shareItemStyle,
						color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
							{
								offset: 0,
								color: 'rgb(251, 118, 123)',
							},
							{
								offset: 1,
								color: 'rgb(204, 46, 72)',
							},
						]),
					},
				},
				{
					name: '15<x<30',
					type: 'scatter',
					datasetIndex: 2,
					symbolSize,
					color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
						{
							offset: 0,
							color: 'rgb(129, 227, 238)',
						},
						{
							offset: 1,
							color: 'rgb(25, 183, 207)',
						},
					]),
				},
				{
					name: '>30',
					type: 'scatter',
					datasetIndex: 3,
					symbolSize,
					color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
						{
							offset: 0,
							color: 'rgb(220 182 66)',
						},
						{
							offset: 1,
							color: 'rgb(255 193 7)',
						},
					]),
				},
			],
		};
	}
}

export const FirstGraph = new FirstFsGraph();
