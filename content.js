// This script runs in the context of the web page
// apparently, the element that contains the account ID is lazily loaded.
const intervalIdentifier = setInterval(() => {
    chrome.storage.local.get().then(accountsStorage => {
        // Check if the page contains the AWS account ID
        const match = RegExp(/(\d{4}-\d{4}-\d{4})/).exec(document.body.innerText);
        const accountId = match ? match[0].replaceAll('-', '') : null;

        const account = accountsStorage.accounts.find(value => value.awsAccountId === accountId);
        if (account) {
            clearInterval(intervalIdentifier);
        } else {
            return;
        }
        // create a new div element to show the account ID
        const diffBox = document.createElement("div");
        diffBox.innerText = account.awsAccountLabel;

        Object.assign(diffBox.style, {
            position: "fixed",
            padding: "10px 10px 10px 10px",
            margin: "10px 10px 10px 10px",
            left: "50%",
            top: "10px",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            backgroundColor: `${account.color}`,
            border: "1px solid #ccc",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
        });

        // append the new div to the top navigation bar
        document.querySelector(".awsui-context-top-navigation > header > nav > div").appendChild(diffBox);
    });

}, 1000);

