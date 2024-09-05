import { SPREADSHEET_ENDPOINT } from '$env/static/private';
import type { HistoricalDataPayload, RoomDataPayload } from '$lib/types';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch(SPREADSHEET_ENDPOINT);
	if (!response.ok) {
		error(response.status, 'Failed to fetch data');
	}
	const rolling = await response.json();
	const lastData = JSON.parse(JSON.stringify(rolling.slice(-1)[0])); // clone
	const lastUpdated = new Date(lastData.timestamp).toLocaleString();
	delete lastData.timestamp;

	return {
		currentState: lastData as RoomDataPayload,
		lastUpdated,
		lastUpdatedRolling: lastUpdated,
		rolling: rolling as HistoricalDataPayload[]
	};
};
