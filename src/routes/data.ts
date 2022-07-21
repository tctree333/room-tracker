import type { RequestHandler } from '@sveltejs/kit';
import Particle from 'particle-api-js';

const particle = new Particle();

const authToken = process.env.PARTICLE_TOKEN;
const product = process.env.PARTICLE_PRODUCT;
const deviceNameMap = new Map<string, string>();

export const GET: RequestHandler = async () => {
	const body = new ReadableStream({
		start(controller) {
			particle.listDevices({ auth: authToken, product }).then((data) => {
				data.body.devices.forEach((device) => {
					deviceNameMap.set(device.id, device.name);
				});

				particle.getEventStream({ name: 'data', auth: authToken, product }).then((stream) => {
					stream.on('event', (data) => {
						const device = deviceNameMap.get(data.coreid) || data.coreid;
						const value = data.data;
						const msg = new TextEncoder().encode(`data: ${JSON.stringify({ device, value })}\n\n`);
						controller.enqueue(msg);
					});
				});
			});
		},
		cancel() {
			return;
		}
	});
	return {
		headers: {
			'Content-Type': 'text/event-stream'
		},
		body
	};
};
