const recomendationDOM = document.querySelector(".series__recomendations");
const informationDOM = document.querySelector(".information");
const searchbutton = document.querySelector("#searchbutton");
const searchinput = document.querySelector("#searchinput");
const main = document.querySelector("main");
let historicalOpen = false;



const createGenre = (genres,clase) => {
    const div = document.createElement("div");
    div.classList.add(clase);
    for(genre of genres){
        const span = document.createElement("span");
        span.classList.add("badge");
        span.innerText = genre;
        div.appendChild(span);
    }
    return div;
};

const createCard = (data) => {
    console.log(data);
    const divBase = document.createElement("div");
    divBase.classList.add("card");
    divBase.classList.add("series__item");
    
    const imgTag = document.createElement("img");
    imgTag.classList.add("card-img-top");
    if (data.image!==null){
        imgTag.setAttribute("src",data.image.medium);
        imgTag.setAttribute("alt",data.name);
    }else{
        imgTag.setAttribute("src","/img/TV WIZARD.png");
        imgTag.setAttribute("alt",data.name);
    }
    
    //Titulo
    const divInfo = document.createElement("div");
    divInfo.classList.add("card-body");
    const h5 = document.createElement("h5");
    h5.classList.add("card-title");
    h5.innerText = data.name;
    divInfo.appendChild(h5);

    //Fechas
    const divDates = document.createElement("div");
    divDates.classList.add("series__dates");
    const pDates = document.createElement("p");
    pDates.classList.add("series_date");
    pDates.innerText = data.premiered;
    if (data.ended !== null){
        pDates.innerText += ` to ${data.ended}`;
    }
    divDates.appendChild(pDates);
    divBase.append(imgTag,divInfo);

    //Generos
    console.log(data.genres)
    if (data.genres.length > 0) {
        const divGenres = document.createElement("div");
        divGenres.classList.add("series__information");

        const h5Genres = document.createElement("h5");
        h5Genres.classList.add("series__genre-title");
        h5Genres.innerText = "Genres";

        const divListGenres = createGenre(data.genres,"series__genres");
        divGenres.append(h5Genres, divListGenres);
        divBase.append(divDates,divGenres);
    } else {
        // Si no hay géneros, mover la fecha justo debajo del título
        divDates.classList.add("inline-date");
        divInfo.appendChild(divDates); // lo pegamos al título
    }

    divBase.addEventListener("click",() => {
        if(!historicalOpen){
            const items = document.querySelectorAll(".series__item");
            const infoData = informationDOM.querySelector(".information__data");
            updateInformationStructure(data);
            const divGenres = document.createElement("div");
            divGenres.classList.add("information__genres");

            const h5Genres = document.createElement("h5");
            h5Genres.classList.add("information__genre-title");
            h5Genres.innerText = "Genres";
            if (data.genres.length>0){
                const divListGenres = createGenre(data.genres,"information__genres");
                divGenres.append(h5Genres, divListGenres);
                infoData.appendChild(divGenres);
            }
            
            items.forEach(item => {
                item.classList.add("series__item--wait");
            })
            informationDOM.classList.add("historical--show");
            main.classList.add("main--wait");
            historicalOpen = true;
        }
    })

    return divBase;
};

const updateInformationStructure = (data) => {
    const image = informationDOM.querySelector(".information__image").firstElementChild;

    if (data.image!==null){
        image.setAttribute("src",data.image.original);
        image.setAttribute("alt",data.name);
    }else{
        image.setAttribute("src","/img/TV WIZARD.png");
        image.setAttribute("alt",data.name);
    }

    const cross = informationDOM.querySelector("#cross");
    const title = informationDOM.querySelector("#title");
    const info = informationDOM.querySelector("#data");
    const date = informationDOM.querySelector("#date");
    const rating = informationDOM.querySelector("#rating");
    const network = informationDOM.querySelector("#network");

    cross.addEventListener("click",() => {
        if(historicalOpen){
            const items = document.querySelectorAll(".series__item");
            const genres = informationDOM.querySelectorAll(".information__genres");
            genres.forEach(item => {
                item.remove()
            })
            informationDOM.classList.remove("historical--show");
            main.classList.remove("main--wait");
            historicalOpen = false;
            items.forEach(item => {
                item.classList.remove("series__item--wait");
            })
        }
        

    });
    title.innerText = data.name;
    info.innerHTML = data.summary!==null ? data.summary.replace(/<\/?p>/g, "") : "Without description";

    date.innerText = data.premiered!==null ? data.premiered:"No date";
    if (data.ended !== null){
        date.innerText += ` to ${data.ended}`;
    }
    rating.innerText = data.rating.average !==null ? `Rating:  ${data.rating.average}` :  `Rating:  Not Found`;
    network.innerText = data.network !== null ?  `Network: ${data.network.name}` : "";
};

const generateRecomendationList = () => {
    const array = []
    for(let i=0; i < 20; i++){
        array.push((Math.random()*1000).toFixed(0));
    }
    return array;
};

const loadRecomendations = async() => {
    const recomemdationIndex = generateRecomendationList();
    const spinner = document.querySelector("#spinner");
    console.log(spinner);
    let index = 0;
    while(index< recomemdationIndex.length){
        try{
            const response = await axios.get(`https://api.tvmaze.com/shows/${recomemdationIndex[index]}`);
            const data = response.data;
            recomendationDOM.appendChild(createCard(data));
            index++;
        }catch(error){
            recomemdationIndex[index] ++;
        }        
    }
    recomendationDOM.style.display = "grid";
    spinner.classList.add("d-none");
    
} 


const loadSearch = async (query) => {
    const spinner = document.querySelector("#spinner");
    const notfound = document.querySelector("#not_found");

    try {
        const response = await axios.get("https://api.tvmaze.com/search/shows", {
        params: { q: query }
        });
        const data = response.data;
        console.log(data);
        if (data!== undefined) {
            if(data.length>0){
                for (const search of data) {
                    console.log(search);
                    recomendationDOM.appendChild(createCard(search.show));
                }
                recomendationDOM.style.display = "grid";
            }else{
                notfound.classList.remove("d-none");
            }
        } else {
            notfound.classList.remove("d-none");
        }
    } catch (error) {
        console.error("Error en carga", error);
    } finally {
        spinner.classList.add("d-none");
    }
};




document.addEventListener("DOMContentLoaded",()=>{
    const path = window.location.pathname;
    const page = path.split("/").pop();
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    if (page.includes("series.html")){
        loadSearch(query);
    }else{
        loadRecomendations();
    }
});


searchbutton.addEventListener("click",(event) => {
    event.preventDefault();
    console.log(searchinput.value);
    if (searchinput.value !== undefined){
        window.location.href = `/html/series.html?query=${searchinput.value}`;
    }
});



