# MCC Ad Group Cleaner - Refinement #

Takes each keyword in an Ad Group, converts it to the campaign match type (exact or BMM), and then compares its context against the name of each ad group in the campaign. At this point it scores itself by similarity to the ad group name, and then moves itself into the most relevant ad group name within the campaign.


### Functionality / Features ###

* Manages keywords to relative Ad Groups based on Semantic Testing Similarity (STS) via an API (http://swoogle.umbc.edu/SimService/api.html)
* Creates copy of keywords to new relative Ad Group based on the STS score for the "Keyword" and "New Ad Group".
* "Pauses" the old keyword from the original Ad Group if new Ad Group is assigned. Then assigns a Label (MOVED STS) on the old keyword.
* Script uses a Google spreadsheet selector to manage Campaigns and Ad Groups: https://docs.google.com/spreadsheets/d/1BXRZjdnMqt9ushaPh34ZkC0KGhfgcF8K6-sCBcsje20/edit#gid=0
* Via the spreadsheet selector, we are able to run the script multiple times in a day at an interval for it to process only Campaigns that has not completed from the previous run, based on the "Last Started" and "Last Completed" values in the spreadsheet selector.


**Google Spreadsheet Selector Columns**

* ***Campaign Name***
* ***Ad Group*** (either "All" or a specific Ad Group)
* ***Skip*** (set "0" to skip the Campaign, or "1" to process it) 
* ***Last Started*** (assigns the current date when the Campaign is being processed)
* ***Last Completed*** (assigns the current date when the Campaign has finished processing)


### How do I get set up? ###

* On the Google Spreadsheet Selector, Assign the Campaigns and its Ad Groups Manually.
* Set Skip value to each Campaign.


### Change Log ###
ver 1.1

* Spreadsheet selector in place. 
* Fixed to iterate over "Enabled" Keywords only under a specified campaigns.
* optimized to minimize runtime by specifying