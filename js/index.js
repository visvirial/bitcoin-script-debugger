
var bitcore = require('bitcore-lib');

var rerun = function() {
	// Initialize.
	$('#result-text').val('');
	$('#result-text-error').hide();
	$('#result-hex').val('');
	$('#result-error').hide();
	$('#result-steps tbody *').remove();
	// Read input.
	var input = $('#input').val().trim();
	var chunks = input.split(/\s+/);
	try {
		var script = bitcore.Script.fromString(chunks.join(' '));
	} catch(e) {
		$('#result-text-error').show();
		return;
	}
	$('#result-text').val(script.toString());
	$('#result-hex').val('0x'+script.toHex());
	var interpreter = new bitcore.Script.Interpreter();
	interpreter.set({script: script});
	var err = '';
	var result = true;
	for(; interpreter.pc<interpreter.script.chunks.length;) {
		result = interpreter.step();
		$('#result-steps tbody').append('<tr><td>'+interpreter.stack.map(function(item) {return item.toString('hex');}).join(', ')+'</td><td>'+chunks[interpreter.pc-1]+'</td><td>'+chunks.slice(interpreter.pc).join(' ')+'</td></tr>');
		if(!result) break;
	}
	
	if(!result) {
		err += 'Script ended with error.';
	} else {
		if(interpreter.stack.length == 0) {
			result = false;
			err += 'The resulting stack is empty.';
		} else {
			var ret = interpreter.stack.pop();
			if(!bitcore.Script.Interpreter.castToBool(ret)) {
				result = false;
				err += 'The resulting top stack item is FALSE.';
			}
		}
	}
	if(!result) {
		$('#result-error').text(err);
		$('#result-error').show();
	}
	$('#result').removeClass('label-success');
	$('#result').removeClass('label-danger');
	$('#result').addClass(result ? 'label-success' : 'label-danger');
	$('#result').text('Result: ' + (result ? 'OK' : 'NG'));
}

$(document).ready(function() {
	rerun();
});

