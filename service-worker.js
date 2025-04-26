"use strict";

const whiteListPatterns = [/^http:\/\/localhost:\d+/, /^https:\/\/farfetchd\./];

const RULES_ID = {
  ORIGIN: "overwrite-origin",
};

chrome.tabs.onActivated.addListener(() => {
  checkCurrentTabAndUpdateRules();
});

// Listener for tab URL updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the URL changed and the tab is active
  if (changeInfo.url && tab.active) {
    checkCurrentTabAndUpdateRules();
  }
});

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function checkCurrentTabAndUpdateRules() {
  getCurrentTab().then((tab) => {
    if (
      tab &&
      tab.url &&
      whiteListPatterns.some((pattern) => pattern.test(tab.url))
    ) {
      enableRules([RULES_ID.ORIGIN]);
    } else {
      disableRules([RULES_ID.ORIGIN]);
    }
  });
}

function enableRules(rulesIds) {
  const rules = Array.isArray(rulesIds) ? rulesIds : [rulesIds];

  chrome.declarativeNetRequest.updateEnabledRulesets(
    { enableRulesetIds: rules },
    () => {
      setIcon(true);
    }
  );
}

function disableRules(rulesIds) {
  const rules = Array.isArray(rulesIds) ? rulesIds : [rulesIds];

  chrome.declarativeNetRequest.updateEnabledRulesets(
    { disableRulesetIds: rules },
    () => {
      setIcon(false);
    }
  );
}

function setIcon(isActive) {
  let path = isActive
    ? {
        16: "icons/icon16.png",
        32: "icons/icon32.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png",
      }
    : {
        16: "icons/disabled/icon16_disabled.png",
        32: "icons/disabled/icon32_disabled.png",
        48: "icons/disabled/icon48_disabled.png",
        128: "icons/disabled/icon128_disabled.png",
      };

  chrome.action.setIcon({ path: path }, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
}
