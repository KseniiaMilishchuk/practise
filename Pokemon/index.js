const API_BASE_URL = 'https://pokeapi.co/api/v2';


const list = document.querySelector('.PokeList');
const loadBtn = document.querySelector('.gallery__button');
const pokeList = document.querySelector('.homepage__list');

const pokemonsLocalStorageController = {
    keyName: 'pokemons',
    
    get pokemons() {
        const stringifiedPokemons = localStorage.getItem(this.keyName);
        return stringifiedPokemons ? JSON.parse(stringifiedPokemons) : [];
    },

    set pokemons(items) {
        localStorage.setItem(this.keyName, JSON.stringify(items));
    }
}

function createPokemon (item) {
    const li = document.createElement('li');
    li.classList.add('PokeList__item');

    const pokeCard = document.createElement('div');
    pokeCard.classList.add('PokeCard');
    pokeCard.setAttribute('role', 'button');
    pokeCard.setAttribute('tabindex', '0');
    pokeCard.dataset.id = item.id;

    const pokeCard__imgBlock = document.createElement('div');
    pokeCard__imgBlock.classList.add('PokeCard__img-block');

    const pokeCard__img = document.createElement('img');
    pokeCard__img.classList.add('PokeCard-image');
    pokeCard__img.src = item.sprites.front_default;
    pokeCard__img.alt = item.name;

    pokeCard__imgBlock.appendChild(pokeCard__img);

    const pokeCard__infoBlock = document.createElement('div');
    pokeCard__infoBlock.classList.add('PokeCard__info-block');

    const pokeCard__name = document.createElement('h2');
    pokeCard__name.classList.add('PokeCard__name');
    pokeCard__name.textContent = item.name;
   
    const pokeCard__types = document.createElement('div');
    pokeCard__types.classList.add('PokeCard__types');

    if (item.types.length) {
        const typeNames = item.types.map((type) => {
            return type.type.name;
        });
      
        typeNames.forEach((name) => {
            const pokeCard__type = document.createElement('div');
            pokeCard__type.classList.add('pokeCard__type', `type-${name}`);
            pokeCard__type.textContent = name;
            pokeCard__types.append(pokeCard__type);
        });

    }

    pokeCard__infoBlock.append(pokeCard__name, pokeCard__types);
    pokeCard.append(pokeCard__imgBlock, pokeCard__infoBlock );
    li.appendChild(pokeCard);

    return li;
}

function getPokemonCard (item) {
    const card = document.createElement('div');
    card.classList.add('PokeDetails');

    const cancelBtn = document.createElement('button');
    cancelBtn.classList.add('PokeDetails__button');
    cancelBtn.innerHTML = '&times';

    cancelBtn.addEventListener('click', () => {
        const cardDetails = card.closest('.homepage__pokeDetails');
        if (cardDetails) {
            cardDetails.remove();
        }
    });

    const pokeDetails__imgBlock = document.createElement('div');
    pokeDetails__imgBlock.classList.add('PokeDetails__img-block');

    const pokeDetails__img = document.createElement('img');
    pokeDetails__img.classList.add('PokeDetails__image');
    pokeDetails__img.src = item.sprites.front_default;
    pokeDetails__img.alt = item.name;

    pokeDetails__imgBlock.append(pokeDetails__img);

    const pokeDetails__name = document.createElement('h2');
    pokeDetails__name.classList.add('PokeDetails__name');
    pokeDetails__name.textContent = item.name;

    
    const pokeDetails__stats = document.createElement('div');
    pokeDetails__stats.classList.add('PokeDetails__stats');

    const table = document.createElement('table');
    table.classList.add('table');

    const tableBody = document.createElement('tbody');
    tableBody.classList.add('table__body');

    item.stats.forEach(statItem => {
        const table__row = document.createElement('tr');
        table__row.classList.add('table__row');

        const table__columnName = document.createElement('td');
        table__columnName.classList.add('table__column-name');
        table__columnName.textContent = statItem.stat.name;

        const table__columnValue = document.createElement('td');
        table__columnValue.classList.add('table__column-value');
        table__columnValue.textContent = statItem.base_stat;

        table__row.append(table__columnName, table__columnValue);
        tableBody.append(table__row);

    });

    table.appendChild(tableBody);
    pokeDetails__stats.appendChild(table);

    card.append(cancelBtn, pokeDetails__imgBlock, pokeDetails__name, pokeDetails__stats);

    return card;
}
function renderPokemons (items) {
    const itemsToRender = items.map(item => createPokemon(item));
    list.append(...itemsToRender);
}

let offset = 0;
const limit = 30;

async function getPokemons(offset, limit) {
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon?offset=${offset}&limit=${limit}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const responsePokemons = await response.json();
       
        const results = await Promise.allSettled(
            responsePokemons.results.map(async (pokemon) => {
                const result = await fetch(pokemon.url);
                const data = await result.json();
                console.log(data);

                return data;
            })
        );
        // Відфільтруємо тільки успішні запити
        const pokemons = results.filter(r => r.status === 'fulfilled').map(r => r.value);

        return pokemons;
        
    } catch (error) {
        console.error('Error fetching pokemons. Please try again later.', error);
        return [];
    }
}
// // Ініціалізація
async function init() {
    const fetchedPokemons = await getPokemons(offset, limit);
    const savedPokemons = pokemonsLocalStorageController.pokemons;
    let pokemons = [...savedPokemons];

    fetchedPokemons.forEach(p => {
        if(!pokemons.some(existing => existing.id === p.id)) {
            pokemons.push(p);
        }
    })
    
    // pokemonsLocalStorageController.pokemons = pokemons;
    renderPokemons(pokemons);
    
    // const updatePokemonsEvent = new CustomEvent('updatePokeList');

    // document.addEventListener('updatePokeList', () => {
    //     pokemonsLocalStorageController.pokemons = pokemons;
    //     renderPokemons(pokemons);
    // });

    //  // document.dispatchEvent(updatePokemonsEvent);
   
   

    loadBtn.addEventListener('click', async () => {
        offset += limit;
        const newPokemons = await getPokemons(offset, limit);
        const uniqueNewPokemons = newPokemons.filter(
            p => !pokemons.some(existing => existing.id === p.id)
        );
        pokemons.push(...uniqueNewPokemons);
        renderPokemons(uniqueNewPokemons);
        
    })

    list.addEventListener('click', (event) => {
        const pokeCard = event.target.closest('.PokeCard');
        if (!pokeCard) return; // якщо клік не по картці – ігноруємо

        const id = pokeCard.dataset.id;
        // const allPokemons = pokemonsLocalStorageController.pokemons;
        const selectedPokemon = pokemons.find(p => p.id === Number(id));

        if (selectedPokemon) {
            let pokeDetails = document.querySelector('.homepage__pokeDetails');
            if (!pokeDetails) {
                pokeDetails = document.createElement('div');
                pokeDetails.classList.add('homepage__pokeDetails');
                pokeList.insertAdjacentElement('afterend', pokeDetails);
            }

            const details = getPokemonCard(selectedPokemon);
            pokeDetails.innerHTML = '';
            pokeDetails.append(details);
            // document.dispatchEvent(updatePokemonsEvent);
        }
    });
}
init();



