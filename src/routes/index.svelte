<script lang="ts">
	import '$lib/global.css';

	import Dial from '$lib/components/Dial.svelte';
	import { browser } from '$app/env';
	import type { DataEndpointPayload, RoomDataPayload } from '$lib/types';

	let messages: DataEndpointPayload[] = [];
	let currentState: RoomDataPayload = {
		PM1: 0,
		'PM2.5': 0,
		PM4: 0,
		PM10: 0,
		HUM1: 0,
		TMP1: 0,
		VOC: 0,
		NOX: 0
	};
	let lastUpdated = 'never';

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

<main class="content">
	<h1>Room Air Data</h1>

	<p>Last updated at {lastUpdated}.</p>
	<pre>{JSON.stringify(currentState, undefined, 2)}</pre>
</main>
<section>
	<div class="content">
		<h2>Real-Time</h2>
	</div>
	<div class="grid">
		<Dial
			title={'PM1.0'}
			unit={'µg/m³'}
			value={currentState?.PM1 || 0}
			min={0}
			max={500}
			ranges={{
				'': [0, 500, '#D946EF']
			}}
		/>
		<Dial
			title={'PM2.5'}
			unit={'µg/m³'}
			value={currentState?.['PM2.5'] || 0}
			min={0}
			max={500}
			ranges={{
				'': [0, 500, '#D946EF']
			}}
		/>
		<Dial
			title={'PM4.0'}
			unit={'µg/m³'}
			value={currentState?.PM4 || 0}
			min={0}
			max={500}
			ranges={{
				'': [0, 500, '#D946EF']
			}}
		/>
		<Dial
			title={'PM10.0'}
			unit={'µg/m³'}
			value={currentState?.PM10 || 0}
			min={0}
			max={500}
			ranges={{
				'': [0, 500, '#D946EF']
			}}
		/>
		<Dial
			title={'Temperature'}
			unit={'°F'}
			value={(currentState?.TMP1 || 0) * (9 / 5) + 32}
			min={25}
			max={110}
			ranges={{
				Freezing: [0, 30, '#3B82F6'],
				Cold: [30, 45, '#0EA5E9'],
				Cool: [45, 65, '#14B8A6'],
				Comfortable: [65, 75, '#22C55E'],
				Warm: [75, 90, '#EAB308'],
				Hot: [90, 150, '#EF4444']
			}}
		/>
		<Dial
			title={'Humidity'}
			unit={'%'}
			value={currentState?.HUM1 || 0}
			min={0}
			max={100}
			ranges={{
				Dry: [0, 30, '#EAB308'],
				Comfortable: [30, 60, '#22C55E'],
				Wet: [60, 100, '#06B6D4']
			}}
		/>
		<Dial
			title={'VOC'}
			unit={'/500'}
			value={currentState?.VOC || 0}
			min={0}
			max={500}
			ranges={{
				Low: [0, 150, '#22C55E'],
				Mild: [150, 250, '#EAB308'],
				Medium: [250, 400, '#F97316'],
				High: [400, 500, '#EF4444']
			}}
		/>
		<Dial
			title={'NOX'}
			unit={'/500'}
			value={currentState?.NOX || 0}
			min={0}
			max={500}
			ranges={{
				Low: [0, 20, '#22C55E'],
				Mild: [20, 150, '#EAB308'],
				Medium: [150, 300, '#F97316'],
				High: [300, 500, '#EF4444']
			}}
		/>
	</div>
</section>

<style>
	.content {
		max-width: 720px;
		margin: 0 auto;
		padding: 16px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(150px, 100%), 1fr));
		grid-gap: 16px;
		padding: 0 16px;
	}
	section {
		max-width: 1440px;
		margin: 0 auto;
	}
</style>
