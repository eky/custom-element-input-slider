const PREFIX = 'ce-input-slider';

export default `
	<style>
		:host { display: block }
		:host([hidden]) { display: none }

		* {
			box-sizing: border-box;
		}

		.${PREFIX} {
			position: relative;
		}

		.${PREFIX}-container {
			display: block;
			width: 100%;
			margin: 0;
			padding: 0;
			overflow: hidden;
		}

		.${PREFIX}-value-list {
			display: inline-flex;
			margin: 0;
			padding: 0;
			flex-wrap: nowrap;
			transition: transform .3s ease-out;
		}

		.${PREFIX}-value-list.${PREFIX}-touching {
			transition: none;
		}

		.${PREFIX}-label {
			position: relative;
			display: flex;
			margin: 0;
			padding: 0;
			align-items: center;
			justify-content: center;
			user-select: none;
		}

		.${PREFIX}-value {
			position: absolute;
			left: 0;
			top: 0;
			opacity: 0;
			display: block;
			width: 100%;
			height: 100%;
			margin: 0;
			padding: 0;
			border: 0;
			text-align: center;
			background: transparent;
		}

		.${PREFIX}-display {
			display: flex;
			width: 100%;
			height: 100%;
			align-items: center;
			justify-content: center;
		}
	</style>
`;
