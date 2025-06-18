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
    const colorizeWholeWith = document.getElementById('colorizeWholeWith').checked;

    if (awsAccountId) {
        // Save the selected color and AWS Account ID to local storage
        chrome.storage.local.get().then(({accounts = []}) => {
            console.log('accounts fetched:', accounts);
            const filteredAccounts = accounts.filter(account => account.awsAccountId !== awsAccountId); // Remove existing account with the same ID
            filteredAccounts.push({awsAccountId, color, awsAccountLabel, colorizeWholeWith});
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
