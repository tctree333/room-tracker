export interface RoomDataPayload {
	PM1?: number;
	'PM2.5'?: number;
	PM4?: number;
	PM10?: number;
	HUM1?: number;
	TMP1?: number;
	VOC?: number;
	NOX?: number;
	CO2?: number;
	TMP2?: number;
	HUM2?: number;
	TMP?: number;
	HUM?: number;
}

export interface HistoricalDataPayload extends RoomDataPayload {
	timestamp: string;
}

export interface DataEndpointPayload {
	device: string;
	value: RoomDataPayload;
}
