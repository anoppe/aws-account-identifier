// This script runs in the context of the web page
// apparently, the element that contains the account ID is lazily loaded.

function getCookie(name) {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const nameValue = cookie.split("=");
        if (name === nameValue[0].trim()) {
            return decodeURIComponent(nameValue[1]);
        }
    }
    throw new Error("Cannot find cookie ${name}");
}

const intervalIdentifier = setInterval(() => {

    chrome.storage.local.get().then(accountsStorage => {

        let accountId;

        try {
            const awsUserInfoCookieValue = getCookie('aws-userInfo');
            const parsedAwsUserInfoCookie = JSON.parse(awsUserInfoCookieValue);
            accountId = parsedAwsUserInfoCookie['alias'];
        } catch (error) {
            console.log('aws-userInfo cookie not found', error.message);
            // Check if the page contains the AWS account ID
            const match = RegExp(/(\d{4}-\d{4}-\d{4})/).exec(document.body.innerText);
            accountId = match ? match[0].replaceAll('-', '') : null;
        }

        if (accountId) {
            clearInterval(intervalIdentifier);
        } else {
            return;
        }

        const account = accountsStorage.accounts.find(value => value.awsAccountId === accountId);
        // create a new div element to show the account ID
        const diffBox = document.createElement("div");
        diffBox.innerText = account.awsAccountLabel;

        const styleDefinition = {
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
        }

        if (account.colorizeWholeWith) {
            document.getElementById('awsc-top-level-nav').style.backgroundColor = account.color;
            styleDefinition.backgroundColor = 'transparent';
            styleDefinition.border = 'none';
        }

        browser.theme.update({
            colors: {
                frame: `${account.color}`,
                tab_background_text: `${account.color}`,
            }
        });

        Object.assign(diffBox.style, styleDefinition);

        // append the new div to the top navigation bar
        document.querySelector(".awsui-context-top-navigation > header > nav > div").appendChild(diffBox);
    });

}, 1000);

