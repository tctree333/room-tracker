import type { HistoricalDataPayload, RoomDataPayload } from './types';

interface PmData {
	time: Date;
	value: number;
}
type ParticleSize = 'PM2.5' | 'PM10';

function averageFull(data: PmData[]) {
	return data.reduce((acc, curr) => acc + curr.value, 0) / data.length;
}

function averageByHour(data: PmData[]) {
	const latestTime = Math.max(...data.map((d) => d.time.getTime()));
	const byHour = data.reduce((acc, curr) => {
		const delta = latestTime - curr.time.getTime();
		const hour = Math.floor(delta / 3600000);
		if (!acc.has(hour)) {
			acc.set(hour, []);
		}
		acc.get(hour)?.push(curr.value);
		return acc;
	}, new Map<number, number[]>());
	const averages = [...byHour.keys()].reduce((acc, hour) => {
		const values = byHour.get(hour) as number[];
		acc.set(hour, values.reduce((acc, curr) => acc + curr, 0) / values.length);
		return acc;
	}, new Map<number, number>());
	return averages;
}

function extractData(data: HistoricalDataPayload[], key: keyof RoomDataPayload): PmData[] {
	return data.flatMap((value) => {
		if (!value[key]) return [];
		return [
			{
				time: new Date(value.timestamp),
				value: value[key] as number
			}
		];
	});
}

function aqiFromConcentration(concentration: number, particle: ParticleSize): number {
	const ranges = {
		'PM2.5': [
			[0.0, 12.0, 0, 50],
			[12.1, 35.4, 51, 100],
			[35.5, 55.4, 101, 150],
			[55.5, 150.4, 151, 200],
			[150.5, 250.4, 201, 300],
			[250.5, 350.4, 301, 400],
			[350.5, 500.4, 401, 500]
		],
		PM10: [
			[0, 54, 0, 50],
			[55, 154, 51, 100],
			[155, 254, 101, 150],
			[255, 354, 151, 200],
			[355, 424, 201, 300],
			[435, 504, 301, 400],
			[505, 604, 401, 500]
		]
	};
	const truncated =
		particle === 'PM2.5' ? Math.trunc(concentration * 10) / 10 : Math.trunc(concentration);
	const bp = ranges[particle].reduce(
		(acc, curr) => {
			if (acc.length !== 4 && truncated >= curr[0] && truncated <= curr[1]) {
				return curr;
			}
			return acc;
		},
		[0]
	);

	return Math.round(((bp[3] - bp[2]) / (bp[1] - bp[0])) * (truncated - bp[0]) + bp[2]);
}

export function aqi(data: HistoricalDataPayload[], particle: ParticleSize): number {
	const extractedData = extractData(data, particle);
	const averaged = averageFull(extractedData);
	return aqiFromConcentration(averaged, particle);
}

export function nowCast(data: HistoricalDataPayload[], particle: ParticleSize): number {
	// from https://usepa.servicenowservices.com/airnow?id=kb_article_view&sys_id=bb8b65ef1b06bc10028420eae54bcb98

	const extractedData = extractData(data, particle);

	const averaged = averageByHour(extractedData);

	const minPm = Math.min(...averaged.values());
	const maxPm = Math.max(...averaged.values());
	const range = maxPm - minPm;
	const scaledRate = range / maxPm;
	const weight = Math.max(1 - scaledRate, 0.5);

	const sumOfProducts = [...averaged.entries()].reduce((acc, [hour, pm]) => {
		acc += pm * Math.pow(weight, hour);
		return acc;
	}, 0);
	const sumOfWeights = [...averaged.keys()].reduce((acc, hour) => {
		acc += Math.pow(weight, hour);
		return acc;
	}, 0);

	return aqiFromConcentration(sumOfProducts / sumOfWeights, particle);
}
