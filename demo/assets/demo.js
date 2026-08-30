const $ = globalThis.$;
const UI = globalThis.UI;

const setTheme = (theme) => {
    if (theme === 'system') {
        $(document.documentElement).removeAttribute('data-ui-theme');
    } else {
        $(document.documentElement).setAttribute('data-ui-theme', theme);
    }

    $('[data-demo-theme]').setValue(theme);
};

const storedTheme = localStorage.getItem('frostui-dialog-demo-theme');
setTheme(['light', 'dark'].includes(storedTheme) ? storedTheme : 'system');

$.ready(() => {
    const report = (message) => {
        const time = new Date().toLocaleTimeString();
        $('#callback-output').setText(`${time} — ${message}`);
    };

    $('[data-demo-theme]').addEvent('change', (event) => {
        const theme = $.getValue(event.currentTarget);

        if (theme === 'system') {
            localStorage.removeItem('frostui-dialog-demo-theme');
        } else {
            localStorage.setItem('frostui-dialog-demo-theme', theme);
        }

        setTheme(theme);
    });

    $('[data-demo-action]').addEvent('click', (event) => {
        const action = $.getDataset(event.currentTarget, 'demoAction');

        switch (action) {
            case 'alert':
                UI.alert(
                    'This alert reports only when OK is selected.',
                    () => report('Alert: OK selected.'),
                    { title: 'Saved successfully' },
                );
                break;
            case 'confirm':
                UI.confirm(
                    'Would you like to publish these changes?',
                    (confirmed) => report(`Confirm: ${confirmed}.`),
                    { title: 'Publish changes' },
                );
                break;
            case 'custom':
                new UI.Dialog({
                    title: 'Move project',
                    content: 'Choose where this project should go.',
                    buttons: [
                        {
                            text: 'Archive',
                            style: 'btn-secondary',
                            callback: () => report('Custom action: Archive selected.'),
                        },
                        {
                            text: 'Move to team',
                            style: 'btn-primary',
                            callback: () => report('Custom action: Move to team selected.'),
                        },
                    ],
                });
                break;
            case 'nodes': {
                const content = $.create('div');
                const message = $.create('p', {
                    text: 'This content was assembled from DOM nodes.',
                });
                const badge = $.create('span', {
                    class: 'badge bg-success-subtle text-success-subtle',
                    text: 'No HTML string parsing',
                });

                $.append(content, [message, badge]);

                new UI.Dialog({
                    title: 'Trusted rich content',
                    content,
                    buttons: [
                        {
                            text: 'Understood',
                            style: 'btn-success',
                            callback: () => report('DOM content: Understood selected.'),
                        },
                    ],
                });
                break;
            }
            case 'backdrop-static':
                new UI.Dialog({
                    title: 'Static backdrop',
                    content: 'Backdrop clicks and Escape keep this dialog open. Use the close button.',
                });
                report('Opened a dialog with the default static backdrop.');
                break;
            case 'backdrop-dismiss':
                new UI.Dialog({
                    title: 'Dismissible backdrop',
                    content: 'Select the backdrop outside this dialog to close it.',
                    backdrop: true,
                    closeBtn: false,
                });
                report('Opened a dialog with a dismissible backdrop.');
                break;
            case 'backdrop-none':
                new UI.Dialog({
                    title: 'No backdrop',
                    content: 'The page remains visible without a backdrop layer.',
                    backdrop: false,
                });
                report('Opened a dialog without a backdrop.');
                break;
            case 'centered':
                new UI.Dialog({
                    title: 'Vertically centered',
                    content: 'This dialog uses centerVertical: true.',
                    centerVertical: true,
                });
                report('Opened a vertically centered dialog.');
                break;
            case 'size-sm':
            case 'size-lg':
            case 'size-xl': {
                const size = action.slice(5);

                new UI.Dialog({
                    title: `${size.toUpperCase()} dialog`,
                    content: `This dialog uses size: '${size}'.`,
                    size,
                });
                report(`Opened the ${size} dialog size.`);
                break;
            }
            case 'append': {
                const dialog = new UI.Dialog({
                    appendTo: $('#dialog-host'),
                    title: 'Custom append target',
                    content: 'Inspect the DOM to see this modal under #dialog-host.',
                });

                report(`Dialog parent: #${dialog.node.parentElement.id}.`);
                break;
            }
            case 'stack': {
                const content = $.create('div');
                const message = $.create('p', {
                    text: 'This first layer stays open while the next one is shown.',
                });
                const openNext = $.create('button', {
                    class: 'btn btn-primary ripple',
                    text: 'Open second layer',
                    attributes: { type: 'button' },
                });

                $.addEvent(openNext, 'click', () => {
                    new UI.Dialog({
                        title: 'Second layer',
                        content: 'Close this dialog to return to the first layer.',
                        centerVertical: true,
                    });
                    report('Opened the second dialog layer.');
                });
                $.append(content, [message, openNext]);

                new UI.Dialog({
                    title: 'First layer',
                    content,
                    size: 'lg',
                });
                report('Opened the first dialog layer.');
                break;
            }
        }
    });

    setTheme(document.documentElement.dataset.uiTheme || 'system');
});
