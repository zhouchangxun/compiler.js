// E.A.L. Easy Algorithmic Language
// A JavaScript demo-compiler
// N.Landsteiner 02.1999; www.masswerk.at

// window functions
function showSyntax() {
	syntaxWin=window.open('syntax.html','syntax');
	if (navigator.userAgent.indexOf("MSIE")<0) syntaxWin.focus();
	}

function resetConsole() {
	document.display.output.value="";
	document.display.output.blur();
	resetDisplay()
	}

function resetProgram(s) {
	document.display.input.value=s;
	document.display.input.blur();
	resetDisplay();
	noError=true;
	didCompile=false
	}

function resetDisplay() {
	document.display.traceon.checked=false;
	document.display.logon.checked=false;
	session=false
	}

var demoscript="{ greatest common divisor }\n"
               +"CONST escapeChar=0;\n"
               +"VAR x,y;\nBEGIN\n  ASK x;\n"
               +"  WHILE x # escapeChar DO\n"
               +"  BEGIN ASK y;\n    WHILE x # y DO\n    BEGIN\n      IF x > y THEN x := x-y\n      ELSE y := y-x ENDIF;\n    END;\n    TELL x; ASK x\n  END\nEND.";

// error codes

var errCode=new Array();
errCode[0]="ok.";
errCode[1]="wrong assignment operator (use '=')";
errCode[2]="'=' must be followed by a number";
errCode[3]="identifier must be followed by '='";
errCode[4]="declaration must be followed by an identifier";
errCode[5]="colon or semicolon expected";
errCode[6]="wrong symbol at start of expression";
errCode[7]="closing parenthesis expected";
errCode[8]="wrong symbol at end of preceding factor";
errCode[9]="period expected";
errCode[10]="incorrect symbol";
errCode[11]="identifier not declared";
errCode[12]="unallowed assignment to constant or function";
errCode[13]="':=' expected";
errCode[14]="missing identifier after call for subroutine";
errCode[15]="unallowed call for constant or variable";
errCode[16]="'THEN' epected";
errCode[17]="semicolon or 'END' expected";
errCode[18]="'DO' expected";
errCode[19]="statement followed by incorrect symbol";
errCode[20]="relation expected";
errCode[21]="expression must not contain a function-identifier";
errCode[22]="'ENDIF' or 'ELSE' expected";
errCode[23]="'ENDIF' expected";
errCode[25]="multiple declaration of identifier";
errCode[30]="integer out of bounds";
errCode[31]="unexpected eof";

// Symbols and Keywords
// (symbol's order by priority)

var Symbols=new Array(
	"none","odd","mult","div","plus","minus","eq","ne","lt","le","gt",
	"ge","comma","rgtparen","then","do","lftparen","assigned","number",
	"identifier","semicolon","end","call","if","while","begin","ask",
	"tell","const","var","else","endif","function","period","eof"
	);
var Keywords=new Array(
	"IF","THEN","ELSE","ENDIF","WHILE","DO","END","BEGIN","CONST","VAR","FUNCTION","CALL","ASK","TELL","ODD","eof"
	);

// Scanner

var c,charCnt,lnCnt,back,sym,num,instream,id;
var keyword=new Array();

var sid=new Array();
for (var i=0; i<Symbols.length; i++) sid[Symbols[i]]=i;

var lnbr=((navigator.appVersion.indexOf("Mac")) || (navigator.appVersion.indexOf("Win")))? "\r":"\n";

function initScanner() {
	c="";
	charCnt=0;
	lnCnt=1;
	back=0;
	sym="";
	num="";
	id="";
	instream=document.display.input.value;
	for (var i=0; i<Keywords.length; i++) {
		keyword[Keywords[i]]=Keywords[i].toLowerCase()
		};
	}

function console(s) {
	document.display.output.value+=s
	}

function outErr(n) {
	var m=charCnt-2;
	while ((m>=0) && (instream.charAt(m)>" ")) m--;
	console("\n["+n+"] "+errCode[n]+" at line "+lnCnt+" near '"+instream.substring(m+1,charCnt)+"'.")
	}

function getChr() {
	c=(charCnt<instream.length)? instream.charAt(charCnt):"\\\\";
	if (back>0) { back-- }
	else {
		//console(c);
		if (c==lnbr) lnCnt++;
		}
	charCnt++
	}

function chrBack(b) {
	charCnt-=b;
	back=b;
	getChr();
	}

function getSym() {
	getChr();
	while (c<=" ") getChr(); // skip whitespace
	if (c=="\\\\") {sym="eof"; c="\n"; return};
	if (c=="{") { // skip comments
		console("\n{");
		while ((c != "}") && (c!="\\\\")) {
			getChr();
			console(c)
			};
		getSym(); return
		};
	if (c=="(") {sym="lftparen"; return};
	if (c==")") {sym="rgtparen"; return};
	if (c==";") {sym="semicolon"; return};
	if (c==",") {sym="comma"; return};
	if (c==".") {sym="period"; return};
	if (c=="+") {sym="plus"; return};
	if (c=="*") {sym="mult"; return};
	if (c=="/") {sym="div"; return};
	if (c=="-") {sym="minus"; return};
	if (c=="#") {sym="ne"; return};
	if (c=="=") {sym="eq"; return};
	if (c==":") {
		getChr();
		if (c=="=") {sym="assigned"}
		else { sym="none"; chrBack(2) };
		return
		};
	if (c=="<") {
		getChr();
		if (c=="=") sym="le"
		else { sym="lt"; chrBack(2) };
		return
		};
	if (c==">") {
		getChr();
		if (c=="=") sym="ge"
		else { sym="gt"; chrBack(2) };
		return
		};
	if ((c>="0") && (c<="9")) {getNumber(); return};
	if ((c>="a") && (c<="z")) {getIdentifier(); return};
	if ((c>="A") && (c<="Z")) {getIdentifier(); return};
	sym="none"; getChr();
	}

function getIdentifier() {
	id=c;
	getChr();
	while (((c>="A") && (c<="Z")) || ((c>="a") && (c<="z")) || ((c>="0") && (c<="9"))) {
		id+=c;
		getChr()
		};
	chrBack(2);
	if (keyword[id]) {
		sym=keyword[id]
		}
	else {
		sym="identifier"
		}
	}

function getNumber() {
	num=c;
	getChr();
	while ((c>="0") && (c<="9")) {
		num+=c;
		getChr()
		};
	chrBack(2);
	if (num.length>10) {outErr(30); num=0}; // out of range
	num=num;
	sym="number"
	}

// Parser

function Node() {
	this.Name=null;
	this.Mode=null;
	this.Next=null;
	this.Last=null;
	this.dLink=null;
	this.Level=null;
	this.Refval=null
	}

var topNode=new Node();
var undef=new Node();
var noError,curLevel;

function error(n) {
	noError=false;
	outErr(n)
	}

function testError(s,n) {
	if (sid[sym]<sid[s]) {
		error(n);
		while (sid[sym]<sid[s]) getSym();
		}
	}

function makeNode(myKind) {
	var pntr;
	// check for multiple def
	pntr=topNode.Next;
	while (pntr!=null) {
		if (id==pntr.Name) error(25);
		pntr=pntr.Next
		};
	// create node
	pntr=new Node();
	pntr.Name=id;
	pntr.Mode=myKind;
	topNode.Last.Next=pntr;
	topNode.Last=pntr;
	return pntr
	}

function findid(fid) {
	var hdpntr, pntr;
	hdpntr=topNode;
	while (hdpntr!=null) {
		pntr=hdpntr.Next;
		while (pntr!=null) {
			if (fid == pntr.Name) return pntr;
			pntr=pntr.Next
			};
		hdpntr=hdpntr.dLink
		};
	error(11);
	return undef
	}

function factor() {
	var pntr;
	if (sym=="eof") return;
	console("\nfactor");
	testError("lftparen",6);
	if (sym=="identifier") {
		pntr=findid(id);
		if (pntr) {
			if (pntr.Mode=="Const") compile(1,0,pntr.Refval);
			if (pntr.Mode=="Var") compile(2,curLevel-pntr.Level,pntr.Refval);
			if (pntr.Mode=="Func") error(21);
			}
		else error(11);
		getSym();
		return;
		};
	if (sym=="number") {
		compile(1,0,num);
		getSym();
		return
		};
	if (sym=="lftparen") {
		getSym();
		expression();
		if (sym=="rgtparen") getSym()
		else error(7);
		return
		};
	error(8)
	}

function term() {
	var myOp;
	if (sym=="eof") return;
	console("\nterm");
	factor();
	while ((sym=="mult") || (sym=="div")) {
		myOp=sym;
		getSym();
		factor();
		if (myOp=="mult") compile(0,0,4)
		else compile(0,0,5)
		}
	}

function expression() {
	var myOp=sym;
	if (sym=="eof") return;
	console("\nexpression");
	if ((sym=="plus") || (sym=="minus")) {
		getSym();
		term();
		if (myOp=="minus") compile(0,0,1);
		}
	else {
		term()
		};
	while ((sym=="plus") || (sym=="minus")) {
		myOp=sym;
		getSym();
		term();
		if (myOp=="plus") compile(0,0,3)
		else compile(0,0,2)
		}
	}

function condition() {
	var myOp;
	if (sym=="eof") return;
	console("\ncondition");
	if (sym=="odd") {
		getSym();
		expression();
		compile(0,0,12)
		}
	else {
		expression();
		if ((sid.eq<=sid[sym]) && (sid[sym]<=sid.ge)) {
			myOp=sym;
			getSym();
			expression();
			if (myOp=="eq") compile(0,0,6);
			if (myOp=="ne") compile(0,0,7);
			if (myOp=="lt") compile(0,0,8);
			if (myOp=="le") compile(0,0,9);
			if (myOp=="ge") compile(0,0,11);
			if (myOp=="gt") compile(0,0,10);
			}
		else error(20)
		}
	}

function statement() {
	statement2();
	if (sym=="eof") return;
	testError("identifier",19)
	}

function statement2() {
	var pntr,L1,L2;
	if (sym=="eof") return;
	console("\nstatement");
	testError("identifier",10);
	if (sym=="identifier") {
		pntr=findid(id);
		if (pntr.Mode!="Var") {
			error(12);
			pntr=null
			};
		getSym();
		if (sym=="assigned") getSym()
		else {
			if (sym=="eq") {
				error(13);
				getSym()
				}
			else error(13)
			}
		expression();
		if (pntr) compile(3,curLevel-pntr.Level,pntr.Refval); // push
		return
		};
	if (sym=="call") {
		getSym();
		if (sym=="identifier") {
			pntr=findid(id);
			if (pntr.Mode=="Func") compile(4,curLevel-pntr.Level,pntr.Refval) // call
			else error(15);
			getSym()
			}
		else error(14);
		return
		}
	if (sym=="begin") {
		getSym();
		while (true) {
			statement();
			if (sym=="semicolon") { getSym(); continue };
			if (sym=="end") { getSym(); break };
			if (sid[sym]<sid["const"]) { error(17); continue };
			error(17); break
			};
		return
		};
	if (sym=="if") {
		getSym();
		condition();
		if (sym=="then") getSym()
		else error(16);
		L1=pStep; compile(7,0,0);
		while (true) {
			statement();
			if (sym=="semicolon") { getSym(); continue };
			if ((sym=="else") || (sym=="endif")) break;
			error(22); break
			};
		if (sym=="else") {
			getSym();
			L2=pStep; compile(6,0,0);
			fixup(L1);
			while (true) {
				statement();
				if (sym=="semicolon") { getSym(); continue };
				if (sym=="endif") break;
				error(23); break
				};
			fixup(L2)
			}
		else {
			if (sym!="endif") error(22);
			fixup(L1);
			};
		getSym();
		return
		};
	if (sym=="while") {
		L1=pStep;
		getSym();
		condition();
		L2=pStep;
		compile(7,0,0)
		if (sym=="do") getSym()
		else error(18);
		statement();
		compile(6,0,L1);
		fixup(L2);
		return
		};
	if (sym=="ask") {
		getSym();
		if (sym=="identifier") {
			pntr=findid(id);
			if (pntr.Mode=="Var") {
				compile(0,0,14);
				compile(3,curLevel-pntr.Level,pntr.Refval)
				}
			else error(12)
			}
		else error(14);
		getSym();
		return
		};
	if (sym=="tell") {
		getSym();
		expression();
		compile(0,0,15)
		return
		}
	}

function constDeclaration() {
	var pntr;
	if (sym=="eof") return;
	console("\nconst declaration");
	if (sym=="identifier") {
		getSym();
		if ((sym=="eq") || (sym=="assigned")) {
			if (sym=="assigned") error(1);
			getSym();
			if (sym=="number") {
				pntr=makeNode("Const");
				pntr.Refval=num;
				getSym()
				}
			else { error(2) }
			}
		else { error(3) }
		}
	else { error(4) }
	}

function varDeclaration(myAdr) {
	var pntr;
	if (sym=="eof") return false;
	console("\nvar declaration");
	if (sym=="identifier") {
		pntr=makeNode("Var");
		pntr.Level=curLevel;
		pntr.Refval=myAdr;
		getSym();
		return true;
		}
	else {
		error(4);
		return false
		}
	}

function block() {
	var hdpntr,addr,L1;
	if (sym=="eof") return;
	console("\nblock");
	curLevel++;
	addr=3; // minimum storage for activation record
	hdpntr=new Node();
	hdpntr.Mode="Header";
	hdpntr.Last=hdpntr;
	hdpntr.Name=0;
	hdpntr.dLink=topNode;
	topNode=hdpntr;
	L1=pStep;
	compile(6,0,0);  // jump to start of procedure
	// declarations
	if (sym=="const") {
		getSym();
		while(true) {
			constDeclaration();
			if (sym=="comma") { getSym(); continue };
			if (sym=="semicolon") { getSym(); break };
			if (sym=="identifier") { error(5); continue };
			error(5); break
			}
		};
	if (sym=="var") {
		getSym();
		while (true) {
			if (varDeclaration(addr)) addr++;
			if (sym=="comma") { getSym(); continue };
			if (sym=="semicolon") { getSym(); break };
			if (sym=="identifier") { getSym(); continue };
			error(5); break
			}
		};
	while (sym=="function") {
		console("\nfunction declaration");
		getSym();
		if (sym=="identifier") getSym()
		else error(4);
		pntr=makeNode("Func");
		pntr.Level=curLevel;
		pntr.Refval=pStep;
		if (sym=="semicolon") getSym()
		else error(5);
		block();
		if (sym=="semicolon") getSym()
		else error(5)
		};
	// compound
	fixup(L1); // fix enter-address
	compile(5,0,addr);  // allocate segment
	statement();
	compile(0,0,0);  // return from procedure
	topNode=topNode.dLink;
	curLevel--
	}

function parse() {
	noError=true;
	curLevel=0;
	undef.Name=0;
	undef.Mode="Var";
	undef.Level=0;
	undef.Refval=0;
	getSym();
	block();
	if (sym=="eof") { error(31); return };
	if (sym!="period") error(9)
	}


// compiler & interpreter structures

function Instruction() {
	this.opc=null;
	this.sg=null;
	this.ac=null
	}

var pcode=new Array();

// Code compiler

var pStep;
var mnem=new Array("XOP","PSH","LOD","STO","CAL","ALC","JMP","JPC");

function compile(x,y,z) {
	if (noError==false) return;
	pcode[pStep]=new Instruction();
	with (pcode[pStep]) {
		opc=x; sg=y; ac=z
		};
	console("\n> "+pStep+" "+mnem[x]+" "+y+" "+z);
	pStep++
	}

function fixup(x) {
	if (noError==false) return;
	pcode[x].ac=pStep;
	console("\n# fixup at "+x+" to '"+pStep+"'")
	}


// Interpreter

var Pr,Br,ir; // program-, base-, instruction-register
var tp;     // top of stack
var st=new Array(); // data stack
var trace=false;
var log=false;

var traceXOP=new Array(
	"return","sign","minus","plus","mult","div","eq","ne",
	"lt","le","gt","ge","odd","nop","ask","tell"
	);

function getBase(offset) {
	var bs=Br;
	for (var i=offset; i>0; i--) bs=st[bs];
	return bs
	}

function interpret() {
	var trFunc,trString,trTos;
	var start=true;
	//setup
	tp=0; Br=1; Pr=0;
	for (var i=1; i<=3; i++) st[i]=0;
	// execution-loop
	while ((Pr!=0) || (start)) {
		start=false;
		ir=pcode[Pr];
		if (trace || log) {
			trFunc=(ir.opc==0)? "  "+traceXOP[ir.ac]:"";
			//trTos=(st[tp]=="undefined")? "_":st[tp];
			trTos=(st[tp])? st[tp]:"_";
			trString="P:"+Pr+" TOS:"+trTos+" > "+mnem[ir.opc]+" "+ir.sg+" "+ir.ac+trFunc;
			if (trace) alert(trString);
			if (log) console("\n"+trString);
			};
		Pr++;
		execute(ir)
		}
	}

function execute(inst) {
	with (inst) {
		if (opc==0) {  // XOP
			if (ac==0) {  // return
				tp=Br-1; Pr=st[tp+3]; Br=st[tp+2]; return
				};
			if (ac==1) { // shift sign
				st[tp]=-st[tp]; return
				};
			if (ac==2) {  // minus
				tp--; st[tp]-=st[tp+1]; return
				};
			if (ac==3) {  // plus
				//tp--; st[tp]+=st[tp+1]; return
				tp--; st[tp]=parseInt(st[tp])+parseInt(st[tp+1]); return
				};
			if (ac==4) {  // mult
				tp--; st[tp]*=st[tp+1]; return
				};
			if (ac==5) {  // div
				tp--; st[tp]=Math.floor(st[tp]/st[tp+1]); return
				};
			if (ac==6) { // eq
				tp--; st[tp]=(st[tp]==st[tp+1])? 1:0; return
				};
			if (ac==7) { // ne
				tp--; st[tp]=(st[tp]!=st[tp+1])? 1:0; return
				};
			if (ac==8) { // lt
				tp--; st[tp]=(st[tp]<st[tp+1])? 1:0; return
				};
			if (ac==9) { // le
				tp--; st[tp]=(st[tp]<=st[tp+1])? 1:0; return
				};
			if (ac==10) { // gt
				tp--; st[tp]=(st[tp]>st[tp+1])? 1:0; return
				};
			if (ac==11) { // ge
				tp--; st[tp]=(st[tp]>=st[tp+1])? 1:0; return
				};
			if (ac==12) { // odd
				st[tp]%=2; return
				};
			if (ac==13) return; // NOP
			if (ac==14) { // ask
				tp++;
				st[tp]=prompt("program input:","");
				if ((st[tp]==null) || (st[tp]=="")) Pr=0; // break on cancle or empty
				st[tp]=parseInt(st[tp]);
				console("\nreading input value "+st[tp]);
				return
				};
			if (ac==15) { // tell
				alert("program output: "+st[tp]);
				console("\noutput of value "+st[tp]);
				tp--;
				return
				}
			}
		if (opc==1) { // PSH - push value on tos
			tp++; st[tp]=ac;
			return
			};
		if (opc==2) { // LOD - push var on tos
			tp++; st[tp]=st[getBase(sg)+ac];
			return
			};
		if (opc==3) { // STO - pull var from tos
			st[getBase(sg)+ac]=st[tp]; tp--;
			return
			};
		if (opc==4) { // CAL ac - allocate new segment-base
			st[tp+1]=getBase(sg); st[tp+2]=Br; st[tp+3]=Pr;
			Br=tp+1; Pr=ac;
			return
			};
		if (opc==5) { // ALC - allocate, inc tos by ac
			tp+=ac;
			return
			};
		if (opc==6) { // JMP ac
			Pr=ac;
			return
			};
		if (opc==7) {  // JPC ac if tos eq 0
			if (st[tp]==0) Pr=ac;
			tp--;
			return
			};
		}
	}

// #### Main

var didCompile=false;
var session=false;

function doCompile() {
	session=false;
	initScanner();
	pStep=0;
	console("Compiling source ...\n--------");
	parse();
	if (noError) {
		console("\n--------\n: ok.\n\n");
		didCompile=true
		}
	else {
		console("\n--------\n: failed.\n\n");
		didCompile=false
		}
	}

function runCode() {
	if (session) {
		alert("Runtime session already in progress.\nEnd of task.");
		return
		};
	if ((noError) && (didCompile)) {
		trace=(document.display.traceon.checked);
		log=(document.display.logon.checked);
		session=true;
		console("Starting runtime session ...\n--------");
		interpret();
		console("\n--------\n: done.\n\n");
		session=false;
		}
	else {
		alert("No code generated.\nThere was no source compiled or the proceding compilation failed.")
		}
	}

//-->