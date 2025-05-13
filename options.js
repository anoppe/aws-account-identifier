const colorPicker = document.getElementById("colorPicker");
const preview = document.getElementById("preview");
// fetch(chrome.runtime.getURL("colors.json"))
//     .then(res => res.json())
//     .then(colors => {

        // Load saved color
        chrome.storage.local.get("selectedColor", ({ selectedColor }) => {
            if (selectedColor) {
                colorPicker.value = selectedColor;
                preview.style.backgroundColor = selectedColor;
            }
        });

        // Save on change
        colorPicker.addEventListener("change", () => {
            const color = colorPicker.value;
            chrome.storage.local.set({ selectedColor: color });
            preview.style.backgroundColor = color;
        });
    // });

// list all accounts and colors from the config in the accountsConfigurations div
chrome.storage.local.get("accounts").then((storedAccounts) => {
    const accountsConfigurations = document.getElementById("accountsConfigurations");
    accountsConfigurations.innerHTML = ""; // Clear existing entries
    storedAccounts.accounts.forEach(({ awsAccountId, color }) => {
        console.log("Loading account:", awsAccountId, "with color:", color);
        const entry = document.createElement("div");
        entry.textContent = `AWS Account: ${awsAccountId}`;
        const colorContainer = document.createElement("div");
        colorContainer.classList.add("accountColor");
        colorContainer.style.backgroundColor = color;
        colorContainer.textContent = "-";
        entry.appendChild(colorContainer);
        accountsConfigurations.appendChild(entry);
    });
});


// when the user clicks the save button, save the selected color to local storage and shown in the list
document.getElementById("add").addEventListener("click", () => {
    console.log("Button clicked");
    const color = colorPicker.value;
    const awsAccountId = document.getElementById("awsAccountId").value;
    const awsAccountLabel = document.getElementById("awsAccountLabel").value;

    if (awsAccountId) {
        // Save the selected color and AWS Account ID to local storage
        chrome.storage.local.get().then(({ accounts = [] }) => {
            console.log("accounts fetched:", accounts);
            accounts.push({ awsAccountId, color, awsAccountLabel });
            chrome.storage.local.set({ accounts });

            // Update the accounts configuration list
            const accountsConfigurations = document.getElementById("accountsConfigurations");

            const entry = document.createElement("div");
            entry.textContent = `AWS Account: ${awsAccountLabel} - ${awsAccountId}`;
            const colorContainer = document.createElement("div");
            colorContainer.classList.add("accountColor");
            colorContainer.style.backgroundColor = color;
            colorContainer.textContent = "-"
            entry.appendChild(colorContainer)
            // entry.style.backgroundColor = color;
            accountsConfigurations.appendChild(entry);
            // Clear the input field and persist config to storage
            document.getElementById("awsAccountId").value = "";
            document.getElementById("awsAccountLabel").value = "";
            chrome.storage.local.set({ accounts });
            const newVar = chrome.storage.local.get().then(value => {
                console.log("newVar", value);
                return value;
            });
            console.log("stored.", newVar)
        });
    }
});