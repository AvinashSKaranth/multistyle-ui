# Toast

`MS.toast(msg, {type:"info|success|warning|error", timeout:4000 (0 = sticky), dismissible:true, title, position:"bottom-right", icon})`. position = top|bottom + left|center|right; icon = Material Symbols name. Declarative: `<button data-ms-toast="Saved" data-ms-toast-type="success" data-ms-toast-title="Done" data-ms-toast-position="top-left">`. aria-live polite; shows above open modals.
