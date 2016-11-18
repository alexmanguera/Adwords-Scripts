// Minimum number of impressions to consider "enough data"
var IMPRESSIONS_THRESHOLD = 50;
// Cost-per-click (in account currency) we consider an expensive keyword.
var AVERAGE_CPC_THRESHOLD = 2; // $1
// Threshold we use to decide if a keyword is a good performer or bad.
var CTR_THRESHOLD = 0.5; // 0.5%
// If ctr is above threshold AND our conversion cost isn’t too high,
// it’ll become a positive keyword.
var COST_PER_CONVERTED_CLICK_THRESHOLD = 20; // $10

function main() {
  var report = AdWordsApp.report(
      'SELECT Query, Clicks, Cost, Ctr, ClickConversionRate,' +
      ' CostPerConvertedClick, ConvertedClicks, CampaignId, AdGroupId ' +
      ' FROM SEARCH_QUERY_PERFORMANCE_REPORT ' +
      ' WHERE ' +
          ' ConvertedClicks > 0' +
          ' AND Impressions > ' + IMPRESSIONS_THRESHOLD +
          ' AND AverageCpc > ' + AVERAGE_CPC_THRESHOLD +
      ' DURING LAST_30_DAYS');
  var rows = report.rows();

  var negativeKeywords = {};
  var positiveKeywords = {};
  var allAdGroupIds = {};
  // Iterate through search query and decide whether to
  // add them as positive or negative keywords (or ignore).
  while (rows.hasNext()) {
    var row = rows.next();
    if (parseFloat(row['Ctr']) < CTR_THRESHOLD) {
      addToMultiMap(negativeKeywords, row['AdGroupId'], row['Query']);
      allAdGroupIds[row['AdGroupId']] = true;
    } else if (parseFloat(row['CostPerConvertedClick']) <
        COST_PER_CONVERTED_CLICK_THRESHOLD) {
      addToMultiMap(positiveKeywords, row['AdGroupId'], row['Query']);
      allAdGroupIds[row['AdGroupId']] = true;
    }
  }

  // Copy all the adGroupIds from the object into an array.
  var adGroupIdList = [];
  for (var adGroupId in allAdGroupIds) {
    adGroupIdList.push(adGroupId);
  }

  // Add the keywords as negative or positive to the applicable ad groups.
  var adGroups = AdWordsApp.adGroups().withIds(adGroupIdList).get();
  while (adGroups.hasNext()) {
    var adGroup = adGroups.next();
    if (negativeKeywords[adGroup.getId()]) {
      for (var i = 0; i < negativeKeywords[adGroup.getId()].length; i++) {
        adGroup.createNegativeKeyword(
            '[' + negativeKeywords[adGroup.getId()][i] + ']');
      }
    }
    if (positiveKeywords[adGroup.getId()]) {
      for (var i = 0; i < positiveKeywords[adGroup.getId()].length; i++) {
              

 var keywordOperation = adGroup.newKeywordBuilder()
    .withText(positiveKeywords[adGroup.getId()][i].replace(/([a-zA-Z0-9]+)/g, '+$1'))
    .build();
 var keyword = keywordOperation.getResult();
        
        
      }
    }
  }
}

function addToMultiMap(map, key, value) {
  if (!map[key]) {
    map[key] = [];
  }
  map[key].push(value);
}