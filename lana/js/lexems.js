var cg = 0;

function constgen() {
    return cg++;
}

const noneaccos = constgen();
const left = constgen();
const right = constgen();

const lexems = {
    '^': {
        2: {
            associated: right,
            precedence: 5,
            allowedTypes: [
                ['number', 'number', /**/ 'number', {associative: false, commutative: false}]
            ],
            calculate: function (a, b) {
                if (a.vType == 'number' && b.vType == 'number')
                    return {
                        vType: 'number',
                        value: Math.pow(a.value, b.value)
                    };
                else
                    throw TypeError();
            }
        }
    },
    '*': {
        2: {
            associated: left,
            precedence: 6,
            allowedTypes: [
                ['number', 'number', /**/ 'number', {associative: true, commutative: true}]
            ],
            calculate: function (a, b) {
                if (a.vType == 'number' && b.vType == 'number')
                    return {
                        vType: 'number',
                        value: a.value * b.value
                    };
                else
                    throw TypeError();
            }
        }
    },
    '/': {
        2: {
            associated: left,
            precedence: 6,
            allowedTypes: [
                ['number', 'number', /**/ 'number', {associative: false, commutative: false}]
            ],
            calculate: function (a, b) {
                if (a.vType == 'number' && b.vType == 'number')
                    return {
                        vType: 'number',
                        value: a.value / b.value
                    };
                else
                    throw TypeError();
            }
        }
    },
    '-': {
        1: {
            associated: right,
            precedence: 4,
            allowedTypes: [
                ['number', /**/ 'number']
            ],
            calculate: function (a) {
                if (a.vType == 'number')
                    return {
                        vType: 'number',
                        value: -a.value
                    };
                else
                    throw TypeError();
            }
        },
        2: {
            associated: left,
            precedence: 7,
            allowedTypes: [
                ['number', 'number', /**/ 'number', {associative: false, commutative: false}]
            ],
            calculate: function (a, b) {
                if (a.vType == 'number' && b.vType == 'number')
                    return {
                        vType: 'number',
                        value: a.value - b.value
                    };
                else
                    throw TypeError();
            }
        }
    },
    '+': {
        1: {
            associated: right,
            precedence: 4,
            allowedTypes: [
                ['number', /**/ 'number']
            ],
            calculate: function (a) {
                if (a.vType == 'number')
                    return {
                        vType: 'number',
                        value: a.value
                    };
                else
                    throw TypeError();
            }
        },
        2: {
            associated: left,
            precedence: 7,
            allowedTypes: [
                ['number', 'number', /**/ 'number', {associative: true, commutative: true}]
            ],
            calculate: function (a, b) {
                if (a.vType == 'number' && b.vType == 'number')
                    return {
                        vType: 'number',
                        value: a.value + b.value
                    };
                else
                    throw TypeError();
            }
        }
    },
    '=': {
        2: {
            associated: left,
            precedence: 6,
            allowedTypes: [
                ['number', 'number', /**/ 'boolean', {associative: false, commutative: true}]
            ],
            calculate: function (a, b) {
                if (a.vType == 'number' && b.vType == 'number')
                    return {
                        vType: 'boolean',
                        value: a.value == b.value
                    };
                else
                    throw TypeError();
            }
        }
    },
    ',': {
        2: {
            associated: left,
            precedence: 17,
            calculate: function (a, b) {
                return b;
            }
        }
    },
    '(': {
        openBracket: {}
    },
    ')': {
        closeBracket: {}
    }
};