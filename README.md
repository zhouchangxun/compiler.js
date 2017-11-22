# compiler.js
## 这个项目是什么？
 用javascript实现的简易程序语言编译器，可在浏览器编译运行。Demo: [点击查看运行效果](http://oh-my.ga/compiler.js)
## 这个项目包括什么？
- 用BNF定义了一种简易编程语言（麻雀虽小，五脏俱全）。
- 实现了此编程语言的编译器。
- 自定义的汇编语句及运行时（解释器）。
## 用途？
  主要是用来学习编程语言设计相关的知识。
  
## 巴科斯范式(BNF)的内容  
1. `' '` 引号中的字代表着这些字符本身,如'if'。`quote`用来代表双引号。
2. `' '` 外的字（有可能有下划线）代表着语法部分。 
3. `< >` 内包含的为必选项。 
4. `[ ]` 内包含的为可选项。 
5. `{ }` 内包含的为可重复0至无数次的项。 
6. `|` 表示在其左右两边任选一项，相当于"OR"的意思。 
7. `::=` 是“被定义为”的意思。

## 编程语言语法定义例子
```python
<program>    ::= <block>'.'.
<block>      ::= [CONST <identifier>'='<number> {',' <identifier>'='<number>}';']
                 [VAR <identifier>{',' <identifier>}';']
                 {FUNCTION <identifier>';' <block>';'} <statement>.
<statement>  ::= [<identifier>':='<expression> | CALL <identifier> |
                 ASK <identifier> | TELL <expression> |
                 BEGIN <statement> {';' <statement>} END |
                 IF <condition> THEN <statement> {';' <statement>}
                 [ELSE <statement> {';' <statement>}] ENDIF|
                 WHILE <condition> DO <statement> |
                 <comment>].
<condition>  ::= <expression> ('='|'#'|'<'|'<='|'>'|'>=') <expression> |
                 ODD <expression>.
<expression> ::= ['+'|'-'] <term> {('+'|'-') <term>}.
<term>       ::= <factor> {('*'|'/') <factor>}.
<factor>     ::= <identifier> | <number> | '('<expression>')'.
<number>     ::= <digit>{<digit}.
<digit>      ::= 0|1|2|3|4|5|6|7|8|9.
<identifier> ::= <letter>{<letter>|<digit>}.
<letter>     ::= a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|
                 A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z.
<comment>    ::= '{'{<us-ascii>}'}'.
```
## 符合以上语法定义的程序例子
```python
{ desc:calculate greatest common divisor }
CONST escapeChar=0;
VAR x,y;
{function definition}
FUNCTION func1;
BEGIN
  ASK x;
  WHILE x # escapeChar DO
  BEGIN ASK y;
    WHILE x # y DO
    BEGIN
      IF x > y THEN x := x-y
      ELSE y := y-x ENDIF;
    END;
    TELL x; ASK x
  END
END;
{this is main program}
BEGIN
  CALL func1
END.
```

*NOTE*: 转自 http://masswerk.at 
