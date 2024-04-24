document.addEventListener("DOMContentLoaded", function() {
    const margin = { top: 270, right: 30, bottom: 70, left: 100 };
    const width = 1000 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;
    const parseDate = d3.timeParse("%d/%m/%Y");
    const formatDate = d3.timeFormat("%d.%m.%Y"); // Changed to required format

    const europeanCountries = ['Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia_and_Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 
        'Denmark', 'Estonia', 'Faroe_Islands', 'Finland', 'France', 'Georgia', 'Germany', 'Gibraltar', 'Greece', 'Guernsey', 'Holy_See', 'Hungary', 
        'Iceland', 'Ireland', 'Isle_of_Man', 'Italy', 'Jersey', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 
        'Monaco', 'Montenegro', 'Netherlands', 'North_Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San_Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United_Kingdom'];

    const selector = d3.select("#country-selector");
    selector.selectAll("option")
        .data(europeanCountries)
        .enter().append("option")
        .attr("value", d => d)
        .text(d => d)
        .text(d => d ? d.replace(/_/g, ' ') : 'Select a country');
      
    const messageContainer = d3.select("#message-container");
    const focusLink = document.getElementById("focus-link");
    const svgContainer = d3.select("#chart-container");

    const svg = d3.select("#chart-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "5px");

    d3.json("filtered_european_data.json").then(function(data) {
      data.forEach(d => {
        d.date = parseDate(d.dateRep);
        d.cases = +d.cases;
      });

      let timer, playing = false;
      const dates = data.map(d => d.date);
      const uniqueDates = [...new Set(dates)].sort(d3.ascending);

      const updateChart = function(date) {
        const country = selector.property('value');
        const filteredData = data.filter(d => d.date <= date && d.countriesAndTerritories === country);
        const x = d3.scaleTime().range([0, width]).domain(d3.extent(filteredData, d => d.date));
        const y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(filteredData, d => d.cases)]);
        svg.selectAll("*").remove(); // Clear previous SVG contents

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%B %Y")))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g").call(d3.axisLeft(y));

        const line = d3.line().x(d => x(d.date)).y(d => y(d.cases));
        svg.append("path")
            .datum(filteredData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);
      
        // Circles for data points
        svg.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.cases))
            .attr("r", 5)
            .attr("fill", "red")
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("Date: " + formatDate(d.date) + "<br/>Cases: " + d.cases)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - (margin.left - 20))
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .style("font-size", "14px")
          .style("fill", "#777")
          .style("font-family", "sans-serif")
          .text("Total Number of Covid cases");

        svg.append("text")
          .attr("class", "chart-title")
          .attr("x", margin.left - 50)
          .attr("y", margin.top - 420)
          .style("font-size", "24px")
          .style("font-weight", "bold")
          .style("font-family", "sans-serif")
          .text("Total Number of Covid cases in " + country + " in the year 2020");
      };

  const sliderSvg = d3.select('#slider-range').append('svg')
      .attr('width', 920) // Increased width to accommodate button
      .attr('height', 100)
      .style("display", "none");

  const sliderG = sliderSvg.append('g')
      .attr('transform', 'translate(50,30)');

  const slider = d3.sliderBottom()
      .min(d3.min(uniqueDates))
      .max(d3.max(uniqueDates))
      .step(1000 * 60 * 60 * 24) // one day
      .width(800)
      .tickFormat(d3.timeFormat("%d %b %Y"))
      .ticks(5)
      .fill('#008000')
      .on('onchange', val => {
        updateChart(val);
      });

  sliderG.call(slider);

  // Adding play/pause button next to the slider
  const playButton = sliderSvg.append('foreignObject')
      .attr('x', 860)
      .attr('y', 20)
      .attr('width', 120)
      .attr('height', 50)
      .append("xhtml:button")
      .attr('class', 'play-pause-btn')
      .text('Play')
      .style("display", "none")
      .style("background-color", "#32CD32") // Initial color is green
            .on('click', function() {
                if (!playing) {
                    timer = setInterval(function() {
                        let date = slider.value();
                        const nextDate = new Date(date.getTime() + (1000 * 60 * 60 * 24));
                        if (nextDate > d3.max(uniqueDates)) {
                            clearInterval(timer);
                            playing = false;
                            this.textContent = 'Play';
                            this.style.backgroundColor = '#32CD32'; // Set to green when paused
                            d3.selectAll("circle").attr("pointer-events", "all"); // Enable mouse events on circles
                        } else {
                            slider.value(nextDate);
                            updateChart(nextDate);
                        }
                    }, 100); // Adjust time for faster/slower playback
                    playing = true;
                    this.textContent = 'Pause';
                    this.style.backgroundColor = '#EE4B2B'; // Set to red when playing
                    d3.selectAll("circle").attr("pointer-events", "none"); // Disable mouse events on circles during play
                } else {
                    clearInterval(timer);
                    playing = false;
                    this.textContent = 'Play';
                    this.style.backgroundColor = '#32CD32'; // Set to green when paused
                    d3.selectAll("circle").attr("pointer-events", "all"); // Enable mouse events on circles after pause
                }
            });

    // Event listener for when the country selection changes
    updateUIBasedOnSelection(selector.property('value'));

    // Update message visibility based on selection
    selector.on("change", function() {
      updateUIBasedOnSelection(this.value);
    });
    function updateUIBasedOnSelection(value) {
        if (value) {
            // If a country is selected, show the slider and play button, and hide the message
            sliderSvg.style("display", "block");
            playButton.style("display", "block");
            messageContainer.style("visibility", "hidden");
            svgContainer.style("display", "block");
            updateChart(slider.value()); // Assuming you have a function to update your chart
        } else {
            // If no country is selected, hide the slider and play button, and show the message
            sliderSvg.style("display", "none");
            playButton.style("display", "none");
            messageContainer.style("visibility", "visible");
            svgContainer.style("display", "none");
        }
      }
    
        focusLink.addEventListener("click", function(event) {
          event.preventDefault(); // Prevent the default anchor behavior
          // Hide the message container when the link is clicked
          messageContainer.style("visibility", "hidden");
          svgContainer.style("display", "none");
          // Focus on the dropdown to allow for immediate selection
          const dropdown = document.getElementById("country-selector");
          if (dropdown) {
              dropdown.focus();
          }
          return false;
      })
    });
 }); 