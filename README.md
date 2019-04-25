# Documentation
## Process Overview
Your development process.

## Data processing 
How you worked with the data.
- Cleaning
- Inflation
- Derived information

## Design process
What you analyzed about the data in terms of data variables and how that informed your choice of visualization.
Your design for the visualization: what channels and marks are in use and why did you choose them? What scales and axes are in use and why did you use them? What other information (e.g., legends) did you use and why did you use them?
- Color -> logarithmic or linear or banded
- Legend -> Adds or detracts? Confuses the user?


## Interactions
What are the interactions in the visualization? Why did you use each one? What aspect of working with data does the interaction address?
- Animation
- Scrolling
- Tooltip
- Toggle legend based on year

## Project Experience 
Overall project experience.



# Resources
I used several resources throughout this project. I used resources for D3 interactions, CSS styling, and for data processing.

 * This link shows how to get the height and width of a browser window. I used this to make the main SVG the size of the window:
https://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code 

* This link shows how to make a slider and animation in D3. This is what I used for the base of my visualization's animation by year: 
http://bl.ocks.org/darrenjaworski/5544599

* To style the slider, I used this W3Schools tutorial: 
https://www.w3schools.com/howto/howto_js_rangeslider.asp

* To style buttons, I used this W3Schools tutorial: 
https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_alert_buttons

* Legends are made using Susie Lu's D3 legend pacakge:
https://d3-legend.susielu.com/#color-examples 

* To account for inflation, I used this site to get the inflation for each year: 
https://www.usinflationcalculator.com/

* This link shows how to clear an SVG. I used this when updating the SVG on the tooltip.
https://stackoverflow.com/questions/22452112/nvd3-clear-svg-before-loading-new-chart/22453174

* This visual was based off of a New York Time's article which had a similar basis: 
https://www.nytimes.com/interactive/2018/11/07/us/politics/how-democrats-took-the-house.html