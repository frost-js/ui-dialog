# Frost UI Dialog

[![CI](https://github.com/frost-js/ui-dialog/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/frost-js/ui-dialog/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/frost-js/ui-dialog/branch/main/graph/badge.svg)](https://codecov.io/gh/frost-js/ui-dialog)
[![npm version](https://img.shields.io/npm/v/%40fr0st%2Fui-dialog?style=flat-square)](https://www.npmjs.com/package/@fr0st/ui-dialog)
[![npm downloads](https://img.shields.io/npm/dm/%40fr0st%2Fui-dialog?style=flat-square)](https://www.npmjs.com/package/@fr0st/ui-dialog)
[![JS gzip size](https://img.badgesize.io/frost-js/ui-dialog/main/dist/frost-ui-dialog.min.js?compression=gzip&label=JS%20gzip%20size&style=flat-square)](https://github.com/frost-js/ui-dialog/blob/main/dist/frost-ui-dialog.min.js)
[![license](https://img.shields.io/github/license/frost-js/ui-dialog?style=flat-square)](./LICENSE)

Programmatic alert, confirmation, and custom modal dialogs for Frost UI.

## Highlights

- Alert and confirm helpers with predictable action callbacks
- Custom titles, content, buttons, sizes, backdrops, centering, and append targets
- Text-safe string content and appendable DOM or fQuery content
- Frost UI v4 transitions, focus trapping, stacked modal handling, and accessibility state
- Native `Dialog` class with `alert()` and `confirm()` helpers
- Frozen resolved options with read-only `node` and `options` accessors
- Prebuilt ESM and UMD bundles with source maps
- No component-specific CSS or Sass
- JSDoc-powered IntelliSense

Explore [the demo](./demo/index.html) for interactive examples.

## Installation

### Browser projects / bundlers

```bash
npm i @fr0st/ui-dialog
```

Frost UI Dialog's package entry point is ESM-only and requires a browser DOM. Import the named exports and the stylesheets in browser projects and bundlers.

```js
import '@fr0st/ui/dist/frost-ui.min.css';
import { Dialog, alert, confirm } from '@fr0st/ui-dialog';
```

`@fr0st/ui` and `@fr0st/query` are peer dependencies so the component shares the application's instances.

### Browser (ESM)

The ESM bundle imports `@fr0st/ui` and `@fr0st/query`. fQuery also imports `@fr0st/core`, so map all three dependencies when loading the bundle directly in a browser:

```html
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@fr0st/ui@latest/dist/frost-ui.min.css">
<script type="importmap">
{
    "imports": {
        "@fr0st/core": "https://cdn.jsdelivr.net/npm/@fr0st/core@latest/dist/frost-core.esm.min.js",
        "@fr0st/query": "https://cdn.jsdelivr.net/npm/@fr0st/query@latest/dist/fquery.esm.min.js",
        "@fr0st/ui": "https://cdn.jsdelivr.net/npm/@fr0st/ui@latest/dist/frost-ui.esm.min.js"
    }
}
</script>
<script type="module">
    import { Dialog, alert, confirm } from 'https://cdn.jsdelivr.net/npm/@fr0st/ui-dialog@latest/dist/frost-ui-dialog.esm.min.js';
</script>
```

### Browser (UMD)

Load the bundles from your own copy or a CDN:

```html
<link
    rel="stylesheet"
    href="/path/to/dist/frost-ui.min.css">
<script src="/path/to/dist/frost-ui-bundle.min.js"></script>
<script src="/path/to/dist/frost-ui-dialog.min.js"></script>
<!-- or -->
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@fr0st/ui@latest/dist/frost-ui.min.css">
<script src="https://cdn.jsdelivr.net/npm/@fr0st/ui@latest/dist/frost-ui-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@fr0st/ui-dialog@latest/dist/frost-ui-dialog.min.js"></script>
<script>
    const { Dialog, alert, confirm } = globalThis.UI;
</script>
```

The UMD bundle adds `Dialog`, `alert`, and `confirm` to the existing `globalThis.UI` object. Load Frost UI's all-in-one bundle first; it supplies the `UI` and `fQuery` globals.

The package root resolves to the prebuilt ESM bundle. Published files under `dist/` and `src/` are also available through matching package subpaths.

## Usage

### Alert

```js
import { alert } from '@fr0st/ui-dialog';

alert('Your profile was updated.', () => {
    console.log('The user selected OK.');
}, {
    title: 'Saved',
});
```

### Confirm

```js
import { confirm } from '@fr0st/ui-dialog';

confirm('Remove this project?', (confirmed) => {
    console.log(confirmed ? 'Confirmed' : 'Cancelled');
}, {
    title: 'Remove project',
});
```

### Custom dialog

```js
import { Dialog } from '@fr0st/ui-dialog';

const dialog = new Dialog({
    title: 'Publish changes',
    content: 'Choose whether to publish now or keep editing.',
    centerVertical: true,
    size: 'lg',
    buttons: [
        {
            text: 'Keep editing',
            style: 'btn-secondary',
        },
        {
            text: 'Publish',
            style: 'btn-primary',
            callback: () => {
                console.log('Publishing.');
            },
        },
    ],
});

// An immediate close waits for opening to finish, then starts the hide transition.
dialog.close();
```

Each `Dialog` starts showing immediately. Frost UI manages the backdrop, focus trap, stack position, keyboard handling, transition state, and body scroll lock. The dialog removes itself when its own `hidden.ui.modal` event fires.

## Options

Options passed to the constructor replace the corresponding values in `Dialog.defaults`. A supplied `buttons` array replaces the entire default array; `buttons: []` removes all default actions.

Resolved arrays and plain objects are deep-copied, so later changes to the supplied button definitions or defaults do not affect an existing dialog. DOM nodes and callback functions retain their identity. The resolved `dialog.options` object is shallow-frozen; nested arrays and objects are not frozen.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `appendTo` | `NodeInput \| null` | `null` | Append the dialog to a custom target instead of `document.body`. |
| `ariaLabel` | `string` | `'Dialog'` | Provide the accessible name when no title is present. |
| `backdrop` | `boolean \| 'static'` | `'static'` | `true` allows backdrop dismissal; `false` omits the backdrop. `'static'` prevents dismissal by backdrop clicks and Escape. |
| `buttons` | `DialogButton[]` | `[]` | Add action buttons to the footer. |
| `centerVertical` | `boolean` | `false` | Center the modal dialog vertically. |
| `closeBtn` | `boolean` | `true` | Show a close button in the header. |
| `content` | `string \| NodeInput` | `''` | Set the body content. Strings are rendered as text; DOM and fQuery inputs are appended. |
| `size` | `'sm' \| 'lg' \| 'xl' \| null` | `null` | Apply a Frost UI modal size. |
| `title` | `string \| null` | `null` | Set the dialog title and accessible name. |

`NodeInput` accepts the node inputs supported by fQuery, including a DOM `Node`, `DocumentFragment`, node collection, array, selector, or `QuerySet`. A string passed directly as `content` is rendered as text rather than resolved as a selector; pass the selected node or `QuerySet` when appending existing DOM content.

### Buttons

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `text` | `string` | Yes | Set the visible button text. |
| `style` | `string \| string[]` | No | Add one or more classes after `Dialog.classes.btn`. |
| `callback` | `() => void` | No | Run immediately when the button is selected, before the dialog starts closing. |

Every action button uses `type="button"`. The first action selected calls its callback, if present, then calls `dialog.close()`. Further action-button clicks on that dialog are ignored.

```js
new Dialog({
    content: 'Select a destination.',
    buttons: [
        {
            text: 'Archive',
            style: ['btn-secondary', 'text-uppercase'],
            callback: archiveItem,
        },
        {
            text: 'Delete',
            style: 'btn-danger',
            callback: deleteItem,
        },
    ],
});
```

### Rendering and sanitization

A string passed directly as `content` is passed to `textContent`; it is never interpreted as HTML:

```js
alert('<strong>This is visible text, not markup.</strong>');
```

Create trusted markup as DOM nodes when rich content is required:

```js
const content = document.createElement('p');
const emphasis = document.createElement('strong');

emphasis.textContent = 'Trusted DOM content';
content.append('This dialog contains ', emphasis, '.');

new Dialog({ content });
```

Avoid assigning untrusted strings to `innerHTML` before passing a node to Dialog. Dialog appends supplied nodes as-is and does not sanitize them.

### Callback behavior

- A custom button callback runs only when that action button is selected.
- Only the first action selection is handled per dialog, preventing repeated callbacks from rapid clicks or selecting another action while closing.
- `alert()` calls its callback only when the generated OK button is selected.
- `confirm()` calls its callback with `false` for Cancel and `true` for OK.
- The header close button, a dismissible backdrop, Escape, or `dialog.close()` does not run an action or helper callback.
- Helper `options` are spread after their generated content and buttons. Supplying `content` or `buttons` in `options` replaces the generated value.
- Callbacks run before the asynchronous hide transition begins.
- `dialog.close()` is called even if a callback throws synchronously; the error is not swallowed.
- Callback return values are ignored. Returned promises are not awaited before closing.

## Methods

| Method | Returns | Description |
| --- | --- | --- |
| `new Dialog(options?)` | `Dialog` | Render, append, and immediately show a dialog. |
| `dialog.close()` | `void` | Request hiding, waiting for an in-progress opening transition to finish first. Repeated and post-cleanup calls are safe. |
| `dialog.node` | `HTMLElement \| null` | Get the modal element, or `null` after cleanup. |
| `dialog.options` | `Readonly<DialogOptions> \| null` | Get the frozen resolved options, or `null` after cleanup. |

### Helpers

| Helper | Returns | Description |
| --- | --- | --- |
| `alert(content?, callback?, options?)` | `Dialog` | Create a dialog with one primary OK action. |
| `confirm(content?, callback?, options?)` | `Dialog` | Create a dialog with secondary Cancel and primary OK actions. |

Both helpers return the created `Dialog`, so it can be closed programmatically or inspected while active:

```js
const dialog = alert('This operation is taking longer than expected.');

if (operationFinished) {
    dialog.close();
}
```

## Lifecycle

Each `new Dialog(options)` call creates and shows a new dialog. Resolved options are shallow-frozen.

An instance exposes its generated modal as `dialog.node` and its resolved configuration as `dialog.options`. Both become `null` after cleanup.

`close()` requests the hide lifecycle and removes the dialog when it finishes. Repeated and post-cleanup calls are safe. If closing interrupts opening, the opening transition finishes before hiding begins.

If initialization fails, the dialog disposes its modal resources and removes its generated markup before rethrowing the error. A new dialog can then be created.

## Events

The generated node is controlled by Frost UI's `Modal` component and emits its namespaced lifecycle events:

| Event | Description |
| --- | --- |
| `show.ui.modal` | The dialog is about to start showing. |
| `shown.ui.modal` | The show transition completed and focus trapping is active. |
| `hide.ui.modal` | The dialog is about to start hiding. |
| `hidden.ui.modal` | The hide transition completed; Dialog then clears its state and removes the node. |

Because `show.ui.modal` is triggered during construction, attach document-level delegated listeners before creating a Dialog when that event is needed.

If `close()` is called during opening, the `shown.ui.modal` event finishes before the hide lifecycle starts. Lifecycle events from nested modals do not trigger the parent dialog's close handling or cleanup.

## Accessibility

- A titled dialog renders an `h2.modal-title` with a generated ID and references it through `aria-labelledby`.
- An untitled dialog uses `ariaLabel` through `aria-label`. Supply a specific label when the default “Dialog” does not describe the task.
- Dialog starts with `aria-hidden="true"`; Frost UI Modal manages `aria-hidden` and `aria-modal` across asynchronous transitions.
- Frost UI traps focus inside the active dialog, handles stacked dialogs, and restores shared page state as dialogs close.
- Dialog captures the focused element before rendering and passes it to Frost UI, which attempts to restore focus to that element when the dialog closes.
- Generated close and action controls are native buttons. The close button uses `Dialog.lang.close` as its accessible label.
- Keep titles and button labels concise, and provide clear instructions or error text in the content when the action has consequences.

## Customization

### CSS classes

Customize generated classes before creating a dialog:

| Key | Default | Applied to |
| --- | --- | --- |
| `btn` | `'btn ripple'` | Every footer action button. |
| `btnClose` | `'btn-close'` | Header close button. |
| `btnPrimary` | `'btn-primary'` | Alert OK and confirm OK actions. |
| `btnSecondary` | `'btn-secondary'` | Confirm Cancel action. |
| `modal` | `'modal'` | Root modal element. |
| `modalBody` | `'modal-body'` | Body container. |
| `modalContent` | `'modal-content'` | Modal content container. |
| `modalDialog` | `'modal-dialog'` | Dialog layout container. |
| `modalDialogCentered` | `'modal-dialog-centered'` | Vertically centered modifier. |
| `modalFooter` | `'modal-footer'` | Footer container. |
| `modalHeader` | `'modal-header'` | Header container. |
| `modalLg` | `'modal-lg'` | Large size modifier. |
| `modalSm` | `'modal-sm'` | Small size modifier. |
| `modalTitle` | `'modal-title'` | Title element. |
| `modalXl` | `'modal-xl'` | Extra-large size modifier. |

```js
Dialog.classes.btnPrimary = 'btn-success';
Dialog.classes.btnClose = 'btn-close btn-close-white';
```

### Language

| Key | Default | Used by |
| --- | --- | --- |
| `cancel` | `'Cancel'` | Confirm Cancel button. |
| `close` | `'Close'` | Header close button accessible label. |
| `ok` | `'OK'` | Alert and confirm OK buttons. |

```js
Dialog.lang.cancel = 'Back';
Dialog.lang.close = 'Dismiss dialog';
Dialog.lang.ok = 'Continue';
```

Set language values before calling a helper so its generated buttons use the updated text.

## Themes and RTL

Frost UI follows the user's preferred color scheme by default. Set `data-ui-theme="light"` or `data-ui-theme="dark"` on the document or an ancestor to select a theme explicitly.

Dialog uses Frost UI modal styling. Apply the theme and `dir="rtl"` to the document or the `appendTo` container before creating the dialog.

## Development

Install dependencies with `npm ci`, then install Playwright browsers with `npx playwright install --with-deps`.

```bash
npm test
npm run lint
npm run build
```

`npm test` rebuilds the bundles, then runs the Playwright suite in Chromium, Firefox, and WebKit. `npm run test:browser` runs the suite against the existing bundles, so rebuild after changing source files.

After building, `npm run test:coverage` runs Chromium tests and writes coverage reports to `coverage/`.

`npm run test:headed` and `npm run test:ui` also use the existing bundles and open headed browsers or the Playwright UI.

To view the demo, open `demo/index.html` in your browser after building.

## License

Frost UI Dialog is released under the [MIT License](./LICENSE).
