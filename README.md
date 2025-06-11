# AWS Account Identifier

This repository contains a browser extension script that identifies and displays the AWS account ID and label in the AWS Management Console. The script runs in the context of the web page and dynamically retrieves the account information. It supports both Chrome and Firefox.

## Features

- Extracts the AWS account ID from the `aws-userInfo` cookie or the page content.
- Matches the account ID with stored account information in browser storage (`chrome.storage.local` or `browser.storage.local`).
- Displays the account label and applies custom styling to the AWS Management Console.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/anoppe/aws-account-identifier.git
   cd aws-account-identifier
    ```
### Chrome
   Load the extension in Chrome:
- Open chrome://extensions/ in your browser.
- Enable Developer mode.
- Click Load unpacked and select the repository folder.
### Firefox
Load the extension in Firefox:
- Open about:debugging#/runtime/this-firefox in your browser.
- Click Load Temporary Add-on and select any file in the repository folder (e.g., manifest.json).

## Usage
Navigate to the AWS Management Console. The account label will be displayed, and custom styling will be applied.


### Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

### License
This project is licensed under the MIT License. See the LICENSE file for details.