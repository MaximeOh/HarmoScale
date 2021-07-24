

var _scales;
var _volume = 50;
var _tempo = 120;
var _timeQuarter = 60 / _tempo;
var _percentAttenuation  = 0.15;
_timeQuarter -= (_timeQuarter * _percentAttenuation);

var _templateScale;
var _scalesContainer;
var _selectTune;

var _resizeTimer;
var _chordToFind = "";
var _intervalCSSLoaded = null;


var _removeClass = function(className, selectorClassName) {
	if(selectorClassName == undefined) {
		selectorClassName = className;
	}
	
	let elements = document.querySelectorAll('.' + selectorClassName);
	elements.forEach(function(element) {
		element.classList.remove(className);
	});
};

var _tick = function(scale, level) {
	_removeClass('currentNotePlayed');
	let noteText = document.getElementById("currentPlayedNote-" + scale.getKey());
	if(level >= scale.getNotes().length) {
		noteText.innerHTML = '-';
		return;
	}
	let note = scale.getNotes()[level];
	noteText.innerHTML = note.note;

	let currentScoreNote = document.getElementById('vf-note-' + scale.getKey() + '-' + level);
	currentScoreNote.classList.add('currentNotePlayed');
	let currentSchemaNote = document.getElementById('schema-note-' + scale.getKey() + '-' + level);
	currentSchemaNote.classList.add('currentNotePlayed');

	
	setTimeout(function() {
		_tick(scale, level + 1)
	}, _timeQuarter * 1000);
};

var initScales = function() {
	var majorScale = new Scale("Majeur", ['W', 'W', 'H', 'W', 'W', 'W', 'H'], 'C')
		.addVersion(0, 'Majeur', ['Ma7'])
		.addVersion(1, 'Dorien', ['mi7'])
		.addVersion(2, 'Phrygien', ['mi7'])
		.addVersion(3, 'Lydien', ['Ma7'])
		.addVersion(4, 'Mixolydien', ['7'])
		.addVersion(5, 'Mineur Naturel', ['mi7'])
		.addVersion(6, 'Locrien', ['mi7b5']);

	var mineurMelScale = new Scale("Mineur Melodique", ['W', 'H', 'W', 'W', 'W', 'W', 'H'], 'C')
		.addVersion(-1, 'Altéré / Super-Locrien', ['7alt', 'mi7b5'])
		.addVersion(0, 'Mineur mélodique ascendant', ['miMa7'])
		.addVersion(1, 'Dorien b2', ['mi7'])
		.addVersion(2, 'Lydien Augmenté', ['Ma7#5'])
		.addVersion(3, 'Lydien Dominante', ['7'])
		.addVersion(4, 'Aeolien Dominante', ['7'])
		.addVersion(5, 'Demi Diminué', ['mi7b5']);

	var mineurHarScale = new Scale("Mineur Harmonique", ['W', 'H', 'W', 'W', 'H', 'WH', 'H'], 'C')
		.addVersion(-5, 'Majeur Augmenté ', ['Ma7#5'])
		.addVersion(-4, 'Dorien #4', ['mi7'])
		.addVersion(-3, 'Phrygien Dominante', ['7'])
		.addVersion(-2, 'Lydien #2', ['Ma7'])
		.addVersion(-1, 'Altéré Dominante bb7', ['dim7'])
		.addVersion(0, 'Mineur Harmonique', ['miMa7'])
		.addVersion(1, 'Locrien becare6', ['mi7b5']);


	var majorHarmScale = new Scale("Majeur Harmonique", ['W', 'W', 'H', 'W', 'H', 'WH', 'H'], 'C')
		.addVersion(0, 'Majeur Harmonique', ['Ma7'])
		.addVersion(1, 'Dorien b5', ['mi7b5'])
		.addVersion(2, 'Phrygien b4', ['mi7', '7'])
		.addVersion(3, 'Lydien b3', ['miMa7'])
		.addVersion(4, 'Mixolydien b2', ['7'])
		.addVersion(5, 'Locrien Augmenté #2', ['Ma7#5', 'dim7'])
		.addVersion(6, 'Locrien bb7', ['dim7']);

	var dimScale = new Scale("Diminue", ['W', 'H', 'W', 'H', 'W', 'H', 'W', 'H'], 'C')
		.addVersion(0, 'Diminué', ['dim7'])
		.addVersion(1, 'Diminué Dominante', ['7']);
	
	var partonScale = new Scale("Par Ton", ['W','W','W','W','W','W'], 'C')
		.addVersion(0, 'Par Ton', ['7#5', 'b5']);

	var augScale = new Scale("Augmente", ['WH','H','WH','H','WH','H'], 'C')
		.addVersion(0, 'Augmenté', ['Ma7'])
		.addVersion(1, 'Augmenté Inversé', ['6#5']);

	_scales = [
		majorScale,
		mineurMelScale,
		mineurHarScale,
		majorHarmScale,
		dimScale,
		partonScale,
		augScale
	];
};

var drawChordsFinder = function() {
	let _templateChordsFinder = document.getElementById('templateChordsFinder').innerHTML;
	let _chordsFinderContainer = document.getElementById('chordsFinderContainer');

	let cFTemplate = Template7.compile(_templateChordsFinder);

	for(let k in Scale.chordsUsed) {
		let used = Scale.chordsUsed[k];

		_chordsFinderContainer.innerHTML += cFTemplate({
			chord:k,	 
			used : used,
	 	});

	}

	let radios = document.querySelectorAll('input[name="chordToFind"]');
	radios.forEach(function(radio) {
		radio.addEventListener('click', function () {
			_chordToFind = radio.value;

			_removeClass('chordFound');
			applyChordsFinder();
			
		});
	});
};

var applyChordsFinder = function() {
	let chords = document.querySelectorAll('span[data-chord="' + _chordToFind+ '"]');
	chords.forEach(function(chord) {
		chord.parentNode.classList.add('chordFound');
		chord.classList.add('chordFound');
	});
};

var drawScales = function() {
	for(let k in _scales) {
		let scale = _scales[k];
		let cTemplate = Template7.compile(_templateScale);
		_scalesContainer.innerHTML += cTemplate({
			scaleName : scale.getName(),
			scaleKey : scale.getKey(),
			versions: scale.getVersionsForTemplate(),
			startNote : scale.getStartNote(),
			chromaticNotes : Scale.getChromaticNotes(),
			scaleSchema : scale.getActiveVersionSchema(),
		});
	}
	applyChordsFinder();
};

var drawScores = function() {
	for(let k in _scales) {
		let scale = _scales[k];
		let scoreDiv = document.getElementById('score-' + scale.getKey());
		let renderer = new Vex.Flow.Renderer(scoreDiv, Vex.Flow.Renderer.Backends.SVG);

		let width = scoreDiv.offsetWidth;
		renderer.resize(width, 140);
		let context = renderer.getContext();
		context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

		let stave = new Vex.Flow.Stave(0, 10, width);
		stave.addClef("treble");
		//stave.addKeySignature(scale.getStartNote());
		stave.setContext(context).draw();

		let notes = [];

		scale.getNotes().forEach(function(note, i) {
			let staveNote = new Vex.Flow.StaveNote({
				keys:[note.note + '/' + (note.level + 1)],
				duration:'q'
			});

			staveNote.setAttribute('id', 'note-' + scale.getKey() + '-' + i);

			let alteration = Scale.getAlteration(note.note);
			if(alteration > 0) {
				staveNote.addAccidental(0, new Vex.Flow.Accidental("#"));
			} else if(alteration < 0) {
				staveNote.addAccidental(0, new Vex.Flow.Accidental("b"));
			}

			notes.push(staveNote);
		});

		let voice = new Vex.Flow.Voice({num_beats: notes.length,  beat_value: 4}).addTickables(notes);
		let formatter = new Vex.Flow.Formatter().joinVoices([voice]).format([voice], width - 50);
		voice.draw(context, stave);
	}
};

var bindPlayButtons = function() {
	for(let k in _scales) {
		let scale = _scales[k];
		let playScaleButton = document.getElementById('play-' + scale.getKey());
		playScaleButton.addEventListener('click', function() {

			let conductor = new BandJS();
			conductor.setTimeSignature(4, 4);
			conductor.setTempo(_tempo);
			var piano = conductor.createInstrument('square', 'oscillators');
			piano.setVolume(_volume);

			let notes = scale.getNotes();
			for(let index in notes) {
				// apply tune decalage
				let note = scale.computeNoteWithDecalage(notes[index], parseInt(_selectTune.value));
				//console.log(note, _selectTune.value);
				piano.note('quarter', note.note + note.level);
			
			}

			var player = conductor.finish();
			player.play();
			_tick(scale, 0);	
		});
	}
};

var bindSelectStartNote = function() {
	for(let k in _scales) {
		let scale = _scales[k];
		let selectStartNote = document.getElementById('selectStartNote-' + scale.getKey());
		selectStartNote.value = scale.getStartNote();
		selectStartNote.addEventListener('change', function(evt) {
			scale.setStartNote(this.value);
			drawAndBind();

		});
	}

};

var bindVersions = function() {
	for(let k in _scales) {
		let scale = _scales[k];

		let versionKey = 'scale-version-' + scale.getKey();
		let versions = document.getElementsByClassName(versionKey);
		for(let i = 0; i < versions.length; i++) {
			let versionItem = versions.item(i);
			versionItem.addEventListener('click', function(evt) {
				_removeClass('activeMode', versionKey);
				let version = parseInt(versionItem.getAttribute('data-version-index'));
				scale.setActiveVersion(version);
				drawAndBind();
			});
		}
	}
};

var drawAndBind = function() {
	_scalesContainer.innerHTML = "";

	drawScales();
	drawScores();
	bindPlayButtons();
	bindSelectStartNote();
	bindVersions();
};

var resize = function() {
	drawAndBind();
};

var manageCSSLoaded = function() {
	let cssDeclared = document.querySelectorAll("link[href*='.css']").length;
	let cssLoaded = document.styleSheets.length;

	if(cssDeclared == cssLoaded) {
		console.log('AllCSSLoaded', cssLoaded);
		drawAndBind();
		clearInterval(_intervalCSSLoaded);
	}
};

document.addEventListener("DOMContentLoaded", function() {
	_templateScale = document.getElementById('templateScale').innerHTML;
	_scalesContainer = document.getElementById('scalesContainer');
	_selectTune = document.getElementById('selectTune');
	_selectTune.value = "0";

	initScales();
	drawChordsFinder();

	_intervalCSSLoaded = setInterval(manageCSSLoaded, 250);
		
	window.addEventListener('resize', function(evt) {
		clearTimeout(_resizeTimer);
		_resizeTimer = setTimeout(resize, 250);
	});
});