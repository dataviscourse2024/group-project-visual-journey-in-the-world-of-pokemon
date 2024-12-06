# **A Visual Journey in the World of Pokémon**

**Website Link:** [Explore the Pokémon World](https://dataviscourse2024.github.io/group-project-visual-journey-in-the-world-of-pokemon/)  
**Video Demonstration:** [Watch on YouTube](https://www.youtube.com/watch?v=x-ZoCTh1Xqc&feature=youtu.be)  

This project offers an interactive and engaging exploration of Pokémon data through visualizations and web-based interactivity. The platform allows users to delve into Pokémon stats, types, and effectiveness while enabling a dynamic and intuitive experience.

## **Features**
- **Interactive Visualizations:** Explore Pokémon stats using tables, radar charts, box plots, and images.
- **Battle Arena:** Simulate Pokémon battles to compare their stats and type effectiveness dynamically.
- **Dynamic Updates:** Click on any Pokémon name to update visualizations instantly.
- **Type Effectiveness Matrix:** Understand type strengths and weaknesses with an easy-to-navigate matrix.

## **Directory Structure**
```
├── assets/                      # Contains images, icons, and other assets
├── code/                        # Core logic and algorithms for stats and visualizations
│   ├── Pokemon_data_preprocessing.ipynb        # Pokémon data processing scripts
├── index.html                   # Main webpage file
├── styles.css                   # Styling for the platform
├── script.js                    # Interactive logic for web components
├── Dataset/
│   ├── pokemon_complete.csv        # Pokémon stats dataset
│   ├── combats.csv                 # Original Combat dataset
│   ├── images                      # Pokemon Images
│   ├── Preprocessed                # Preproccessed Dataset
│       ├── combats_results.csv                 # Preproccess Combat dataset
│       ├── pokemon_stats_with_images.csv       # Pokémon stats dataset after preprocessing
│       ├── type_effectiveness.json             # Type effectiveness dataset
├── Process_Book/                # Documentation of project processes and methodologies
├── Project_Proposal/            # Initial project proposal and planning documents
```

## **How to Run the Project**
1. Clone this repository:
   ```bash
   git clone https://github.com/username/pokemon-visual-journey.git
   cd pokemon-visual-journey
   ```
2. Open `index.html` in your browser to launch the application.
3. Explore various features designed to provide insights and interactivity:
   - **Select a Pokémon**: View detailed stats and interactive visualizations.
   - **Battle Arena**: Simulate Pokémon battles and compare their stats.
   - **Type Effectiveness Matrix**: Understand Pokémon strengths and weaknesses with ease.

## **Technologies Used**
- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: Python (for data preprocessing and analytics)  
- **Visualizations**: D3.js  

## **Contributing**
We welcome contributions to improve this project!

Follow these steps to contribute:
1. Fork this repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature"
   ```
4. Push your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## **Acknowledgments**
Special thanks to:
- The Pokémon Community for providing the inspiration and datasets.
- The course instructors and peers for guidance and feedback.
- All contributors for enhancing the project's functionality and user experience.