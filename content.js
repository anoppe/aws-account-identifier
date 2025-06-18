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

function contrastingColor(hex, factorAlpha=false) {
    let [r,g,b,a]=hex.replace(/^#?(?:(?:(..)(..)(..)(..)?)|(?:(.)(.)(.)(.)?))$/, '$1$5$5$2$6$6$3$7$7$4$8$8').match(/(..)/g).map(rgb=>parseInt('0x'+rgb));
    return ((~~(r*299) + ~~(g*587) + ~~(b*114))/1000) >= 128 || (!!(~(128/a) + 1) && factorAlpha) ? '#000' : '#FFF';   
}

function overrideTextColor(element, color) {
    element.style.color = color;
    for(let child of element.children) {
        overrideTextColor(child, color);
    }
}

function readAccountId() {
    try {
        const awsUserInfoCookieValue = getCookie('aws-userInfo');
        const parsedAwsUserInfoCookie = JSON.parse(awsUserInfoCookieValue);
        return parsedAwsUserInfoCookie['alias'];
    } catch (error) {
        console.log('aws-userInfo cookie not found, trying to find the account id on the page itself', error.message);
        // Check if the page contains the AWS account ID
        const match = RegExp(/(\d{4}-\d{4}-\d{4})/).exec(document.body.innerText);
        return match ? match[0].replaceAll('-', '') : null;
    }
}

function renderAccountElement() {
    chrome.storage.local.get().then(accountsStorage => {

        const accountId = readAccountId();

        if (accountId) {
            clearInterval(intervalIdentifier);
        } else {
            return;
        }

        const account = accountsStorage.accounts.find(value => value.awsAccountId === accountId);
        // create a new div element to show the account ID
        const diffBox = document.createElement("div");
        diffBox.innerText = account.awsAccountLabel;
        const contrastColor = contrastingColor(account.color);

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
            color: `${contrastColor}`
        }

        if (account.colorizeWholeWith) {
            document.getElementById('awsc-top-level-nav').style.backgroundColor = account.color;
            overrideTextColor(document.getElementById('awsc-top-level-nav'), contrastColor);
            styleDefinition.backgroundColor = 'transparent';
            styleDefinition.border = 'none';
        }

        Object.assign(diffBox.style, styleDefinition);

        // append the new div to the top navigation bar
        document.querySelector(".awsui-context-top-navigation > header > nav > div").appendChild(diffBox);
    });
}

/** Set an interval to check for the account ID and render the element.
 * If the account ID is not found, it will keep trying until it is found.
 * this is necessary because the page might not be fully loaded when this script runs.
 */
const intervalIdentifier = setInterval(() => {
    try {
        renderAccountElement();
    } catch (e) {
        console.log('something went wrong while rendering the account element:', e.message);
    }

}, 1000);

