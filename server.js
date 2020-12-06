//zmienne, stałe
var express = require("express")
var app = express()
var PORT = process.env.PORT || 3000;
// bardzo istotna linijka - port zostaje przydzielony przez Heroku
var path = require("path")
var bodyParser = require("body-parser")

var zalogowany = false


//nasłuch na określonym porcie
app.listen(PORT, function () {
    console.log("start serwera na porcie AAAA" + PORT)
})

//do parsowania na obiekty danych przesyłanych w formularzu, potrzebny jest body-parser
app.use(bodyParser.urlencoded({ extended: true }));

//podlinkowanie css
app.use(express.static('css'))




// tablica juz istniejacych userow
var users = [
    { id: 1, login: "AAA", haslo: "PASS1", wiek: 10, uczen: "checked", plec: "m" },
    { id: 2, login: "ola", haslo: "ola", wiek: 14, uczen: "checked", plec: "k" },
    { id: 3, login: "ala", haslo: "ala", wiek: 20, uczen: "", plec: "k" },
    { id: 4, login: "maciek", haslo: "maciek", wiek: 16, uczen: "checked", plec: "m" },
    { id: 5, login: "olek", haslo: "olek", wiek: 18, uczen: "", plec: "m" },
]





//---------------------------------------- MAIN PAGE --------------------------------------
app.get("/", function (req, res) {
    if (zalogowany) {
        res.sendFile(path.join(__dirname + "/strony/zalogowane/main.html"))
    }
    else {
        res.sendFile(path.join(__dirname + "/strony/main.html"))
    }
})





//---------------------------------------- REGISTER PAGE --------------------------------------
app.get("/register", function (req, res) {
    if (zalogowany) {
        res.sendFile(path.join(__dirname + "/strony/zalogowane/register.html"))
    }
    else {
        res.sendFile(path.join(__dirname + "/strony/register.html"))
    }
})


//odbiór przesłanych danych na serwerze po kliknięciu butona
app.post("/register", function (req, res) {
    var dodany_user = req.body
    dodany_user.id = users.length + 1
    dodany_user.wiek = parseInt(dodany_user.wiek)

    //umożliwia dodanie danych usera do tablicy obiektów na serwerze
    //jesli 4 inputy podane (bez koniecznego ucznia) + w tablicy users nie ma takiego loginu
    if (dodany_user.login != "" && dodany_user.haslo != "" && dodany_user.plec != "") {
        var flaga = false  //flaga - true || false, sprawdza czy sie wykonalo -> czy byl taki login
        users.forEach(function (olduser) {
            if (dodany_user.login == olduser.login) {
                res.send('Juz istnieje taki login')
                istnieje = true
            }
        })
        if (flaga != true) {
            users.push(req.body)
            res.send("Witaj " + dodany_user.login + ", jesteś zajerestrowany.")
        }
    }
    //ustaw mu uczen checked jesli klikniety
    if (dodany_user.uczen == 'on') {
        dodany_user.uczen = 'checked'
    } else {
        dodany_user.uczen = ''
    }
    // jesli brak loginu lub hasla
    if (dodany_user.login == "" || dodany_user.haslo == "") {
        res.send("Brak danych")
    }
    console.log(users)
})





//---------------------------------------- LOGIN PAGE --------------------------------------
app.get("/login", function (req, res) {
    if (zalogowany) {
        res.sendFile(path.join(__dirname + "/strony/zalogowane/login.html"))
    }
    else {
        res.sendFile(path.join(__dirname + "/strony/login.html"))
    }
})



app.post('/login', function (req, res) {
    var info = req.body

    for (i = 0; i < users.length; i++) {
        if (users[i].login == info.login && users[i].haslo == info.haslo) {
            res.redirect('/admin')
            zalogowany = true
        }
    }
    if (!zalogowany) {
        res.send('Błedna nazwa uzytkownika lub haslo')
    }
})






//---------------------------------------- LOGOUT --------------------------------------

app.get('/logout', function (req, res) {
    zalogowany = false
    res.redirect('/')
})





//---------------------------------------- ADMIN PAGE --------------------------------------

app.get("/admin", function (req, res) {
    if (zalogowany) {
        res.sendFile(path.join(__dirname + "/strony/zalogowane/admin.html"))
    }
    else {
        res.sendFile(path.join(__dirname + "/strony/admin.html"))
    }
})





//---------------------------------------- SHOW --------------------------------------
//prezentacja wszystkich danych w tablicy w postaci tabeli

app.get('/show', function (req, res) {
    var tabela = ''

    var byid = users.sort((a, b) => a.id - b.id)

    byid.forEach(function (user) {
        var wiersz = `<tr>
            <td>id: ` + user.id + `</td>
            <td id="login_haslo">user: ` + user.login + `  -  ` + user.haslo + `</td>
            <td>uczen:  <input type="checkbox" disabled ${user.uczen ? 'checked' : ''}></td> </td>
            <td>wiek: ` + user.wiek + `</td>
            <td>płeć: ` + user.plec + `</td>
        </tr>`
        tabela += wiersz
    })



    //-------------- wysyłanie strony -----------------
    if (!zalogowany) {
        res.sendFile(__dirname + '/strony/admin.html')
    } else {
        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Show</title>
            <link rel='stylesheet' href="style.css">
        </head>

        <body id="header_dark">
            <div id="pages_dark">
                <a href="/sort">sort</a>
                <a href="/gender">gender</a>
                <a href="/show">show</a>
            </div>

            <table id="tabela">
                ${tabela}
            </table>
        </body>
        </html>`)
    }
})





//---------------------------------------- GENDER --------------------------------------
//podział na kobiety i mężczyzn w dwu różnych tabelach na jednej stronie

app.get('/gender', function (req, res) {
    var mezczyzni = []
    var kobiety = []

    var tabela_kobiety = ''
    var tabela_mezczyzni = ''



    users.forEach(function (user) {
        if (user.plec == 'k') {
            kobiety.push(user)
        } else {
            mezczyzni.push(user)
        }
    })



    var kobiety_sortowanie_id = kobiety.sort((a, b) => a.id - b.id);
    var mezczyzni_sortowanie_id = mezczyzni.sort((a, b) => a.id - b.id);

    kobiety_sortowanie_id.forEach(function (user) {
        var wiersz_kobiety = `<tr>
            <td>id: ` + user.id + `</td>
            <td>płeć: ` + user.plec + `</td>
        </tr>`
        tabela_kobiety += wiersz_kobiety
    })
    mezczyzni_sortowanie_id.forEach(function (user) {
        var wiersz_mezczyzni = `<tr>
            <td>id: ` + user.id + `</td>
            <td>płeć: ` + user.plec + `</td>
        </tr>`
        tabela_mezczyzni += wiersz_mezczyzni
    })



    //-------------- wysyłanie strony -----------------
    if (!zalogowany) {
        res.sendFile(__dirname + '/strony/admin.html')
    } else {
        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Gender</title>
            <link rel='stylesheet' href="style.css">
        </head>

        <body id="header_dark">
            <div id="pages_dark">
                <a href="/sort">sort</a>
                <a href="/gender">gender</a>
                <a href="/show">show</a>
            </div>

            <table id="tabela">
                ${tabela_kobiety}
            </table>
            <br>
            <br>
            <table id="tabela">
            ${tabela_mezczyzni}
        </table>
        </body>
        </html>`)
    }
})





//---------------------------------------- SORT --------------------------------------
//sortowanie wg wieku, wyświetlone w postaci tabeli

app.get('/sort', function (req, res) {
    var tabela = ''

    var byid = users.sort((a, b) => a.id - b.id)

    byid.forEach(function (user) {
        var wiersz = `<tr>
        <td>id: ` + user.id + `</td>
        <td id="login_haslo">user: ` + user.login + `  -  ` + user.haslo + `</td>
        <td>wiek: ` + user.wiek + `</td>
    </tr>`
        tabela += wiersz
    })



    //-------------- wysyłanie strony -----------------
    if (!zalogowany) {
        res.sendFile(__dirname + '/strony/admin.html')
    } else {
        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sort</title>
            <link rel='stylesheet' href="style.css">
        </head>

        <body id="header_dark">
            <div id="pages_dark">
                <a href="/sort">sort</a>
                <a href="/gender">gender</a>
                <a href="/show">show</a>
            </div>

            <form id="inputy" method='POST' onchange="this.submit()">
                <label>
                    <input type='radio' name='sortowanie' value='rosnaco' id='rosnaco' checked>   rosnąco
                    <input type='radio' name='sortowanie' value='malejaco' id='malejaco'>   malejąco
                </label>
                <br>
                <br>
            </form>

            <table id="tabela">
                ${tabela}
            </table>
        </body>
        </html>`)
    }
})




//---------------------------------------- SORT - rosnąco -------------------------------

app.post('/sort', function (req, res) {

    if (req.body.sortowanie == 'rosnaco') {
        var tabela = ''

        var byage = users.sort((a, b) => a.wiek - b.wiek);
        byage.forEach(function (user) {
            var wiersz = `<tr>
            <td>id: ` + user.id + `</td>
            <td id="login_haslo">user: ` + user.login + `  -  ` + user.haslo + `</td>
            <td>wiek: ` + user.wiek + `</td>
        </tr>`
            tabela += wiersz
        })


        if (!zalogowany) {
            res.sendFile(__dirname + '/strony/admin.html')
        } else {
            res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sort</title>
            <link rel='stylesheet' href="style.css">
        </head>

        <body id="header_dark">
            <div id="pages_dark">
                <a href="/sort">sort</a>
                <a href="/gender">gender</a>
                <a href="/show">show</a>
            </div>

            <form id="inputy" method='POST' onchange="this.submit()">
                <label>
                    <input type='radio' name='sortowanie' value='rosnaco' id='rosnaco' checked>   rosnąco
                    <input type='radio' name='sortowanie' value='malejaco' id='malejaco'>   malejąco
                </label>
                <br>
                <br>
            </form>

            <table id="tabela">
                ${tabela}
            </table>
        </body>
        </html>`)
        }
    }

    //---------------------------------------- SORT - malejąco -------------------------------
    else if (req.body.sortowanie == 'malejaco') {

        tabela = ''

        byage = users.sort((a, b) => b.wiek - a.wiek);
        byage.forEach(function (user) {
            wiersz = `<tr>
            <td>id: ` + user.id + `</td>
            <td id="login_haslo">user: ` + user.login + ` - ` + user.haslo + ` </td>
            <td>wiek: ` + user.wiek + `</td>
        </tr>`
            tabela += wiersz
        })
        if (!zalogowany) {
            res.sendFile(__dirname + '/strony/admin.html')
        } else {
            res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sort</title>
            <link rel='stylesheet' href="style.css">
        </head>

        <body id="header_dark">
            <div id="pages_dark">
                <a href="/sort">sort</a>
                <a href="/gender">gender</a>
                <a href="/show">show</a>
            </div>

            <form id="inputy" method='POST' onchange="this.submit()">
                <label>
                    <input type='radio' name='sortowanie' value='rosnaco' id='rosnaco'>   rosnąco
                    <input type='radio' name='sortowanie' value='malejaco' id='malejaco' checked>   malejąco
                </label>
                <br>
                <br>
            </form>
            
            <table id="tabela">
                ${tabela}
            </table>
        </body>
        </html>`)
        }
    }
})