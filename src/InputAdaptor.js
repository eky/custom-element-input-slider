export default class InputAdaptor {
	constructor(input) {
		this.$input = input;
	}

	values() {
		if (this.$input.tagName === 'SELECT') {
			return this._select();
		} else if (this.$input.list && this.$input.list.options) {
			return this._datalist();
		} else if (this.$input.type === 'range') {
			return this._range();
		}

		return [];
	}

	_range() {
		const min = Number(this.$input.min);
		const max = Number(this.$input.max);
		const step = Number(this.$input.step) || 1;

		return new Array(
			Math.ceil((max - min) / step + 1)
		).fill(0).map((value, index) => {
			// Try to fight with 0.1+0.2 !== 0.3 floting point problem 🤧
			const newValue = Number(
				(min + step * index).toPrecision(12)
			);
			return {
				display: (newValue > max ? max : newValue).toString(),
				value: (newValue > max ? max : newValue).toString(),
			};
		});
	}

	_datalist() {
		return Array.from(this.$input.list.options).map(option => {
			return {
				display: option.text || option.innerText || option.textContent,
				value: option.value,
			};
		});
	}

	_select() {
		return Array.from(this.$input.options).map(option => {
			return {
				display: option.text || option.innerText || option.textContent,
				value: option.value,
			};
		});
	}
}
