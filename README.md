# Duplicate ID Finder

A simple Chrome extension that helps developers quickly find duplicate HTML `id` attributes on a web page.

## Overview

**Duplicate ID Finder** scans the current web page and identifies HTML elements that use duplicate `id` values.

HTML `id` attributes should be unique within a page. Duplicate IDs can cause unexpected behavior with JavaScript, CSS selectors, accessibility tools, and automated testing.

This extension makes checking for duplicate IDs quick and easy.

## Features

* 🔍 Find duplicate HTML `id` attributes
* ⚡ Scan the current page with a single click
* 📋 Identify duplicate ID values
* 🧑‍💻 Built for web developers and QA testers
* 🚀 No configuration required
* 💻 Simple click-and-install setup

## Installation

### Install from the Chrome Web Store

1. Install **Duplicate ID Finder** from the Chrome Web Store.
2. Pin the extension to your Chrome toolbar if desired.
3. Open the web page you want to inspect.
4. Click the **Duplicate ID Finder** extension icon.

That's it. No additional configuration is required.

## How to Use

1. Navigate to a web page.
2. Click the **Duplicate ID Finder** icon in your Chrome toolbar.
3. Run the duplicate ID check.
4. Review any duplicate IDs found on the page.

If duplicate IDs are detected, the extension will help you identify them so they can be reviewed and fixed.

## Why Check for Duplicate IDs?

According to HTML standards, an `id` value should uniquely identify a single element on a page.

For example, the following HTML contains a duplicate ID:

```html
<div id="content">
    First content block
</div>

<div id="content">
    Second content block
</div>
```

Both elements use:

```html
id="content"
```

Duplicate IDs may cause issues with:

* JavaScript methods such as `document.getElementById()`
* CSS ID selectors
* Accessibility and ARIA relationships
* Automated testing
* Anchor links
* DOM manipulation

**Duplicate ID Finder** provides a quick way to detect these issues directly from your browser.

## Who Is This For?

Duplicate ID Finder is useful for:

* Front-end developers
* Back-end developers working with HTML templates
* Web developers
* QA engineers and testers
* Accessibility testers
* CMS developers
* Anyone debugging HTML markup

## Privacy

Duplicate ID Finder analyzes the HTML of the current web page to detect duplicate IDs.

The extension is designed to perform this check directly in the browser and does not require configuration or account registration.

## Author

**John Paul Mariano**

## License

This project is licensed under the MIT License.

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

If you find an issue or have an idea for improving **Duplicate ID Finder**, feel free to open an issue or submit a pull request.

---

Made for developers who want a faster way to find duplicate HTML IDs.
