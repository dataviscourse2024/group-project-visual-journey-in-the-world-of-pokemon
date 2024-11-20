document.addEventListener("DOMContentLoaded", function () {
  const pokemonStatsUrl = "Dataset/Preprocessed/pokemon_stats_with_images.csv";
  const combatResultsUrl = "Dataset/Preprocessed/combats_results.csv";

  let pokemonStats = [];
  let combatResults = [];

  Promise.all([d3.csv(pokemonStatsUrl), d3.csv(combatResultsUrl)])
    .then(function ([statsData, combatData]) {
      pokemonStats = statsData;
      combatResults = combatData;
      // console.log("Pokemon Stats loaded:");
      // console.log("Combat Results loaded:");
      displayAllPokemonStats(pokemonStats);
      //d3.select("#pokemonVisualization").html("<h3>Select a Pokémon to see its visualization</h3>");
      initializeInterface();
      initializeBattleButton();
    })
    .catch(function (error) {
      console.error("Error loading data:", error);
      document.getElementById("winner").textContent =
        "Error loading Pokémon data";
    });

  d3.select(".stats-card").style("display", "none");

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
                    <td>${pokemon.type1}${
        pokemon.type2 ? "/" + pokemon.type2 : ""
      }</td>
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
    rows
      .on("mouseover", function () {
        d3.select(this).style("background-color", "#ff6347");
      })
      .on("mouseout", function () {
        d3.select(this).style("background-color", null);
      });

    rows.on("click", function (event) {
      rows.classed("selected", false);
      d3.select(this).classed("selected", true);
    });

    // on click on table - show visualization on right
    d3.select("#allPokemonStats").on("click", function (event) {
      const target = d3.select(event.target);

      if (target.node().tagName === "TD") {
        const row = target.node().parentNode;
        const pokemonName = row.cells[1].textContent; // pokemon name is 2nd column

        // Show the stats card
        d3.select(".stats-card").style("display", "block");

        // Update visualizations
        updateVisualization(pokemonName);
      }
    });
  }

  function updateVisualization(pokemonName) {
    const pokemon = pokemonStats.find((p) => p.name === pokemonName);
    if (pokemon) {
      renderRadarChart(pokemon);
      renderBoxPlot(pokemon);
      document.getElementById(
        "pokemonImage"
      ).src = `Dataset/images/pokemon_jpg/${pokemon.image_filename}`;
      document.getElementById("pokemonImage").style.display = "block";

      let genderDisplay = '';
        if (pokemon.percentage_male === "100") {
            genderDisplay = '<span class="gender-symbol">♂</span>';
        } else if (pokemon.percentage_male === "0") {
            genderDisplay = '<span class="gender-symbol">♀</span>';
        } else {
            genderDisplay = '<span class="gender-symbol">♂</span><span class="gender-symbol">♀</span>';
        }
        
      const statsHtml = `
            <div class="pokemon-info-grid">
                <div class="info-row">
                    <div class="info-label">Height</div>
                    <div class="info-value">${pokemon.height_m}'</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Weight</div>
                    <div class="info-value">${pokemon.weight_kg} KG</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Gender</div>
                    <div class="info-value">${genderDisplay}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Category</div>
                    <div class="info-value">${pokemon.category || 'Unknown'}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Abilities</div>
                    <div class="info-value">${pokemon.abilities || 'Unknown'}</div>
                </div>
            </div>
        `;
        d3.select("#pokemoncardStats").html(statsHtml);
    } else {
      console.error("Pokémon not found: ", pokemonName);
    }
  }

  // Section 1 - Right (Box Plot in Cell 4)
  function renderBoxPlot(pokemon) {
    const boxPlotContainer = d3.select("#boxPlotVisualization");
    boxPlotContainer.html("");

    void boxPlotContainer.node().offsetHeight;

    const containerWidth = boxPlotContainer.node().getBoundingClientRect().width;
    const containerHeight = boxPlotContainer.node().getBoundingClientRect().height;
    const chartSize = Math.min(containerWidth, containerHeight) * 0.95;

    const margin = {
        top: chartSize * 0.1,
        right: chartSize * 0.05,  // Reduced right margin
        bottom: chartSize * 0.15, // Increased bottom margin for rotated labels
        left: chartSize * 0.1
    };

    const width = chartSize - margin.left - margin.right;
    const height = chartSize - margin.top - margin.bottom;

    const svg = boxPlotContainer
        .append("svg")
        .attr("width", chartSize)
        .attr("height", chartSize)
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

    const x = d3
      .scaleBand()
      .domain(stats.map((d) => d.label))
      .range([0, width])
      .padding(0.4);

    const y = d3.scaleLinear().domain([0, 260]).range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .style("font-size", "12px")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)")
        .style("font-weight", "bold");

    svg.append("g").call(d3.axisLeft(y)).style("font-size", "12px");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("x", -(height / 2))
      .attr("dy", "0.5em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Stat Value");

    const colorScale = d3
      .scaleOrdinal()
      .domain(stats.map((d) => d.label))
      .range([
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
        "#FFEEAD",
        "#D4A5A5",
      ]);

    stats.forEach((stat) => {
      const group = svg.append("g");

      group
        .append("line")
        .attr("x1", x(stat.label) + x.bandwidth() / 2)
        .attr("x2", x(stat.label) + x.bandwidth() / 2)
        .attr("y1", y(stat.min))
        .attr("y2", y(stat.max))
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 2)
        .style("opacity", 0.5);

      group
        .append("rect")
        .attr("x", x(stat.label))
        .attr("y", y(stat.q3))
        .attr("width", x.bandwidth())
        .attr("height", y(stat.q1) - y(stat.q3))
        .attr("fill", colorScale(stat.label))
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 2)
        .style("opacity", 0.7);

      group
        .append("line")
        .attr("x1", x(stat.label))
        .attr("x2", x(stat.label) + x.bandwidth())
        .attr("y1", y(stat.median))
        .attr("y2", y(stat.median))
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 2);

      group
        .append("circle")
        .attr("cx", x(stat.label) + x.bandwidth() / 2)
        .attr("cy", y(stat.value))
        .attr("r", 6)
        .attr("fill", "#e74c3c")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

      const valueLabel = group
        .append("g")
        .attr(
          "transform",
          `translate(${x(stat.label) + x.bandwidth() + 5},${y(stat.value)})`
        );

      valueLabel
        .append("rect")
        .attr("x", -2)
        .attr("y", -10)
        .attr("width", 35)
        .attr("height", 20)
        .attr("fill", "#fff")
        .attr("stroke", "#2c3e50")
        .attr("rx", 3)
        .style("opacity", 0.8);

      valueLabel
        .append("text")
        .attr("x", 15)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(stat.value);
    });

    const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width * 0.85}, ${height * 0.1})`);  // Position in top-right corner inside plot

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
    void chartContainer.node().offsetHeight;

    const containerWidth = chartContainer.node().getBoundingClientRect().width;
    const containerHeight = chartContainer.node().getBoundingClientRect().height;
    const chartSize = Math.min(containerWidth, containerHeight);
    

    chartContainer.append("h3")
        .attr("class", "text-center mb-2")
        .style("font-size", "14px")
        .text(pokemon.name);

    RadarChart(chartContainer.node(), [stats], {
        w: chartSize,
        h: chartSize,
        maxValue: 175,
        levels: 5,
        color: "#FF0000",
        margin: chartSize * 0.1  // Dynamic margin based on chart size
    });
}

  function RadarChart(parentSelector, data, options) {

    const container = d3.select(parentSelector);
    const containerWidth = container.node().getBoundingClientRect().width;
    const containerHeight = container.node().getBoundingClientRect().height;
    const defaultSize = Math.min(containerWidth, containerHeight);

    const cfg = {
        w: defaultSize,          // Use container width instead of fixed 300
        h: defaultSize,          // Use container height instead of fixed 300
        maxValue: 175,
        levels: 5,
        color: "#ff4500",
        margin: defaultSize * 0.1  // 10% of size for margin
    };

    Object.assign(cfg, options);
    d3.select(parentSelector).select("svg").remove();

    const allAxis = data[0].map((d) => d.axis);
    const total = allAxis.length;
    const radius = Math.min(cfg.w / 2 - cfg.margin, cfg.h / 2 - cfg.margin);
    const angleSlice = (Math.PI * 2) / total;

    const svg = d3.select(parentSelector)
        .append("svg")
        .attr("width", cfg.w)
        .attr("height", cfg.h)
        .append("g")
        .attr("transform", `translate(${cfg.w/2}, ${cfg.h/2})`);

    // const rScale = d3
    //   .scaleLinear()
    //   .range([0, radius])
    //   .domain([0, cfg.maxValue]);

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
        .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
        .style("stroke", "#CDCDCD")
        .style("stroke-width", "1px");

        axis.append("text")
        .attr("class", "legend")
        .style("font-size", "11px")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", (d, i) => {
            const x = radius * 1.15 * Math.cos(angleSlice * i - Math.PI / 2);
            // Adjust label position based on quadrant
            if (Math.abs(x) < 1) return x + (x < 0 ? -10 : 10);
            return x;
        })
        .attr("y", (d, i) => {
            const y = radius * 1.15 * Math.sin(angleSlice * i - Math.PI / 2);
            // Adjust label position based on quadrant
            if (Math.abs(y) < 1) return y + (y < 0 ? -10 : 10);
            return y;
        })
        .text(d => d);

        const dataPoints = data[0].map((d, i) => ({
            x: radius * (d.value / cfg.maxValue) * Math.cos(angleSlice * i - Math.PI / 2),
            y: radius * (d.value / cfg.maxValue) * Math.sin(angleSlice * i - Math.PI / 2),
            value: d.value
        }));

        const radarLine = d3.lineRadial()
        .radius(d => d.value)
        .angle((d, i) => i * angleSlice)
        .curve(d3.curveLinearClosed);  // Use curveLinearClosed to ensure the path is closed

    // Convert data for the radar line
    const scaledData = data[0].map(d => ({
        value: (radius * d.value) / cfg.maxValue
    }));

    // Add the radar area
    svg.append("path")
        .datum(scaledData)
        .attr("d", radarLine)
        .style("fill", cfg.color)
        .style("fill-opacity", 0.3)
        .style("stroke", cfg.color)
        .style("stroke-width", "2px");

    // Add dots at each data point
    svg.selectAll(".dot")
        .data(dataPoints)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 4)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .style("fill", cfg.color);

    // Add value labels
    // svg.selectAll(".value-label")
    //     .data(dataPoints)
    //     .enter()
    //     .append("text")
    //     .attr("class", "value-label")
    //     .attr("x", d => d.x * 1.1)
    //     .attr("y", d => d.y * 1.1)
    //     .style("font-size", "10px")
    //     .style("fill", "#333")
    //     .text(d => d.value);
}

  //section 2 - Battle Arena
  function initializeInterface() {
    const dropdown1 = d3.select("#pokemon1");
    const dropdown2 = d3.select("#pokemon2");

    dropdown1.html("");
    dropdown2.html("");

    dropdown1.append("option").attr("value", "").text("Select Pokémon");

    dropdown2.append("option").attr("value", "").text("Select Pokémon");

    const sortedPokemon = [...pokemonStats].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    sortedPokemon.forEach((pokemon) => {
      dropdown1
        .append("option")
        .attr("value", pokemon.name)
        .text(`${pokemon.name}`);

      dropdown2
        .append("option")
        .attr("value", pokemon.name)
        .text(`${pokemon.name}`);
    });

    dropdown1.on("change", function () {
      updatePokemonDisplay(1);
    });

    dropdown2.on("change", function () {
      updatePokemonDisplay(2);
    });

    updatePokemonDisplay(1);
    updatePokemonDisplay(2);
  }

  function updatePokemonDisplay(pokemonNumber) {
    const dropdownId = `pokemon${pokemonNumber}`;
    const imageId = `pokemon${pokemonNumber}Image`;
    const selectedName = d3.select(`#${dropdownId}`).property("value");
    // console.log(selectedName)
    const pokemon = pokemonStats.find((p) => p.name === selectedName);
    const imgElement = d3.select(`#${imageId}`);

    if (pokemon && pokemon.image_exists === "True") {
      const imagePath = `Dataset/images/pokemon_jpg/${pokemon.image_filename}`;
      imgElement.attr("src", imagePath).attr("alt", `${pokemon.name} image`);

      // const statsHtml = `
      //     <div class="pokemon-stats">
      //         <p>Type: ${pokemon.type1}${pokemon.type2 ? '/' + pokemon.type2 : ''}</p>
      //         <p>HP: ${pokemon.hp}</p>
      //         <p>Attack: ${pokemon.attack}</p>
      //         <p>Defense: ${pokemon.defense}</p>
      //         <p>Sp. Attack: ${pokemon.sp_attack}</p>
      //         <p>Sp. Defense: ${pokemon.sp_defense}</p>
      //         <p>Speed: ${pokemon.speed}</p>
      //     </div>
      // `;
      // d3.select(`#pokemon${pokemonNumber}Stats`).html(statsHtml);
    } else {
      imgElement
        .attr("src", "Dataset/images/pokemon_jpg/Pokeball.jpg")
        .attr("alt", "Select a Pokémon");
      d3.select(`#pokemon${pokemonNumber}Stats`).html("");
    }
  }

  function initializeBattleButton() {
    const battleButton = document.getElementById("battleButton");
    if (battleButton) {
      battleButton.addEventListener("click", calculateWinner);
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

    const result = combatResults.find(
      (r) =>
        (r.name_first === pokemon1Name && r.name_second === pokemon2Name) ||
        (r.name_first === pokemon2Name && r.name_second === pokemon1Name)
    );

    const pokemon1 = pokemonStats.find((p) => p.name === pokemon1Name);
    const pokemon2 = pokemonStats.find((p) => p.name === pokemon2Name);
    // console.log(pokemon1)
    // console.log(pokemon2)

    const stats1 = [
      pokemon1.hp,
      pokemon1.attack,
      pokemon1.defense,
      pokemon1.sp_attack,
      pokemon1.sp_defense,
      pokemon1.speed,
    ];
    const stats2 = [
      pokemon2.hp,
      pokemon2.attack,
      pokemon2.defense,
      pokemon2.sp_attack,
      pokemon2.sp_defense,
      pokemon2.speed,
    ];
    // console.log(stats1)
    // console.log(stats2)

    if (result) {
      const winner = pokemonStats.find((p) => p.name === result.winner_name);
      d3.select("#winner").html(`
                    <h3>Winner: ${result.winner_name}!</h3>
                `);
      // .html(`
      //     <h3>Winner: ${result.winner_name}!</h3>
      //     <p>Base Stats Total: ${winner.base_total}</p>
      // `);
    } else {
      // d3.select("#winner").html("<h3>No battle data available for these Pokémon</h3>");
      const sumStats1 = stats1.reduce((sum, stat) => sum + parseInt(stat), 0);
      const sumStats2 = stats2.reduce((sum, stat) => sum + parseInt(stat), 0);
      let winnerName, winnerTotal;
      if (sumStats1 > sumStats2) {
        winnerName = pokemon1Name;
        winnerTotal = sumStats1;
      } else if (sumStats2 > sumStats1) {
        winnerName = pokemon2Name;
        winnerTotal = sumStats2;
      } else {
        winnerName = "It's a tie!";
        winnerTotal = sumStats1;
      }

      // d3.select("#winner")
      //     .html(`
      //         <h3>Winner: ${winnerName}!</h3>
      //         <p>Base Stats Total: ${winnerTotal}</p>
      //     `);
      d3.select("#winner").html(`
                    <h3>Winner: ${winnerName}!</h3>
                `);
    }

    // Create battle visualization container
    const battleContainer = d3.select(".battle-container");
    let visualizationDiv = battleContainer.select("#battleVisualizations");

    if (visualizationDiv.empty()) {
      visualizationDiv = battleContainer
        .append("div")
        .attr("id", "battleVisualizations")
        .attr("class", "battle-visualizations");
    }

    visualizationDiv.html(`
            <div class="battle-charts">
                <div id="barChart"></div>
                <div id="lineChart"></div>
            </div>
        `);

    const statsLabels = [
      "HP",
      "Attack",
      "Defense",
      "Sp. Attack",
      "Sp. Defense",
      "Speed",
    ];

    createBarChart(statsLabels, stats1, stats2, pokemon1Name, pokemon2Name);
    createLineChart(statsLabels, stats1, stats2, pokemon1Name, pokemon2Name);
  }

  function createBarChart(labels, stats1, stats2, pokemon1Name, pokemon2Name) {
    d3.select("#barChart").html("");

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select("#barChart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Stats Comparison (Bar Chart)");

    const x = d3.scaleBand().range([0, width]).domain(labels).padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, Math.max(...stats1, ...stats2)])
      .range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    svg.append("g").call(d3.axisLeft(y));

    svg
      .selectAll(".bar1")
      .data(stats1)
      .enter()
      .append("rect")
      .attr("class", "bar1")
      .attr("x", (d, i) => x(labels[i]))
      .attr("width", x.bandwidth() / 2)
      .attr("y", height) // Start at the bottom (height)
      .attr("height", 0) // Start with 0 height
      .attr("fill", "#FF4136")
      .attr("opacity", 0.7)
      .transition() // Add transition
      .duration(1000) // Duration of animation
      .attr("y", (d) => y(d)) // Animate to the correct y position
      .attr("height", (d) => height - y(d)); // Animate the height

    svg
      .selectAll(".bar2")
      .data(stats2)
      .enter()
      .append("rect")
      .attr("class", "bar2")
      .attr("x", (d, i) => x(labels[i]) + x.bandwidth() / 2)
      .attr("width", x.bandwidth() / 2)
      .attr("y", height) // Start at the bottom (height)
      .attr("height", 0) // Start with 0 height
      .attr("fill", "#0074D9")
      .attr("opacity", 0.7)
      .transition() // Add transition
      .duration(1000) // Duration of animation
      .attr("y", (d) => y(d)) // Animate to the correct y position
      .attr("height", (d) => height - y(d)); // Animate the height

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 100}, 0)`);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "#FF4136")
      .style("opacity", 0.7);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 25)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "#0074D9")
      .style("opacity", 0.7);

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(pokemon1Name);

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 34)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(pokemon2Name);
  }

  function createLineChart(labels, stats1, stats2, pokemon1Name, pokemon2Name) {
    d3.select("#lineChart").html("");

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select("#lineChart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Stats Comparison (Line Chart)");

    const x = d3.scalePoint().range([0, width]).domain(labels);

    const y = d3
      .scaleLinear()
      .domain([0, Math.max(...stats1, ...stats2)])
      .range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    svg.append("g").call(d3.axisLeft(y));

    const line = d3
      .line()
      .x((d, i) => x(labels[i]))
      .y((d) => y(d));

    svg
      .append("path")
      .datum(stats1)
      .attr("fill", "none")
      .attr("stroke", "#FF4136")
      .attr("stroke-width", 2)
      .attr("d", line)
      .attr("stroke-dasharray", function () {
        return this.getTotalLength();
      }) // Initially, path is not drawn
      .attr("stroke-dashoffset", function () {
        return this.getTotalLength();
      }) // Set the dash offset to the length of the path
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0); // Draw the path by animating the dash offset to 0

    svg
      .append("path")
      .datum(stats2)
      .attr("fill", "none")
      .attr("stroke", "#0074D9")
      .attr("stroke-width", 2)
      .attr("d", line)
      .attr("stroke-dasharray", function () {
        return this.getTotalLength();
      }) // Initially, path is not drawn
      .attr("stroke-dashoffset", function () {
        return this.getTotalLength();
      }) // Set the dash offset to the length of the path
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0);

    svg
      .selectAll(".dot1")
      .data(stats1)
      .enter()
      .append("circle")
      .attr("class", "dot1")
      .attr("cx", (d, i) => x(labels[i]))
      .attr("cy", (d) => y(d))
      .attr("r", 5)
      .attr("fill", "#FF4136")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1); // Fade in the dots with a transition

    svg
      .selectAll(".dot2")
      .data(stats2)
      .enter()
      .append("circle")
      .attr("class", "dot2")
      .attr("cx", (d, i) => x(labels[i]))
      .attr("cy", (d) => y(d))
      .attr("r", 5)
      .attr("fill", "#0074D9")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1); // Fade in the dots with a transition

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 100}, 0)`);

    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 18)
      .attr("y1", 9)
      .attr("y2", 9)
      .style("stroke", "#FF4136")
      .style("stroke-width", 2);

    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 18)
      .attr("y1", 34)
      .attr("y2", 34)
      .style("stroke", "#0074D9")
      .style("stroke-width", 2);

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(pokemon1Name);

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 34)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(pokemon2Name);
  }


function createEffectivenessMatrix(typeEffectivenessData) {
    d3.select("#typeEffectiveness").selectAll("*").remove();

    const types = [
        "fire", "water", "grass", "electric", "ice", "fighting", "poison",
        "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon",
        "dark", "steel", "fairy"
    ];

    const abbreviateType = (type) => {
        return type.slice(0, 3).toUpperCase();
    };

    const typeColors = {
        fire: { main: "#EE8130", light: "#ff9d57" },
        water: { main: "#6390F0", light: "#89aeff" },
        grass: { main: "#7AC74C", light: "#98e670" },
        electric: { main: "#F7D02C", light: "#ffe056" },
        ice: { main: "#96D9D6", light: "#b8ecea" },
        fighting: { main: "#C22E28", light: "#e54a43" },
        poison: { main: "#A33EA1", light: "#c655c4" },
        ground: { main: "#E2BF65", light: "#f5d989" },
        flying: { main: "#A98FF3", light: "#c4b2ff" },
        psychic: { main: "#F95587", light: "#ff7ca6" },
        bug: { main: "#A6B91A", light: "#c5db2d" },
        rock: { main: "#B6A136", light: "#d4bc45" },
        ghost: { main: "#735797", light: "#9173b5" },
        dragon: { main: "#6F35FC", light: "#915aff" },
        dark: { main: "#705746", light: "#8f735f" },
        steel: { main: "#B7B7CE", light: "#d6d6e7" },
        fairy: { main: "#D685AD", light: "#ffa7cf" }
    };

    const margin = { top: 120, right: 150, bottom: 100, left: 140 };
    const width = 800 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "4px")
        .style("padding", "10px")
        .style("pointer-events", "none")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)")
        .style("font-size", "14px");

    const svg = d3.select("#typeEffectiveness")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("width", "100%")
        .attr("height", "100%")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(types)
        .range([0, width])
        .padding(0.05);

    const y = d3.scaleBand()
        .domain(types)
        .range([0, height])
        .padding(0.05);

    const effectivenessColorScale = (value) => {
        if (value >= 2) return "#4ecdc4";
        if (value === 1) return "#ffffff";
        if (value > 0 && value <= 0.5) return "#ff6b6b";
        return "#444444";
    };

    const highlightRelated = (type, isAttacking = true) => {
        svg.selectAll(".cell rect")
            .style("opacity", 0.3);
        
        if (isAttacking) {
            svg.selectAll(".cell")
                .filter(d => d.attacker === type)
                .select("rect")
                .style("opacity", 1);
        } else {
            svg.selectAll(".cell")
                .filter(d => d.defender === type)
                .select("rect")
                .style("opacity", 1);
        }
    };

    const resetHighlight = () => {
        svg.selectAll(".cell rect")
            .style("opacity", 1);
    };

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -85)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text("Pokémon Type Effectiveness Matrix");

    const xLabels = svg.append("g")
        .selectAll(".xLabel")
        .data(types)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d) + x.bandwidth() / 2}, ${-25}) rotate(-45)`);

    xLabels.append("rect")
        .attr("x", -20)
        .attr("y", -10)
        .attr("width", 40)
        .attr("height", 20)
        .attr("fill", d => typeColors[d].main)
        .attr("rx", 4)
        .attr("ry", 4)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", typeColors[d].light);
            highlightRelated(d, true);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Attacking: ${d.charAt(0).toUpperCase() + d.slice(1)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", typeColors[d].main);
            resetHighlight();
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    xLabels.append("text")
        .attr("class", "xLabel")
        .attr("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", 5)
        .text(d => abbreviateType(d))
        // .text(d => d)
        .style("font-size", "12px")
        .style("fill", "white")
        .style("font-weight", "bold")
        .style("pointer-events", "none");

    const yLabels = svg.append("g")
        .selectAll(".yLabel")
        .data(types)
        .enter()
        .append("g")
        .attr("transform", d => `translate(0, ${y(d) + y.bandwidth() / 2})`);

    yLabels.append("rect")
        .attr("x", -100)
        .attr("y", -10)
        .attr("width", 80)
        .attr("height", 20)
        .attr("fill", d => typeColors[d].main)
        .attr("rx", 4)
        .attr("ry", 4)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", typeColors[d].light);
            highlightRelated(d, false);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Defending: ${d.charAt(0).toUpperCase() + d.slice(1)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", typeColors[d].main);
            resetHighlight();
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    yLabels.append("text")
        .attr("class", "yLabel")
        .attr("text-anchor", "middle")
        .attr("x", -60)
        .attr("y", 5)
        .text(d => d.charAt(0).toUpperCase() + d.slice(1))
        .style("font-size", "12px")
        .style("fill", "white")
        .style("font-weight", "bold")
        .style("pointer-events", "none");

    const cells = svg.selectAll(".cell")
        .data(types.flatMap(attackType => 
            types.map(defenseType => ({
                attacker: attackType,
                defender: defenseType,
                effectiveness: typeEffectivenessData[attackType][defenseType]
            }))
        ))
        .enter()
        .append("g")
        .attr("class", "cell");

    cells.append("rect")
        .attr("x", d => x(d.attacker))
        .attr("y", d => y(d.defender))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => effectivenessColorScale(d.effectiveness))
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).style("stroke", "#333").style("stroke-width", 2);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`
                <strong>${d.attacker.charAt(0).toUpperCase() + d.attacker.slice(1)}</strong> →
                <strong>${d.defender.charAt(0).toUpperCase() + d.defender.slice(1)}</strong><br>
                Effectiveness: ${d.effectiveness}×
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).style("stroke", "#ccc").style("stroke-width", 1);
            
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    cells.append("text")
        .attr("x", d => x(d.attacker) + x.bandwidth() / 2)
        .attr("y", d => y(d.defender) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", d => {
            if (d.effectiveness === 0) return "#ffffff";
            return d.effectiveness >= 2 ? "white" : "black";
        })
        .style("pointer-events", "none")
        .text(d => d.effectiveness === 1 ? "" : d.effectiveness);

    const legendData = [
        { value: 2, text: "Super Effective (2×-4×)", color: "#4ecdc4" },
        { value: 1, text: "Normal (1×)", color: "#ffffff" },
        { value: 0.5, text: "Not Very Effective (0.25×-0.5×)", color: "#ff6b6b" },
        { value: 0, text: "No Effect (0×)", color: "#444444" }
    ];

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + 20}, 0)`);

    const legendItems = legend.selectAll(".legendItem")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legendItem")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    legendItems.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", d => d.color)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);

    legendItems.append("text")
        .attr("x", 30)
        .attr("y", 15)
        .text(d => d.text)
        .style("font-size", "12px");

    svg.append("text")
        .attr("x", -height/2)
        .attr("y", -margin.left + 30)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Defending Type");

    svg.append("text")
        .attr("x", width/2)
        .attr("y", -60)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Attacking Type");
}

d3.json("/dataset/Preprocessed/type_effectiveness.json").then(function(data) {
        createEffectivenessMatrix(data);
    })

window.addEventListener('resize', () => {
    d3.json("/dataset/Preprocessed/type_effectiveness.json")
        .then(function(data) {
            createEffectivenessMatrix(data);
        })
        .catch(function(error) {
            console.error("Error loading the data:", error);
        });
});

});