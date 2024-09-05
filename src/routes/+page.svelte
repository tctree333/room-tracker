<script lang="ts">
	import '$lib/global.css';

	import Dial from '$lib/components/Dial.svelte';
	import type { DataEndpointPayload } from '$lib/types';
	import { aqi, nowCast } from '$lib/aqi';

	import { browser } from '$app/environment';
	import type { PageData } from './$types';

	export let data: PageData;

	let { currentState, lastUpdated, rolling, lastUpdatedRolling } = data;

	let messages: DataEndpointPayload[] = [];

	if (browser) {
		const sse = new EventSource('/data');

		sse.onerror = function (e) {
			console.log({ e });
		};

		sse.addEventListener('message', (event) => {
			lastUpdated = new Date().toLocaleString();
			const data: DataEndpointPayload = JSON.parse(event.data);
			currentState = data.value;
			messages.unshift(data);
			messages = messages;
		});
	}
</script>

<svelte:head>
	<title>Room Tracker</title>
</svelte:head>

<main>
	<div class="content">
		<h1>Room Air Data</h1>
		<details>
			<summary>Raw Data</summary>
			<pre>{JSON.stringify(currentState, undefined, 2)}</pre>
		</details>
	</div>
	<section>
		<div class="content">
			<h2>Current Measurements</h2>
			<p>Last updated at {lastUpdated}.</p>
		</div>
		<div class="grid">
			<Dial
				title={'Temperature'}
				unit={'°F'}
				value={Math.trunc(((currentState?.TMP || 0) * (9 / 5) + 32) * 100) / 100}
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
				value={currentState?.HUM || 0}
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
			<Dial
				title={'CO2'}
				unit={'ppm'}
				value={currentState?.CO2 || 0}
				min={300}
				max={3000}
				ranges={{
					Normal: [0, 450, '#22C55E'],
					Acceptable: [450, 600, '#EAB308'],
					Elevated: [600, 1000, '#F97316'],
					High: [1000, 3000, '#EF4444']
				}}
			/>
		</div>
	</section>
	<section>
		<div class="content">
			<h2>Computed AQI</h2>
			<p>Last updated at {lastUpdatedRolling}.</p>
		</div>
		<div class="grid">
			<Dial
				title={'Current AQI (PM2.5)'}
				unit={'AQI'}
				value={nowCast(rolling, 'PM2.5')}
				min={0}
				max={500}
				ranges={{
					Good: [0, 50, '#00e400'],
					Moderate: [51, 100, '#ffff00'],
					'Unhealthy for Sensitive Groups': [101, 150, '#ff7e00'],
					Unhealthy: [151, 200, '#ff0000'],
					'Very Unhealthy': [201, 300, '#99004c'],
					Hazardous: [301, 500, '#7e0023']
				}}
			/>
			<Dial
				title={'Current AQI (PM10)'}
				unit={'AQI'}
				value={nowCast(rolling, 'PM10')}
				min={0}
				max={500}
				ranges={{
					Good: [0, 50, '#00e400'],
					Moderate: [51, 100, '#ffff00'],
					'Unhealthy for Sensitive Groups': [101, 150, '#ff7e00'],
					Unhealthy: [151, 200, '#ff0000'],
					'Very Unhealthy': [201, 300, '#99004c'],
					Hazardous: [301, 500, '#7e0023']
				}}
			/>
			<Dial
				title={'24hr AQI (PM2.5)'}
				unit={'AQI'}
				value={aqi(rolling, 'PM2.5')}
				min={0}
				max={500}
				ranges={{
					Good: [0, 50, '#00e400'],
					Moderate: [51, 100, '#ffff00'],
					'Unhealthy for Sensitive Groups': [101, 150, '#ff7e00'],
					Unhealthy: [151, 200, '#ff0000'],
					'Very Unhealthy': [201, 300, '#99004c'],
					Hazardous: [301, 500, '#7e0023']
				}}
			/>
			<Dial
				title={'24hr AQI (PM10)'}
				unit={'AQI'}
				value={aqi(rolling, 'PM10')}
				min={0}
				max={500}
				ranges={{
					Good: [0, 50, '#00e400'],
					Moderate: [51, 100, '#ffff00'],
					'Unhealthy for Sensitive Groups': [101, 150, '#ff7e00'],
					Unhealthy: [151, 200, '#ff0000'],
					'Very Unhealthy': [201, 300, '#99004c'],
					Hazardous: [301, 500, '#7e0023']
				}}
			/>
		</div>
	</section>
	<section>
		<div class="content">
			<h2>Current Particulate Matter</h2>
			<p>Last updated at {lastUpdated}.</p>
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
		</div>
	</section>
</main>

<style>
	h2 {
		margin: 0 0 8px;
	}
	main {
		margin: 32px 0 128px;
	}
	section {
		max-width: 960px;
		margin: 32px auto 56px;
	}
	.content {
		max-width: 960px;
		margin: 0 auto;
		padding: 8px 16px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(150px, 100%), 1fr));
		grid-gap: 16px;
		padding: 0 16px;
	}
</style>
