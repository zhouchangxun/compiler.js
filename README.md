# compiler.js

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
