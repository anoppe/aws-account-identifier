const colorPicker = document.getElementById("colorPicker");
const preview = document.getElementById("preview");
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

function addRemoveEventListener(removeButton) {
    console.log('new remove button to add', removeButton);
    removeButton.addEventListener("click", (event) => {
        const removeButton = event.target;
        const awsAccountId = removeButton.getAttribute("data-id");
        console.log("Remove button clicked for account ID:", awsAccountId);

        // Remove the account from local storage
        chrome.storage.local.get("accounts").then(({accounts}) => {
            const updatedAccounts = accounts.filter(account => account.awsAccountId !== awsAccountId);
            chrome.storage.local.set({accounts: updatedAccounts});

            // Remove the account from the UI
            removeButton.closest("tr").remove();
        });
    });
}

// list all accounts and colors from the config in the accountsConfigurations div
chrome.storage.local.get("accounts").then((storedAccounts) => {
    const accountsConfigurations = document.getElementById("accountsConfigurationsBody");
    accountsConfigurations.innerHTML = ""; // Clear existing entries
    storedAccounts.accounts.forEach(({awsAccountId, awsAccountLabel, color}) => {
        console.log("Loading account:", awsAccountId, "with color:", color);
        addAccount(awsAccountId, awsAccountLabel, color);
    });

    const removeButtons = document.getElementsByClassName('remove');
    console.log(removeButtons);
    for (const removeButton of removeButtons) {
        addRemoveEventListener(removeButton);
    }
});

// add event listener to the label input to update the preview with the entered label
document.getElementById("awsAccountLabel").addEventListener("input", () => {
    // update the preview with the entered label
    const awsAccountLabel = document.getElementById("awsAccountLabel").value;
    const preview = document.getElementById("preview");
    preview.textContent = awsAccountLabel;
});

function addAccount(awsAccountId, awsAccountLabel, color) {
    const accountsConfigurations = document.getElementById("accountsConfigurationsBody");
    // create a table row with the account id, label and color
    accountsConfigurations.innerHTML += `
        <tr>
            <td>${awsAccountId}</td>
            <td>${awsAccountLabel}</td>
            <td style="background-color: ${color}; width: 50px;"></td>
            <td><button id="remove" class="remove" data-id="${awsAccountId}">Remove</button></td>
        </tr>
    `;
    const removeButtonElements = accountsConfigurations.getElementsByClassName('remove');
    const removeButtonElement = removeButtonElements[removeButtonElements.length - 1];
    addRemoveEventListener(removeButtonElement);
}

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
            addAccount(awsAccountId, awsAccountLabel, color);

            // Reset the input fields to empty
            document.getElementById("awsAccountId").value = "";
            document.getElementById("awsAccountLabel").value = "";
            colorPicker.value = '';
            preview.style.backgroundColor = '';

            // store the updated accounts list.
            chrome.storage.local.set({ accounts });
            const newVar = chrome.storage.local.get().then(value => {
                console.log("newVar", value);
                return value;
            });
            console.log("stored.", newVar)
        });
    }
});
