"use strict";

const RULES_ID = {
  ORIGIN: "overwrite-origin",
};

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
});

chrome.declarativeNetRequest.getEnabledRulesets((rulesetIds) => {
  console.log("Initial enabled rulesets:", rulesetIds);
});

chrome.tabs.onActivated.addListener(() => {
  checkCurrentTabAndUpdateRules();
});

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

const whiteList = ["http://localhost:5173", "https://farfetchd.buildbuddy.one"];

function checkCurrentTabAndUpdateRules() {
  getCurrentTab().then((tab) => {
    if (tab.url && whiteList.some((url) => tab.url.startsWith(url))) {
      enableRules([RULES_ID.ORIGIN]);
    } else {
      // Disable rules
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
