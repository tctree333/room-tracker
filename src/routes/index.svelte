<script lang="ts">
	import { browser } from '$app/env';

	let messages: { device: string; value: string }[] = [];

	let value = 0;

	if (browser) {
		const sse = new EventSource('/data');

		sse.onerror = function (e) {
			console.log({ e });
		};

		sse.addEventListener('message', (event) => {
			console.log({ event });
			const data = JSON.parse(event.data);
			value = parseInt(data.value);
			messages.unshift(data);
			messages = messages;
		});
	}
</script>

<h1>Wow!</h1>

<progress {value} max="4095" />

<button
	on:click={() => {
		messages = [];
	}}>Clear</button
>

<p>{value}</p>

<!-- <ul>
	{#each messages as msg}
		<li>{msg.device}: {msg.value}</li>
	{/each}
</ul> -->
