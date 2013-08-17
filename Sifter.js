
//Object Declaration 
var Sifter = function() {
	this.captured = [];
	this.regEx_ = '';
	this.flags_ = '';
	this.infinite_ = null;
	this.atLeastOne_ = null;
	this.zeroOrOne_ = null;
	this.exactly_ = null;
	this.between_ = null;
	this.anti_ = null;
}

//registration functions
Sifter.prototype.registry_ = {};

//save regex or sifter here
Sifter.prototype.registerNamedCapture = function(name, captured) {
	Sifter.prototype.registry_[name] = captured;
};

Sifter.prototype.getNamedCapture = function(name){
	return Sifter.prototype.registry_[name];
}

Sifter.prototype.registerCharSet = function(name, set) {
	var self = this;
	Sifter.prototype[name] = function(){
		self.charSet(set);
		return self;
	}
};

//Loose Navigation
Sifter.prototype.startsWith = function(exp) {
	if(typeof exp === 'function'){
		this.regEx_ = resolveExp_(exp) + this.regEx_;
		return this;
	}
	else if(typeof exp === 'string'){
		this.regEx_ = escape_(exp) + this.regEx_;
		return this;
	}
	throw 'startsWith() arguments must be of type "string" or "function".';
};

Sifter.prototype.endsWith = function(exp) {
	if(typeof exp === 'function'){
		this.regEx_ += resolveExp_(exp);
		return this;
	}
	else if(typeof exp === 'string'){
		this.regEx_ += escape_(exp);
		return this;
	}
	throw 'endsWith() arguments must be of type "string" or "function".';
};

Sifter.prototype.then = function(exp) {
	if(typeof exp === 'function'){
		this.regEx_ += resolveExp_(exp);
		return this;
	}
	else if(typeof exp === 'string'){
		this.regEx_ += escape_(exp);
		return this;
	}
	else if(exp === undefined){
		return this;
	}
	throw 'then() arguments must be of type "string" or "function".';
};

Sifter.prototype.ifFollowedBy = function(exp) {
	if(typeof exp === 'function'){
		this.regEx_ += '(?=' + resolveExp_(exp) + ')';
		return this;
	}
	else if(typeof exp === 'string'){
		this.regEx_ += '(?=' + escape_(exp) + ')';
		return this;
	}
	throw 'ifFollowedBy() arguments must be of type "string" or "function".';
};

Sifter.prototype.ifNotFollowedBy = function(exp) {
	if(typeof exp === 'function'){
		this.regEx_ += '(?!' + resolveExp_(exp) + ')';
		return this;
	}
	else if(typeof exp === 'string'){
		this.regEx_ += '(?!' + escape_(exp) + ')';
		return this;
	}
	throw 'ifNotFollowedBy() arguments must be of type "string" or "function".';
};

//Strict Navigation
Sifter.prototype.startsLineWith = function(exp) {
	if(typeof exp === 'function'){
		this.regEx_ = '^' + resolveExp_(exp);
		return this;
	}
	else if(typeof exp === 'string'){
		this.regEx_ = '^' + escape_(exp);
		return this;
	}
	throw 'startsLineWith() arguments must be of type "string" or "function".';
};

Sifter.prototype.endsLineWith = function(exp) {
	if(typeof exp === 'function'){
		this.regEx_ += resolveExp_(exp) + '$';
		return this;
	}
	else if(typeof exp === 'string'){
		this.regEx_ += escape_(exp) + '$';
		return this;
	}
	throw 'endsLineWith() arguments must be of type "string" or "function".';
};

// Grouping
Sifter.prototype.captures = function(expFunc, name, autoRegister) {
	if(typeof expFunc !== 'function'){
		throw 'captures() arguments must be of type "function".';
	}
	var exp;
	this.captured.push(name);
	exp = resolveExp_(expFunc);
	this.regEx_ += '(' + exp + ')';
	quantify_(this);
	if(autoRegister){
		this.registerNamedCapture(name, exp);
	}
	return this;
};

Sifter.prototype.groups = function(exp) {
	if(typeof exp === 'function'){
		this.regEx_ += '(?:' + resolveExp_(exp) + ')';
		quantify_(this);
		return this;
	}
	//may not want this to escape the exp if it comes from either()
	else if(typeof exp === 'string'){
		this.regEx_ += '(?:' + escape_(exp) + ')';
		quantify_(this);
		return this;
	}
	throw 'groups() arguments must be of type "string" or "function".';
};

//Doesnt need to quantify_ because of its groups() call
Sifter.prototype.either = function(expArr) {
	if(typeof expArr !== 'array'){
		throw 'either() argument must be of type "array".';
	}
	var orExpressions;
	orExpressions = either_(expArr, 0);
	for(var i = 1; i < expArr.length; i++){
		orExpressions += '|' + either_(expArr, i);
	}
	this.groups(orExpressions);
	return this;
};

Sifter.prototype.charSet = function(exp) {
	var chars;
	if(typeof exp === 'function'){
		chars = exp();
	}
	else if(typeof exp === 'array'){
		chars = exp.join('');
	}
	else if(typeof exp === 'string'){
		chars = exp;
	}
	else{
		throw 'charSet() argument needs to be of type "function", "array", or "string"';
	}
	if(this.anti_){
		this.regEx_ += '[^' + chars + ']';
		this.anti_ = null;
	}
	else{
		this.regEx_ += '[' + chars + ']';
	}
	quantify_(this);
	return this;
};

Sifter.prototype.anti = function() {
	this.anti_ = true;
	return this;
};

//Quantifiers
Sifter.prototype.infinite = function() {
	this.infinite_ = '*';
	return this;
};

Sifter.prototype.atLeastOne = function() {
	this.atLeastOne_ = '+';
	return this;
};

Sifter.prototype.zeroOrOne = function() {
	this.zeroOrOne_ = '+';
	return this;
};

Sifter.prototype.exactly = function(num) {
	this.exactly_ = num;
	return this;
};

Sifter.prototype.between = function(start, end) {
	this.between_ = {start_ : start, end_ : end};
	return this;
};

//Character sets (negations and quantification happens in charSet call)
Sifter.prototype.anyThing = function() {
	this.regEx_ += '.*';
	return this;
};

Sifter.prototype.alphaNumeric = function() {
	this.charSet('A-Za-z0-9');
	return this;
};

Sifter.prototype.numeric = function() {
	this.charSet('0-9');
	return this;
};

Sifter.prototype.whiteSpace = function() {
	this.charSet('\f\n\r\t\v​\u00A0\u1680​\u180e\u2000​\u2001'
		+ '\u2002​\u2003\u2004​\u2005\u2006​\u2007\u2008​\u2009\u200a​'
		+ '\u2028\u2029​\u2028\u2029​\u202f\u205f​\u3000'
	);
	return this;
};

Sifter.prototype.letters = function() {
	this.charSet('A-Za-z');
	return this;
};

Sifter.prototype.lowerCase = function() {
	this.charSet('a-z');
	return this;
};

Sifter.prototype.upperCase = function() {
	this.charSet('A-Z');
	return this;
};

//Flags (make sure peope dont call these on any nested functions...
//shoud only be specified on the outtermost chain)
Sifter.prototype.isGlobal = function() {
	this.flags_ += 'g';
	return this;
};

Sifter.prototype.ignoresCase = function() {
	this.flags_ += 'i';
	return this;
};

Sifter.prototype.isMultiline = function() {
	this.flags_ += 'm';
	return this;
};

//Sifter Object Functions
//dont forget to reset fields for next call
//BE ABLE TO TAKE IN OBJECTS AND RECURSIVELY SEARCH THEM
//FOR ANY VALUE THAT MATCHES THE REGEX AND RETURN AN OBJECT 
//THAT HOLDS ALL OF THOSE KEY/VALUE PAIRS
Sifter.prototype.sift = function(string) {
	var self = this,
		obj = {},
		func = function(match, i, j){
			if(self.captured[i]){
				obj[self.captured[i]] = match[j];
				return true;
			}
		},
	match = createObj_(self, string, func);
	obj.index = match.index;
	obj.input = match.input;
	obj.match = match[0];
	return obj;
};

Sifter.prototype.create = function(objConstr, string) {
	var self = this,
		obj = new objConstr(),
		func = function(match, i, j){
			if(self.captured[i] && obj.hasOwnProperty(self.captured[i]) ){
				obj[self.captured[i]] = match[j];
				return true;
			}
		};
	createObj_(self, string, func);
	return obj;
};

Sifter.prototype.regEx = function() {
	return new RegExp(this.regEx_, this.flags_);
};

Sifter.prototype.replace = function(first_argument) {
	// body...
};

Sifter.prototype.forEach = function(first_argument) {
	// body...
};

Sifter.prototype.siftObj = function(){
	//take an object and look through all its fields/values and re
	//return an object that
}

//Syntactic Helpers
Sifter.prototype.and = function() {
	return this;
};

//Internal Helpers (do not export)
function escape_(string) {
    return string
    	.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    	.replace(/\$/g, '$$$$');
}

function either_(expArr, index){
	if(typeof expArr[index] === 'function'){
		return resolveExp_(expArr[index]);
	} 
	else if(typeof expArr[index] === 'string'){
		return expArr[index];
	}
	else{
		throw 'either() array argument must contain only values of type "strings" or "function".';
	}
};

function resolveExp_(func){
var scope = new Sifter();
	func(scope);
	return scope.regEx_;
};

function quantify_(sifter){
	if(sifter.infinite_){
		sifter.regEx_ += sifter.infinite_;
		sifter.infinite_ = null;
	}
	else if(sifter.atLeastOne_){
		sifter.regEx_ += sifter.atLeastOne_;
		sifter.atLeastOne_ = null;
	}
	else if(sifter.zeroOrOne_){
		sifter.regEx_ += sifter.zeroOrOne_;
		sifter.zeroOrOne_ = null;
	}
	else if(sifter.exactly_){
		sifter.regEx_ += '{' + sifter.exactly_ + '}';
		sifter.exactly_ = null;
	}
	else if(sifter.between_){
		sifter.regEx_ += '{' + sifter.between_.start_ +
			',' + sifter.between_.end_ + '}';
		sifter.between_ = null;
	}
}

function createObj_(scope, string, iterFunc){
	var match = new RegExp(scope.regEx_, scope.flags_).exec(string);
	if(!match){
		return null;
	}
	var j = 1;
	for(var i = 0; i < scope.captured.length; i++){
		j = iterFunc(match, i, j) ? j += 1 : j;
		console.log(j);
	}
	return match;
};

//Syntax========================================================================
/*
var baseCommand = new Sifter()
	.startsWith('{')
	.captures(function(s){
		s
		.anyThing()
		.then('-flag')
		.then()
		.anyThing();
	}, 'cmd')
	.endsWith('}');


var ifElseCommand = new Sifter()
	.startsWith('{{')
	.captures(function(s){
		s 
		.infinite()
		.alphaNumeric();
	}, 'baseCommand')
	.then('}{')
	.then()
	.captures(function(s){
		s
		.infinite()
		.alphaNumeric();
	}, 'compCommand')
	.then('}}{')
	.then()
	.infinite()
	.whiteSpace()
	.captures(function(s){
		s
		.infinite()
		.alphaNumeric();
	}, 'trueCommand')
	.infinite()
	.whiteSpace()
	.then('}{')
	.infinite()
	.whiteSpace()
	.captures(function(s){
		s
		.infinite()
		.alphaNumeric();
	}, 'falseCommand')
	.infinite()
	.whiteSpace()
	.then('}');

var s = new Sifter();
s.registerCharSet('cocksucker', '8=D');
console.log(s.cocksucker());

console.log(baseCommand.sift('{command1 -flag flagParam}'));
console.log();
console.log();
console.log(ifElseCommand.sift('htfjghjcfghxdhghjk{{command1}{command2}}{\n\tcommand3\n}{\n\tcommand4\n}'));
var Command = require('./Command.js').constructor;

console.log(ifElseCommand.create(Command, 'htfjghjcfghxdhghjk{{command1}{command2}}{\n\tcommand3\n}{\n\tcommand4\n}'));*/

var s = new Sifter();
s.isGlobal();
s.isMultiline();
s.regEx_ = '((?:a|b|c)*)';
console.log(s.sift('anbhdcjdabksabc'));
console.log(new RegExp('((?:a|b|c)*)((?:a|b|c)*)').exec('anbhdcjdabksabc'));

// module.exports = Sifter;




