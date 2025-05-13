console.log("Content script loaded on", window.location.href);
// Default config
const defaultConfig = {
    526586384084: "Dev Account"
}

// Save config to storage
function saveConfig(config) {
    return browser.storage.local.set(config);
}

console.log("Page loaded");
const intervalIdentifier = setInterval(() => {
    chrome.storage.local.get().then(accountsStorage => {
        console.log("Config accounts:", accountsStorage);
        // Check if the page contains the AWS account ID
        const match = document.body.innerText.match(/(\d{4}-\d{4}-\d{4})/);
        const accountId = match ? match[0].replaceAll('-', '') : null;
        console.log("Account ID found:", accountId);

        const account = accountsStorage.accounts.find(value => value.awsAccountId === accountId);
        console.log("Account config:", account);
        if (account) {
            console.log("account found in config!");
            clearInterval(intervalIdentifier);
        } else {
            return;
        }
        const diffBox = document.createElement("div");
        diffBox.innerText = account.awsAccountLabel;
        // const elementsByClassName = document.getElementsByClassName(".awsui-context-top-navigation");
        // console.log(elementsByClassName);
        // .style = `background-color: ${account.color}`;
        Object.assign(diffBox.style, {
            position: "fixed",
            padding: "10 10 10 10",
            left: "50%",
            top: "10px",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            backgroundColor: `${account.color}`,
            border: "1px solid #ccc",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
        });

        document.querySelector(".awsui-context-top-navigation > header > nav > div").appendChild(diffBox);
    });

}, 1000);

