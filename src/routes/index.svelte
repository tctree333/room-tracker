<script lang="ts">
	import '$lib/global.css';

	import { browser } from '$app/env';
	import type { DataEndpointPayload, RoomDataPayload } from 'src/lib/types';

	let messages: DataEndpointPayload[] = [];
	let currentState: RoomDataPayload;
	let lastUpdated = '';

	if (browser) {
		const sse = new EventSource('/data');

		sse.onerror = function (e) {
			console.log({ e });
		};

		sse.addEventListener('message', (event) => {
			console.log({ event });
			lastUpdated = new Date().toLocaleString();
			const data: DataEndpointPayload = JSON.parse(event.data);
			currentState = data.value;
			messages.unshift(data);
			messages = messages;
		});
	}
</script>

<h1>Wow!</h1>

<p>Last updated at {lastUpdated}.</p>
<pre>{JSON.stringify(currentState, undefined, 2)}</pre>
