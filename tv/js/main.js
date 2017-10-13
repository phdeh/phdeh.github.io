function detectmob() {
    return !!(navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i));
}

function makeButtonIfMobile() {
    if (detectmob()) {
        document.getElementById("submitter").hidden = false;
        window.onscroll = function (ev) {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                if (schollDown)
                    focusOnScroll();
            }
        };
    } else {
        document.getElementsByName("studak")[0].focus();
    }
}

function validate(forced, evt, target, func) {
    schollDown = false;
    var theEvent = evt || window.event;
    if (theEvent !== null) {
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
        var regex = /[0-9]|\./;
        if (!regex.test(key)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
        }
    }
    if (forced || theEvent.keyCode === 13 || theEvent.keyCode === 32 || theEvent.keyCode === 9) {
        if (!target.value)
            target.value = target.placeholder;

        func();
    }
}

function min(a, b) {
    if (a < b)
        return a;
    else
        return b;
}

function calcall() {
    const hw = document.getElementById("homework");
    const er = document.getElementById("error");
    hw.hidden = true;
    er.hidden = true;
    const v = parseInt(document.getElementsByName("variant")[0].value);
    if (25 - v < 4) {
        er.hidden = false;
        return;
    } else
        hw.hidden = false;
    calcGirls(v);
}

function calcGirls(v) {
    const girls = 25 - v;
    const guys = 30 - (25 - v);
    var each2girlsnum = girls * girls * guys * guys;
    var each2girlsden = 30 * 30 * 30 * 30;
    for (var i = 2; i <= min(each2girlsden, each2girlsnum); ++i)
        while (each2girlsden % i == 0 && each2girlsnum % i == 0) {
            each2girlsden /= i;
            each2girlsnum /= i;
        }
    var each2girls = each2girlsnum / each2girlsden;
    var approxe2g = Math.round(each2girls * 10000) / 10000;
    var approxgirls = approxe2g !== each2girls ? "≈" : "=";

    var times6num = each2girlsnum * 6;
    var times6den = each2girlsden;
    for (var i = 2; i <= min(times6den, times6num); ++i)
        while (times6den % i == 0 && times6num % i == 0) {
            times6den /= i;
            times6num /= i;
        }
    var times6 = times6num / times6den;
    var approx6 = Math.round(times6 * 10000) / 10000;
    var approxtimes6 = approxe2g !== each2girls ? "≈" : "=";
    document.getElementsByName("girls").forEach(function (t) {
        t.innerHTML = girls;
    });
    document.getElementsByName("guys").forEach(function (t) {
        t.innerHTML = guys;
    });
    document.getElementsByName("each2girlsnum").forEach(function (t) {
        t.innerHTML = each2girlsnum;
    });
    document.getElementsByName("each2girlsden").forEach(function (t) {
        t.innerHTML = each2girlsden;
    });
    document.getElementsByName("each2girls").forEach(function (t) {
        t.innerHTML = approxgirls + " " + (approxe2g).toString().replace('.', ',');
    });

    document.getElementsByName("times6num").forEach(function (t) {
        t.innerHTML = times6num;
    });
    document.getElementsByName("times6den").forEach(function (t) {
        t.innerHTML = times6den;
    });
    document.getElementsByName("times6").forEach(function (t) {
        t.innerHTML = approxtimes6 + " " + (approx6).toString().replace('.', ',');
    });
}