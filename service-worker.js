("use strict");

if (typeof browser == "undefined") {
  // Chrome does not support the browser namespace yet.
  globalThis.browser = chrome;
}

const whiteListPatterns = [/^http:\/\/localhost:\d+/, /^https:\/\/farfetchd\./];

const RULES_ID = {
  ORIGIN: "overwrite-origin",
};

browser.tabs.onActivated.addListener(() => {
  checkCurrentTabAndUpdateRules();
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the URL changed and the tab is active
  if (changeInfo.url && tab.active) {
    checkCurrentTabAndUpdateRules();
  }
});

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await browser.tabs.query(queryOptions);
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

  browser.declarativeNetRequest.updateEnabledRulesets(
    { enableRulesetIds: rules },
    () => {
      setIcon(true);
    }
  );
}

function disableRules(rulesIds) {
  const rules = Array.isArray(rulesIds) ? rulesIds : [rulesIds];

  browser.declarativeNetRequest.updateEnabledRulesets(
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

  browser.action.setIcon({ path: path }, () => {
    if (browser.runtime.lastError) {
      console.error(browser.runtime.lastError);
    }
  });
}
