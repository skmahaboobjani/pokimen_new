import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';



const SearchPage = () =>
 {
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [abilities, setAbilities] = useState([]);
  const [selectedAbility, setSelectedAbility] = useState('');
  const [selectedHabitat, setSelectedHabitat] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [habitats, setHabitats] = useState([]);
  const [species, setSpecies] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pokemonList, setPokemonList] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [bookmarkedPokemon, setBookmarkedPokemon] = useState([]);
  const loader = useRef(null);
  const [selectedFavorite, setSelectedFavorite] = useState(null);




  const FavoritePokemonList = ({ bookmarkedPokemon, onViewFavoriteDetails }) => {
    return (
      <div>
        <h2>Bookmarked Pokemon</h2>
        <ul>
          {bookmarkedPokemon.map((pokemon) => (
            <li  key={pokemon.id}>
              {pokemon.name}{' '}
              <button className='btn' onClick={() => onViewFavoriteDetails(pokemon)}>
                View Details
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  const FavoritePokemonCard = ({ pokemon, onRemove }) => {
    return (
      <div className="favorite-pokemon-card">
        <h2>Favorite Pokemon</h2>
        <p>Name: {pokemon.name}</p>
        <p>Height: {pokemon.height}</p>
        <p>Weight: {pokemon.weight}</p>
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
          alt={pokemon.name}
        />
        <button onClick={() => onRemove(pokemon)}>Remove from Favorites</button>
      </div>
    );
  };
  





  useEffect(() => {
    const fetchAbilities = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/ability');
        const abilityNames = response.data.results.map((ability) => ability.name);
        setAbilities(abilityNames);
      } catch (error) {
        console.error('Error fetching abilities:', error);
      }
    };

    fetchAbilities();
  }, []);




  useEffect(() => {
    const fetchPokemonByAbility = async () => {
      if (!selectedAbility) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`https://pokeapi.co/api/v2/ability/${selectedAbility}`);
        const pokemonDetails = await Promise.all(
          response.data.pokemon.map(async (pokemon) => {
            const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.pokemon.name}`);
            return pokemonResponse.data;
          })
        );
        setFilteredPokemon(pokemonDetails);
      } catch (error) {
        setError(error.message || 'Error fetching Pokemon by ability');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonByAbility();
  }, [selectedAbility]);





  useEffect(() => {
    const fetchHabitats = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon-habitat');
        const habitatNames = response.data.results.map((habitat) => habitat.name);
        setHabitats(habitatNames);
      } catch (error) {
        console.error('Error fetching habitats:', error);
      }
    };

    fetchHabitats();
  }, []);





  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon-species');
        const speciesNames = response.data.results.map((species) => species.name);
        setSpecies(speciesNames);
      } catch (error) {
        console.error('Error fetching species:', error);
      }
    };

    fetchSpecies();
  }, []);






  useEffect(() => {
    const fetchPokemonByHabitat = async () => {
      if (!selectedHabitat) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-habitat/${selectedHabitat}`);
        const pokemonDetails = await Promise.all(
          response.data.pokemon_species.map(async (pokemon) => {
            const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
            return pokemonResponse.data;
          })
        );
        setFilteredPokemon(pokemonDetails);
      } catch (error) {
        setError(error.message || 'Error fetching Pokemon by habitat');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonByHabitat();
  }, [selectedHabitat]);






  







  useEffect(() => {
    const fetchPokemonBySpecies = async () => {
      if (!selectedSpecies) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${selectedSpecies}`);
        const pokemonDetails = await Promise.all(
          response.data.varieties.map(async (variety) => {
            const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${variety.pokemon.name}`);
            return pokemonResponse.data;
          })
        );
        setFilteredPokemon(pokemonDetails);
      } catch (error) {
        setError(error.message || 'Error fetching Pokemon by species');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonBySpecies();
  }, [selectedSpecies]);










  useEffect(() => {
    const fetchMorePokemon = async () => {
      setLoadingMore(true);
      try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?offset=${(pageNumber - 1) * 10}&limit=10`);
        const detailedPokemonList = await Promise.all(
          response.data.results.map(async (pokemon) => {
            const pokemonDetails = await axios.get(pokemon.url);
            return pokemonDetails.data;
          })
        );
        setPokemonList((prevList) => [...prevList, ...detailedPokemonList]);
      } catch (error) {
        console.error('Error fetching more Pokemon:', error);
      } finally {
        setLoadingMore(false);
      }
    };

    fetchMorePokemon();
  }, [pageNumber]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0,
    };

    const observer = new IntersectionObserver(handleObserver, options);
    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loader]);

  useEffect(() => {
    const storedBookmarks = JSON.parse(localStorage.getItem('bookmarkedPokemon')) || [];
    setBookmarkedPokemon(storedBookmarks);
  }, []);

  const handleObserver = (entries) => {
    const target = entries[0];
    if (target.isIntersecting && !loadingMore) {
      setPageNumber((prevPage) => prevPage + 1);
    }
  };


  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      if (searchInput.trim() === "") {
        throw new Error("Please enter a Pokemon name.");
      }

      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchInput}`);
      setSearchResult(response.data);
    } catch (error) {
      setError(error.message || 'Error fetching Pokemon details');
      if (searchInput.trim() === "") {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleBookmark = (pokemon) => {
    if (!bookmarkedPokemon.some((p) => p.id === pokemon.id)) {
      const updatedBookmarks = [...bookmarkedPokemon, pokemon];
      setBookmarkedPokemon(updatedBookmarks);
      localStorage.setItem('bookmarkedPokemon', JSON.stringify(updatedBookmarks));
    }
  };

  const handleUnbookmark = (pokemon) => {
    const updatedBookmarks = bookmarkedPokemon.filter(
      (bookmarkedPokemon) => bookmarkedPokemon.id !== pokemon.id
    );
    setBookmarkedPokemon(updatedBookmarks);
    localStorage.setItem('bookmarkedPokemon', JSON.stringify(updatedBookmarks));
  };

  const handleViewFavoriteDetails = (pokemon) => {
    setSelectedFavorite(pokemon);
  };

  const handleRemoveFavorite = (pokemon) => {
    setBookmarkedPokemon((prevBookmarks) =>
      prevBookmarks.filter((bookmarkedPokemon) => bookmarkedPokemon.id !== pokemon.id)
    );
    setSelectedFavorite(null);
  };

  return (
    <div  >
      <h1>Pokemon Search and Filter</h1>


      

      <input 
        type="text"
        id="pokemonSearch"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search for Pokemon"
      />
      <button className='btn1' onClick={handleSearch} disabled={loading}>
        Search
      </button>


      <div >
       
    <label htmlFor="abilityFilter">Filter by Ability:</label>
    <select
        id="abilityFilter"
        value={selectedAbility}
        onChange={(e) => setSelectedAbility(e.target.value)}
    >
        <option value="">Select an ability</option>
        {abilities.map((ability) => (
            <option key={ability} value={ability}>
                {ability}
            </option>
        ))}
    </select>
   



    <label htmlFor="habitatFilter">Filter by Habitat:</label>
   
    <select
        id="habitatFilter"
        value={selectedHabitat}
        onChange={(e) => setSelectedHabitat(e.target.value)}
    >
        <option value="">Select a habitat</option>
        {habitats.map((habitat) => (
            <option key={habitat} value={habitat}>
                {habitat}
            </option>
        ))}
    </select>
   


    <label htmlFor="speciesFilter">Filter by Species:</label>
    <select
        id="speciesFilter"
        value={selectedSpecies}
        onChange={(e) => setSelectedSpecies(e.target.value)}
    >
        <option value="">Select a species</option>
        {species.map((specie) => (
            <option key={specie} value={specie}>
                {specie}
            </option>
        ))}
    </select>
    

</div>










      {bookmarkedPokemon.length > 0 && (
        <FavoritePokemonList
          bookmarkedPokemon={bookmarkedPokemon}
          onViewFavoriteDetails={handleViewFavoriteDetails}
        />
      )}


      {selectedFavorite && (
        <FavoritePokemonCard pokemon={selectedFavorite} onRemove={handleRemoveFavorite} />
      )}


      {loading && <div className="loader"></div>}

      {error && <p className="error-message">Error: {error}</p>}

      {searchResult && (
        <div >
          <h2  className='det'>Pokemon Details</h2>
          <div className='pokemandetails'>
            <p>Name: {searchResult.name}</p>
            <p>Height: {searchResult.height}</p>
            <p>Weight: {searchResult.weight}</p>

            {searchResult.id && (
              <>
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${searchResult.id}.png`}
                  alt={searchResult.name}
                />
                {bookmarkedPokemon.some((p) => p.id === searchResult.id) ? (
                  <button onClick={() => handleUnbookmark(searchResult)}>Unbookmark</button>
                ) : (
                  <button onClick={() => handleBookmark(searchResult)}>
                    <span role="img" aria-label="Bookmark">
                      bookmark
                    </span>
                  </button>
                )}

              </>
            )}
          </div>
        </div>
      )}


     




{filteredPokemon.length > 0 && (
  <div>
    <h2>Filtered Pokemon</h2>
    <div className="pokemon-grid">
      {filteredPokemon.map((pokemon, index) => (
        <div key={`filtered-${pokemon.id}-${index}`} className="pokemon-card">
          <p>Name: {pokemon.name}</p>
          <p>Height: {pokemon.height}</p>
          <p>Weight: {pokemon.weight}</p>
          {pokemon.sprites && (
            <>
              <img src={pokemon.sprites.front_default} alt={pokemon.name} />
              {bookmarkedPokemon.some((p) => p.id === pokemon.id) ? (
                <button onClick={() => handleUnbookmark(pokemon)}>Unbookmark</button>
              ) : (
                <button onClick={() => handleBookmark(pokemon)}>
                  <span role="img" aria-label="Bookmark">
                    bookman
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  </div>
)}

{pokemonList.length > 0 && (
  <div>
    <h2>Pokemon List</h2>
    <div className="pokemon-grid">
      {pokemonList.map((pokemon, index) => (
        <div key={`list-${pokemon.id}-${index}`} className="pokemon-card">
          <p>Name: {pokemon.name}</p>
          <p>Height: {pokemon.height}</p>
          <p>Weight: {pokemon.weight}</p>
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
            alt={pokemon.name}
          />
          {bookmarkedPokemon.some((p) => p.id === pokemon.id) ? (
            <button onClick={() => handleUnbookmark(pokemon)}>Unbookmark</button>
          ) : (
            <button onClick={() => handleBookmark(pokemon)}>
              <span role="img" aria-label="Bookmark">
                bookmark
              </span>
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
)}



      
      {loadingMore && <p className="loader"></p>}
      <div ref={loader}></div>
    </div>
  );
};

export default SearchPage;


















