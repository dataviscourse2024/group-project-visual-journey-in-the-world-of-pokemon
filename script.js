document.addEventListener("DOMContentLoaded", function () {
    const pokemonStatsUrl = "Dataset/Preprocessed/pokemon_stats_with_images.csv";
    const combatResultsUrl = "Dataset/Preprocessed/combats_results.csv";

    let pokemonStats = [];
    let combatResults = [];

    Promise.all([
        d3.csv(pokemonStatsUrl),
        d3.csv(combatResultsUrl)
    ]).then(function ([statsData, combatData]) {
        pokemonStats = statsData;
        combatResults = combatData;
        // console.log("Pokemon Stats loaded:");
        // console.log("Combat Results loaded:");
        displayAllPokemonStats(pokemonStats);
        //d3.select("#pokemonVisualization").html("<h3>Select a Pokémon to see its visualization</h3>");
        initializeInterface();
        initializeBattleButton(); 
    }).catch(function (error) {
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

        //Hover effects
        const rows = d3.selectAll(".pokemon-stats-table tbody tr");
        rows.on("mouseover", function() {
            d3.select(this).style("background-color", "#ff6347"); 
        })
        .on("mouseout", function() {
            d3.select(this).style("background-color", null);
        });

        rows.on("click", function(event) {
            rows.classed("selected", false);

            d3.select(this).classed("selected", true);

            const pokemonName = d3.select(this).attr("data-pokemon-name");
            updateVisualization(pokemonName);  
        });

        // on click on table - show visualization on right
        d3.select("#allPokemonStats").on("click", function (event) {
            const target = d3.select(event.target);

            if (target.node().tagName === "TD") {
                const row = target.node().parentNode;
                const pokemonName = row.cells[1].textContent;  //pokemon name is 2nd column
                updateVisualization(pokemonName);
            }
        });
    }

    function updateVisualization(pokemonName) {
        const pokemon = pokemonStats.find(p => p.name === pokemonName);
        console.log(pokemon)
        if (pokemon) {
            // renderPokemonStatsChart(pokemon);
            renderRadarChart(pokemon);
            renderBoxPlot(pokemon);
            console.log(pokemon.image_filename);
            document.getElementById("pokemonImage").src = `Dataset/images/pokemon_jpg/${pokemon.image_filename}`;
            document.getElementById("pokemonImage").style.display = "block";
        } else {
            console.error("Pokémon not found: ", pokemonName);
        }
    }

    // Section 1 - Right (Box Plot in Cell 4)
    function renderBoxPlot(pokemon) {
        const boxPlotContainer = d3.select("#boxPlotVisualization");
        boxPlotContainer.html("");

        const margin = { top: 50, right: 60, bottom: 60, left: 60 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = boxPlotContainer.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("class", "plot-title")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(`${pokemon.name}'s Stats Distribution`);

        const stats = [
            { label: "HP", value: pokemon.hp, min: 1, max: 255, q1: 60, median: 90, q3: 110 },
            { label: "Attack", value: pokemon.attack, min: 5, max: 185, q1: 70, median: 100, q3: 130 },
            { label: "Defense", value: pokemon.defense, min: 5, max: 230, q1: 60, median: 100, q3: 130 },
            { label: "Sp. Attack", value: pokemon.sp_attack, min: 10, max: 194, q1: 50, median: 90, q3: 120 },
            { label: "Sp. Defense", value: pokemon.sp_defense, min: 20, max: 230, q1: 60, median: 100, q3: 130 },
            { label: "Speed", value: pokemon.speed, min: 5, max: 180, q1: 50, median: 80, q3: 120 }
        ];

        const x = d3.scaleBand()
            .domain(stats.map(d => d.label))
            .range([0, width])
            .padding(0.4);

        const y = d3.scaleLinear()
            .domain([0, 260])
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .style("font-size", "12px")
            .selectAll("text")
            .style("font-weight", "bold");

        svg.append("g")
            .call(d3.axisLeft(y))
            .style("font-size", "12px");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left)
            .attr("x", -(height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Stat Value");

        const colorScale = d3.scaleOrdinal()
            .domain(stats.map(d => d.label))
            .range(["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD", "#D4A5A5"]);

        stats.forEach(stat => {
            const group = svg.append("g");

            group.append("line")
                .attr("x1", x(stat.label) + x.bandwidth() / 2)
                .attr("x2", x(stat.label) + x.bandwidth() / 2)
                .attr("y1", y(stat.min))
                .attr("y2", y(stat.max))
                .attr("stroke", "#2c3e50")
                .attr("stroke-width", 2)
                .style("opacity", 0.5);

            group.append("rect")
                .attr("x", x(stat.label))
                .attr("y", y(stat.q3))
                .attr("width", x.bandwidth())
                .attr("height", y(stat.q1) - y(stat.q3))
                .attr("fill", colorScale(stat.label))
                .attr("stroke", "#2c3e50")
                .attr("stroke-width", 2)
                .style("opacity", 0.7);

            group.append("line")
                .attr("x1", x(stat.label))
                .attr("x2", x(stat.label) + x.bandwidth())
                .attr("y1", y(stat.median))
                .attr("y2", y(stat.median))
                .attr("stroke", "#2c3e50")
                .attr("stroke-width", 2);

            group.append("circle")
                .attr("cx", x(stat.label) + x.bandwidth() / 2)
                .attr("cy", y(stat.value))
                .attr("r", 6)
                .attr("fill", "#e74c3c")
                .attr("stroke", "#fff")
                .attr("stroke-width", 2);

            const valueLabel = group.append("g")
                .attr("transform", `translate(${x(stat.label) + x.bandwidth() + 5},${y(stat.value)})`);

            valueLabel.append("rect")
                .attr("x", -2)
                .attr("y", -10)
                .attr("width", 35)
                .attr("height", 20)
                .attr("fill", "#fff")
                .attr("stroke", "#2c3e50")
                .attr("rx", 3)
                .style("opacity", 0.8);

            valueLabel.append("text")
                .attr("x", 15)
                .attr("y", 5)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text(stat.value);
        });

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width + 10}, 0)`);

        legend.append("circle")
            .attr("cx", 10)
            .attr("cy", 10)
            .attr("r", 6)
            .attr("fill", "#e74c3c")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);

        legend.append("text")
            .attr("x", 25)
            .attr("y", 15)
            .style("font-size", "12px")
            .text("Current Value");

        legend.append("rect")
            .attr("x", 5)
            .attr("y", 30)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "#4ECDC4")
            .style("opacity", 0.7);

        legend.append("text")
            .attr("x", 25)
            .attr("y", 40)
            .style("font-size", "12px")
            .text("Stat Range");
    }

    // // Section 1 - Right   ->   Cell 3
    // function renderPokemonStatsChart(pokemon) {
    //     const chartContainer = d3.select("#pokemonVisualization");

    //     chartContainer.html("");

    //     const svg = chartContainer.append("svg")
    //     .attr("width", 400)
    //     .attr("height", 200);

    //     const stats = [
    //         { label: "HP", value: pokemon.hp },
    //         { label: "Attack", value: pokemon.attack },
    //         { label: "Defense", value: pokemon.defense },
    //         { label: "Sp. Attack", value: pokemon.sp_attack },
    //         { label: "Sp. Defense", value: pokemon.sp_defense },
    //         { label: "Speed", value: pokemon.speed }
    //     ];

    //     const x = d3.scaleBand().domain(stats.map(d => d.label)).range([0, 400]).padding(0.2);
    //     const y = d3.scaleLinear().domain([0, 200]).range([200, 0]);

    //     svg.selectAll(".bar")
    //         .data(stats)
    //         .enter()
    //         .append("rect")
    //         .attr("class", "bar")
    //         .attr("x", d => x(d.label))
    //         .attr("y", d => y(d.value))
    //         .attr("width", x.bandwidth())
    //         .attr("height", d => 200 - y(d.value))
    //         .attr("fill", "#4285f4");

    //     svg.selectAll(".label")
    //         .data(stats)
    //         .enter()
    //         .append("text")
    //         .attr("x", d => x(d.label) + x.bandwidth() / 2)
    //         .attr("y", d => y(d.value) - 5)
    //         .attr("text-anchor", "middle")
    //         .text(d => d.value);
    // }

    // Section 1 - Right (Radar Chart in Cell 3)
    function renderRadarChart(pokemon) {
        if (!pokemon) {
            console.error("No pokemon data provided");
            return;
        }

        const stats = [
            { axis: "HP", value: pokemon.hp },
            { axis: "Attack", value: pokemon.attack },
            { axis: "Defense", value: pokemon.defense },
            { axis: "Sp. Atk", value: pokemon.sp_attack },
            { axis: "Sp. Def", value: pokemon.sp_defense },
            { axis: "Speed", value: pokemon.speed }
        ];

        const chartContainer = d3.select("#pokemonVisualization");
        chartContainer.html("");

        // Get the container dimensions
        const containerWidth = chartContainer.node().getBoundingClientRect().width;
        const containerHeight = chartContainer.node().getBoundingClientRect().height;
        const chartSize = Math.min(containerWidth, containerHeight) * 0.9; // 90% of the smallest dimension

        chartContainer.append("h3")
            .attr("class", "text-center mb-2")
            .style("font-size", "14px")
            .text(pokemon.name);

        RadarChart(chartContainer.node(), [stats], {
            w: chartSize,
            h: chartSize,
            maxValue: 200,
            levels: 5,
            color: "#4285f4"
        });
    }

    function RadarChart(parentSelector, data, options) {
        const cfg = {
            w: 300,
            h: 300,
            maxValue: 200,
            levels: 5,
            color: "#4285f4"
        };

        Object.assign(cfg, options);

        const allAxis = data[0].map(d => d.axis);
        const total = allAxis.length;
        const radius = Math.min(cfg.w / 2, cfg.h / 2);
        const angleSlice = Math.PI * 2 / total;

        const svg = d3.select(parentSelector)
            .append("svg")
            .attr("width", cfg.w)
            .attr("height", cfg.h)
            .append("g")
            .attr("transform", `translate(${cfg.w / 2}, ${cfg.h / 2})`);

        const rScale = d3.scaleLinear()
            .range([0, radius])
            .domain([0, cfg.maxValue]);

        for (let j = 0; j < cfg.levels; j++) {
            const levelFactor = radius * ((j + 1) / cfg.levels);

            svg.selectAll(".levels")
                .data([1])
                .enter()
                .append("circle")
                .attr("r", levelFactor)
                .style("fill", "none")
                .style("stroke", "#CDCDCD")
                .style("stroke-width", "0.5px");

            svg.append("text")
                .attr("x", 5)
                .attr("y", -levelFactor)
                .attr("fill", "#737373")
                .style("font-size", "10px")
                .text((j + 1) * (cfg.maxValue / cfg.levels));
        }

        const axis = svg.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");

        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => rScale(cfg.maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y2", (d, i) => rScale(cfg.maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
            .style("stroke", "#CDCDCD")
            .style("stroke-width", "1px");

        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("x", (d, i) => rScale(cfg.maxValue * 1.2) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y", (d, i) => rScale(cfg.maxValue * 1.2) * Math.sin(angleSlice * i - Math.PI / 2))
            .text(d => d);

        const dataPoints = data[0].map((d, i) => {
            return {
                x: rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2),
                y: rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2)
            };
        });

        const lineGenerator = d3.line()
            .x(d => d.x)
            .y(d => d.y);

        svg.append("path")
            .datum(dataPoints)
            .attr("d", lineGenerator)
            .style("fill", cfg.color)
            .style("fill-opacity", 0.3)
            .style("stroke", cfg.color)
            .style("stroke-width", "2px");

        svg.selectAll(".dot")
            .data(dataPoints)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("r", 4)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .style("fill", cfg.color);
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
        });
    
        dropdown2.on("change", function() {
            updatePokemonDisplay(2);
        });
    
    
        updatePokemonDisplay(1);
        updatePokemonDisplay(2);
    }


    function updatePokemonDisplay(pokemonNumber) {
        const dropdownId = `pokemon${pokemonNumber}`;
        const imageId = `pokemon${pokemonNumber}Image`;
        const selectedName = d3.select(`#${dropdownId}`).property("value");
        console.log(selectedName)
        const pokemon = pokemonStats.find(p => p.name === selectedName);
        const imgElement = d3.select(`#${imageId}`);
        
        if (pokemon && pokemon.image_exists === "True") {
            const imagePath = `Dataset/images/pokemon_jpg/${pokemon.image_filename}`;
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
            imgElement.attr("src", "Dataset/images/pokemon_jpg/1.jpg")
                .attr("alt", "Select a Pokémon");
            d3.select(`#pokemon${pokemonNumber}Stats`).html("");
        }
    }
    

    function initializeBattleButton() {
        const battleButton = document.getElementById('battleButton');
        if (battleButton) {
            battleButton.addEventListener('click', calculateWinner);
        }
    }
    function calculateWinner() {
        const pokemon1Name = d3.select("#pokemon1").property("value");
        const pokemon2Name = d3.select("#pokemon2").property("value");
    
        if (!pokemon1Name || !pokemon2Name) {
            d3.select("#winner").html("<h3>Select two Pokémon to battle!</h3>");
            return;
        }
    
        if (pokemon1Name === pokemon2Name) {
            d3.select("#winner").html("<h3>Please select different Pokémon!</h3>");
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
            d3.select("#winner").html("<h3>No battle data available for these Pokémon</h3>");
        }
    }
});