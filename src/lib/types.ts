export interface RoomDataPayload {
	PM1: number;
	'PM2.5': number;
	PM4: number;
	PM10: number;
	HUM1: number;
	TMP1: number;
	VOC: number;
	NOX: number;
}

export interface DataEndpointPayload {
	device: string;
	value: RoomDataPayload;
}
