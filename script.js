const theaterListContainer = document.getElementById('theater-list');
const movieListContainer = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');

let selectedTheaterId = '';
let lastFetchTime = 0;

// Haetaan Finnkinon teatterit
fetch('https://www.finnkino.fi/xml/TheatreAreas/')
    .then(response => response.text())
    .then(data => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'text/xml');
        const theaters = xmlDoc.getElementsByTagName('TheatreArea');

        // Luodaan teatterilista
        for (let i = 0; i < theaters.length; i++) {
            const theaterName = theaters[i].getElementsByTagName('Name')[0].childNodes[0].nodeValue;
            const theaterId = theaters[i].getElementsByTagName('ID')[0].childNodes[0].nodeValue;
            const theaterItem = document.createElement('div');
            theaterItem.className = 'theater-list';
            theaterItem.innerText = theaterName;
            theaterItem.addEventListener('click', () => fetchMovies(theaterId));
            theaterListContainer.appendChild(theaterItem);
        }
    });

// Hakee elokuvat ja näytökset valitussa teatterissa
function fetchMovies(theaterId) {
    const currentTime = new Date().getTime();
    if (currentTime - lastFetchTime < 1000) {
        // Älä tee mitään, jos edellinen haku tapahtui alle sekunti sitten
        return;
    }

    lastFetchTime = currentTime;

    selectedTheaterId = theaterId;
    const movieListContainer = document.getElementById('movieListContainer');

    fetch(`https://www.finnkino.fi/xml/Schedule/?area=${theaterId}`)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            const movies = xmlDoc.getElementsByTagName('Show');

            movieListContainer.innerHTML = '';

            let uniqueMovies = new Map();

            for (let i = 0; i < movies.length; i++) {
                const movieTitle = movies[i].getElementsByTagName('Title')[0].childNodes[0].nodeValue;
                const movieID = movies[i].getElementsByTagName('EventID')[0].childNodes[0].nodeValue;
                const moviePoster = movies[i].getElementsByTagName('EventSmallImagePortrait')[0].childNodes[0].nodeValue;
                const movieDuration = movies[i].getElementsByTagName('LengthInMinutes')[0].childNodes[0].nodeValue;
                const theater = movies[i].getElementsByTagName('Theatre')[0].childNodes[0].nodeValue;
                const auditorium = movies[i].getElementsByTagName('TheatreAuditorium')[0].childNodes[0].nodeValue;
                const theaterAndAuditorium = movies[i].getElementsByTagName('TheatreAndAuditorium')[0].childNodes[0].nodeValue;
                const presentationMethodAndLanguage = movies[i].getElementsByTagName('PresentationMethodAndLanguage')[0].childNodes[0].nodeValue;

                
                // Elokuvakortit
                if (!uniqueMovies.has(movieID))  {
                    const movieCard = document.createElement('div');
                    movieCard.className = 'movie-card';
                    movieCard.innerHTML = `
                        <h3>${movieTitle}</h3>
                        <img src="${moviePoster}" alt="${movieTitle}" style="max-width: 100%;">
                        <p>Kesto: ${movieDuration} min</p>
                        <p>Teatteri: ${theater}</p>
                        <p>Salin numero: ${auditorium}</p>
                        <p>Teatteri ja sali: ${theaterAndAuditorium}</p>
                        <p>Esitystapa ja kieli: ${presentationMethodAndLanguage}</p>
                    `;

                    // Lisätään näytösajat valintakenttään
                    const showtimes = movies[i].getElementsByTagName('dttmShowStart');
                    const showtimeSelect = document.createElement('select');
                    showtimeSelect.className = 'showtime-select';

                    for (let j = 0; j < showtimes.length; j++) {
                        const showtime = new Date(showtimes[j].childNodes[0].nodeValue);
                        const showtimeOption = document.createElement('option');
                        showtimeOption.value = showtime.toISOString();
                        showtimeOption.innerText = showtime.toLocaleString();
                        showtimeSelect.appendChild(showtimeOption);
                    }

                    movieCard.appendChild(showtimeSelect);
                    movieListContainer.appendChild(movieCard);
                }
            }
        });
}

// Suorittaa hakutoiminnon
function performCustomSearch() {
    const searchString = searchInput.value.toLowerCase();
    const movieCards = document.getElementsByClassName('movie-card');

    for (let i = 0; i < movieCards.length; i++) {
        const movieTitle = movieCards[i].getElementsByTagName('h3')[0].innerText.toLowerCase();
        if (movieTitle.includes(searchString)) {
            movieCards[i].style.display = 'block';
        } else {
            movieCards[i].style.display = 'none';
        }
    }
}
