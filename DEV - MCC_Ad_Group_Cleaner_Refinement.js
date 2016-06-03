var LABEL_NAME = "MOVED STS";

// specify a Campaign name for the script to run on.
// leave empty if you want to run on all Campaigns.
var CAMPAIGN_NAME = "Keyword Sorter (BMM)";

// Specify an Ad Group name under the Campaign if specified above.
// leave empty if you want to run on all Ad Groups under the above specified campaign.
//var SPECIFIC_ADGROUP = "Master Ad Group";
var SPECIFIC_ADGROUP = "";



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
	// process all keywords from all adGroups.
	// --------------------------------------------------------------
	function processCleanerAllAdGroups() {
		var keywordIterator = AdWordsApp.keywords().get();
		if (keywordIterator.hasNext()) {
			while (keywordIterator.hasNext()) {
				var keyword = keywordIterator.next();
				var originalAdGroup = keyword.getAdGroup().getName();
				
				// skip checking semantic similarity if keyword and adgroup is a perfect match.
				if(keyword.getText() == originalAdGroup)
				{
					Logger.log("Skip Moving... Keyword: " + keyword.getText() + " and Ad Group: " + originalAdGroup + " is already a perfect match!");
					continue;
				}
				else
				{
					Logger.log(getAdGroups(keyword.getText(), originalAdGroup));
				}
			}
		}
	}
	
	
	// --------------------------------------------------------------
	// process all keywords within a specified adGroup only.
	// --------------------------------------------------------------
	function processCleanerSpecificAdGroup(AdGroup) {
		var adGroupName = AdGroup;
		var adGroupIterator = AdWordsApp.adGroups()
			.withCondition('Name = "'+adGroupName+'"')
			.get();
		if (adGroupIterator.hasNext()) {
			var adGroup = adGroupIterator.next();
			var keywordIterator = adGroup.keywords().get();
			while (keywordIterator.hasNext()) {
				var keyword = keywordIterator.next();
				var originalAdGroup = keyword.getAdGroup().getName();
				
				// skip checking semantic similarity if keyword and adgroup is a perfect match.
				if(keyword.getText() == originalAdGroup)
				{
					Logger.log("Skip Moving... Keyword: " + keyword.getText() + " and Ad Group: " + originalAdGroup + " is already a perfect match!");
					continue;
				}
				else
				{
					Logger.log(getAdGroups(keyword.getText(), originalAdGroup));
				}
			}
		}
	}
	
	
	// --------------------------------------------------------------
	// process all keywords within a specified adGroup and Campaign.
	// --------------------------------------------------------------
	function processCleanerSpecificCampaignAdGroup(campaignName, adGroupName) {
		var campaignIterator = AdWordsApp.campaigns()
			.withCondition('Name = "'+campaignName+'"')
			.get();
		if (campaignIterator.hasNext())
		{
			
			var campaign = campaignIterator.next();
			
			Logger.log('Processing Campaign: ' + campaign.getName() + '...\n\n');
			
			// ----------------------------------------
			// check if specific ad group or all ad groups under the campaign.
			// include or exclude the .withCondition()
			var whatAdGroup = adGroupName.length;
			if(whatAdGroup > 0)
			{
				var adGroupIterator = campaign.adGroups()
					.withCondition('Name = "'+adGroupName+'"')
					.get();
					
				Logger.log('Processing Ad Group: (' + adGroupName + ') only...\n\n');
				
				if(adGroupIterator.hasNext())
				{
					var adGroup = adGroupIterator.next();
					var keywordIterator = adGroup.keywords().get();
					while (keywordIterator.hasNext()) {
						var keyword = keywordIterator.next();
						var originalAdGroup = keyword.getAdGroup().getName();
						
						// skip checking semantic similarity if keyword and adgroup is a perfect match.
						if(keyword.getText() == originalAdGroup)
						{
							Logger.log("Skip Moving... Keyword: " + keyword.getText() + " and Ad Group: " + originalAdGroup + " is already a perfect match!");
							continue;
						}
						else
						{
							Logger.log(getAdGroups(keyword.getText(), originalAdGroup));
						}
					}
				}
				else
				{
					Logger.log("No Ad Group: " + adGroupName + " found!");
				}
			}
			else
			{
				Logger.log('Processing all Ad Groups under this Campaign...\n\n');
				
				var keywordIterator = campaign.keywords().get();
				if (keywordIterator.hasNext())
				{
					while (keywordIterator.hasNext()) {
						var keyword = keywordIterator.next();
						var originalAdGroup = keyword.getAdGroup().getName();
						
						// skip checking semantic similarity if keyword and adgroup is a perfect match.
						if(keyword.getText() == originalAdGroup)
						{
							Logger.log("Skip Moving... Keyword: " + keyword.getText() + " and Ad Group: " + originalAdGroup + " is already a perfect match!");
							continue;
						}
						else
						{
							Logger.log(getAdGroups(keyword.getText(), originalAdGroup));
						}
					}
				}
				else
				{
					Logger.log("No Ad Group: " + adGroupName + " found!");
				}
			}
			
			//Logger.log('Campaign Name: ' + campaign.getName());
			//Logger.log('Enabled: ' + campaign.isEnabled());
			//Logger.log('Bidding strategy: ' + campaign.getBiddingStrategyType());
			//Logger.log('Ad rotation: ' + campaign.getAdRotationType());
			//Logger.log('Start date: ' + formatDate(campaign.getStartDate()));
			//Logger.log('End date: ' + formatDate(campaign.getEndDate()));
		}
		else
		{
			Logger.log("No Campaign: " + campaignName + " found!");
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
	
	function getExternal(keyworda, keywordb) {
		var url = "http://swoogle.umbc.edu/StsService/GetStsSim?operation=api&phrase1=" + keyworda + "&phrase2=" + keywordb;
		var result = UrlFetchApp.fetch(url).getContentText();
		return result;
	}
	
	function getAdGroups(keyword, originalAdGroup) {
		var adGroupIterator = AdWordsApp.adGroups().get();
		//Logger.log('Total adGroups found : ' + adGroupIterator.totalNumEntities());
		var selectedKeyword = '';
		var keywordScore = 0.0;
		var defaultScore = 0;
		var outputJaroResult = '';
		addKeywordProcess = false;
		adGroupNameForNewKeyword = "";
		
		// -------------------------------
		// check to see if label name has already been created.
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
			
			
			// skip checking Semantic Similarity if Keyword and new Ad Group is a perfect match.
			// just add the keyword to new ad group and pause from the old ad group.
			if(adGroupName.toLowerCase() == keyword.toLowerCase())
			{
				addKeywordProcess = true;
				adGroupNameForNewKeyword = adGroupName;
				selectedKeyword = '(Perfect Match!)\nMoving keyword to new Ad Group...\nKeyword: ' + keyword + '\nAdGroup: ' + adGroupName + ' / Original: ' + originalAdGroup + '\nPaused this Keyword from Original Ad Group!\n';
				break;
			}
			
			// initiate api call for Semantic Similarity
			var cleanAdGroupName = removeSpecialChars(adGroupName);
			var cleanKeyword = removeSpecialChars(keyword);
			
			var semanticSimilarity = getExternal(cleanAdGroupName, cleanKeyword);
			
			// --------------------------------------------
			// In case of a semantic score tie, do a jaro winkler comparison.
			if(semanticSimilarity == keywordScore)
			{
				var formerAdGroupComboScore = calculateMatch.jwDistance(adGroupNameForNewKeyword, cleanKeyword);
				var newestAdGroupComboScore = calculateMatch.jwDistance(cleanAdGroupName, cleanKeyword);
				
				outputJaroResult = "Semantic Tie Found! Jaro Winkler implemented...\n(" + adGroupNameForNewKeyword +", " + cleanKeyword  + "): " + formerAdGroupComboScore + " vs (" + cleanAdGroupName + cleanKeyword + "): " + newestAdGroupComboScore + "\n";
				
				if(newestAdGroupComboScore > formerAdGroupComboScore)
				{
					semanticSimilarity = newestAdGroupComboScore;
				}else{
					semanticSimilarity = formerAdGroupComboScore;
					cleanAdGroupName = adGroupNameForNewKeyword; // just overwriting the variable to use the old ad group from previous loop.					
				}
			}
			// --------------------------------------------
			
			if(semanticSimilarity > keywordScore)
			{
				keywordScore = semanticSimilarity;
				addKeywordProcess = true;
				adGroupNameForNewKeyword = cleanAdGroupName;
				selectedKeyword = '(Winner!)\nMoving keyword to new Ad Group...\nKeyword: ' + cleanKeyword + '\nNew AdGroup: ' + cleanAdGroupName + ' / Original: ' + originalAdGroup + '\nScore: ' + keywordScore + 'Paused this Keyword from Original Ad Group!\n';
			}
		}
		
		if(addKeywordProcess == true)
		{
			addKeyword(adGroupNameForNewKeyword, keyword);
			pauseApplyLabelOldKeywordInAdGroup(originalAdGroup, keyword, skipCreateNewLabel);
		}
		return outputJaroResult + selectedKeyword;
	}
	
	function addKeyword(adGroupName, keywordName) {
		var adGroupIterator = AdWordsApp.adGroups()
			.withCondition('Name = "'+adGroupName+'"')
			.get();

		if (adGroupIterator.hasNext()) {
			var adGroup = adGroupIterator.next();

			adGroup.newKeywordBuilder()
			.withText(keywordName)
			.build();
		}
	}
	
	function pauseApplyLabelOldKeywordInAdGroup(adGroupName, keywordName, skipCreateNewLabel) {
		var adGroupIterator = AdWordsApp.adGroups()
			.withCondition('Name = "'+adGroupName+'"')
			.get();
		if (adGroupIterator.hasNext()) {
			var adGroup = adGroupIterator.next();
			var keywordIterator = adGroup.keywords()
			.withCondition('Text = "'+keywordName+'"').get();
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
	
	// --------------------------------------------------------------------
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
	
	//return true if char is a number
	function isNumber(text) {
		reg = new RegExp('[0-9]+$');
		if(text) {
			return reg.test(text);
		}
		return false;
	}
	// --------------------------------------------------------------------
	
	
	// =================================================
	//var n = SPECIFIC_ADGROUP.length;
	//if(n > 0)
	//{
	//	processCleanerSpecificAdGroup(SPECIFIC_ADGROUP);		
	//}else{
	//	processCleanerAllAdGroups();	
	//}
	
	processCleanerSpecificCampaignAdGroup(CAMPAIGN_NAME, SPECIFIC_ADGROUP);
	// =================================================
	
} 