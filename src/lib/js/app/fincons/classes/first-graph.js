import FsGraph from './fs-graph.js';

class FirstFsGraph extends FsGraph {
	combineDataMaker(data, client) {
		const getMinAndRound = v => Math.round((v / 1000 / 60) * 100) / 100;
		const getPercentage = v => Math.round(v * 100 * 100) / 100;

		if (client === 'Amazon') {
			const { pauseBreaks } = data;
			const shots = pauseBreaks.map(({ shots }) => shots);
			const breaks = shots
				.map(s => s.map(({ breakTimestamp }) => breakTimestamp))
				.flat();
			const _breaks = breaks.map(v => getMinAndRound(v));
			const weights = shots.map(s => s.map(({ weight }) => weight)).flat();
			const _weight = weights.map(v => getPercentage(v));
			return _breaks.map((b, i) => [b, 1, _weight[i], breaks[i]]);
		}
		if (client === 'CTS') {
			const { result } = data;

			return result.map(({ startTime, confidence }) => [
				getMinAndRound(startTime),
				1,
				getPercentage(confidence),
				startTime,
			]);
		}
	}

	makeFirstGraphOptions(data, client) {
		if (!data) console.log(`🧊 ~ data: `, data);
		const combineData = this.combineDataMaker(data, client);
		const top = [...combineData];
		const _top = top.sort((f, s) => s[2] - f[2]).slice(0, 15);
		console.log(`🧊 ~ combineData: `, combineData);
		console.log(`🧊 ~ combineDataSort: `, _top);

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
				data: ['All', 'Low', 'Medium', 'High', 'Top 15'],
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
					return `insert break point: ${value[0]}m<br> confidence: ${value[2]}%<br>`;
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
