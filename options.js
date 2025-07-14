const colorPicker = document.getElementById('colorPicker');
const preview = document.getElementById('preview');
// Load saved color
chrome.storage.local.get('selectedColor', ({selectedColor}) => {
    if (selectedColor) {
        colorPicker.value = selectedColor;
        preview.style.backgroundColor = selectedColor;
    }
});

// Save on change
colorPicker.addEventListener('change', () => {
    const color = colorPicker.value;
    chrome.storage.local.set({selectedColor: color});
    preview.style.backgroundColor = color;
});

document.addEventListener('click', (event) => {
    if (event.target.tagName.toLowerCase() !== 'button' || !event.target.classList.contains('remove')) {
        return; // Exit if the clicked element is not a remove button
    }
    console.log('Remove button clicked', event);
    const removeButton = event.target;
    const awsAccountId = removeButton.getAttribute('data-id');
    console.log('Remove button clicked for account ID:', awsAccountId);

    // Remove the account from local storage
    chrome.storage.local.get('accounts').then(({accounts}) => {
        const updatedAccounts = accounts.filter(account => account.awsAccountId !== awsAccountId);
        const updatedAccountStorageObject = {accounts: updatedAccounts};
        chrome.storage.local.set(updatedAccountStorageObject);

        renderAllAccountsFromStorage(updatedAccountStorageObject);
    });
});

function addAccount(awsAccountId, awsAccountLabel, color) {
    const accountsConfigurations = document.getElementById('accountsConfigurationsBody');
    // create a table row with the account id, label and color
    accountsConfigurations.innerHTML += `
        <tr>
            <td>${awsAccountId}</td>
            <td>${awsAccountLabel}</td>
            <td style="background-color: ${color}; width: 50px;"></td>
            <td><button id="remove_${awsAccountId}" class="remove" data-id="${awsAccountId}">Remove</button></td>
        </tr>
    `;
}

function renderAllAccountsFromStorage(storedAccounts) {
    const accountsConfigurations = document.getElementById('accountsConfigurationsBody');
    accountsConfigurations.innerHTML = ''; // Clear existing entries

    storedAccounts.accounts.forEach(({awsAccountId, awsAccountLabel, color}) => {
        console.log('Loading account:', awsAccountId, 'with color:', color);
        addAccount(awsAccountId, awsAccountLabel, color);
    });
}

function validateDataStructure(data) {
    if (typeof data !== 'object' || data === null) {
        return { valid: false, message: 'Invalid data format. Expected an object.' };
    }

    if (!Array.isArray(data.accounts)) {
        return { valid: false, message: 'Invalid data format. Expected "accounts" to be an array.' };
    }

    for (const account of data.accounts) {
        if (typeof account.awsAccountId !== 'string' || !account.awsAccountId.trim()) {
            return { valid: false, message: 'Each account must have a valid "awsAccountId".' };
        }
        if (typeof account.awsAccountLabel !== 'string' || !account.awsAccountLabel.trim()) {
            return { valid: false, message: 'Each account must have a valid "awsAccountLabel".' };
        }
        if (typeof account.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(account.color)) {
            return { valid: false, message: 'Each account must have a valid "color" in hex format.' };
        }
    }

    return { valid: true, message: 'Data structure is valid.' };
}

try {
    chrome.storage.local.get('accounts').then((storedAccounts) => {
        console.log(storedAccounts);
        renderAllAccountsFromStorage(storedAccounts);
    });
} catch (e) {
    console.error('Error fetching accounts from storage:', e);
}

// add event listener to the label input to update the preview with the entered label
document.getElementById('awsAccountLabel').addEventListener('input', () => {
    // update the preview with the entered label
    const awsAccountLabel = document.getElementById('awsAccountLabel').value;
    const preview = document.getElementById('preview');
    preview.textContent = awsAccountLabel;
});

// when the user clicks the save button, save the selected color to local storage and shown in the list
document.getElementById('add').addEventListener('click', () => {
    console.log('Button clicked');
    const color = colorPicker.value;
    const awsAccountId = document.getElementById('awsAccountId').value;
    const awsAccountLabel = document.getElementById('awsAccountLabel').value;
    const colorizeWholeWidth = document.getElementById('colorizeWholeWidth').checked;

    if (awsAccountId) {
        // Save the selected color and AWS Account ID to local storage
        chrome.storage.local.get().then(({accounts = []}) => {
            console.log('accounts fetched:', accounts);
            const filteredAccounts = accounts.filter(account => account.awsAccountId !== awsAccountId); // Remove existing account with the same ID
            filteredAccounts.push({awsAccountId, color, awsAccountLabel, colorizeWholeWidth});
            const filteredAccountsStorageObject = {accounts: filteredAccounts};
            chrome.storage.local.set(filteredAccountsStorageObject);

            // Update the accounts configuration list
            renderAllAccountsFromStorage(filteredAccountsStorageObject);

            // Reset the input fields to empty
            document.getElementById('awsAccountId').value = '';
            document.getElementById('awsAccountLabel').value = '';
            colorPicker.value = '';
            preview.style.backgroundColor = '';

            // store the updated accounts list.
            chrome.storage.local.set(filteredAccountsStorageObject);
            const storageResult = chrome.storage.local.get().then(value => {
                return value;
            });
            console.log('Updated the account storage with the new changes.', storageResult)
        });
    }
});

document.getElementById('settingsImportButton').addEventListener('click', (event) => {

    const fileInput = document.getElementById('settingsImport');
    const files = fileInput.files;

    console.log('Selected file:', files);
    if (files.length > 0) {
        const result = confirm('Are you sure you want to import settings? This will overwrite your current settings.');
        if (!result) {
            return;
        }

        const file = files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                console.log('data', data);
                // validate the data structure.
                const validationResult = validateDataStructure(data);
                if (!validationResult.valid) {
                    alert("The uploaded file doesn't have the expected data structure.\n" + validationResult.message);
                    return;
                }
                console.log('Parsed data:', data);
                if (data.accounts && Array.isArray(data.accounts)) {
                    // Save the imported accounts to local storage
                    chrome.storage.local.set({accounts: data.accounts}, () => {
                        console.log('Accounts imported successfully');
                        renderAllAccountsFromStorage(data);
                    });
                } else {
                    console.error('Invalid data format. Expected an object with an "accounts" array.');
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        };

        reader.readAsText(file);
    } else {
        alert('Please select a file to import.');
    }

});

document.getElementById("settingsExport").addEventListener("click", () => {
    // turn your settings into a JSON string
    chrome.storage.local.get().then(({accounts = []}) => {

        const dataStr = JSON.stringify({accounts: accounts}, null, 4);

        // make a Blob
        const blob = new Blob([dataStr], {type: "application/json"});

        // create a link to download it
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "plugin-settings.json";

        // trigger download
        a.click();

        // cleanup
        URL.revokeObjectURL(url);
    });
});
