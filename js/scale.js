
class Scale {

	static chordsUsed = {};

	constructor(name, schema, startNote, level) {
		this.name = name;
		this.schema = schema;
		this.setStartNote(startNote)

		this.level = level;
		this.versions = [];

		if(this.level == undefined) {
			this.level = 3;
		}

		this.activeVersion = 0;		
	}

	getActiveVersion() {
		return this.activeVersion;
	}

	setActiveVersion(activeVersion) {
		this.activeVersion = activeVersion;
	}

	setStartNote(startNote) {
		this.startNote = startNote;
		this.startPosition = Scale.computePositionForNote(startNote);
		// automatic adapt level if start note is Ab, A, Bb, B
		if(this.startPosition >= 8) {
			this.level = 2;
		} else {
			this.level = 3;
		}
	}

	getStartNote() {
		return this.startNote;
	}

	addVersion(index, versionName, chords) {

		for(let k in chords) {
			let chord = chords[k];
			if(Scale.chordsUsed[chord] == undefined) {
				Scale.chordsUsed[chord] = 0;
			}
			Scale.chordsUsed[chord]++;
		}
		this.versions.push({
			name : versionName,
			chords: chords,
			index: index,
		});

		return this;
	}

	getVersions() {
		return this.versions;
	}

	getActiveVersionSchema() {
		return this.getSchema(this.getActiveVersion());
	}

	getSchema(decalage) {
		if(decalage == undefined) {
 			return this.schema;
		}
		
		if(decalage == 0) {
			return this.schema;
		}

		let schema = this.schema.map(function(e){return e;});

		for(let i = 0; i < Math.abs(decalage); i++) {
			if(decalage < 0) {
				// on décale en enlevant à la fin et remettant au début
				let el = schema.pop();
				schema.unshift(el);
			} else {
				// on décale en enlevant au debut et met par la fin
				let el = schema.shift();
				schema.push(el);
			}
		}


		return schema;
	}

	getVersionsForTemplate() {
		let versions = [];
		for(let k in this.versions) {
			let version = this.versions[k];

			versions.push({
				vName : version.name,
				vChords: version.chords,
				vIndex: version.index,
				vScaleKey: this.getKey(),
				vActiveVersion : this.getActiveVersion()
			});

		}
		return versions;
	}

	getName() {
		return this.name;
	}

	getKey() {
		return this.getName().replace(' ','-');
	}

	getNotes() {
		let notes = [];
		let currentPosition = Scale.computePositionForNote(this.startNote);
		notes.push({
			note:this.startNote,
			level: this.level
		});
		let currentSchema = this.getActiveVersionSchema(); //this.getSchema(this.getActiveVersion()) 
		for(let k in currentSchema) {
			let interval = currentSchema[k];
			let delta = Scale.computeInterval(interval);
			currentPosition += delta;
			let rest = parseInt(currentPosition / Scale.getChromaticNotes().length);
			let currentLevel = this.level + rest;
			notes.push({
				note: Scale.getNoteForPosition(currentPosition),
				level: currentLevel
			});
		}
		return notes;
	}

	computeNoteWithDecalage(note, decalage) {
		let position = Scale.computePositionForNote(note.note);
		position += decalage;
		let level = note.level;
		if(position < 0) {
			position = Scale.getChromaticNotes().length + position;
			level--;
		} else if(position >= Scale.getChromaticNotes().length) {
			level++;
		}
		return {
			precNote : note.note,
			note: Scale.getNoteForPosition(position),
			level: level,
			position: position,
			decalage : decalage
		};
	}

	static computePositionForNote(note) {
		return Scale.getChromaticNotes().indexOf(note);
	}

	static computeInterval(interval) {
		let result = 0;
		switch(interval) {
			case 'W' : result = 2;
				break;
			case 'H' : result = 1;
				break;
			case 'WH' : result = 3;
				break;
		}
		return result;
	}

	static getNoteForPosition(index) {
		let notes = Scale.getChromaticNotes();
		index = index%notes.length;


		return notes[index];
	} 

	static getChromaticNotes() {
		return ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
	}

	static getEquivalentNotes() {
		return {
			'Db' : 'C#',
			'Eb' : 'D#',
			'Gb' : 'F#',
			'Ab' : 'G#',
			'Bb' : 'A#'
		};
	}

	static getAlteration(note) {
		if(note.endsWith('#')) {
			return 1;
		} else if(note.endsWith('b')) {
			return -1;
		}
		return 0;
	}
}