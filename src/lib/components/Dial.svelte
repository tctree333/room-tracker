<script lang="ts">
	export let value: number;
	export let min: number;
	export let max: number;
	export let ranges: Record<string, [number, number, string]>;
	export let title: string;
	export let unit: string;

	$: [label, color] = findRange(value);

	function findRange(value: number): [string, string] {
		for (const [label, [min, max, color]] of Object.entries(ranges)) {
			if (value >= min && value <= max) {
				return [label, color || '#22C55E'];
			}
		}
		return ['', '#22C55E'];
	}
</script>

<article>
	<h3>{title}</h3>
	<meter class="sr-only" {value} {min} {max}>{value} {unit}</meter>
	<svg class="gauge" aria-hidden="true" viewBox="0 0 340 340">
		<circle
			class="outline"
			r="150"
			cx="50%"
			cy="50%"
			stroke="#A1A1AA"
			stroke-width="40"
			fill="none"
			pathLength="1000"
			stroke-dasharray="811"
		/>
		<circle
			class="filled"
			r="150"
			cx="50%"
			cy="50%"
			stroke={color}
			stroke-width="30"
			fill="none"
			pathLength="1000"
			stroke-dasharray="{800 * Math.min(Math.max((value - min) / (max - min), 0.02), 1)} 1000"
		/>
		<text class="value" x="50%" y="48%" text-anchor="middle" dominant-baseline="middle"
			>{value}</text
		>
		<text class="unit" x="50%" y="68%" text-anchor="middle" dominant-baseline="middle">{unit}</text>
	</svg>
	<p>{label}</p>
</article>

<style>
	article {
		padding: 16px;
		border: 2px solid #d6d3d1;
		border-radius: 8px;
	}
	h3 {
		margin: 0;
		text-align: center;
		margin-bottom: 12px;
		font-weight: 400;
		font-size: 1.25rem;
	}
	p {
		margin: 0;
		text-align: center;
		font-size: 1rem;
	}
	svg.gauge {
		color: #22c55e;
		display: block;
		width: 100%;
	}
	svg.gauge circle {
		transform-origin: center;
	}
	svg.gauge circle.filled {
		transform: rotate(126deg);
		transition-property: stroke-dasharray;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 300ms;
	}
	svg.gauge circle.outline {
		transform: rotate(124deg);
	}
	svg.gauge text {
		font: inherit;
		color: black;
	}
	svg.gauge text.value {
		font-size: 3.5rem;
	}
	svg.gauge text.unit {
		font-size: 2rem;
	}
</style>
