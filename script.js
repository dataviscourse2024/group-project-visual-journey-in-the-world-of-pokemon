document.addEventListener("DOMContentLoaded", function () {
    // URLs for the CSV files
    const pokemonStatsUrl = "Dataset/Preprocessed/pokemon_stats_with_images.csv";
    const combatResultsUrl = "Dataset/Preprocessed/combats_results.csv";

    // Store loaded data
    let pokemonStats = [];
    let combatResults = [];

    // Load both CSV files using Promise.all to ensure both are loaded
    Promise.all([
        d3.csv(pokemonStatsUrl),
        d3.csv(combatResultsUrl)
    ]).then(function([statsData, combatData]) {
        pokemonStats = statsData;
        combatResults = combatData;
        // console.log("Pokemon Stats loaded:", pokemonStats.length);
        // console.log("Combat Results loaded:", combatResults.length);
        initializeInterface();
    }).catch(function(error) {
        console.error("Error loading data:", error);
        document.getElementById("winner").textContent = "Error loading Pokémon data";
    });

    function initializeInterface() {
        // Get dropdown elements
        const dropdown1 = d3.select("#pokemon1");
        const dropdown2 = d3.select("#pokemon2");

        // Clear existing options
        dropdown1.html("");
        dropdown2.html("");

        // Add default option
        dropdown1.append("option")
            .attr("value", "")
            .text("Select Pokémon");
        
        dropdown2.append("option")
            .attr("value", "")
            .text("Select Pokémon");

        // Sort Pokémon by name
        const sortedPokemon = [...pokemonStats].sort((a, b) => a.name.localeCompare(b.name));

        // Populate dropdowns
        sortedPokemon.forEach(pokemon => {
            dropdown1.append("option")
                .attr("value", pokemon.name)
                // .text(`${pokemon.name} (#${pokemon.pokedex_number})`);
                .text(`${pokemon.name}`);
            
            dropdown2.append("option")
                .attr("value", pokemon.name)
                // .text(`${pokemon.name} (#${pokemon.pokedex_number})`);
                .text(`${pokemon.name}`);
        });

        // Add event listeners
        dropdown1.on("change", function() {
            updatePokemonDisplay(1);
            calculateWinner();
        });

        dropdown2.on("change", function() {
            updatePokemonDisplay(2);
            calculateWinner();
        });

        // Initialize with default images
        updatePokemonDisplay(1);
        updatePokemonDisplay(2);
    }

    function updatePokemonDisplay(pokemonNumber) {
        const dropdownId = `pokemon${pokemonNumber}`;
        const imageId = `pokemon${pokemonNumber}Image`;
        const selectedName = d3.select(`#${dropdownId}`).property("value");
        
        console.log(selectedName)
        // console.log(pokemonStats[0])

        const pokemon = pokemonStats.find(p => p.name === selectedName);
        // console.log(pokemon)
        const imgElement = d3.select(`#${imageId}`);
        console.log(pokemon.image_exists)
        if (pokemon && pokemon.image_exists === "True") {
            const imagePath = `Dataset/images/pokemon_jpg/${pokemon.image_filename}`;
            console.log(imagePath)
            imgElement.attr("src", imagePath)
                .attr("alt", `${pokemon.name} image`);

            // Update stats display if you want to show additional information
            const statsHtml = `
                <div class="pokemon-stats">
                    <p>Type: ${pokemon.type1}${pokemon.type2 ? '/' + pokemon.type2 : ''}</p>
                    <p>HP: ${pokemon.hp}</p>
                    <p>Attack: ${pokemon.attack}</p>
                    <p>Defense: ${pokemon.defense}</p>
                    <p>Sp. Attack: ${pokemon.sp_attack}</p>
                    <p>Sp. Defense: ${pokemon.sp_defense}</p>
                    <p>Speed: ${pokemon.speed}</p>
                </div>
            `;
            d3.select(`#pokemon${pokemonNumber}Stats`).html(statsHtml);
        } else {
            // Set default image if no Pokémon selected or image doesn't exist
            imgElement.attr("src", "Dataset/images/pokemon_jpg/1.jpg")
                .attr("alt", "Select a Pokémon");
            d3.select(`#pokemon${pokemonNumber}Stats`).html("");
        }
    }

    function calculateWinner() {
        const pokemon1Name = d3.select("#pokemon1").property("value");
        const pokemon2Name = d3.select("#pokemon2").property("value");

        if (!pokemon1Name || !pokemon2Name) {
            d3.select("#winner").text("Select two Pokémon to battle!");
            return;
        }

        if (pokemon1Name === pokemon2Name) {
            d3.select("#winner").text("Please select different Pokémon!");
            return;
        }

        // Find the battle result
        const result = combatResults.find(r => 
            (r.name_first === pokemon1Name && r.name_second === pokemon2Name) ||
            (r.name_first === pokemon2Name && r.name_second === pokemon1Name)
        );

        if (result) {
            // Get winner's stats for more detailed display
            const winner = pokemonStats.find(p => p.name === result.winner_name);
            d3.select("#winner")
                .html(`
                    <h3>Winner: ${result.winner_name}!</h3>
                    <p>Type: ${winner.type1}${winner.type2 ? '/' + winner.type2 : ''}</p>
                    <p>Base Stats Total: ${winner.base_total}</p>
                `);
        } else {
            d3.select("#winner").text("No battle data available for these Pokémon");
        }
    }
});