import InputAdaptor from './InputAdaptor.js';
import defaultStyle from './default-style.js';

const PREFIX = 'ce-input-slider';

export default class HTMLInputSliderElement extends HTMLElement {
	constructor() {
		super();
		this.isInitialized = false;

		this.isTouching = false;
		this.isMoving = false;

		this.swipe = {
			startX: 0,
			startY: 0,
			diffX: 0,
			diffY: 0,
			moveX: 0,
			moveY: 0,
			endX: 0,
			endY: 0,
			startTime: 0,
			endTime: 0,
		};

		// Build content template
		const template = document.createElement('template');
		template.innerHTML = `
			${defaultStyle}
			<slot name="custom-stylesheet"></slot>
			<slot name="custom-style"></slot>
			<div class="${PREFIX}">
				<slot name="input"></slot>
				<div class="${PREFIX}-container">
					<div class="${PREFIX}-value-list"></div>
				</div>
			</div>
		`;

		this.attachShadow({ mode: 'open' }).appendChild(
			template.content.cloneNode(true)
		);

		// Select elements we will use
		this.$slider = this.shadowRoot.querySelector(`.${PREFIX}`);
		this.$container = this.shadowRoot.querySelector(`.${PREFIX}-container`);
		this.$valueList = this.shadowRoot.querySelector(`.${PREFIX}-value-list`);

		this.$slotInput = this.shadowRoot.querySelector('slot[name="input"]');
		this.$input = this.$slotInput.assignedNodes()[0];

		this.$slotCustomStylesheet = this.shadowRoot.querySelector('slot[name="custom-stylesheet"]');
		this.$slotCustomStyle = this.shadowRoot.querySelector('slot[name="custom-style"]');

		this.$checkedValue = null;
	}

	static get defaultAttributes() {
		return {
			centermode: null,
			boundary: 0,
			friction: 150,
		};
	}

	static get observedAttributes() {
		return Object.keys(HTMLInputSliderElement.defaultAttributes);
	}

	connectedCallback() {
		if (!this.isInitialized) {
			this._assignDefaultAttributes(HTMLInputSliderElement.defaultAttributes);

			this.$slotInput.addEventListener('slotchange', () => {
				this.render();
			});
			this.render();

			// Add custom <link rel="stylesheet">
			const applyCustomStylesheet = () => {
				this.$customStylesheet = this.$slotCustomStylesheet.assignedNodes()[0];

				if (this.$customStylesheet) {
					const newStylesheet = document.createElement('link');
					newStylesheet.rel = 'stylesheet';
					newStylesheet.href = this.$customStylesheet.href;
					this.shadowRoot.appendChild(newStylesheet);
				}
			};
			this.$slotCustomStylesheet.addEventListener('slotchange', () => applyCustomStylesheet());

			// Add custom <style>
			const applyCustomStyle = () => {
				this.$customStyle = this.$slotCustomStyle.assignedNodes()[0];

				if (this.$customStyle) {
					const newStyle = document.createElement('style');
					newStyle.innerHTML = this.$customStyle.innerHTML;
					this.shadowRoot.appendChild(newStyle);
				}
			};
			this.$slotCustomStyle.addEventListener('slotchange', () => applyCustomStyle());

			// Attach input change
			this.$input.addEventListener('input', event => {
				this._inputChange(event.target.value);

				const isCenterMode = this.getAttribute('centermode') !== null;
				if (isCenterMode) this._moveToCenter();
			}, false);

			// Attach swipe events
			[
				'touchstart',
				'mousedown',
			].forEach(eventName => this.$container.addEventListener(eventName, event => this._start(event), false));
			[
				'touchmove',
				'mousemove',
			].forEach(eventName => window.addEventListener(eventName, event => this._move(event), false));
			[
				'touchend',
				'touchcancel',
				'mouseup',
			].forEach(eventName => window.addEventListener(eventName, event => this._end(event), false));

			this.isInitialized = true;
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (this.isInitialized && this.isConnected && newValue !== null) {
			this.render();
		}
	}

	_assignDefaultAttributes(defaultAttributes) {
		const defaults = defaultAttributes;
		Object.keys(defaults).map(key => {
			const attribute = this.getAttribute(key);
			if (
				(
					attribute === null ||
					attribute === ''
				) &&
				defaults[key] !== null
			) {
				this.setAttribute(key, defaults[key]);
			}
		});
	}

	/* Input attributeNames ['a', b'] will returns:
	 * {
	 * 	a: this.getAttribute('a'),
	 * 	b: this.getAttribute('b'),
	 * }
	 */
	_getAttributes(attributeNames) {
		if (!Array.isArray(attributeNames)) return {};
		return attributeNames.reduce((accumulator, currentValue) => {
			const currentPair = {};
			currentPair[currentValue] = this.getAttribute(currentValue);
			return Object.assign(accumulator, currentPair);
		}, {});
	}

	_dispatchGeneratedEvent() {
		this.dispatchEvent(new CustomEvent('generated', {
			bubbles: false,
			composed: true,
		}));
	}

	render() {
		const $fragment = document.createDocumentFragment();
		const inputAdaptor = new InputAdaptor(this.$input);

		this.$valueList.innerHTML = '';

		// Generate value list
		const valuePairs = inputAdaptor.values();

		valuePairs.forEach(valuePair => {
			const { display, value } = valuePair;
			const $label = document.createElement('label');
			$label.classList.add(`${PREFIX}-label`);
			$label.dataset.value = value;

			const $value = document.createElement('input');
			$value.classList.add(`${PREFIX}-value`);
			$value.setAttribute('type', 'radio');
			$value.setAttribute('name', `${PREFIX}-radio`);
			$value.value = value;
			$value.onclick = event => {
				const isCenterMode = this.getAttribute('centermode') !== null;
				if (isCenterMode && this.isTouching) {
					event.preventDefault();
				} else {
					this.$input.setAttribute('value', value);
					this.$input.value = event.target.value;
					if (isCenterMode && !this.isMoving) {
						this._moveToCenter();
					}
				}
			};
			$value.onkeydown = event => event.preventDefault();
			if (value === this.$input.value) {
				$value.checked = true;
				this.$checkedValue = $value;
			}
			$label.appendChild($value);

			const $display = document.createElement('span');
			$display.classList.add(`${PREFIX}-display`);
			$display.textContent = display;
			$label.appendChild($display);

			$fragment.appendChild($label);
		});

		this.$valueList.appendChild($fragment);

		const isCenterMode = this.getAttribute('centermode') !== null;
		if (isCenterMode) this._moveToCenter();

		this._dispatchGeneratedEvent();
	}

	_moveToCenter() {
		const $selectedLabel = this.shadowRoot.querySelector(`.${PREFIX}-label[data-value="${this.$input.value}"]`);
		const centerX = -($selectedLabel.offsetLeft) + this.$container.clientWidth / 2 - $selectedLabel.clientWidth / 2;
		this.$valueList.style.transform = `translateX(${centerX}px)`;

		this.swipe.endX = -centerX;
	}

	_selectCenter(translateX) {
		let selectedIndex = 0;
		const $labels = Array.from(
			this.shadowRoot.querySelectorAll(`.${PREFIX}-label`)
		);
		const boundary = this.$container.clientWidth / 2 - $labels[0].clientWidth / 2;

		$labels.forEach(($label, index) => {
			const labelLeft = $label.offsetLeft - $label.clientWidth / 2;
			if (-translateX + boundary >= labelLeft) {
				selectedIndex = index;
			}
		});

		const value = $labels[selectedIndex].querySelector('input').value;

		this.$input.setAttribute('value', value);
		this.$input.value = value;

		this._inputChange(value);
	}

	_inputChange(value) {
		if (this.$checkedValue !== null) {
			this.$checkedValue.checked = false;
		}

		const $checkedValue = this.shadowRoot.querySelector(`.${PREFIX}-value[value="${value}"]`);
		if ($checkedValue) {
			$checkedValue.checked = true;
			this.$checkedValue = $checkedValue;
		}
	}

	_start(event) {
		if (!this.isTouching) {
			event.preventDefault();
			const clientX = event.clientX || event.touches[0].clientX || 0;

			this.classList.add(`${PREFIX}-touching`);
			this.$valueList.classList.add(`${PREFIX}-touching`);

			this.isTouching = true;
			this.swipe.startX = clientX + this.swipe.endX;
			// this.swipe.startY = event.clientY;
			this.swipe.startTime = new Date().getTime();
		}
	}

	_move(event) {
		if (this.isTouching) {
			// event.preventDefault();

			const clientX = event.clientX || event.touches[0].clientX || 0;
			const moveX = clientX - this.swipe.startX;

			// const boundary = Number(this.getAttribute('boundary'));
			// const maxX = this.$valueList.clientWidth - this.$container.clientWidth;
			// const maxOver = 250;
			// if (moveX > 0 + boundary) {
			// 	const cushion = 1 - moveX / (maxOver * 4);
			// 	moveX = cushion > 0.5 ? moveX * cushion : maxOver;
			// } else if (moveX < -maxX - boundary) {
			// 	const cushion = 1 - -(moveX - maxX) / (maxOver * 4);
			// 	console.log(cushion);
			// 	moveX = cushion > 0.5
			// 		? moveX * cushion
			// 		: -(maxX + maxOver);
			// }

			this.swipe.moveX = moveX;
			this.swipe.diffX = clientX - (this.swipe.startX - this.swipe.endX);
			this.$valueList.style.transform = `translateX(${moveX}px)`;

			if (this.swipe.moveX >= 20) {
				this.isMoving = true;
			}

			const isCenterMode = this.getAttribute('centermode') !== null;
			if (isCenterMode) {
				this._selectCenter(moveX);
			}
		}
	}

	_end() {
		if (this.isTouching) {
			// event.preventDefault();

			// const clientX = event.clientX || event.touches[0].clientX || 0;

			let boundary = Number(this.getAttribute('boundary'));
			const friction = Number(this.getAttribute('friction'));
			const isCenterMode = this.getAttribute('centermode') !== null;

			if (isCenterMode) {
				const $firstLabel = this.shadowRoot.querySelector(`.${PREFIX}-label:first-child`);
				boundary = this.$container.clientWidth / 2 - $firstLabel.clientWidth / 2;
			}

			this.swipe.endTime = new Date().getTime();

			const maxX = this.$valueList.clientWidth - this.$container.clientWidth;

			this.classList.remove(`${PREFIX}-touching`);
			this.$valueList.classList.remove(`${PREFIX}-touching`);

			// Inertia movement
			const kinetic = this.swipe.diffX / (this.swipe.endTime - this.swipe.startTime);
			let inertiaX = this.swipe.moveX + kinetic * friction;

			if (inertiaX > 0 + boundary) {
				inertiaX = 0 + boundary;
			} else if (inertiaX < -maxX - boundary) {
				inertiaX = -maxX - boundary;
			}

			this.$valueList.style.transform = `translateX(${inertiaX}px)`;

			// this.swipe.endX = -this.swipe.moveX;
			this.swipe.endX = -inertiaX;

			this.isTouching = false;
			this.isMoving = false;
			if (isCenterMode) {
				this._selectCenter(inertiaX);
			}
		}
	}
}
