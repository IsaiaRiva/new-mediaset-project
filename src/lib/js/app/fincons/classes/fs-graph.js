import AppUtils from '../../shared/appUtils.js';

export default class FsGraph {
	constructor() {}

	create(data, options = {}) {
		this.graphData = data;
		this.id = AppUtils.randomHexstring();
		this.graphContainer = $('<div/>')
			.addClass('scatter-graph mx-auto')
			.attr('id', `scatter-${this.id}`);
		const graph = echarts.init(this.graphContainer[0], 'dark', {
			width: 'auto',
			height: 'auto',
		});
		this.registerGraphEvents(this.graphData, graph);
		graph.setOption(options);
		this.graphLibValue = graph;
		console.log(`🧊 ~ graphData: `, data, graph);
	}

	destroy() {
		this.graphLibValue?.dispose();
		const element = document.getElementById(`scatter-${this.id}`);
		element?.remove();
	}

	setOn(event, fn) {
		return this.graphContainer.on(event, fn);
	}

	getGraphContainer() {
		return this.graphContainer;
	}

	resize() {
		const w = window.innerWidth - window.innerWidth * 0.1;
		const content = document.querySelector('.use-cases-container .scatter-graph');
		content.style.width = `${w}px`;
		content.style.height = `${w / 3}px`;
		return this.graphLibValue.resize({ width: w, height: w / 3 });
	}

	registerGraphEvents(datasets, graph) {
		const onDataPoint = this.onDataPointClickEvent.bind(this, datasets);
		graph.off('click').on('click', async event => onDataPoint(event));
	}

	onDataPointClickEvent(datasets, event) {
		return this.graphContainer.trigger('scatter:data:selected', [event]);
	}
}
