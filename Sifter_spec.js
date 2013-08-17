var Sifter = require('./Sifter.js');

describe('startsWith()', function(){
	var s;

	beforeEach(function(){
		s = new Sifter();
	});

	it('prepends the result of a function to the internal regEx_', function(){
		s.regEx_ = 'abc';
		s.startsWith(function(s){
			s.then('{');
		});
		expect(s.regEx_).toBe('\\{abc');
	});

	it('prepends the string to the internal regex_', function(){
		s.regEx_ = 'abc';
		s.startsWith('{');
		expect(s.regEx_).toBe('\\{abc');
	});

	it('throws an error if the wrong input is given', function(){
		expect(function(){
			s.startsWith(1);
		}).toThrow('startsWith() arguments must be of type "string" or "function".');
	});
});

describe('endsWith()', function(){
	var s;

	beforeEach(function(){
		s = new Sifter();
		s.regEx_ = 'abc'; 
	});

	it('appends the string to the internal regEx_', function(){
		s.endsWith('d');
		expect(s.regEx_).toBe('abcd');
	});

	it('appends the string result of a builderFunction to the internal regEx_', function(){
		s.endsWith(function(s){
			s.then('d');
		});
		expect(s.regEx_).toBe('abcd');
	});

	it('throws an error if the wrong input is given', function(){
		expect(function(){
			s.endsWith([]);
		}).toThrow('endsWith() arguments must be of type "string" or "function".');
	});
});

describe('then()', function(){
	var s;

	beforeEach(function(){
		s = new Sifter();
		s.regEx_ = 'a'; 
	});

	it('appends the result of a builderFunction to the internal regEx_', function(){
		s.then(function(s){
			s
			.startsWith('b')
			.endsWith('c');
		});
		expect(s.regEx_).toBe('abc');
	});

	it('appends the string to the internal regEx_', function(){
		s
		.then('b')
		.then('c');
		expect(s.regEx_).toBe('abc');
	});

	it('allows for chaining even if no argument is given', function(){
		expect(s.then()).toBe(s);
	});

	it('throws an error when the wrong type of argument is given', function(){
		expect(function(){
			s.then(1);
		}).toThrow('then() arguments must be of type "string" or "function".');
	});
});

describe('ifFollowedBy()', function(){
	var s;

	beforeEach(function(){
		s = new Sifter();
		s.regEx_ = 'a'; 
	});

	it('appends the lookahead regex to the internal regEx_', function(){
		s 
		.ifFollowedBy('bc');
		expect(s.regEx_).toBe('a(?=bc)');
	});

	it('appends the string result of a builderFunction as a lookahead to the internal regEx_', function(){
		s
		.ifFollowedBy(function(s){
			s.then('bc');
		});
		expect(s.regEx_).toBe('a(?=bc)');
	});

	it('throws an error if the wrong type of argument is input', function(){
		expect(function(){
			s.ifFollowedBy(1);
		}).toThrow('ifFollowedBy() arguments must be of type "string" or "function".');
	});
});

describe('ifNotFollowedBy()', function(){
	var s;

	beforeEach(function(){
		s = new Sifter();
		s.regEx_ = 'a'; 
	});

	it('appends the lookahead regex to the internal regEx_', function(){
		s 
		.ifNotFollowedBy('bc');
		expect(s.regEx_).toBe('a(?!bc)');
	});

	it('appends the string result of a builderFunction as a lookahead to the internal regEx_', function(){
		s
		.ifNotFollowedBy(function(s){
			s.then('bc');
		});
		expect(s.regEx_).toBe('a(?!bc)');
	});

	it('throws an error if the wrong type of argument is input', function(){
		expect(function(){
			s.ifNotFollowedBy(1);
		}).toThrow('ifNotFollowedBy() arguments must be of type "string" or "function".');
	});
});

describe('startsLineWith()', function(){
	var s;

	beforeEach(function(){
		s = new Sifter();
	});

	it('prepends the result of a function to the internal regEx_ with the line start ^', function(){
		s.startsLineWith(function(s){
			s.then('{abc');
		});
		expect(s.regEx_).toBe('^\\{abc');
	});

	it('prepends the string to the internal regex_ with the like start ^', function(){
		s.startsLineWith('{abc');
		expect(s.regEx_).toBe('^\\{abc');
	});

	it('throws an error if the wrong input is given', function(){
		expect(function(){
			s.startsLineWith(1);
		}).toThrow('startsLineWith() arguments must be of type "string" or "function".');
	});
});

describe('endsLineWith()', function(){
	var s;

	beforeEach(function(){
		s = new Sifter();
		s.regEx_ = 'abc'; 
	});

	it('appends the string to the internal regEx_', function(){
		s.endsLineWith('d');
		expect(s.regEx_).toBe('abcd$');
	});

	it('appends the string result of a builderFunction to the internal regEx_', function(){
		s.endsLineWith(function(s){
			s.then('d');
		});
		expect(s.regEx_).toBe('abcd$');
	});

	it('throws an error if the wrong input is given', function(){
		expect(function(){
			s.endsLineWith([]);
		}).toThrow('endsLineWith() arguments must be of type "string" or "function".');
	});
});

describe('captures()', function(){
	var s;

	beforeEach(function(){
		s = new Sifter();
		s.regEx_ = 'a';
	});

	it('appends the string result surrounded by () to the internal regEx_', function(){
		s.captures(function(s){
			s.startsWith('b')
			.endsWith('c');
		});
		expect(s.regEx_).toBe('a(bc)');
	});

	it('throws an error if the wrong input is given', function(){
		expect(function(){
			s.captures('abc');
		}).toThrow('captures() arguments must be of type "function".');
	});
});	

describe('groups()', function(){
	var s;

	beforeEach(function(){
		s = new Sifter;
		s.regEx_ = 'a';
	});

	it('creates a non capturing group out of the string and adds it to the internal regEx_', function(){
		s.groups('bc');
		expect(s.regEx_).toBe('a(?:bc)');
	});

	it('creates a non capturing group from the builderFunction and adds it to the internal regEx_', function(){
		s.groups(function(s){
			s.startsWith('b')
			.endsWith('c');
		});
		expect(s.regEx_).toBe('a(?:bc)');
	});

	it('throws an error if the wrong input is given', function(){
		expect(function(){
			s.groups(['a', 'b']);
		}).toThrow('groups() arguments must be of type "string" or "function".');
	});
});

describe('either()', function(){
	var s;

	beforeEach(function(){
		s = new Sifter();
		s.regEx_ = 'a';
	})
});

describe('charSet()', function(){
	//start with beforeEach() or it()...
});

describe('anti()', function(){
	//start with beforeEach() or it()...
});
















