function ready() {
    var proxyUrl = 'https://cors-anywhere.herokuapp.com/',
        apiUrl = 'http://www.ringcentral.com/api/index.php',
        getCountries = '?cmd=getCountries&typeResponse=json',
        xhr = new XMLHttpRequest();

    xhr.open('GET', proxyUrl + apiUrl + getCountries, true);
    xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
            var jsonResponse = JSON.parse(xhr.response.substring(0, xhr.response.length -1));

            select = document.getElementById('countries');
            select.innerHTML = '';
            option = document.createElement( 'option' );
            option.text = 'Select country';
            option.disabled = true;
            option.selected = true;
            select.add( option );

            jsonResponse['result'].forEach(country => {
                option = document.createElement( 'option' );
                option.text = country['name'];
                option.setAttribute('country_id', country['id']);
                select.add(option);
            });
        } else {
            alert('Failed to get countries from server');
            console.log(xhr);
        }
    };
    xhr.send();
}

function selectCountry() {
    var body = document.getElementById('countryStatTable'),
        loader = document.getElementById('loader');
    body.innerHTML = "";
    loader.style.display = '';

    var selector = document.getElementById('countries'),
        selectedCountry = selector.options[selector.selectedIndex];

    var proxyUrl = 'https://cors-anywhere.herokuapp.com/',
        apiUrl = 'http://www.ringcentral.com/api/index.php',
        getCountries = '?cmd=getInternationalRates&param[internationalRatesRequest][brandId]=1210&param[internationalRatesRequest][countryId]=' + selectedCountry.getAttribute("country_id") + '&param[internationalRatesRequest][tierId]=3311&typeResponse=json',
        xhr = new XMLHttpRequest();

    xhr.open('GET', proxyUrl + apiUrl + getCountries, true);
    xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
            var jsonResponse = JSON.parse(xhr.response.substring(0, xhr.response.length -1));
            var stats = jsonResponse['rates'][0]['value'][0];
            var selectedCountry = jsonResponse['rates'][0]['key']['name'];

            var resultedArray = {};

            groupBy(stats, stat => stat.type).forEach(type => {
                var phoneType = type[0]['type'],
                    rate = type[0]['rate'],
                    codes = [];

                type.forEach(areaStat => {
                    codes.push(parseInt(areaStat['areaCode'].toString() + (areaStat['phonePart'] ?? '')));
                });

                resultedArray[phoneType] = {'rate' : rate};
                resultedArray[phoneType]['type'] = phoneType;
                resultedArray[phoneType]['codes'] = codes;
            });

            loader.style.display='none';
            printResultTable(selectedCountry, resultedArray)
        } else {
            alert('Failed to get countries from server');
            console.log(xhr);
        }
    };
    xhr.send();
}

function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });

    return map;
}

function printResultTable(city, countryData) {
    var body = document.getElementById('countryStatTable');
    body.innerHTML = "";

    var tbl = document.createElement("table"),
        tblBody = document.createElement("tbody");

    tblBody = createBaseTableHeader(tblBody);

    Object.values(countryData).forEach(phoneType => {
        var tableValues = [
            city,
            phoneType['type'],
            phoneType['codes'].join(', '),
            phoneType['rate'],
        ];

        var row = document.createElement("tr");
        tableValues.forEach(tableValue => {
            var cell = document.createElement("td"),
                cellText = document.createTextNode(tableValue);

            cell.appendChild(cellText);
            row.appendChild(cell);
            tblBody.appendChild(row);
        });
    });

    tbl.appendChild(tblBody);
    body.appendChild(tbl);
    tbl.setAttribute("border", "2");
}

function createBaseTableHeader(tblBody) {
    var columnNames = [
        'Country',
        'Type',
        'Code',
        'Rate per minute'
    ];

    var row = document.createElement("tr");
    columnNames.forEach(name => {
        var cell = document.createElement("td");
        var cellText = document.createTextNode(name);

        cell.appendChild(cellText);
        row.appendChild(cell);
        tblBody.appendChild(row);
    });

    return tblBody;
}

document.addEventListener("DOMContentLoaded", ready);
document.addEventListener("change", selectCountry);
