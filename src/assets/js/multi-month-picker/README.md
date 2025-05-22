Multi Month Picker
=========================

## Basic Usage


Include jQuery, jQuery UI and multi-month-picker on your web page
```
<link rel="stylesheet" href="/path/to/multi-month-picker.min.css">
<script src="/path/to/jquery.js"></script>
<script src="/path/to/jquery-ui.js"></script>
<script src="/path/to/multi-month-picker.min.js"></script>
```

HTML:
```
<input type="text" id="exampleInput">
```

Basic initialization:
```
$('#exampleInput').multiMonthPicker();
```

## Options:

You may set multiMonthPicker options with `$().multiMonthPicker(options)`.


### monthFormat


- Type: `String`
- Default: `yyyy-mm`


| Format | Description                |
| ------ | -------------------------- |
| yyyy   | Four-digit year            |
| yy     | Last two digits of year    |
| mmm    | Three-letter month name    |
| mm     | Two-digit month            |
| m      | Month without leading zero |




### value


- Type: `Array`
- Default: `[]`


## Advanced Usage


Month format:
```
$('#exampleInput').multiMonthPicker({
    monthFormat: 'yyyy mmm'
});
```

Set months:
```
$('#exampleInput').multiMonthPicker({
    value: ['2023-10','2023-12']
});
```

Get selected months:
```
$('#exampleInput').multiMonthPicker('value');
```

## Example
https://armashansari.github.io/multi-month-picker/demo/index.html

