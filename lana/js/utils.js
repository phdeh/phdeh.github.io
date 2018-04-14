function render(expression) {
    return render(expression, 100);
}

function render(expression, precedence) {
    $("#log").html($("#log").html() + "<hr/>" + JSON.stringify(expression, null, '\t'));
    if (expression.type == tokenType.PREPARED) {
        if (expression.hasOwnProperty('operator')) {
            var greater = expression.operator.value[2].precedence > precedence;
            return "<span class='expression'>" +
                (greater ? "(" : "") +
                render(expression.operand1, expression.operator.value[2].precedence) +
                " " +
                expression.operator.lexem +
                " " +
                render(expression.operand2, expression.operator.value[2].precedence) +
                (greater ? ")" : "") +
                "</span>"
        } else if (expression.hasOwnProperty('value')) {
            return "<span class='expression'>" +
                expression.value +
                "</span>"
        }
    }
    else
        return "";
}

function calculate(expression) {
    if (expression.hasOwnProperty('operator')) {
        if (
            expression.hasOwnProperty('operand1') &&
            expression.hasOwnProperty('operand2')
        ) {
            var r = expression.operator.value[2].calculate(
                calculate(expression.operand1),
                calculate(expression.operand2)
            );
            return r;
        }
    } else if (expression.hasOwnProperty('value')) {
        return expression;
    } else throw Error();
}