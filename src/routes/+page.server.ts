import { SPREADSHEET_ENDPOINT } from '$env/static/private';
import type { HistoricalDataPayload, RoomDataPayload } from '$lib/types';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const rollingResp = await fetch(
		'https://raw.githubusercontent.com/tctree333/room-tracker/main/archive/data/rolling.json'
	);
	if (!rollingResp.ok) {
		error(rollingResp.status, 'Failed to fetch data');
	}
	const rolling = await rollingResp.json();

	let lastData = JSON.parse(JSON.stringify(rolling.slice(-1)[0])); // clone

	const currentDataResp = await fetch(SPREADSHEET_ENDPOINT);
	if (currentDataResp.ok) {
		lastData = (await currentDataResp.json()).slice(-1)[0];
	}
	const lastUpdated = new Date(lastData.timestamp);
	delete lastData.timestamp;

	return {
		currentState: lastData as RoomDataPayload,
		lastUpdated,
		lastUpdatedRolling: new Date(rolling.slice(-1)[0].timestamp),
		rolling: rolling as HistoricalDataPayload[]
	};
};
