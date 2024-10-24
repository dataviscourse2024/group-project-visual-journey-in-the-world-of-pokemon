document.addEventListener("DOMContentLoaded", function () {
    const pokemonStatsUrl = "Dataset/Preprocessed/pokemon_stats_with_images.csv";
    const combatResultsUrl = "Dataset/Preprocessed/combats_results.csv";

    let pokemonStats = [];
    let combatResults = [];

    Promise.all([
        d3.csv(pokemonStatsUrl),
        d3.csv(combatResultsUrl)
    ]).then(function([statsData, combatData]) {
        pokemonStats = statsData;
        combatResults = combatData;
        // console.log("Pokemon Stats loaded:");
        // console.log("Combat Results loaded:");
        displayAllPokemonStats(pokemonStats);
        d3.select("#pokemonVisualization").html("<h3>Select a Pokémon to see its visualization</h3>");
        initializeInterface();
    }).catch(function(error) {
        console.error("Error loading data:", error);
        document.getElementById("winner").textContent = "Error loading Pokémon data";
    });

    // Section 1 - Left
    function displayAllPokemonStats(pokemonStats) {
        let statsTable = `<table class="pokemon-stats-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>HP</th>
                    <th>Attack</th>
                    <th>Defense</th>
                    <th>Sp. Attack</th>
                    <th>Sp. Defense</th>
                    <th>Speed</th>
                </tr>
            </thead>
            <tbody>`;

        pokemonStats.forEach((pokemon, index) => {
            statsTable += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${pokemon.name}</td>
                    <td>${pokemon.type1}${pokemon.type2 ? '/' + pokemon.type2 : ''}</td>
                    <td>${pokemon.hp}</td>
                    <td>${pokemon.attack}</td>
                    <td>${pokemon.defense}</td>
                    <td>${pokemon.sp_attack}</td>
                    <td>${pokemon.sp_defense}</td>
                    <td>${pokemon.speed}</td>
                </tr>
            `;
        });

        statsTable += `</tbody></table>`;

        d3.select("#allPokemonStats").html(statsTable);
    }

    d3.select("#allPokemonStats").on("click", function(event) {
        const target = d3.select(event.target);
        
        if (target.node().tagName === "TD") {
            const row = target.node().parentNode; 
            const pokemonName = row.cells[1].textContent;  //pokemon name is 2nd column
            updateVisualization(pokemonName);
        }
    });

    function updateVisualization(pokemonName) {
        const pokemon = pokemonStats.find(p => p.name === pokemonName); 
        if (pokemon) {
            renderPokemonStatsChart(pokemon);
            renderRadarChart(pokemon)
        } else {
            console.error("Pokémon not found: ", pokemonName);
        }
    }

    // Section 1 - Right
    function renderPokemonStatsChart(pokemon) {
        const chartContainer = d3.select("#pokemonVisualization");
        
        chartContainer.html("");

        const svg = chartContainer.append("svg")
        .attr("width", 400)
        .attr("height", 200);

        const stats = [
            { label: "HP", value: pokemon.hp },
            { label: "Attack", value: pokemon.attack },
            { label: "Defense", value: pokemon.defense },
            { label: "Sp. Attack", value: pokemon.sp_attack },
            { label: "Sp. Defense", value: pokemon.sp_defense },
            { label: "Speed", value: pokemon.speed }
        ];

        const x = d3.scaleBand().domain(stats.map(d => d.label)).range([0, 400]).padding(0.2);
        const y = d3.scaleLinear().domain([0, 200]).range([200, 0]);

        svg.selectAll(".bar")
            .data(stats)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.label))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", d => 200 - y(d.value))
            .attr("fill", "#4285f4");

        svg.selectAll(".label")
            .data(stats)
            .enter()
            .append("text")
            .attr("x", d => x(d.label) + x.bandwidth() / 2)
            .attr("y", d => y(d.value) - 5)
            .attr("text-anchor", "middle")
            .text(d => d.value);
    }

    function RadarChart(parentSelector, data, options) {
        const cfg = {
            w: 600, 
            h: 600, 
            maxValue: 200, 
            levels: 5, 
            roundStrokes: true,
            color: d3.scaleOrdinal(d3.schemeCategory10) 
        };
    
        if (options) {
            Object.keys(options).forEach((key) => {
                cfg[key] = options[key];
            });
        }
    
        const radius = Math.min(cfg.w / 2, cfg.h / 2);
        const angleSlice = (Math.PI * 2) / cfg.maxValue;
    
        const svg = d3.select(parentSelector)
            .append("svg")
            .attr("width", cfg.w)
            .attr("height", cfg.h)
            .append("g")
            .attr("transform", `translate(${cfg.w / 2}, ${cfg.h / 2})`);
    
        for (let j = 0; j < cfg.levels; j++) {
            const levelFactor = radius * ((j + 1) / cfg.levels);
            svg.selectAll(".levels")
                .data(data[0])
                .enter()
                .append("line")
                .attr("class", "line")
                .attr("x1", (d, i) => levelFactor * (1 - Math.sin(i * angleSlice)))
                .attr("y1", (d, i) => levelFactor * (1 - Math.cos(i * angleSlice)))
                .attr("x2", (d, i) => levelFactor * (1 - Math.sin(i * angleSlice + angleSlice)))
                .attr("y2", (d, i) => levelFactor * (1 - Math.cos(i * angleSlice + angleSlice)))
                .attr("stroke", "grey")
                .attr("stroke-width", "0.3px")
                .attr("fill", "none");
        }
    
        const radarLine = d3.lineRadial()
            .radius(d => (d.value / cfg.maxValue) * radius)
            .angle((d, i) => i * angleSlice);
    
        const blob = svg.append("path")
            .datum(data[0])
            .attr("class", "radar-chart")
            .attr("d", radarLine)
            .style("fill", cfg.color(0))
            .style("fill-opacity", 0.5)
            .style("stroke", cfg.color(0))
            .style("stroke-width", 2);
    
        data[0].forEach((d, i) => {
            const angle = i * angleSlice;
            svg.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", radius * Math.sin(angle))
                .attr("y2", -radius * Math.cos(angle))
                .attr("stroke", "black")
                .attr("stroke-width", "1px");
            
            svg.append("text")
                .attr("x", (radius + 10) * Math.sin(angle))
                .attr("y", -(radius + 10) * Math.cos(angle))
                .text(d.axis)
                .style("font-size", "10px");
        });
    }

    function renderRadarChart(pokemon) {
        const stats = [
            { axis: "HP", value: pokemon.hp },
            { axis: "Attack", value: pokemon.attack },
            { axis: "Defense", value: pokemon.defense },
            { axis: "Sp. Attack", value: pokemon.sp_attack },
            { axis: "Sp. Defense", value: pokemon.sp_defense },
            { axis: "Speed", value: pokemon.speed }
        ];
        
        const chartContainer = d3.select("#pokemonVisualization"); 
        const radarChartSize = 300;
    
        chartContainer.html(""); 
        chartContainer.append("h3").text(`${pokemon.name}`);
    
        RadarChart(chartContainer.node(), [stats], {
            w: radarChartSize,
            h: radarChartSize,
            maxValue: 200,
            levels: 5,
            roundStrokes: true,
            color: d3.scaleOrdinal().range(["#4285f4"])
        });
    }

    function renderPokemonStatsProgress(pokemonStats) {
        const container = d3.select("#allPokemonStats");
        container.html("");
    
        pokemonStats.forEach(pokemon => {
            const pokemonDiv = container.append("div").attr("class", "pokemon-stats-block");
    
            pokemonDiv.append("h3").text(`${pokemon.name}`);
    
            const stats = [
                { label: "HP", value: pokemon.hp },
                { label: "Attack", value: pokemon.attack },
                { label: "Defense", value: pokemon.defense },
                { label: "Sp. Attack", value: pokemon.sp_attack },
                { label: "Sp. Defense", value: pokemon.sp_defense },
                { label: "Speed", value: pokemon.speed }
            ];
    
            stats.forEach(stat => {
                const statDiv = pokemonDiv.append("div").attr("class", "stat-bar");
    
                statDiv.append("span").text(`${stat.label}:`);
    
                const progressBar = statDiv.append("div").attr("class", "progress-bar");
    
                progressBar.append("div")
                    .attr("class", "progress-bar-fill")
                    .style("width", `${stat.value / 2}%`)
                    .text(stat.value);
            });
        });
    }
    


    //section 2 - Battle Arena
    function initializeInterface() {
        const dropdown1 = d3.select("#pokemon1");
        const dropdown2 = d3.select("#pokemon2");

        dropdown1.html("");
        dropdown2.html("");

        dropdown1.append("option")
            .attr("value", "")
            .text("Select Pokémon");
        
        dropdown2.append("option")
            .attr("value", "")
            .text("Select Pokémon");

        const sortedPokemon = [...pokemonStats].sort((a, b) => a.name.localeCompare(b.name));

        sortedPokemon.forEach(pokemon => {
            dropdown1.append("option")
                .attr("value", pokemon.name)
                .text(`${pokemon.name}`);
            
            dropdown2.append("option")
                .attr("value", pokemon.name)
                .text(`${pokemon.name}`);
        });

        dropdown1.on("change", function() {
            updatePokemonDisplay(1);
            calculateWinner();
        });

        dropdown2.on("change", function() {
            updatePokemonDisplay(2);
            calculateWinner();
        });

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
            // change default image if not found
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

        const result = combatResults.find(r => 
            (r.name_first === pokemon1Name && r.name_second === pokemon2Name) ||
            (r.name_first === pokemon2Name && r.name_second === pokemon1Name)
        );

        if (result) {
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