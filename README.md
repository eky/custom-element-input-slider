# custom-element-input-slider
Still in development. Please do not use unless you know what you are actually doing.

## Installation
```sh
npm install custom-element-input-slider
```
or
```sh
yarn add custom-element-input-slider
```

## Polyfills
You will need polyfills bundled in `dist/polyfills.js`, it included:
* [`@babel/polyfill`](https://babeljs.io/docs/en/babel-polyfill)
* [`@webcomponents/webcomponentsjs`](https://github.com/webcomponents/webcomponentsjs)

## Usage
### Basic
#### HTML
```html
<input-slider centermode boundary="100">
	<link slot="custom-stylesheet" href="slider.css" rel="stylesheet" />
	<style slot="custom-style">
		:host .ce-input-slider-label {
			background: rebeccapurple;
		}
	</style>
	<input
		slot="input"
		id="range" name="range" type="range"
		min="0" max="9" step="1.5" value="3"
	/>
</input-slider>

<input-slider>
	<link slot="custom-stylesheet" href="slider.css" rel="stylesheet" />
	<input
		slot="input"
		list="datalist-example"
		id="datalist" name="datalist" type="text"
		value="Pig"
	/>
	<datalist id="datalist-example">
		<option value="Pig">🐷</option>
		<option value="Cat">🐱</option>
		<option value="Dog">🐶</option>
	</datalist>
</input-slider>

<input-slider>
	<link slot="custom-stylesheet" href="slider.css" rel="stylesheet" />
	<select
		slot="input"
		id="select" name="select"
		value="Thinking Face"
	/>
		<option value="Thinking Face">🤔</option>
		<option value="Face With Tears of Joy">😂</option>
		<option value="Grinning Face">😀</option>
	</select>
</input-slider>

<script src="path/to/polyfills.js"></script>
<script src="path/to/custom-element-input-slider.js"></script>
<!-- or import the .js in somewhere if you use bundler -->
```
[Demo on Codepen](https://codepen.io/eky/pen/rRQBpb)

## License
[MIT](https://github.com/eky/custom-element-input-slider/blob/master/LICENSE)
