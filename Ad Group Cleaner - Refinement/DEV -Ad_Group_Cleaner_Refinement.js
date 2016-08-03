/**************

====================
Ad Group Refiner/Cleaner
Current Version: 1.3
====================

Change Log:
ver 1.1
- Spreadsheet selector in place.
- Fixed to iterate over "Enabled" Keywords only under a specified campaigns.
- optimized to minimize runtime by specifying additional filters when querying.
ver 1.2
- Ability to move irrelevant (low STS keywords that does not meet threshold) to an Ad Group Placeholder.
- Creates the Ad Group placeholder if it does not exists.
ver 1.3
- Ability to Skip certain Ad Groups/Campaigns that are assigned with the label "STS_SKIP".
**************/

var LABEL_NAME = "MOVED STS";
var LABEL_SKIP = "STS_SKIP";

// set minthresholdscore to "0" to disable it.
var MINTHRESHOLDSCORE = "0.8";
var ADGROUPPLACEHOLDER = "Temp_Storage";

//--------------------------------------------//
// Change these to the appropriate google spreadsheet document

// PRODUCTION:
//var SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/10raJpYF-FJ120iiModiCKwC1UAkhWURSKCo20ONL_pM/edit#gid=0';

// DEVELOPMENT:
var SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1BXRZjdnMqt9ushaPh34ZkC0KGhfgcF8K6-sCBcsje20/edit#gid=0';

var SHEET_NAME = 'Sheet1';

var ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
var sheet = ss.getSheetByName(SHEET_NAME);

// Log the last cell with data in it, and its co-ordinates.
var lastRow = sheet.getLastRow();
var lastColumn = sheet.getLastColumn();
var lastCell = sheet.getRange(lastRow, lastColumn);
//Logger.log('Last cell is at (%s,%s) and has value "%s".', lastRow, lastColumn, lastCell.getValue());

var currDate = getDateString(new Date(),'MM-dd-yyyy');
  
// Retrieve the account that has 'Skip' = '0' and store to array
var CAMPAIGN_NAME = [];

for(var i = 2; i <= lastRow; i++)
{
	var ssCampaignName = sheet.getRange(i, 1);
	var ssCampaignSkip = sheet.getRange(i, 2);
	var ssCampaignAdGroup = sheet.getRange(i, 3);
	//var ssCampaignLastCompleted = getDateString(new Date(sheet.getRange(i, 5).getValue()),'MM-dd-yyyy');
	var ssCampaignLastCompleted = sheet.getRange(i, 5);
	
	if(ssCampaignSkip.getValue() < '1' && ssCampaignLastCompleted.getValue() !== currDate)
	{
		CAMPAIGN_NAME.push(ssCampaignName.getValue());
	}
	else
	{
		continue; 
	}
}

//Helper function to format the date
function getDateString(date,format) {
	return Utilities.formatDate(new Date(date),AdWordsApp.currentAccount().getTimeZone(),format); 
}
//--------------------------------------------//


function main()
{
	
	// ===============================================================================================
	// Jaro Winkler
	var calculateMatch = (function() {
		var jaroDistance = function(string1, string2) {
			// Returns Jaro Distance
			var l1 = string1.length,
				l2 = string2.length,
				matchedIndexes = [],
				matchedIndexes2 = [],
				numberMatched = 0;
				transpositions = 0,
				halfTranspositions = 0,
				maxDistance = Math.floor(Math.max(l1,l2)/2)-1,
				jd = 0; // jaro distance
				
			var inDistance = function(distance) { 
				if (distance <= maxDistance) {
					return true;
				} else {
					return false;	
				}
			}
			
			// count the matches
			var getMatching = function(topString, bottomString) {
				// first time calling this function
				// matches will be empty...  The second time we 
				// just need to do a basic comparison
				var tsLength = topString.length,
					bsLength = bottomString.length,
					tempMatchedIndexes = [],
					matches = [];

				for (var a = 0; a < tsLength; a++) {
					var matchFound = (function () {
						for (var b = 0; b < bsLength; b++) {
							if (topString[a] === bottomString[b]) {
								//string1[a] and string2[b] match
								if (tempMatchedIndexes.indexOf(b) === -1) {
									// index b has not been indexed yet
									if (inDistance(Math.abs(a-b))) {
										// the character is within distnace
										tempMatchedIndexes.push(b);
										matches.push(topString[a]);
										return true;
									} else {
										return false;
									}
								} else {
									//ALREADY BEEN INDEXED	
								}
							}	
						}
						return false;
						}());
					if (!matchFound) {
						tempMatchedIndexes.push("-");
					}	
				}
				return matches;
			
			}
			matchedIndexes = getMatching(string1, string2);
			matchedIndexes2 = getMatching(string2, string1);
			numberMatched = matchedIndexes.length;
			
			for (var a = 0; a < numberMatched; a++) {
				if (matchedIndexes[a] !== matchedIndexes2[a]) {
					halfTranspositions++;
				}	
			}
			
			transpositions = halfTranspositions/2;
			jd = ((numberMatched/l1) + (numberMatched/l2) + ((numberMatched-transpositions)/numberMatched))/3;
			return jd;
		};

		var jwDistance = function(string1,string2, leadingCharactersToScore, scorePerMatch) {
			// Returns Jaro-Winkler Distance
			leadingCharactersToScore = leadingCharactersToScore || 2;
			scorePerMatch = scorePerMatch || .1; // should not be greater than .25
			var jd = jaroDistance(string1,string2);
			var jw = jd+((leadingCharactersToScore*scorePerMatch)*(1-jd));
			return jw;	
		}

		var lsDistance = function(pattern, text) {
			//  Returns Levenshtein Distance
			var i = 0,
				i2 = 0,
				matrix = [], // text.length by pattern.length matrix
				width = text.length, // n
				height = pattern.length; // m
			
			var blankArray = function(length) {
				var temp = [];
				for (var a = 0; a < length; a++) {
					temp[a] = 0;	
				}
				return temp;
			}
				
			for (i = 0; i <= width; i++) {
				matrix[i] = blankArray(height+1);
				matrix[i][0] = i;
			}
			
			for (i = 0; i <= height; i++) {
				matrix[0][i] = i;	
			}
			
			for (i = 1; i <= height; i++) {
				for (i2 = 1; i2 <= width; i2++) {
					if (pattern[i-1] === text[i2-1]) {
						matrix[i2][i] = matrix[i2-1][i-1];	
					} else {
						var deletion = matrix[i2-1][i] + 1;
						var insertion = matrix[i2][i-1] + 1;
						var substitution = matrix[i2-1][i-1] + 1;
						matrix[i2][i] = Math.min(deletion, insertion, substitution);									
					}
				}
			}
			return matrix[width][height];
		};

		return {
			lsDistance:lsDistance,
			jwDistance:jwDistance,
			jaroDistance:jaroDistance	
		};
	}());
	// ===============================================================================================
		
	// --------------------------------------------------------------
	// process all keywords within a specified adGroup and Campaign.
	// --------------------------------------------------------------
	function processCleanerSpecificCampaignAdGroup(campaignName) {
		
		// ------------------------------------------------- //
		// check and create the placeholder ad group if not exists.
		if(MINTHRESHOLDSCORE != "0.0")
		{
			if(addAdGroup(campaignName, ADGROUPPLACEHOLDER))
			{
				Logger.log("Creating new Ad Group Placeholder (" + ADGROUPPLACEHOLDER + ")...");
			}
		}
		// ------------------------------------------------- //
		// check to see if label name has already been created.
		// LABEL_SKIP
		if(getLabelsByName(LABEL_SKIP) == false)
		{
			Logger.log("Label (" + LABEL_SKIP + ") does not exist. Creating this Label once...");
			AdWordsApp.createLabel(LABEL_SKIP);
		}
		// ------------------------------------------------- //
		
		var campaignIterator = AdWordsApp.campaigns()
			.withCondition('Name = "' + campaignName + '"')
			.withCondition('LabelNames CONTAINS_NONE ["' + LABEL_SKIP + '"]')
			.get();
		if (campaignIterator.hasNext())
		{
			var campaign = campaignIterator.next();
			
			Logger.log('*******************');
			Logger.log('Processing Campaign: ' + campaignName + '...');
			Logger.log('Skipping with Label: ' + LABEL_SKIP + '...');
			
			// ------------------------------------------------- //		  
			for(var y = 2; y <= lastRow; y++)
			{
				var tempCampaignName = sheet.getRange(y, 1);
				if(tempCampaignName.getValue() == campaignName)
				{
					// set the "Last Started" column
					sheet.getRange(y, 4).setValue(currDate);
					var ssSelectedAdGroup = sheet.getRange(y, 3).getValue();
				}
			}			 
			// ------------------------------------------------- //

			// ----------------------------------------
			// check if to process (a specific ad group) or (all ad groups) under the campaign.
			// includes or excludes the .withCondition()
			var whatAdGroup = ssSelectedAdGroup.length;
			
			if(ssSelectedAdGroup != "All")
			{
				var adGroupIterator = campaign.adGroups()
					.withCondition('Name = "'+ssSelectedAdGroup+'"')
					.withCondition('LabelNames CONTAINS_NONE ["' + LABEL_SKIP + '"]')
					.withCondition("Status = ENABLED")
					.get();
				
				var skipAdGroupValue = false;
				
				Logger.log('Ad Group to Process: ' + ssSelectedAdGroup + '\n');
				//Logger.log('X Total adGroups found : ' + adGroupIterator.totalNumEntities());
				
				if(adGroupIterator.hasNext())
				{
					var adGroup = adGroupIterator.next();
					
					//var keywordIterator = adGroup.keywords().get();
						
					// skip keywords that has been labeled with "MOVED_STS".
					var keywordIterator = adGroup.keywords()
						.withCondition('LabelNames CONTAINS_NONE ["' + LABEL_NAME + '"]')
						.withCondition("Status = ENABLED")
						.get();
					
					Logger.log('Total Keywords found : ' + keywordIterator.totalNumEntities());
					
					if(keywordIterator.hasNext())
					{
						while(keywordIterator.hasNext())
						{
							var keyword = keywordIterator.next();
							var originalAdGroup = keyword.getAdGroup().getName();
							
							// just notify if this keyword is already PAUSED and would skip it.
							if(keyword.isPaused() == true)
							{
								Logger.log("IS PAUSED: " + keyword.getText());
								continue;
							}
							//-----------------------------------------------------------------
							
							// skip checking semantic similarity if keyword and adgroup is a perfect match.
							if(keyword.getText() == originalAdGroup)
							{
								Logger.log("Skip Moving... Keyword: " + keyword.getText() + " and Ad Group: " + originalAdGroup + " is already a perfect match!");
								continue;
							}
							else
							{
								Logger.log(getAdGroups(campaignName, keyword.getText(), originalAdGroup, skipAdGroupValue));
							}
						}
						// ------------------------------------------------- //		  
						for(var y = 2; y <= lastRow; y++)
						{
							var tempCampaignName = sheet.getRange(y, 1);
							if(tempCampaignName.getValue() == campaignName)
							{
								// set the "Last Completed" column
								sheet.getRange(y, 5).setValue(currDate);
							}
						}			 
						// ------------------------------------------------- //
					}
					else
					{
						Logger.log("No Keywords found!");	
					}
					Logger.log('\n=====');
					Logger.log("Done!");
					Logger.log('=====');
				}
				else
				{
					Logger.log("No available Ad Group found: " + ssSelectedAdGroup);
				}
			}
			else
			{
				var adGroupIterator = campaign.adGroups()
					.withCondition('LabelNames CONTAINS_NONE ["' + LABEL_SKIP + '"]')
					.withCondition('Name != "'+ADGROUPPLACEHOLDER+'"')
					.withCondition("Status = ENABLED")
					.get();
								
				var skipAdGroupValue = true;
								
				Logger.log('Ad Groups to Process: All');
				Logger.log('Total adGroups found : ' + adGroupIterator.totalNumEntities());
				
				if(adGroupIterator.hasNext())
				{				
					while(adGroupIterator.hasNext())
					{
						var adGroup = adGroupIterator.next();
						
						Logger.log('==============================================================');
						Logger.log("\nCurrently Processing Ad Group: " + adGroup.getName() + "...");
												
						//var keywordIterator = adGroup.keywords().get();

						// skip keywords that has been labeled with "MOVED_STS".
						var keywordIterator = adGroup.keywords()
						.withCondition('LabelNames CONTAINS_NONE ["' + LABEL_NAME + '"]')
						.withCondition("Status = ENABLED")
						.get();
						
						Logger.log('Total Keywords: ' + keywordIterator.totalNumEntities());
						
						if(keywordIterator.hasNext())
						{
							while(keywordIterator.hasNext())
							{
								var keyword = keywordIterator.next();
								var originalAdGroup = keyword.getAdGroup().getName();
								
								// just notify if this keyword is already PAUSED and would skip it.
								if(keyword.isPaused() == true)
								{
									Logger.log("IS PAUSED: " + keyword.getText());
									continue;
								}
								//-----------------------------------------------------------------
							
								// skip checking semantic similarity if keyword and adgroup is a perfect match.
								if(keyword.getText() == originalAdGroup)
								{
									Logger.log("Skip Moving... Keyword: " + keyword.getText() + " and Ad Group: " + originalAdGroup + " is already a perfect match!");
									continue;
								}
								else
								{
									Logger.log(getAdGroups(campaignName, keyword.getText(), originalAdGroup, skipAdGroupValue));
								}
							}
						}
						else
						{
							Logger.log("No Keywords found!");	
						}
					}
					Logger.log('\n=====');
					Logger.log("Done!");
					Logger.log('=====');
				}
				else
				{
					Logger.log("No available Ad Group found: " + ssSelectedAdGroup);
				}
			}
			// ------------------------------------------------- //		  
			for(var y = 2; y <= lastRow; y++)
			{
				var tempCampaignName = sheet.getRange(y, 1);
				if(tempCampaignName.getValue() == campaignName)
				{
					// set the "Last Completed" column
					sheet.getRange(y, 5).setValue(currDate);
				}
			}			 
			// ------------------------------------------------- //
		}
		else
		{
			Logger.log("No available Campaign found: " + campaignName);
		}
	}
	// --------------------------------------------------------------
	
	
	
	function getLabelsByName(labelName) {
		var labelIterator = AdWordsApp.labels()
			.withCondition('Name = "'+labelName+'"')
			.get();
		if(labelIterator.hasNext())
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	// --------------------------------------------
	
	// --------------------------------------------
	function getExternal(keyworda, keywordb) {
		var url = "http://swoogle.umbc.edu/StsService/GetStsSim?operation=api&phrase1=" + keyworda + "&phrase2=" + keywordb;
		var result = UrlFetchApp.fetch(url).getContentText();
		return result;
	}
	// --------------------------------------------
	
	// --------------------------------------------
	function getAdGroups(campaignName, keyword, originalAdGroup, skipAdGroup) {
		//var adGroupIterator = AdWordsApp.adGroups().get();
		var adGroupIterator = AdWordsApp.adGroups()
							.withCondition('CampaignName CONTAINS "'+campaignName+'"')
							.withCondition('Name != "'+ADGROUPPLACEHOLDER+'"')
							.withCondition("Status = ENABLED")
							.withCondition('LabelNames CONTAINS_NONE ["' + LABEL_SKIP + '"]')
							.get();
		
		//Logger.log('Total adGroups found : ' + adGroupIterator.totalNumEntities());
		
		var selectedKeyword = '';
		var keywordScore = 0.0;
		var defaultScore = 0;
		var outputJaroResult = '';
		addKeywordProcess = false;
		adGroupNameForNewKeyword = "";
		var didNotMetMinThreshold = false;
		var tempStorageForInvalidKeywords = [];
		var selectedAdGroupName = "";
		
		// -------------------------------
		// check to see if label name has already been created.
		// LABEL_NAME
		if(getLabelsByName(LABEL_NAME))
		{
			var skipCreateNewLabel = true;
		}
		else
		{
			var skipCreateNewLabel = false;
		}
		// -------------------------------
		
		while (adGroupIterator.hasNext()) {
			var adGroup = adGroupIterator.next();
			var adGroupName = adGroup.getName();
			var adGroupNameForNewKeyword = adGroupName;
			
			var cleanAdGroupName = removeSpecialChars(adGroupName);
			var cleanKeyword = removeSpecialChars(keyword);
			
			// --------------------------------------------
			if(cleanKeyword.toLowerCase() == originalAdGroup.toLowerCase())
			{
				didNotMetMinThreshold = false;
				addKeywordProcess = false;
				selectedKeyword = "Skipping...!\nKeyword: ("+ keyword +") and Ad Group (" + originalAdGroup + ") is already a match!\n";
				break;
			}
			// --------------------------------------------
			
			// --------------------------------------------
			// skip checking Semantic Similarity if Keyword and new Ad Group is a perfect match.
			// just add the keyword to new ad group and pause from the old ad group.
			else if(cleanAdGroupName.toLowerCase() == cleanKeyword.toLowerCase())
			{
				didNotMetMinThreshold = false;
				addKeywordProcess = true;
				selectedAdGroupName = cleanAdGroupName;
				selectedKeyword = '(Perfect Match!)\nMoving keyword to new Ad Group...\nKeyword: ' + keyword + '\nAdGroup: ' + adGroupNameForNewKeyword + ' / Original: ' + originalAdGroup + '\nPaused this Keyword from Original Ad Group!\n';
				break;
			}
			// --------------------------------------------
			
			// initiate api call for Semantic Similarity			
			else
			{
				var semanticSimilarity = getExternal(cleanAdGroupName, cleanKeyword);
				
				// --------------------------------------------
				// In case of a semantic score tie, do a jaro winkler comparison.
				if(semanticSimilarity == keywordScore)
				{
					var formerAdGroupComboScore = calculateMatch.jwDistance(adGroupNameForNewKeyword, cleanKeyword);
					var newestAdGroupComboScore = calculateMatch.jwDistance(cleanAdGroupName, cleanKeyword);
					
					outputJaroResult = "Semantic Tie Found! Jaro Winkler implemented...\n(" + adGroupNameForNewKeyword +", " + cleanKeyword  + "): " + formerAdGroupComboScore + " vs (" + cleanAdGroupName +", " + cleanKeyword + "): " + newestAdGroupComboScore + "\n\n";
					
					if(newestAdGroupComboScore > formerAdGroupComboScore)
					{
						semanticSimilarity = newestAdGroupComboScore;
					}else{
						semanticSimilarity = formerAdGroupComboScore;			
					}
				}
				// --------------------------------------------
				
				// --------------------------------------------
				if(semanticSimilarity > keywordScore || semanticSimilarity == 1.0)
				{
					
					selectedAdGroupName = cleanAdGroupName;
					
					// --------------------------------------------
					// this method below will move the keyword to a temp placeholder when STS score is below min. threshold.
					if(semanticSimilarity < MINTHRESHOLDSCORE)
					{
						didNotMetMinThreshold = true;
						addKeywordProcess = false;
						
						tempStorageForInvalidKeywords.push(semanticSimilarity);
						continue;
					}
					// --------------------------------------------
					else
					{
						didNotMetMinThreshold = false;
						keywordScore = semanticSimilarity;	
						//adGroupNameForNewKeyword = cleanAdGroupName;
						// --------------------------------------------
						// skip if suggested Ad Group (new Ad Group) is the same with  Original Ad Group.
						if(selectedAdGroupName == originalAdGroup)
						{
							addKeywordProcess = false;
							selectedKeyword = "Skipping...!\nKeyword: ("+ keyword +"), New suggested Ad Group (" + selectedAdGroupName + ") is the same with Original Ad Group (" + originalAdGroup + ").\n";
							continue;
						}else{
						// --------------------------------------------
							addKeywordProcess = true;
							selectedKeyword = '(Winner!)\nMoving keyword to new Ad Group...\nKeyword: ' + keyword + '\nNew AdGroup: ' + selectedAdGroupName + ' / Original: ' + originalAdGroup + '\nScore: ' + keywordScore + 'Paused this Keyword from Original Ad Group!\n';
						}
					}
				}
			}
			// --------------------------------------------
		}
		
		if(didNotMetMinThreshold == true)
		{
			addKeyword(campaignName, ADGROUPPLACEHOLDER, keyword);
			pauseApplyLabelOldKeywordInAdGroup(campaignName, originalAdGroup, keyword, skipCreateNewLabel);
			// output all sts scores for this keyword.
			//selectedKeyword = "Keyword: ("+keyword+") - " + tempStorageForInvalidKeywords.join(", ");
			selectedKeyword = "Alert! STS Score for Keyword: (" + keyword + ") from Ad Group: (" + originalAdGroup + ") is below Minimum Threshold. Moved to placeholder:" + ADGROUPPLACEHOLDER + ".\n";
		}
		else if(addKeywordProcess == true)
		{
			addKeyword(campaignName, selectedAdGroupName, keyword);
			pauseApplyLabelOldKeywordInAdGroup(campaignName, originalAdGroup, keyword, skipCreateNewLabel);
		}
		//return outputJaroResult + selectedKeyword;
		return selectedKeyword;
	}
	// --------------------------------------------
	
	// --------------------------------------------
	function addKeyword(campaignName, adGroupName, keywordName) {
		var adGroupIterator = AdWordsApp.adGroups()
			.withCondition('CampaignName CONTAINS "'+campaignName+'"')
			.withCondition('Name = "'+adGroupName+'"')
			.get();

		if (adGroupIterator.hasNext()) {
			var adGroup = adGroupIterator.next();

			adGroup.newKeywordBuilder()
			.withText(keywordName)
			.build();
		}
	}
	// --------------------------------------------
	
	// --------------------------------------------
	function addAdGroup(campaignName, adGroupName) {
		var adGroupIterator = AdWordsApp.adGroups()
			.withCondition('CampaignName CONTAINS "'+campaignName+'"')
			.withCondition('Name = "'+adGroupName+'"')
			.get();
		if (!adGroupIterator.hasNext()) {
			var campaignIterator = AdWordsApp.campaigns()
				.withCondition('Name = "'+campaignName+'"')
				.get();
			var campaign = campaignIterator.next();
			var adGroupOperation = campaign.newAdGroupBuilder()
			.withName(adGroupName)
			.build();
			
			return true;
		}
		else
		{
			return false;
		}
	}
	// --------------------------------------------
	
	// --------------------------------------------
	function pauseApplyLabelOldKeywordInAdGroup(campaignName, adGroupName, keywordName, skipCreateNewLabel) {
		var adGroupIterator = AdWordsApp.adGroups()
			.withCondition('CampaignName CONTAINS "'+campaignName+'"')
			.withCondition('Name = "'+adGroupName+'"')
			.get();
		if (adGroupIterator.hasNext()) {
			var adGroup = adGroupIterator.next();

			if(keywordName.indexOf('"') != -1)
			{
				var keywordIterator = adGroup.keywords()
					.withCondition("Text = '"+keywordName+"'")
					.get();
			}
			else
			{
				var keywordIterator = adGroup.keywords()
					.withCondition('Text = "'+keywordName+'"')
					.get();
			}
			
			while (keywordIterator.hasNext()) {
				var keyword = keywordIterator.next();
				keyword.pause();
				// -------------------------------
				// also apply Label to old keyword.
				if(false == skipCreateNewLabel)
				{
					AdWordsApp.createLabel("MOVED STS");
				}
				keyword.applyLabel("MOVED STS");
				// -------------------------------
			}
		}
	}
	// --------------------------------------------
	
	// --------------------------------------------
	function removeSpecialChars(text) {
		if(text) {
			var lower = text.toLowerCase();
			var upper = text.toUpperCase();
			var result = "";
			for(var i=0; i<lower.length; ++i) {
				if(isNumber(text[i]) || (lower[i] != upper[i]) || (lower[i].trim() === '')) {
					result += text[i];
				}
			}
			return result;
		}
		return '';
	}
	// --------------------------------------------
	
	// --------------------------------------------
	//return true if char is a number
	function isNumber(text) {
		reg = new RegExp('[0-9]+$');
		if(text) {
			return reg.test(text);
		}
		return false;
	}
	// --------------------------------------------
	
	
	// =================================================
	function mainProcessor(campaignName)
	{		
		if(campaignName.constructor == Array)
		{
			if(campaignName.length > 0)
			{
				Logger.log('==============================================================');
				Logger.log('Campaigns to be processed: ' + campaignName.join(", "));
				Logger.log('==============================================================\n');
				
				arrayLength = campaignName.length;
				for (i = 0; i < arrayLength; i++)
				{
					processCleanerSpecificCampaignAdGroup(campaignName[i]);
				}
			}
			else
			{
				Logger.log('==============================================================');
				Logger.log('No Campaigns to process! Stopping the script now...');
				Logger.log('==============================================================\n');
			}
		}
		else
		{
			processCleanerSpecificCampaignAdGroup(campaignName);
		}
	}
	
	mainProcessor(CAMPAIGN_NAME);
	// =================================================
	
} 