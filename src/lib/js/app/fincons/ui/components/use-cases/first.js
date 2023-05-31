import { FirstGraph } from '../../../classes/first-graph.js';
import { VS } from '../../../classes/video-state.js';
import { insertIntoUserCaseTab } from '../../logic/dom-manipulation.js';
import { jsonMap } from '../../../jsons/json-map.js';
import { getAdvVideo, getPLayerContainer } from '../../logic/selectors.js';

export const createFirstGraph = ({ useCase }) => {
	const graph = FirstGraph;

	graph.destroy();

	const {
		media: {
			$data: { basename },
		},
	} = VS.getVideoData();
	const JsonData = jsonMap(basename);

	const options = graph.makeFirstGraphOptions(JsonData);
	graph.create(JsonData, options);
	graph.setOn('scatter:data:selected', async (event, datapoint) =>
		onDataPointSelected(event, datapoint)
	);

	insertIntoUserCaseTab(graph.getGraphContainer()[0]);

	graph.resize();

	console.log(`🧊 ~ basename: `, basename);
};

const onDataPointSelected = async (_, { value }) => {
	const player = VS.getPlayer();
	if (!player || player.getIfAdvIsPlaying()) {
		return;
	}

	console.log(`🧊 ~ value: `, value);
	console.log(`🧊 ~ VS.getPLayer(): `, VS.getPlayer());

	player.seek((value[3] - 10000)/ 1000 );
	console.log(`🧊 ~ value[3] - 10000)/ 1000 : `, (value[3] - 10000)/ 1000 );
	const advVideo = player.createAdv();
	player.registerAdvListener(value[3]);

	player.play();
	await delay(1);

	console.log(`🧊 ~ advVideo: `, advVideo);
	const playerContainer = getPLayerContainer();
	if (!getAdvVideo()) {
		playerContainer.appendChild(advVideo); 
	}
};

const delay = time => {
	return new Promise(res => {
		setTimeout(res, time * 1000);
	});
};
