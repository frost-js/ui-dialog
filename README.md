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
- Frost UI v3 transitions, focus trapping, stacked modal handling, and accessibility state
- Frozen resolved options with read-only `node` and `options` accessors
- Prebuilt ESM and UMD bundles with source maps
- No component-specific CSS or Sass
- JSDoc-powered IntelliSense

## Installation

### Browser projects / bundlers

Install Dialog with its Frost UI and fQuery peers:

```bash
npm i @fr0st/ui-dialog @fr0st/ui @fr0st/query
```

The package root resolves to the compiled ESM bundle. Import the Frost UI stylesheet and the named APIs you need:

```js
import '@fr0st/ui/dist/frost-ui.min.css';
import { Dialog, alert, confirm } from '@fr0st/ui-dialog';

alert('Your changes were saved.');

confirm('Delete this item?', (confirmed) => {
    if (confirmed) {
        console.log('Delete the item.');
    }
});

const dialog = new Dialog({
    title: 'Custom dialog',
    content: 'Choose an action.',
});
```

`@fr0st/ui` and `@fr0st/query` are peer dependencies so Dialog shares the application's UI and fQuery instances. The package root, `dist/*`, and `src/*` are available through package exports.

Dialog requires a browser DOM or a compatible DOM environment configured through fQuery. Server-rendered applications should load it on the client.

### Browser (ESM)

The ESM bundle imports `@fr0st/ui` and `@fr0st/query`. Frost UI and fQuery also require `@fr0st/core`, so map all three dependencies when loading the bundle directly in a browser:

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
    import {
        Dialog,
        alert,
        confirm,
    } from 'https://cdn.jsdelivr.net/npm/@fr0st/ui-dialog@latest/dist/frost-ui-dialog.esm.min.js';

    alert('ESM is ready.');
</script>
```

### Browser (UMD)

Load Frost UI's all-in-one bundle before Dialog. The UI bundle supplies both the `UI` and `fQuery` globals expected by the component:

```html
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@fr0st/ui@latest/dist/frost-ui.min.css">

<script src="https://cdn.jsdelivr.net/npm/@fr0st/ui@latest/dist/frost-ui-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@fr0st/ui-dialog@latest/dist/frost-ui-dialog.min.js"></script>
<script>
    UI.alert('UMD is ready.');

    const dialog = new UI.Dialog({
        content: 'The Dialog API extends the existing UI global.',
    });
</script>
```

The UMD bundle adds `Dialog`, `alert`, and `confirm` to the existing `globalThis.UI` object. It expects `globalThis.UI` and `globalThis.fQuery` to exist before it loads. If the non-bundled Frost UI build is used instead, load fQuery, Frost UI, and Dialog in that order.

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

// Closing is asynchronous because Frost UI waits for the modal transition.
dialog.close();
```

Each `Dialog` is shown immediately. Frost UI manages the backdrop, focus trap, stack position, keyboard handling, transition state, and body scroll lock. The dialog removes itself after the `hidden.ui.modal` event.

## Options

Options passed to the constructor are applied after `Dialog.defaults`. The resolved `dialog.options` object is frozen.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `content` | `string \| NodeInput` | `''` | Set the body content. Strings are rendered as text; DOM and fQuery inputs are appended. |
| `title` | `string \| null` | `null` | Set the dialog title and accessible name. |
| `buttons` | `DialogButton[]` | `[]` | Add action buttons to the footer. |
| `size` | `'sm' \| 'lg' \| 'xl' \| null` | `null` | Apply a Frost UI modal size. |
| `backdrop` | `boolean \| 'static'` | `'static'` | Use a dismissible, absent, or non-dismissible backdrop. |
| `centerVertical` | `boolean` | `false` | Center the modal dialog vertically. |
| `closeBtn` | `boolean` | `true` | Show a close button in the header. |
| `appendTo` | `NodeInput \| null` | `null` | Append the dialog to a custom target instead of `document.body`. |
| `ariaLabel` | `string` | `'Dialog'` | Provide the accessible name when no title is present. |

`NodeInput` accepts the node inputs supported by fQuery, including a DOM `Node`, `DocumentFragment`, node collection, array, selector, or `QuerySet`. For `content`, every string is rendered as text rather than resolved as a selector; pass the selected node or `QuerySet` when appending existing DOM content.

## Buttons

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `text` | `string` | Yes | Set the visible button text. |
| `style` | `string \| string[]` | No | Add one or more classes after `Dialog.classes.btn`. |
| `callback` | `() => void` | No | Run immediately when the button is selected, before the dialog starts closing. |

Every action button uses `type="button"`. Selecting one calls its callback, if present, then calls `dialog.close()`.

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

## Content safety

String content is passed to `textContent`; it is never interpreted as HTML:

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

## Callback behavior

- A custom button callback runs only when that action button is selected.
- `alert()` calls its callback only when the generated OK button is selected.
- `confirm()` calls its callback with `false` for Cancel and `true` for OK.
- The header close button, a dismissible backdrop, Escape, or `dialog.close()` does not run an action or helper callback.
- Helper `options` are spread after their generated content and buttons. Supplying `content` or `buttons` in `options` replaces the generated value.
- Callbacks run before the asynchronous hide transition begins.

## Dialog API

| API | Returns | Description |
| --- | --- | --- |
| `new Dialog(options?)` | `Dialog` | Render, append, and immediately show a dialog. |
| `dialog.node` | `HTMLElement \| null` | Get the modal element, or `null` after cleanup. |
| `dialog.options` | `Readonly<DialogOptions> \| null` | Get the frozen resolved options, or `null` after cleanup. |
| `dialog.close()` | `void` | Start hiding the dialog. Repeated and post-cleanup calls are safe. |

## Helpers

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

## Classes

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

## Language

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

## Modal events

The generated node is controlled by Frost UI's `Modal` component and emits its namespaced lifecycle events:

| Event | Description |
| --- | --- |
| `show.ui.modal` | The dialog is about to start showing. |
| `shown.ui.modal` | The show transition completed and focus trapping is active. |
| `hide.ui.modal` | The dialog is about to start hiding. |
| `hidden.ui.modal` | The hide transition completed; Dialog then clears its state and removes the node. |

Because `show.ui.modal` is triggered during construction, attach document-level delegated listeners before creating a Dialog when that event is needed.

## Accessibility

- A titled dialog renders an `h2.modal-title` with a generated ID and references it through `aria-labelledby`.
- An untitled dialog uses `ariaLabel` through `aria-label`. Supply a specific label when the default “Dialog” does not describe the task.
- Dialog starts with `aria-hidden="true"`; Frost UI Modal manages `aria-hidden` and `aria-modal` across asynchronous transitions.
- Frost UI traps focus inside the active dialog, handles stacked dialogs, and restores shared page state as dialogs close.
- Generated close and action controls are native buttons. The close button uses `Dialog.lang.close` as its accessible label.
- Keep titles and button labels concise, and provide clear instructions or error text in the content when the action has consequences.

## Development

```bash
npm test
npm run lint
npm run build
```

`npm test` builds the bundles and runs the Playwright suite in Chromium, Firefox, and WebKit.

## License

Frost UI Dialog is released under the [MIT License](./LICENSE).
