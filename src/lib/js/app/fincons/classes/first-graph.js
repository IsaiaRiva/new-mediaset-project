import FsGraph from './fs-graph.js';

const getMinAndRound = v => Math.round((v / 1000 / 60) * 100) / 100;
const getPercentage = v => Math.round(v * 100 * 100) / 100;
class FirstFsGraph extends FsGraph {
	combineDataMaker(data, client) {
		if (client === 'Amazon') {
			const { pauseBreaks } = data;
			const shots = pauseBreaks.map(({ shots }) => shots);
			const breaks = shots
				.map(s => s.map(({ breakTimestamp }) => breakTimestamp))
				.flat();
			const _breaks = breaks.map(v => getMinAndRound(v)).sort((a, b) => a - b);
			const weights = shots.map(s => s.map(({ weight }) => weight)).flat();
			const _weight = weights;
			return _breaks.map((b, i) => [b, 1, _weight[i], breaks[i]]);
		}
		if (client === 'CTS') {
			const { result } = data;

			return result.map(({ startTime, confidence }) => [
				getMinAndRound(startTime),
				1,
				confidence,
				startTime,
			]);
		}
		const breaks = data.map(({ breakTimestamp }) => breakTimestamp);
		const _breaks = breaks.map(v => getMinAndRound(v)).sort((a, b) => a - b);
		const weights = data.map(({ weight }) => weight);
		const _weight = weights.map(v => v);
		if (client === 'AdvInsertion') {
			const cta = data
				.map(({ content_tailored_adv }) => content_tailored_adv)
				.map(v => Array.from(new Set(v.map(({ catmerc }) => catmerc))));
			console.log(`🧊 ~ _cta: `, cta);
			return _breaks.map((b, i) => {
				return [b, 1, _weight[i], breaks[i], cta[i]];
			});
		}

		return _breaks.map((b, i) => {
			return [b, 1, _weight[i], breaks[i]];
		});
	}

	makeFirstGraphOptions(data, client) {
		if (!data) console.log(`🧊 ~ data: `, data);
		const combineData = this.combineDataMaker(data, client);
		const top = [...combineData];
		const _top = top.sort((f, s) => s[2] - f[2]).slice(0, 15);
		console.log(`🧊 ~ combineData: `, combineData);
		console.log(`🧊 ~ top: `, _top);

		const symbolSize = val => {
			return getPercentage(val[2]);
		};
		const shareItemStyle = {
			shadowBlur: 10,
			shadowColor: 'rgba(120, 36, 50, 0.5)',
			shadowOffsetY: 5,
		};

		return {
			legend: {
				top: 10,
				right: 20,
				data: ['All', 'Low', 'Medium', 'High', 'Top 15'],
				textStyle: {
					fontSize: 16,
				},
			},
			dataset: [
				{
					source: [['Time', 'Y', 'Weight', 'BreakInMs', 'AdvInsertion'], ...combineData],
				},

				{
					transform: {
						type: 'filter',
						config: { dimension: 'Weight', '>': 0, '<=': 0.15 },
					},
				},
				{
					transform: {
						type: 'filter',
						config: { dimension: 'Weight', '>': 0.15, '<=': 0.3 },
					},
				},
				{
					transform: {
						type: 'filter',
						config: { dimension: 'Weight', '>': 0.3, '<=': 100 },
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
					const type =
						value[4]?.length > 0 ? `adv insertion type: ${value[4].join()}` : '';
					return `insert break point: ${value[0]}m<br> weight: ${value[2]}<br>${type}`;
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
					data: _top,
					type: 'scatter',
					name: 'Top 15',
					symbolSize,
					itemStyle: {
						...shareItemStyle,
						color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
							{
								offset: 0,
								color: 'rgb(139 199 28)',
							},
							{
								offset: 1,
								color: 'rgb(83 119 16)',
							},
						]),
					},
				},

				{
					name: 'Low',
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
					name: 'Medium',
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
					name: 'High',
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
