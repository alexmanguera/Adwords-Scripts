# Exact/Broad Organizer #

### Functionality / Features ###

A script which ads all the keywords from the campaign into a 'Negative keyword list'
Each time it runs, it checks the keywords in the campaign against those against the 'Negative keyword list' , and adds any that are not there.


### How do I get set up? ###

* Provide the Campaign Name where the script will be processed.
***var CAMPAIGN_NAME***

### Change Log ###
ver 1.0

* Iterate over all keywords in a Campaign and copy the keyword to the Negative keyword list.

ver 1.1

* Create Negative Keyword list based off of the Campaign.

ver 1.2

* Ability to run on multiple Campaigns by specifying the Campaign Names within the CAMPAIGN_NAME array.

* Search for Unused Negative Keywords and remove from the list.

ver 1.2.1 (Bug Fix)

* Searching of keywords that has Exact Match Type (has [ ] symbols).

ver 1.2.2 (Bug Fix)

* Resolve issue with Phrase Match Type keywords.

- - - - - - - - - - - - - - - - - - - - - 

# MCC Ad Checker #

### Functionality / Features ###

A google script that checks that active adgroups within active campaigns have 2 live ads present, other wise a notification is sent to designated email as an alert.

This alert will state the account name, as well as the campaign/adgroups that do not meet this requirement. 

### How do I get set up? ###

* Provide an email recipient for the report.
***var EMAIL***

* supply a manager-account-id if you want to process all accounts under a manager-account.If this is not empty, manager-account will be used instead of specific client-accounts.
***var MANAGER_ACCOUNT***

* Supply client-ids for all client-account that you want to process if manager-account is not specified.
***var CLIENT_ACCOUNTS***

### Change Log ###
ver 1.0

* Works for MCC Accounts

- - - - - - - - - - - - - - - - - - - - - 

# Bid Adjustment #

### Functionality / Features ###

Multi-Campaign capable.

### How do I get set up? ###

- Set constant values for both TARGET_CPA and UPPER_BID_LIMIT.
- Specify a single or multiple Campaign to process.

### Change Log ###
ver 1.0

* All results can only be seen within the log.

ver 1.1
 
* Apply value of upper-bid-limit (Max CPC) if new-bid is greater than upper-bid-limit.

ver 1.2

* Make use of array for Campaigns to allow processing of multiple Campaigns.

ver 1.3

* Allows to Compute for New Bid based on either ROAS method or conventional method.
* Select a method via the constant "var SELECTED_BID_METHOD".

ver 1.4

* Use "All-Time" bid as the new bid if keyword conversion for All-Time is not greater than 1.

ver 1.5

* Apply a limit to the increase (ex. 100%) and decrease (ex. 50%) of new bids based from the set upper-bid-limit (Max CPC).

ver 1.5.1

* Address issue with some incorrect results when checking for Min/Max percent increase/decrease of Bid from the Current CPC.
* Fix error with using new bid even if 0.00, instead use the existing CPC Bid as new Bid (no changes made to CPC of the keyword).

ver 2.0

* Complete overhaul of how Keyword iterations are made. Used KEYWORDS_PERFORMANCE_REPORT as initial query for keywords.
* More optimized implementation in terms of speed execution.

ver 2.0.1

* Fix issue when doing comparisons of Number values. Explicitly define the values as Numbers instead of the default string (javascript default).

ver 2.0.2

* Include output details such as keyword id and group id to determine duplicate keywords from separate ad groups.

- - - - - - - - - - - - - - - - - - - - - 

# Ad Group Cleaner - Refinement #

Takes each keyword in an Ad Group, converts it to the campaign match type (exact or BMM), and then compares its context against the name of each ad group in the campaign. At this point it scores itself by similarity to the ad group name, and then moves itself into the most relevant ad group name within the campaign.


### Functionality / Features ###

* Manages keywords to relative Ad Groups based on Semantic Testing Similarity (STS) via an API (http://swoogle.umbc.edu/SimService/api.html)
* Creates copy of keywords to new relative Ad Group based on the STS score for the "Keyword" and "New Ad Group".
* "Pauses" the old keyword from the original Ad Group if new Ad Group is assigned. Then assigns a Label (MOVED STS) on the old keyword.
* Script uses a Google spreadsheet selector to manage Campaigns and Ad Groups: https://docs.google.com/spreadsheets/d/1BXRZjdnMqt9ushaPh34ZkC0KGhfgcF8K6-sCBcsje20/edit#gid=0
* Via the spreadsheet selector, we are able to run the script multiple times in a day at an interval for it to process only Campaigns that has not completed from the previous run, based on the "Last Started" and "Last Completed" values in the spreadsheet selector.
* Move irrelevant keywords (low STS scores that does not meet specified threhold) to an Ad Group placeholder.

### How do I get set up? ###

* On the Google Spreadsheet Selector, Assign the Campaigns and its Ad Groups Manually.
* Set Skip value to each Campaign.
* Set the Threshold within the script to "0.0" to disable Threshold feature (moving of keywords to a placeholder).

**Google Spreadsheet Selector Columns**

* ***Campaign Name***
* ***Ad Group*** (either "All" or a specific Ad Group)
* ***Skip*** (set "0" to skip the Campaign, or "1" to process it) 
* ***Last Started*** (assigns the current date when the Campaign is being processed)
* ***Last Completed*** (assigns the current date when the Campaign has finished processing)


### Change Log ###
ver 1.1

* Spreadsheet selector in place. 
* Fixed to iterate over "Enabled" Keywords only under a specified campaigns.
* optimized to minimize runtime by specifying additional filters when querying.

ver 1.2

* Ability to move irrelevant (low STS keywords that does not meet threshold) to an Ad Group Placeholder.
* Creates the Ad Group placeholder if it does not exists.

ver 1.3

* Ability to Skip certain Ad Groups/Campaigns that are assigned with the label "STS_SKIP".

ver 1.4

* Processing of Temp_Storage (Ad Group for below-min-threshold keywords).
* Carry over the MaxCPC value of a moved keyword.
- - - - - - - - - - - - - - - - - - - - - 


# MCC A/B Testing Significance #

This script will monitor your AdGroups for creative tests that have hit statistical significance and notify you with an email so that you can take action.
The script keeps track of changes to any AdGroups so that it always knows when a new test has started without you having to keep track.
It applies labels to your Ads and then notifies you via email when the tests have completed.

* Improvements made to original script to work in MCC level.
* Implement feature that allows script to resume from last checked ad groups from previous run (same day).


###Functionality / Features ###

* Provides AB Split tests on Ad Groups for each Accounts.
* Sends out email result after each tests made.
* Makes use of a Google Spreadsheet as an account selector: https://docs.google.com/spreadsheets/d/1I1TGGHcKFoTDwS0ZywIXCc5QFn7QLq0rVZZbxPz8xNw/edit#gid=0


### How do I get set up? ###

* Provide correct email for the script to send reports to.
* Provide the below requirements:
//These come from the url when you are logged into AdWords
//Set these if you want your emails to link directly to the AdGroup:
(var __c = '2919914748') and (var __u = '8381103468')
* Assign the Google spreadsheet to use as the Account selector.


**Google Spreadsheet Selector Columns**

* ***Account Name***
* ***Account ID***
* ***Skip*** (set "0" to skip the Campaign, or "1" to process it) 
* ***Last Started*** (assigns the current date when the Campaign is being processed)
* ***Last Completed*** (assigns the current date when the Campaign has finished processing)

### Change Log ###
ver 2.0

* Allow script to work in MCC level.

ver 2.1

* Use a Google spreadsheet as account selector.
* Feature that will set when an Account has Last started and Last Completed run.

ver 2.2

* Implement a last checkpoint feature using Labels to processed Ad Groups from the previous run (within the same day).