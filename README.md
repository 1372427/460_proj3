# Documentation
## Process Overview
Your development process.

## Data processing 
After I decided on my dataset, I used OpenRefine to clean it. There were several territories which were included with the states. I removed these data as they were missing 
years and were inconsistent with the information gathered for all data variables. I also removed some extra columns which I knew I would not be using. While cleaning the 
dataset, I was not sure which variables I wanted to visualize or how, so I kept the majority of them. 

One major problem with my dataset was duplicated entries. For several states, there were years in which there were multiple different entries. I deleted the data which did
not seem to match the neighboring years for the state. Most of these duplicated entries were missing some variables, and were easy to pick out.

Once the data was clean, I used it to import with D3. In doing so, I derived some information, such as the revenue per student, by applying simple arithmetric operations to two variables. I also used a seperate website to get the inflation per years compared to the starting year of 1993. I used this to convert all monetary values to be comparable
to the value in 1993 and therefore able to compare across the years. 


## Design process
When looking at the different data variables, I had several ideas about which visualization to use. I could have used line charts, but with 50 different states, 
it would be hard to seperate individual states. 

What you analyzed about the data in terms of data variables and how that informed your choice of visualization.
Your design for the visualization: what channels and marks are in use and why did you choose them? What scales and axes are in use and why did you use them? What other information (e.g., legends) did you use and why did you use them?
- Color -> logarithmic or linear or banded
- Legend -> Adds or detracts? Confuses the user?


## Interactions
### Animation
I used animation to show data across time. The user can also use a slider to view individual years.

### Scrolling
I used scrolling as a way of changing which data variable was being displayed. This helps give structure rather than having the user be able to pick 
which variable they are viewing. This also allowed me to have an explanation of what is being shown.

### Tooltip

### Color Scale 
The user can pick which 

What are the interactions in the visualization? Why did you use each one? What aspect of working with data does the interaction address?
- Animation
- Scrolling
- Tooltip
- Toggle legend based on year

## Project Experience 
Overall project experience.



# Resources
I used several resources throughout this project. I used resources for D3 interactions, CSS styling, and for data processing.

 * The data shown in this visualization is from a Kaggle database: https://www.kaggle.com/noriuk/us-education-datasets-unification-project 

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

* The following site was the base for the interaction on the stacked area charts
https://bl.ocks.org/fabiomainardi/3976176cb36e718a608f

- Use legend with values?  Scale w min/max and rollover for individual values, start at 0(?)
- Sizing