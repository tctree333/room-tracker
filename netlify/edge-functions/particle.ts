const BASE_URL = 'https://api.particle.io';

const authToken = Deno.env.get('PARTICLE_TOKEN');
const product = Deno.env.get('PARTICLE_PRODUCT');
const deviceNameMap = new Map<string, string>();

async function readEvent(url: string, callback: (data: Record<string, string>) => void) {
	const utf8Decoder = new TextDecoder('utf-8');

	const resp = await fetch(url);
	if (!resp.body) return;
	const reader = resp.body.getReader();
	let finished = false;
	while (!finished) {
		const { value, done } = await reader.read();
		if (done) {
			finished = true;
			break;
		}
		const decoded = utf8Decoder.decode(value).trim();
		decoded.split('\n').forEach((line) => {
			if (line.startsWith('data:')) {
				const data = JSON.parse(line.substring(5));
				callback(data);
			}
		});
	}
}

export default async function () {
	const body = new ReadableStream({
		start(controller) {
			fetch(`${BASE_URL}/v1/products/${product}/devices?access_token=${authToken}`)
				.then((res) => res.json())
				.then((data) => {
					data.devices.forEach((device: { id: string; name: string }) => {
						deviceNameMap.set(device.id, device.name);
					});

					readEvent(
						`${BASE_URL}/v1/products/${product}/events/roomData?access_token=${authToken}`,
						(data) => {
							const device = deviceNameMap.get(data.coreid) || data.coreid;
							const payload = JSON.parse(data.data);
							const msg = new TextEncoder().encode(
								`data: ${JSON.stringify({ device, value: payload })}\n\n`
							);
							controller.enqueue(msg);
						}
					).then();
				});
		},
		cancel() {
			return;
		}
	});
	return new Response(body, {
		headers: {
			'Content-Type': 'text/event-stream'
		}
	});
}
